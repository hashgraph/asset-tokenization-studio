// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Maturity
bytes32 constant RESOLVER_KEY_MATURITY = 0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82;

/**
 * @title  IMaturity
 * @notice Interface for maturity redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity` and `updateMaturityDate` manage the token maturity lifecycle,
 *         registered under `RESOLVER_KEY_MATURITY`.
 *         Events: `MaturityDateUpdated`. Errors: `MaturityDateInvalid`.
 * @author Asset Tokenization Studio Team
 */
interface IMaturity {
    /**
     * @notice Emitted once when the maturity date is set for the first time via
     *         `initializeMaturity`.
     * @param maturityDate  Initial maturity timestamp (Unix epoch, seconds).
     */
    event MaturityInitialized(uint256 indexed maturityDate);

    /**
     * @notice Emitted whenever the maturity date is updated via `updateMaturityDate`.
     * @param tokenId              Address of the token proxy whose date was updated.
     * @param maturityDate         New maturity timestamp (Unix epoch, seconds).
     * @param previousMaturityDate Previous maturity timestamp that was replaced.
     */
    event MaturityDateUpdated(
        address indexed tokenId,
        uint256 indexed maturityDate,
        uint256 indexed previousMaturityDate
    );

    /**
     * @notice Emitted once after `fullRedeemAtMaturity` has redeemed every partition held by
     *         `tokenHolder`.
     * @param tokenHolder Token holder whose full partition list was redeemed.
     */
    event FullyRedeemedAtMaturity(address indexed tokenHolder);

    /**
     * @notice Emitted once after `redeemAtMaturityByPartitionRange` has redeemed the requested
     *         page of partitions held by `tokenHolder`.
     * @param tokenHolder Token holder whose partitions were redeemed.
     * @param pageIndex   Zero-based index of the page that was redeemed.
     * @param pageLength  Number of partitions per page, as requested by the caller.
     */
    event RedeemedAtMaturityByPartitionRange(address indexed tokenHolder, uint256 pageIndex, uint256 pageLength);

    /**
     * @notice Thrown when a maturity date fails validation.
     * @dev Reverts when a proposed maturity date is not strictly in the future at the time it
     *      is set, or when a maturity-gated action is attempted before the stored maturity
     *      date has been reached.
     */
    error MaturityDateInvalid();

    /**
     * @notice Sets the token maturity date exactly once during deployment.
     * @dev    Called by the Factory immediately after the proxy is deployed. No role gate —
     *         the one-time guard is enforced by `onlyNotMaturityInitialized`, which reverts with
     *         `AlreadyInitialized` on any subsequent call. Persists the date via
     *         `MaturityDateStorageWrapper.initializeMaturity`.
     * @dev    Emits {MaturityInitialized} with the contract address and the maturity date.
     * @param  _maturityDate Maturity timestamp to set (Unix epoch, in seconds). Must be strictly
     *                       greater than zero and in the future at deployment time.
     */
    function initializeMaturity(uint256 _maturityDate) external;

    /**
     * @notice Redeems all token partitions held by a token holder at maturity.
     * @dev    Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing
     *         must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC
     *         status, must not be recovered, and the current timestamp must be at or past the
     *         maturity date. Iterates every partition owned by `_tokenHolder` and redeems each
     *         balance in full. Reverts with an unexpected error if any partition balance is zero.
     * @dev    Emits {TransferByPartition} and {RedeemedByPartition} for each redeemed partition
     *         via `ERC1410StorageWrapper.redeemByPartition`, then {FullyRedeemedAtMaturity} once
     *         after every partition has been processed.
     * @param  _tokenHolder Address of the token holder whose partitions are to be redeemed.
     */
    function fullRedeemAtMaturity(address _tokenHolder) external;

    /**
     * @notice Redeems a bounded page of the token partitions held by a token holder at maturity.
     * @dev    Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing
     *         must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC
     *         status, must not be recovered, and the current timestamp must be at or past the
     *         maturity date. Iterates only the partitions in the `[_pageIndex * _pageLength,
     *         _pageIndex * _pageLength + _pageLength)` range of `_tokenHolder`'s partition list,
     *         clamped to the actual partition count, and redeems each balance in full. Reverts
     *         with an unexpected error if any partition in that range has a zero balance. Exists
     *         so a holder with more partitions than fit in one block's gas limit can still be
     *         fully redeemed across multiple calls; `fullRedeemAtMaturity` remains available
     *         unchanged for holders within the existing gas budget.
     * @dev    Emits {TransferByPartition} and {RedeemedByPartition} for each redeemed partition
     *         via `ERC1410StorageWrapper.redeemByPartition`, then
     *         {RedeemedAtMaturityByPartitionRange} once after the page has been processed.
     * @param  _tokenHolder Address of the token holder whose partitions are to be redeemed.
     * @param  _pageIndex   Zero-based index of the page of partitions to redeem.
     * @param  _pageLength  Number of partitions per page.
     */
    function redeemAtMaturityByPartitionRange(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external;

    /**
     * @notice Updates the token maturity date to a new timestamp.
     * @dev    Caller must hold `ROLE_MATURITY_MANAGER`. Contract must be unpaused. `_newMaturityDate`
     *         must satisfy the validity constraint enforced by `onlyValidMaturityDate` — the new
     *         date must be strictly greater than the current maturity date. Persists the new date
     *         via `MaturityDateStorageWrapper.setMaturityDate`.
     * @dev    Emits {MaturityDateUpdated} with the contract address, the new maturity date, and
     *         the previous maturity date.
     * @param  _newMaturityDate New maturity timestamp to set (Unix epoch, in seconds).
     * @return success_         Always `true` on successful execution.
     */
    function updateMaturityDate(uint256 _newMaturityDate) external returns (bool success_);

    /**
     * @notice Returns the current token maturity date.
     * @dev    Reads directly from `MaturityDateStorageWrapper` storage slot. No access-control gate —
     *         maturity date is public information.
     * @return maturityDate_ Current maturity timestamp (Unix epoch, in seconds). Returns zero if
     *                       the date has not been set yet.
     */
    function getMaturityDate() external view returns (uint256 maturityDate_);
}
