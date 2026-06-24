// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedHoldByPartition, RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION } from "./IProtectedHoldByPartition.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { HoldOps } from "../../domain/orchestrator/HoldOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ProtectedHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet implementation for the protected variant of partition-scoped hold
 *         creation, extracted from `HoldManagement` as part of the MAF (Modular Asset Factory)
 *         decomposition.
 * @dev Routes write logic through `HoldOps.protectedCreateHoldByPartition` (deployed
 *      orchestrator library, DELEGATECALL), keeping the storage-wrapper inlining inside
 *      `HoldOps` bytecode rather than this facet. Authorisation is enforced by a
 *      partition-specific role obtained from `ProtectedPartitionsStorageWrapper`. Storage
 *      layout is unchanged; this contract only owns the selector exposure.
 */
abstract contract ProtectedHoldByPartition is IProtectedHoldByPartition, Modifiers {
    /// @inheritdoc IProtectedHoldByPartition
    function initializeProtectedHoldByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION);
        emit ProtectedHoldByPartitionInitialized();
    }

    /// @inheritdoc IProtectedHoldByPartition
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        notZeroAddress(_from)
        notZeroAddress(_protectedHold.hold.escrow)
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp)
        onlyUnrecoveredAddress(_from)
        onlyUnrecoveredAddress(_protectedHold.hold.to)
        onlyProtectedPartitions
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldOps.protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature);

        emit ProtectedHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _protectedHold.hold, "");
    }
}
