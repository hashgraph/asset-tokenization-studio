// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { IBond } from "../../asset/bond/IBond.sol";
import { IBondRead } from "../../asset/bond/IBondRead.sol";
import { IKyc } from "../../core/kyc/IKyc.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";

import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { KycStorageWrapper } from "../../../domain/core/KycStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
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
        BondStorageWrapper.initializeBond(_bondDetailsData);
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external virtual override returns (uint256 couponID_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_CORPORATE_ACTION_ROLE);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = BondStorageWrapper.setCoupon(_newCoupon);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MATURITY DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function updateMaturityDate(uint256 _newMaturityDate) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_BOND_MANAGER_ROLE);
        _requireAfterCurrentMaturityDate(_newMaturityDate);

        emit IBond.MaturityDateUpdated(address(this), _newMaturityDate, BondStorageWrapper.getMaturityDate());
        success_ = BondStorageWrapper.setMaturityDate(_newMaturityDate);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // REDEMPTION
    // ═══════════════════════════════════════════════════════════════════════════════

    function fullRedeemAtMaturity(address _tokenHolder) external override {
        _validateRedeemAtMaturity(_tokenHolder);

        bytes32[] memory partitions = ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = ERC1410StorageWrapper.balanceOfByPartition(partition, _tokenHolder);
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
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
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
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_tokenHolder);
        ControlListStorageWrapper.requireListedAllowed(_tokenHolder);
        AccessStorageWrapper.checkRole(_MATURITY_REDEEMER_ROLE);
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        KycStorageWrapper.requireValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder);
        ComplianceStorageWrapper.requireNotRecovered(_tokenHolder);
        _requireAfterCurrentMaturityDate(_getBlockTimestamp());
    }

    function _validateBondInitData(IBondRead.BondDetailsData calldata _bondDetailsData) internal view {
        CorporateActionsStorageWrapper.validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate);
        _requireValidTimestamp(_bondDetailsData.startingDate);
    }

    function _requireAfterCurrentMaturityDate(uint256 _maturityDate) internal view {
        if (_maturityDate <= BondStorageWrapper.getMaturityDate()) {
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
        return BondStorageWrapper.isBondInitialized();
    }
}
