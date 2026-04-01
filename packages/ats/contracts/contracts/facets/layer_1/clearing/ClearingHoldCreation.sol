// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { Hold } from "../hold/IHold.sol";
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
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract ClearingHoldCreation is IClearingHoldCreation, Modifiers {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_hold.to)
        notZeroAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
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
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_hold.to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        notZeroAddress(_hold.escrow)
        notZeroAddress(_clearingOperationFrom.from)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
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
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_hold.to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        notZeroAddress(_hold.escrow)
        notZeroAddress(_clearingOperationFrom.from)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        {
            ERC1410StorageWrapper.requireOperator(
                _clearingOperationFrom.clearingOperation.partition,
                _clearingOperationFrom.from
            );
        }

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
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
        onlyValidAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.protectedClearingCreateHoldByPartition(
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
            ClearingReadOps.getClearingHoldCreationForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
