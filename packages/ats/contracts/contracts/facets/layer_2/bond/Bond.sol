// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBond } from "./IBond.sol";
import { IBondRead } from "./IBondRead.sol";
import { IKyc } from "../../layer_1/kyc/IKyc.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../../../domain/core/KycStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { IClearing } from "../../layer_1/clearing/IClearing.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract Bond is IBond, TimestampProvider {
    function fullRedeemAtMaturity(address _tokenHolder) external override {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireValidAddress(_tokenHolder);
        ControlListStorageWrapper._requireListedAllowed(_tokenHolder);
        AccessControlStorageWrapper._checkRole(_MATURITY_REDEEMER_ROLE, msg.sender);
        if (ClearingStorageWrapper._isClearingActivated()) revert IClearing.ClearingIsActivated();
        KycStorageWrapper._requireValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder);
        ERC3643StorageWrapper._requireUnrecoveredAddress(_tokenHolder);
        BondStorageWrapper._requireValidMaturityDate(_getBlockTimestamp());
        bytes32[] memory partitions = ERC1410StorageWrapper._partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = ERC1410StorageWrapper._balanceOfByPartition(partition, _tokenHolder);
            assert(balance > 0);
            ERC1410StorageWrapper._redeemByPartition(partition, _tokenHolder, msg.sender, balance, "", "");
        }
    }

    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external override {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireValidAddress(_tokenHolder);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        ControlListStorageWrapper._requireListedAllowed(_tokenHolder);
        AccessControlStorageWrapper._checkRole(_MATURITY_REDEEMER_ROLE, msg.sender);
        if (ClearingStorageWrapper._isClearingActivated()) revert IClearing.ClearingIsActivated();
        KycStorageWrapper._requireValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder);
        ERC3643StorageWrapper._requireUnrecoveredAddress(_tokenHolder);
        BondStorageWrapper._requireValidMaturityDate(_getBlockTimestamp());
        ERC1410StorageWrapper._redeemByPartition(_partition, _tokenHolder, msg.sender, _amount, "", "");
    }

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external override returns (uint256 couponID_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_CORPORATE_ACTION_ROLE, msg.sender);
        CorporateActionsStorageWrapper._requireValidDates(_newCoupon.startDate, _newCoupon.endDate);
        CorporateActionsStorageWrapper._requireValidDates(_newCoupon.recordDate, _newCoupon.executionDate);
        CorporateActionsStorageWrapper._requireValidDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        ScheduledTasksStorageWrapper._requireValidTimestamp(_newCoupon.recordDate);
        ScheduledTasksStorageWrapper._requireValidTimestamp(_newCoupon.fixingDate);
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = BondStorageWrapper._setCoupon(_newCoupon);
    }

    function updateMaturityDate(uint256 _newMaturityDate) external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_BOND_MANAGER_ROLE, msg.sender);
        BondStorageWrapper._requireValidMaturityDate(_newMaturityDate);
        emit MaturityDateUpdated(address(this), _newMaturityDate, BondStorageWrapper._getMaturityDate());
        success_ = BondStorageWrapper._setMaturityDate(_newMaturityDate);
        return success_;
    }
}
