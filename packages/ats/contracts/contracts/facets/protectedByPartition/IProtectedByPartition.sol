// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../protectedPartitions/IProtectedPartitions.sol";

/// @custom:hash resolverKey ProtectedByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_PROTECTED_BY_PARTITION = 0x2f9cd983bc92f917e9c55a3f61b8984646d96980224f4712084967ea1d24d62f;

/// @custom:hash nonceKey ProtectedTransferFromByPartition
// solhint-disable-next-line max-line-length
bytes32 constant NONCE_KEY_PROTECTED_TRANSFER_FROM_BY_PARTITION = 0x5440e561c55f91f22b6ac88baaebae772528bef8956e755c22eddb300a5defbd;

/// @custom:hash nonceKey ProtectedRedeemFromByPartition
// solhint-disable-next-line max-line-length
bytes32 constant NONCE_KEY_PROTECTED_REDEEM_FROM_BY_PARTITION = 0x919cab41dc9ab7b4be8e4972ee1edc08820e92db27c5542a3486edecb2ed077a;

/**
 * @title IProtectedByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for protected partition-scoped redemption and transfer operations,
 *         gated by a per-partition role and off-chain signature verification.
 * @dev Single-tier interface with events declared inline. No separate types interface;
 *      uses `IProtectedPartitions.ProtectionData` for cross-facet consistency.
 */
interface IProtectedByPartition {
    /**
     * @notice Emitted once when the protected-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeProtectedByPartition`.
     */
    event ProtectedByPartitionInitialized();

    /**
     * @notice Emitted when a protected transfer completes successfully.
     * @param operator The address that initiated the transfer (msg.sender).
     * @param from The token holder whose tokens are transferred.
     * @param to The recipient of the transferred tokens.
     * @param amount The quantity of tokens transferred.
     * @param partition The partition from which tokens are transferred.
     * @param protectionData The protection metadata used for signature verification.
     */
    event ProtectedTransferredByPartition(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 partition,
        IProtectedPartitions.ProtectionData protectionData
    );

    /**
     * @notice Emitted when a protected redemption completes successfully.
     * @param operator The address that initiated the redemption (msg.sender).
     * @param from The token holder whose tokens are redeemed.
     * @param amount The quantity of tokens redeemed.
     * @param partition The partition from which tokens are redeemed.
     * @param protectionData The protection metadata used for signature verification.
     */
    event ProtectedRedeemedByPartition(
        address indexed operator,
        address indexed from,
        uint256 amount,
        bytes32 partition,
        IProtectedPartitions.ProtectionData protectionData
    );

    /**
     * @notice Raised when an account is not authorised for a protected partition.
     * @dev The reported sender is resolved through `EvmAccessors` for forwarding support.
     * @param partition Partition whose access requirement is not satisfied.
     * @param sender Effective caller that lacks the required role.
     */
    error ProtectedPartitionRoleRequired(bytes32 partition, address sender);

    /**
     * @notice Initialises the protected-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeProtectedByPartition() external;

    /**
     * @notice Transfers tokens from a token holder to a recipient by presenting an
     *         off-chain signature, within a protected partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be disabled, and the partition
     *      must be flagged as protected. Emits `ProtectedTransferredByPartition` on success.
     * @param _partition The protected partition identifier.
     * @param _from The token holder whose tokens are transferred.
     * @param _to The recipient of the transferred tokens.
     * @param _amount The quantity of tokens to transfer.
     * @param _protectionData The protection payload, including the nonce and deadline
     *        used for signature replay protection and verification.
     * @return partitionKey_ The partition identifier as confirmation.
     */
    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external returns (bytes32);

    /**
     * @notice Redeems tokens from a token holder by presenting an off-chain signature,
     *         within a protected partition.
     * @dev Caller must hold the partition-specific role returned by
     *      `ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)`.
     *      The contract must not be paused, clearing must be disabled, and the partition
     *      must be flagged as protected. Emits `ProtectedRedeemedByPartition` on success.
     * @param _partition The protected partition identifier.
     * @param _from The token holder whose tokens are redeemed.
     * @param _amount The quantity of tokens to redeem.
     * @param _protectionData The protection payload, including the nonce and deadline
     *        used for signature replay protection and verification.
     */
    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external;
}
