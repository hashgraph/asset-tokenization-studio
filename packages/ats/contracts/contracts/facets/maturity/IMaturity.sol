// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Maturity
bytes32 constant RESOLVER_KEY_MATURITY = 0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82;

/**
 * @title  IMaturity
 * @notice Interface for bond maturity redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity` and `updateMaturityDate` are extracted from the Bond facet
 *         into a dedicated Maturity facet registered under `RESOLVER_KEY_MATURITY`.
 *         Events and errors — `MaturityDateUpdated` and `BondMaturityDateWrong` — are
 *         inherited from `IBondTypes`.
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
     * @dev    Emits {RedeemedByPartition} for each redeemed partition via
     *         `ERC1410StorageWrapper.redeemByPartition`.
     * @param  _tokenHolder Address of the token holder whose partitions are to be redeemed.
     */
    function fullRedeemAtMaturity(address _tokenHolder) external;

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
