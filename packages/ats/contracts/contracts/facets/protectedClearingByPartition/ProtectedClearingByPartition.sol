// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedClearingByPartition } from "./IProtectedClearingByPartition.sol";
import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingProtectedOps } from "../../domain/orchestrator/ClearingProtectedOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ProtectedClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet implementation for the protected variant of partition-scoped clearing
 *         operations (redeem and transfer), extracted from `ClearingRedeem` and `ClearingTransfer`
 *         as part of the MAF (Modular Asset Factory) decomposition.
 * @dev Forwards write logic to `ClearingProtectedOps`. Authorisation is enforced by a
 *      partition-specific role obtained from `ProtectedPartitionsStorageWrapper`.
 *      Storage layout is unchanged; this contract only owns the selector exposure.
 */
abstract contract ProtectedClearingByPartition is IProtectedClearingByPartition, Modifiers {
    /// @inheritdoc IProtectedClearingByPartition
    function initializeProtectedClearingByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY);
        emit ProtectedClearingByPartitionInitialized();
    }

    /// @inheritdoc IProtectedClearingByPartition
    function protectedClearingRedeemByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyProtectedPartitions
        onlyValidAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingRedeemByPartition(
            _protectedClearingOperation,
            _amount,
            _signature
        );
        _emitProtectedClearedRedeem(_protectedClearingOperation, _amount, clearingId_);
    }

    /// @inheritdoc IProtectedClearingByPartition
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    )
        external
        override
        onlyActivated
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
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingTransferByPartition(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature
        );
        _emitProtectedClearedTransfer(_protectedClearingOperation, _amount, _to, clearingId_);
    }

    /**
     * @notice Emits `ProtectedClearedRedeemByPartition` for a successful protected clearing redeem.
     * @dev Extracted to a `private` helper so the external entry point's stack stays within the
     *      Solidity 16-slot limit; the helper is called exactly once, after the
     *      `ClearingProtectedOps.protectedClearingRedeemByPartition` call returns.
     * @param _operation  The protected clearing operation (partition, from, expiration, data, ...).
     * @param _amount     The cleared amount.
     * @param _clearingId The identifier assigned to the clearing operation by the library call.
     */
    function _emitProtectedClearedRedeem(
        IClearingTypes.ProtectedClearingOperation calldata _operation,
        uint256 _amount,
        uint256 _clearingId
    ) private {
        emit ProtectedClearedRedeemByPartition(
            EvmAccessors.getMsgSender(),
            _operation.from,
            _operation.clearingOperation.partition,
            _clearingId,
            _amount,
            _operation.clearingOperation.expirationTimestamp,
            _operation.clearingOperation.data,
            ""
        );
    }

    /**
     * @notice Emits `ProtectedClearedTransferByPartition` for a successful protected clearing transfer.
     * @dev Extracted to a `private` helper so the external entry point's stack stays within the
     *      Solidity 16-slot limit; the helper is called exactly once, after the
     *      `ClearingProtectedOps.protectedClearingTransferByPartition` call returns.
     * @param _operation  The protected clearing operation (partition, from, expiration, data, ...).
     * @param _amount     The cleared amount.
     * @param _to         The recipient address for the transfer.
     * @param _clearingId The identifier assigned to the clearing operation by the library call.
     */
    function _emitProtectedClearedTransfer(
        IClearingTypes.ProtectedClearingOperation calldata _operation,
        uint256 _amount,
        address _to,
        uint256 _clearingId
    ) private {
        emit ProtectedClearedTransferByPartition(
            EvmAccessors.getMsgSender(),
            _operation.from,
            _to,
            _operation.clearingOperation.partition,
            _clearingId,
            _amount,
            _operation.clearingOperation.expirationTimestamp,
            _operation.clearingOperation.data,
            ""
        );
    }
}
