// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingProtectedOps } from "../../../domain/orchestrator/ClearingProtectedOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingHoldCreation is IClearingHoldCreation, Modifiers {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_hold.to)
        notZeroAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperation,
            EvmAccessors.getMsgSender(),
            _hold,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyValidClearingCreateHoldByPartition(
            _hold.expirationTimestamp,
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _clearingOperationFrom.from,
            _hold.escrow,
            _clearingOperationFrom.clearingOperation.partition
        )
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
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

    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
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
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingCreateHoldByPartition(
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
