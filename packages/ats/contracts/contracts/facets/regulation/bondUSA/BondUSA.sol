// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "../interfaces/IBondUSA.sol";
import { IBond } from "../../assetCapabilities/interfaces/bond/IBond.sol";
import { IBondRead } from "../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { IKyc } from "../../features/interfaces/IKyc.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";

import { LibBond } from "../../../lib/domain/LibBond.sol";
import { LibSecurity } from "../../../lib/domain/LibSecurity.sol";
import { TokenCoreOps } from "../../../lib/orchestrator/TokenCoreOps.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibKyc } from "../../../lib/core/LibKyc.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { IClearing } from "../../features/interfaces/clearing/IClearing.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";

abstract contract BondUSA is IBond, IBondUSA {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERROR DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    error AlreadyInitialized();
    error WrongTimestamp(uint256 timeStamp);

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override {
        if (_isBondInitialized()) revert AlreadyInitialized();

        _validateBondInitData(_bondDetailsData);
        LibBond.initializeBond(_bondDetailsData);
        LibSecurity.initializeSecurity(_regulationData, _additionalSecurityData);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external virtual override returns (uint256 couponID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MATURITY DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function updateMaturityDate(uint256 _newMaturityDate) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_BOND_MANAGER_ROLE);
        _requireAfterCurrentMaturityDate(_newMaturityDate);

        emit IBond.MaturityDateUpdated(address(this), _newMaturityDate, LibBond.getMaturityDate());
        success_ = LibBond.setMaturityDate(_newMaturityDate);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // REDEMPTION
    // ═══════════════════════════════════════════════════════════════════════════════

    function fullRedeemAtMaturity(address _tokenHolder) external override {
        _validateRedeemAtMaturity(_tokenHolder);

        bytes32[] memory partitions = LibERC1410.partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = LibERC1410.balanceOfByPartition(partition, _tokenHolder);
            if (balance > 0) {
                TokenCoreOps.redeemByPartition(
                    partition,
                    _tokenHolder,
                    msg.sender,
                    balance,
                    "",
                    "",
                    LibTimeTravel.getBlockTimestamp()
                );
            }
        }
    }

    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external override {
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        _validateRedeemAtMaturity(_tokenHolder);

        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            msg.sender,
            _amount,
            "",
            "",
            LibTimeTravel.getBlockTimestamp()
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _validateRedeemAtMaturity(address _tokenHolder) internal view {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_tokenHolder);
        LibControlList.requireListedAllowed(_tokenHolder);
        LibAccess.checkRole(_MATURITY_REDEEMER_ROLE);
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibKyc.requireValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder);
        LibCompliance.requireNotRecovered(_tokenHolder);
        _requireAfterCurrentMaturityDate(LibTimeTravel.getBlockTimestamp());
    }

    function _validateBondInitData(IBondRead.BondDetailsData calldata _bondDetailsData) internal view {
        LibCorporateActions.validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate);
        _requireValidTimestamp(_bondDetailsData.startingDate);
    }

    function _requireAfterCurrentMaturityDate(uint256 _maturityDate) internal view {
        if (_maturityDate <= LibBond.getMaturityDate()) {
            revert BondMaturityDateWrong();
        }
    }

    function _requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= LibTimeTravel.getBlockTimestamp()) {
            revert WrongTimestamp(_timestamp);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _isBondInitialized() internal view returns (bool) {
        return LibBond.isBondInitialized();
    }
}
