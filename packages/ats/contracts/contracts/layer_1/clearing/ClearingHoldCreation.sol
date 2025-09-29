// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../common/Common.sol';
import {
    IClearingHoldCreation
} from '../interfaces/clearing/IClearingHoldCreation.sol';
import {Hold} from '../interfaces/hold/IHold.sol';
import {ThirdPartyType} from '../../layer_0/common/types/ThirdPartyType.sol';

abstract contract ClearingHoldCreation is IClearingHoldCreation, Common {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_hold.to)
        validateAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _clearingHoldCreationCreation(
            _clearingOperation,
            _msgSender(),
            _hold,
            '',
            ThirdPartyType.NULL
        );
    }

    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_hold.to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        validateAddress(_hold.escrow)
        validateAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        )
        onlyWithValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        {
            _checkExpirationTimestamp(_hold.expirationTimestamp);
            _checkUnProtectedPartitionsOrWildCardRole();
        }

        (success_, clearingId_) = _clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        _decreaseAllowedBalanceForClearing(
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
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyUnrecoveredAddress(_hold.to)
        validateAddress(_hold.escrow)
        validateAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        )
        onlyWithValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        {
            _checkOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
            _checkExpirationTimestamp(_hold.expirationTimestamp);
            _checkUnProtectedPartitionsOrWildCardRole();
        }

        (success_, clearingId_) = _clearingHoldCreationCreation(
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
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_hold.to)
        onlyProtectedPartitions
        validateAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp
        )
        onlyRole(
            _protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _protectedClearingCreateHoldByPartition(
            _protectedClearingOperation,
            _hold,
            _signature
        );
    }

    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    )
        external
        view
        override
        returns (ClearingHoldCreationData memory clearingHoldCreationData_)
    {
        return
            _getClearingHoldCreationForByPartitionAdjusted(
                _partition,
                _tokenHolder,
                _clearingId
            );
    }
}
