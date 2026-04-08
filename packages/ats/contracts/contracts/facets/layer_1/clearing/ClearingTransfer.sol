// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTransfer } from "./IClearingTransfer.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingTransfer is IClearingTransfer, TimestampProvider, Modifiers {
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        notZeroAddress(_to)
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
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
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        notZeroAddress(_clearingOperationFrom.from)
        notZeroAddress(_to)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        returns (bool success_, uint256 clearingId_)
    {
        return _clearingTransferFromByPartition(_clearingOperationFrom, _amount, _to);
    }

    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyUnProtectedPartitionsOrWildCardRole
        onlyValidOperatorClearingTransferByPartition(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.clearingOperation.partition
        )
        returns (bool success_, uint256 clearingId_)
    {
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

    function _clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) internal returns (bool success_, uint256 clearingId_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.requireUnProtectedPartitionsOrWildCardRole();
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
}
