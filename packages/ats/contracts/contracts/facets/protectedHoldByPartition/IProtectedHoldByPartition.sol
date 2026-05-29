// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";

/// @custom:hash resolverKey ProtectedHoldByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION = 0x5b77b995d3e53c3e46f114bbf37642ce3169369548c8135b8b11f5cebd3fb07b;

/**
 * @title IProtectedHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the protected variant of partition-scoped hold creation, gated by a
 *         per-partition role and an off-chain signature provided by the token holder.
 * @dev Inherits the shared `IHoldTypes` module so the `ProtectedHold` struct and the
 *      `ProtectedHeldByPartition` event are referenced from a single source of truth and never
 *      redeclared. This interface is aggregated into the `IAsset` umbrella; the facet itself
 *      never inherits the umbrella.
 */
interface IProtectedHoldByPartition is IHoldTypes {
    /**
     * @notice Emitted once when the protected-hold-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeProtectedHoldByPartition`.
     */
    event ProtectedHoldByPartitionInitialized();

    /**
     * @notice Initialises the protected-hold-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeProtectedHoldByPartition() external;

    /**
     * @notice Creates a hold on a protected partition on behalf of a token holder, authorised by
     *         an off-chain signature.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`. The contract
     *      must not be paused, clearing must be disabled, and the partition must be flagged as
     *      protected. Emits `ProtectedHeldByPartition` on success.
     * @param _partition The protected partition identifier.
     * @param _from The token holder whose tokens are placed on hold.
     * @param _protectedHold The protected-hold payload, including the inner `Hold`, deadline, and
     *        nonce used for signature replay protection.
     * @param _signature ECDSA signature authorising the protected hold creation.
     * @return success_ True when the hold has been created and recorded.
     * @return holdId_ The identifier assigned to the newly created hold.
     */
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 holdId_);
}
