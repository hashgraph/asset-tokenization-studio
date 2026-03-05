// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { IBond } from "../../assets/bond/IBond.sol";
import { IBondRead } from "../../assets/bond/IBondRead.sol";
import { IKyc } from "../../core/kyc/IKyc.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";

import { LibBond } from "../../../domain/assets/LibBond.sol";
import { LibSecurity } from "../../../domain/assets/LibSecurity.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { LibPause } from "../../../domain/core/LibPause.sol";
import { LibERC1410 } from "../../../domain/assets/LibERC1410.sol";
import { LibControlList } from "../../../domain/core/LibControlList.sol";
import { LibAccess } from "../../../domain/core/LibAccess.sol";
import { LibClearing } from "../../../domain/assets/LibClearing.sol";
import { LibKyc } from "../../../domain/core/LibKyc.sol";
import { LibCompliance } from "../../../domain/core/LibCompliance.sol";
import { LibCorporateActions } from "../../../domain/core/LibCorporateActions.sol";
import { IClearing } from "../../core/clearing/IClearing.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract BondUSA is IBond, IBondUSA, TimestampProvider {
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
                    _getBlockTimestamp(),
                    _getBlockNumber()
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
            _getBlockTimestamp(),
            _getBlockNumber()
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
        _requireAfterCurrentMaturityDate(_getBlockTimestamp());
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
        if (_timestamp <= _getBlockTimestamp()) {
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
