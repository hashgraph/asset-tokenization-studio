// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IProtectedClearingHoldByPartition,
    RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION
} from "./IProtectedClearingHoldByPartition.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { IClearingTypes } from "../clearing/IClearingTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingProtectedOps } from "../../domain/orchestrator/ClearingProtectedOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ProtectedClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet implementation for the protected variant of partition-scoped clearing
 *         hold creation, extracted from `ClearingHoldCreation` as part of the MAF (Modular
 *         Asset Factory) decomposition.
 * @dev Forwards write logic to `ClearingProtectedOps.protectedClearingCreateHoldByPartition`.
 *      Authorisation is enforced by a partition-specific role obtained from
 *      `ProtectedPartitionsStorageWrapper`. Storage layout is unchanged; this contract only
 *      owns the selector exposure.
 */
abstract contract ProtectedClearingHoldByPartition is IProtectedClearingHoldByPartition, Modifiers {
    /// @inheritdoc IProtectedClearingHoldByPartition
    function initializeProtectedClearingHoldByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION);
        emit ProtectedClearingHoldByPartitionInitialized();
    }

    /// @inheritdoc IProtectedClearingHoldByPartition
    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_hold.to)
        onlyProtectedPartitions
        validateAddressNotZero(_protectedClearingOperation.from)
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
        _emitProtectedClearedHold(_protectedClearingOperation, _hold, clearingId_);
    }

    /**
     * @notice Emits `ProtectedClearedHoldByPartition` for a successful protected clearing hold.
     * @dev Extracted to a `private` helper so the external onlyOperational entry point's stack stays within the
     *      Solidity 16-slot limit; the helper is called exactly once, after the
     *      `ClearingProtectedOps.protectedClearingCreateHoldByPartition` call returns.
     * @param _operation  The protected clearing operation (partition, from, expiration, data, ...).
     * @param _hold       The hold details (amount, expiration, escrow, to, data).
     * @param _clearingId The identifier assigned to the clearing operation by the library call.
     */
    function _emitProtectedClearedHold(
        IClearingTypes.ProtectedClearingOperation calldata _operation,
        IHoldTypes.Hold calldata _hold,
        uint256 _clearingId
    ) private {
        emit ProtectedClearedHoldByPartition(
            EvmAccessors.getMsgSender(),
            _operation.from,
            _operation.clearingOperation.partition,
            _clearingId,
            _hold,
            _operation.clearingOperation.expirationTimestamp,
            _operation.clearingOperation.data,
            ""
        );
    }
}
