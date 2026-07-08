// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey InterestRate
bytes32 constant RESOLVER_KEY_INTEREST_RATE = 0xc09a5111a37fc8806e149b4a20c17a33a9487c6da8ee95f8a2b8ac31ea8dd2f3;

/**
 * @title IInterestRate
 * @author Asset Tokenization Studio Team
 * @notice Interface for the explicit coupon rate type selector facet.
 * @dev Pure types tier: function signatures and events only. Does NOT inherit `ICouponTypes`
 *      to avoid forcing read-only callers to pick up the full type tree.
 *      The `setCouponRateType` / `getCouponRateType` / `isCouponRateTypeSet` trio is the
 *      only surface exposed by this facet.
 */
interface IInterestRate {
    /**
     * @notice Discriminator that selects which coupon-rate formula is applied.
     * @dev STANDARD (0) is the implicit default when no rate type has been explicitly set.
     *      It passes user-supplied coupon rates through unchanged.
     */
    enum RateType {
        STANDARD,
        FIXED,
        KPI_LINKED
    }

    /**
     * @notice Emitted once when the interest rate type is initialised on a token.
     * @dev Fires exclusively from `initializeInterestRateType` after the storage write succeeds.
     * @param rateType The rate type that was set.
     */
    event InterestRateTypeInitialized(RateType rateType);

    /**
     * @notice Emitted when the coupon rate type is set (by factory initializer or admin).
     * @param operator The caller who invoked the setter.
     * @param rateType The `RateType` value that was selected.
     */
    event CouponRateTypeSet(address indexed operator, RateType rateType);

    /**
     * @notice Initializes the coupon rate type during asset deployment.
     * @dev Intended to be called by the factory immediately after proxy creation.
     *      No role required — the factory is trusted at deploy time.
     * @param _rateType The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED).
     */
    function initializeInterestRateType(RateType _rateType) external;

    /**
     * @notice Sets the coupon rate type discriminator for this asset.
     * @dev Requires `ROLE_INTEREST_RATE_MANAGER`.
     * @param _rateType The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED).
     */
    function setCouponRateType(RateType _rateType) external;

    /**
     * @notice Returns the stored coupon rate type.
     * @return The `RateType` value; defaults to `STANDARD` (0) if never set.
     */
    function getCouponRateType() external view returns (RateType);
}
