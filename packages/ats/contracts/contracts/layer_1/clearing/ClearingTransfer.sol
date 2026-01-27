// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "contracts/layer_0/Internals.sol";
import { IClearingTransfer } from "../interfaces/clearing/IClearingTransfer.sol";
import { ThirdPartyType } from "../../layer_0/common/types/ThirdPartyType.sol";

abstract contract ClearingTransfer is IClearingTransfer, Internals {
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        validateAddress(_to)
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_to)
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _clearingTransferCreation(
            _clearingOperation,
            _amount,
            _to,
            _msgSender(),
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
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        {
            _checkValidAddress(_clearingOperationFrom.from);
            _checkValidAddress(_to);
            _checkRecoveredAddress(_msgSender());
            _checkRecoveredAddress(_to);
            _checkRecoveredAddress(_clearingOperationFrom.from);
        }
        (success_, clearingId_) = _clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        _decreaseAllowedBalanceForClearing(
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
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        {
            _checkValidAddress(_clearingOperationFrom.from);
            _checkValidAddress(_to);
            _checkOperator(_clearingOperationFrom.clearingOperation.partition, _clearingOperationFrom.from);
            _checkRecoveredAddress(_msgSender());
            _checkRecoveredAddress(_to);
            _checkRecoveredAddress(_clearingOperationFrom.from);
        }

        (success_, clearingId_) = _clearingTransferCreation(
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
        validateAddress(_protectedClearingOperation.from)
        validateAddress(_to)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_to)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(_protectedPartitionsRole(_protectedClearingOperation.clearingOperation.partition))
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _protectedClearingTransferByPartition(
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
        return _getClearingTransferForByPartitionAdjustedAt(_partition, _tokenHolder, _clearingId, _blockTimestamp());
    }
}
