// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IClearingTransfer } from "./IClearingTransfer.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingTransfer is IClearingTransfer, TimestampProvider, Modifiers {
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    ) external override onlyUnpaused onlyClearingActivated returns (bool success_, uint256 clearingId_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper.requireValidExpirationTimestamp(_clearingOperation.expirationTimestamp);
        ERC1410StorageWrapper.requireValidAddress(_to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(EvmAccessors.getMsgSender());
        ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperation,
            _amount,
            _to,
            EvmAccessors.getMsgSender(),
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        notZeroAddress(_clearingOperationFrom.from)
        notZeroAddress(_to)
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper.requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        {
            ERC3643StorageWrapper.requireUnrecoveredAddress(EvmAccessors.getMsgSender());
            ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_clearingOperationFrom.from);
        }
        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Transfer,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external override onlyUnpaused onlyClearingActivated returns (bool success_, uint256 clearingId_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        _requireUnProtectedPartitionsOrWildCardRole();
        LockStorageWrapper.requireValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        );
        {
            ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
            ERC1410StorageWrapper.requireValidAddress(_to);
            ERC1410StorageWrapper.requireOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
            ERC3643StorageWrapper.requireUnrecoveredAddress(EvmAccessors.getMsgSender());
            ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_clearingOperationFrom.from);
        }

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingTransferByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyProtectedPartitions
        notZeroAddress(_protectedClearingOperation.from)
        notZeroAddress(_to)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_to)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.protectedClearingTransferByPartition(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature
        );
    }

    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingTransferData memory clearingTransferData_) {
        return
            ClearingReadOps.getClearingTransferForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(
                EvmAccessors.getMsgSender(),
                _WILD_CARD_ROLE
            );
        }
    }
}
