// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/// @custom:hash resolverKey ProtectedClearingHoldByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION = 0xc28474cfcf6b32464e9000d064b91827c6c37fd3e06dae932c9447c204c35cc1;

/**
 * @title IProtectedClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the protected variant of clearing hold creation scoped to a partition,
 *         gated by a per-partition role and an off-chain signature provided by the token holder.
 * @dev Inherits `IClearingTypes` for the `ProtectedClearingOperation` struct used in the
 *      method signature. The `ProtectedClearedHoldByPartition` event is declared on this writer
 *      interface and emitted inline from
 *      `ProtectedClearingHoldByPartition.protectedClearingCreateHoldByPartition` after the
 *      `ClearingProtectedOps` library call returns successfully. This interface is aggregated
 *      into the `IAsset` umbrella; the facet itself never inherits the umbrella.
 */
interface IProtectedClearingHoldByPartition is IClearingTypes {
    /**
     * @notice Emitted once when the protected-clearing-hold-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeProtectedClearingHoldByPartition`.
     */
    event ProtectedClearingHoldByPartitionInitialized();

    /**
     * @notice Emitted when a protected clearing hold is created successfully.
     * @param operator The address that initiated the clearing hold creation.
     * @param tokenHolder The token holder whose tokens are placed on hold.
     * @param partition The partition identifier.
     * @param clearingId The identifier assigned to the newly created clearing operation.
     * @param hold The hold details.
     * @param expirationDate The expiration timestamp of the clearing operation.
     * @param data Additional data passed with the clearing hold creation.
     * @param operatorData Operator-specific data associated with the operation.
     */
    event ProtectedClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Initialises the protected-clearing-hold-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeProtectedClearingHoldByPartition() external;

    /**
     * @notice Creates a hold for a protected clearing operation by partition, authorised by an
     *         off-chain signature.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`. The contract
     *      must not be paused, and the partition must be flagged as protected. Emits
     *      `ProtectedClearedHoldByPartition` on success.
     * @param _protectedClearingOperation The protected clearing operation details, including the
     *        inner `ClearingOperation`, deadline, and nonce used for signature replay protection.
     * @param _hold The hold details.
     * @param _signature ECDSA signature authorising the protected clearing hold creation.
     * @return success_ True when the clearing hold has been created and recorded.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
