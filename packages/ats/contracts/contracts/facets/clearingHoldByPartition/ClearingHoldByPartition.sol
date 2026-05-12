// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldByPartition } from "./IClearingHoldByPartition.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../domain/orchestrator/ClearingReadOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the unprotected clearing hold creation operations by partition.
 * @dev Implements clearingCreateHoldByPartition (self-initiated), clearingCreateHoldFromByPartition
 *      (third-party-authorized), and getClearingCreateHoldForByPartition (read). Intended to be
 *      inherited by ClearingHoldByPartitionFacet.
 */
abstract contract ClearingHoldByPartition is IClearingHoldByPartition, Modifiers {
    /// @inheritdoc IClearingHoldByPartition
    /// @dev Emits {ClearedHoldByPartition} via ClearingOps.clearingHoldCreationCreation.
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

    /// @inheritdoc IClearingHoldByPartition
    /// @dev Emits {ClearedHoldFromByPartition} via ClearingOps.clearingHoldCreationCreation.
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

    /// @inheritdoc IClearingHoldByPartition
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
