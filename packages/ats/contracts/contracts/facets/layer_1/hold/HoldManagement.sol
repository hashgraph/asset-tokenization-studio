// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { Hold, ProtectedHold } from "./IHold.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { IClearing } from "../clearing/IClearing.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";

abstract contract HoldManagement is IHoldManagement {
    function operatorCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper._requireNotPaused();
        if (ClearingStorageWrapper._isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper._requireValidAddress(_from);
        ERC1410StorageWrapper._requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper._requireOperator(_partition, _from);
        LockStorageWrapper._requireValidExpirationTimestamp(_hold.expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        {
            ERC3643StorageWrapper._requireUnrecoveredAddress(msg.sender);
            ERC3643StorageWrapper._requireUnrecoveredAddress(_hold.to);
            ERC3643StorageWrapper._requireUnrecoveredAddress(_from);
        }
        (success_, holdId_) = HoldStorageWrapper._createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.OPERATOR
        );

        emit OperatorHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireValidAddress(_from);
        ERC1410StorageWrapper._requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        AccessControlStorageWrapper._checkRole(_CONTROLLER_ROLE, msg.sender);
        LockStorageWrapper._requireValidExpirationTimestamp(_hold.expirationTimestamp);
        ERC1644StorageWrapper._requireControllable();
        (success_, holdId_) = HoldStorageWrapper._createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper._requireNotPaused();
        if (ClearingStorageWrapper._isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper._requireValidAddress(_from);
        ERC1410StorageWrapper._requireValidAddress(_protectedHold.hold.escrow);
        ERC3643StorageWrapper._requireUnrecoveredAddress(_from);
        ERC3643StorageWrapper._requireUnrecoveredAddress(_protectedHold.hold.to);
        AccessControlStorageWrapper._checkRole(
            ProtectedPartitionsStorageWrapper._protectedPartitionsRole(_partition),
            msg.sender
        );
        LockStorageWrapper._requireValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp);
        ProtectedPartitionsStorageWrapper._requireProtectedPartitions();
        (success_, holdId_) = HoldStorageWrapper._protectedCreateHoldByPartition(
            _partition,
            _from,
            _protectedHold,
            _signature
        );

        emit ProtectedHeldByPartition(msg.sender, _from, _partition, holdId_, _protectedHold.hold, "");
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper._arePartitionsProtected() &&
            !AccessControlStorageWrapper._hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
