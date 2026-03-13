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
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper.requireOperator(_partition, _from);
        LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        {
            ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        }
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
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
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        AccessControlStorageWrapper.checkRole(_CONTROLLER_ROLE, msg.sender);
        LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
        ERC1644StorageWrapper.requireControllable();
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
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
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_protectedHold.hold.escrow);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_protectedHold.hold.to);
        AccessControlStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition),
            msg.sender
        );
        LockStorageWrapper.requireValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp);
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        (success_, holdId_) = HoldStorageWrapper.protectedCreateHoldByPartition(
            _partition,
            _from,
            _protectedHold,
            _signature
        );

        emit ProtectedHeldByPartition(msg.sender, _from, _partition, holdId_, _protectedHold.hold, "");
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
