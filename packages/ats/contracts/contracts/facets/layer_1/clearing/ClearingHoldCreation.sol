// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { Hold } from "../hold/IHold.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";

abstract contract ClearingHoldCreation is IClearingHoldCreation {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        LockStorageWrapper.requireValidExpirationTimestamp(_clearingOperation.expirationTimestamp);
        LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        ClearingStorageWrapper.requireClearingActivated();
        (success_, clearingId_) = ClearingStorageWrapper.clearingHoldCreationCreation(
            _clearingOperation,
            msg.sender,
            _hold,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        LockStorageWrapper.requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        ClearingStorageWrapper.requireClearingActivated();
        {
            LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
            _requireUnProtectedPartitionsOrWildCardRole();
        }

        (success_, clearingId_) = ClearingStorageWrapper.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingStorageWrapper.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.HoldCreation,
            _clearingOperationFrom.from,
            _hold.amount
        );
    }

    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_clearingOperationFrom.from);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        LockStorageWrapper.requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        ClearingStorageWrapper.requireClearingActivated();
        {
            ERC1410StorageWrapper.requireOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
            LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
            _requireUnProtectedPartitionsOrWildCardRole();
        }

        (success_, clearingId_) = ClearingStorageWrapper.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC3643StorageWrapper.requireUnrecoveredAddress(_protectedClearingOperation.from);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1410StorageWrapper.requireValidAddress(_protectedClearingOperation.from);
        LockStorageWrapper.requireValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp
        );
        AccessControlStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            ),
            msg.sender
        );
        ClearingStorageWrapper.requireClearingActivated();
        (success_, clearingId_) = ClearingStorageWrapper.protectedClearingCreateHoldByPartition(
            _protectedClearingOperation,
            _hold,
            _signature
        );
    }

    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingHoldCreationData memory clearingHoldCreationData_) {
        return
            ClearingStorageWrapper.getClearingHoldCreationForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                block.timestamp
            );
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
