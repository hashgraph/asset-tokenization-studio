// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../clearing/IClearingTypes.sol";

/// @custom:hash resolverKey ProtectedClearingByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION = 0x3cbb73b8ee5db791f9534af7a5c9fc09a4cf9adff327a05839f2673a3dc63aae;

/**
 * @title IProtectedClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the protected variant of partition-scoped clearing operations
 *         (redeem and transfer), gated by a per-partition role and an off-chain signature
 *         provided by the token holder.
 * @dev The protected-clearing events (`ProtectedClearedRedeemByPartition`,
 *      `ProtectedClearedTransferByPartition`) are declared on this writer interface and
 *      emitted inline from `ProtectedClearingByPartition.protectedClearing{Redeem,Transfer}ByPartition`
 *      after the `ClearingProtectedOps` library call returns successfully. `is IClearingTypes`
 *      is retained for the `ProtectedClearingOperation` struct used in method signatures.
 */
interface IProtectedClearingByPartition is IClearingTypes {
    /**
     * @notice Emitted once when the protected-clearing-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeProtectedClearingByPartition`.
     */
    event ProtectedClearingByPartitionInitialized();

    /**
     * @notice Emitted when a protected clearing redeem operation is successfully created
     *         for a partition.
     * @param operator The address that initiated the protected clearing operation.
     * @param tokenHolder The address of the token holder executing the clearing.
     * @param partition The partition identifier for this clearing operation.
     * @param clearingId The unique identifier assigned to this clearing operation.
     * @param amount The amount cleared.
     * @param expirationDate The expiration timestamp for the clearing operation.
     * @param data The operation data associated with the clearing.
     * @param operatorData Additional operator-specific data.
     */
    event ProtectedClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a protected clearing transfer operation is successfully
     *         created for a partition.
     * @param operator The address that initiated the protected clearing operation.
     * @param tokenHolder The address of the token holder executing the clearing.
     * @param to The address to transfer tokens to.
     * @param partition The partition identifier for this clearing operation.
     * @param clearingId The unique identifier assigned to this clearing operation.
     * @param amount The amount cleared.
     * @param expirationDate The expiration timestamp for the clearing operation.
     * @param data The operation data associated with the clearing.
     * @param operatorData Additional operator-specific data.
     */
    event ProtectedClearedTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Initialises the protected-clearing-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeProtectedClearingByPartition() external;

    /**
     * @notice Creates a protected clearing redeem operation for a partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be activated, and the
     *      operation must include a valid signature from the token holder.
     *      Emits `ProtectedClearedRedeemByPartition` on success.
     * @param _protectedClearingOperation The clearing operation details, including
     *        partition, from address, deadline, and nonce for replay protection.
     * @param _amount The amount to redeem.
     * @param _signature ECDSA signature authorising the protected clearing operation.
     * @return success_ True when the clearing operation has been created.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingRedeemByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a protected clearing transfer operation for a partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be activated, and the
     *      operation must include a valid signature from the token holder.
     *      Emits `ProtectedClearedTransferByPartition` on success.
     * @param _protectedClearingOperation The clearing operation details, including
     *        partition, from address, deadline, and nonce for replay protection.
     * @param _amount The amount to transfer.
     * @param _to The address to transfer the tokens to.
     * @param _signature ECDSA signature authorising the protected clearing operation.
     * @return success_ True when the clearing operation has been created.
     * @return clearingId_ The identifier assigned to the newly created clearing operation.
     */
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
