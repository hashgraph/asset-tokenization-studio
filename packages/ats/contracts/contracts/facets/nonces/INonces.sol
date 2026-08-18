// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Nonces
bytes32 constant RESOLVER_KEY_NONCES = 0xd1166cb96f266d69db4d4e49d81acaf5441b16bb11681f2b1b53dcf7e1bd3bf4;

/**
 * @title INonces
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying per-account nonces used in off-chain signature schemes such as
 *         EIP-2612 permit.
 * @dev Derived from OpenZeppelin's `Nonces` interface. Each nonce is a monotonically increasing
 *      counter; it is incremented internally after a valid signed operation (e.g. permit) to
 *      invalidate replay of the same signature.
 */
interface INonces {
    /**
     * @notice Emitted once when the nonces capability is initialised on a token.
     * @dev Fires exclusively from `initializeNonces`.
     */
    event NoncesInitialized();

    /**
     * @notice Initialises the nonces capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeNonces() external;

    /**
     * @notice Returns the current nonce for `owner`.
     * @param _owner Address whose nonce is queried.
     * @return Current nonce value for `owner`.
     */
    function nonces(address _owner) external view returns (uint256);

    /**
     * @notice Returns the current nonce for `_owner` used in protected partition transfers.
     * @dev Incremented internally upon consumption of a valid signed
     *      `protectedTransferFromByPartition` operation.
     * @param _owner Address whose partition transfer nonce is queried.
     * @return Current nonce value for `_owner`.
     */
    function protectedTransferFromByPartitionNonce(address _owner) external view returns (uint256);

    /**
     * @notice Returns the current nonce for `_owner` used in protected partition redemptions.
     * @dev Incremented internally upon consumption of a valid signed
     *      `protectedRedeemFromByPartition` operation.
     * @param _owner Address whose partition redemption nonce is queried.
     * @return Current nonce value for `_owner`.
     */
    function protectedRedeemFromByPartitionNonce(address _owner) external view returns (uint256);

    /**
     * @notice Returns the current nonce for `_owner` used in protected partition hold creations.
     * @dev Incremented internally upon consumption of a valid signed
     *      `protectedCreateHoldByPartition` operation.
     * @param _owner Address whose partition hold creation nonce is queried.
     * @return Current nonce value for `_owner`.
     */
    function protectedClearingCreateHoldByPartitionNonce(address _owner) external view returns (uint256);

    /**
     * @notice Returns the current nonce for `_owner` used in protected clearing partition
     *         transfers.
     * @dev Incremented internally upon consumption of a valid signed
     *      `protectedClearingTransferByPartition` operation.
     * @param _owner Address whose clearing partition transfer nonce is queried.
     * @return Current nonce value for `_owner`.
     */
    function protectedClearingTransferByPartitionNonce(address _owner) external view returns (uint256);

    /**
     * @notice Returns the current nonce for `_owner` used in protected clearing partition
     *         redemptions.
     * @dev Incremented internally upon consumption of a valid signed
     *      `protectedClearingRedeemByPartition` operation.
     * @param _owner Address whose clearing partition redemption nonce is queried.
     * @return Current nonce value for `_owner`.
     */
    function protectedClearingRedeemByPartitionNonce(address _owner) external view returns (uint256);
}
