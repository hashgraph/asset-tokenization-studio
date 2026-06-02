// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey ProtectedPartitions
bytes32 constant RESOLVER_KEY_PROTECTED_PARTITIONS = 0x895834530eae98f8a742fe98f3d528d3cce6c6a51af63b495414bdf391180dd7;

interface IProtectedPartitions {
    /**
     * @notice Payload bundling the EIP-712 authorisation fields for a protected operation.
     * @param deadline Latest block timestamp at which the signature remains valid.
     * @param nonce Per-holder nonce consumed on submission to prevent signature replay.
     * @param signature EIP-712 signature produced by the token holder authorising the operation.
     */
    struct ProtectionData {
        uint256 deadline;
        uint256 nonce;
        bytes signature;
    }

    /**
     * @notice Emitted once when the protected partitions capability is initialised on a token.
     * @dev Fires exclusively from `initializeProtectedPartitions` after the storage write succeeds.
     * @param arePartitionsProtected Initial protection state set at deployment time.
     */
    event ProtectedPartitionsInitialized(bool arePartitionsProtected);

    /**
     * @notice Emitted when the protected-partition mode is activated.
     * @param operator The address that called `protectPartitions`.
     */
    event PartitionsProtected(address indexed operator);

    /**
     * @notice Emitted when the protected-partition mode is deactivated.
     * @param operator The address that called `unprotectPartitions`.
     */
    event PartitionsUnProtected(address indexed operator);

    /**
     * @notice Emitted when a signature-authorised transfer executes under protected-partition mode.
     * @param partition Partition from which the tokens are transferred.
     * @param operator The address that submitted the protected transfer.
     * @param from The holder whose tokens are being transferred; must be the signer.
     * @param to Recipient of the transferred tokens.
     * @param value Number of tokens transferred.
     * @param deadline Signature validity deadline supplied with the operation.
     * @param nonce Holder nonce consumed by this operation.
     * @param signature EIP-712 signature provided by the holder.
     */
    event ProtectedTransferFrom(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        address to,
        uint256 value,
        uint256 deadline,
        uint256 nonce,
        bytes signature
    );

    /**
     * @notice Emitted when a signature-authorised redemption executes under protected-partition mode.
     * @param partition Partition from which the tokens are redeemed.
     * @param operator The address that submitted the protected redemption.
     * @param from The holder whose tokens are being redeemed; must be the signer.
     * @param value Number of tokens redeemed.
     * @param deadline Signature validity deadline supplied with the operation.
     * @param nonce Holder nonce consumed by this operation.
     * @param signature EIP-712 signature provided by the holder.
     */
    event ProtectedRedeemFrom(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        uint256 value,
        uint256 deadline,
        uint256 nonce,
        bytes signature
    );

    /**
     * @notice Reverts when a transfer is attempted while partitions are protected and the
     *         caller does not hold the required partition role.
     * @param account The caller lacking the required role.
     * @param role The role that would have been needed to proceed.
     */
    error PartitionsAreProtectedAndNoRole(address account, bytes32 role);

    /// @notice Reverts when a protected-mode operation is attempted but partitions are not currently protected.
    error PartitionsAreUnProtected();

    /// @notice Reverts when an operation that requires unprotected mode is attempted while partitions are protected.
    error PartitionsAreProtected();

    /**
     * @notice Initialises the protected-partitions capability with the given starting state.
     * @dev Called once during token deployment; reverts if the facet has already been registered.
     * @param _arePartitionsProtected Initial protection state; `true` enables protection immediately.
     * @return success_ Always `true` when the call does not revert.
     */
    function initializeProtectedPartitions(bool _arePartitionsProtected) external returns (bool success_);

    /**
     * @notice Activates the protected partitions mode
     * @dev Disables the ability to freely transfer tokens unless the sender has the requited role for the partition
     */
    function protectPartitions() external returns (bool success_);

    /**
     * @notice Deactivates the protected partitions mode
     * @dev Enables the ability to freely transfer tokens
     */
    function unprotectPartitions() external returns (bool success_);

    /**
     * @notice Returns whether the protected partitions mode is active
     * @dev If true, transfers are restricted to accounts having the required role for the partition
     * @return bool true if the protected partitions mode is active, false otherwise
     */
    function arePartitionsProtected() external view returns (bool);

    /**
     * @notice Calculates the role required to transfer tokens from a given partition
     * @param _partition The partition to calculate the role for
     * @return roleForPartition_ The role required to transfer tokens from the given partition
     */
    function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_);
}
