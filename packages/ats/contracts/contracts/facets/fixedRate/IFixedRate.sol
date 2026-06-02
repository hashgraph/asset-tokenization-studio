// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey FixedRate
bytes32 constant RESOLVER_KEY_FIXED_RATE = 0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521;

/**
 * @title  IFixedRate
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing a token's fixed interest rate — its value and decimal
 *         precision.
 * @dev    Once set, the rate may be updated by an authorised operator at any time;
 *         `setRate` reverts with `InterestRateIsFixed` when the token's rate is locked.
 *         The rate is stored as a scaled integer: the effective rate is
 *         `rate / 10 ** rateDecimals`.
 */
interface IFixedRate {
    /**
     * @notice Packed storage for the fixed interest rate.
     * @param rate         Scaled rate value. Divide by `10 ** rateDecimals` to obtain the
     *                     effective rate.
     * @param rateDecimals Number of decimal places used to scale `rate`.
     */
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    /// @notice Emitted once when the FixedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initializeFixedRate` after the storage write succeeds.
    /// @param initData The rate and decimal precision written during initialisation.
    event FixedRateInitialized(FixedRateData initData);

    /**
     * @notice Emitted when the fixed rate is updated by an authorised operator.
     * @param operator        Address that performed the update.
     * @param newRate         New scaled rate value.
     * @param newRateDecimals New decimal precision for the rate.
     */
    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    /// @notice Thrown when `setRate` is called on a token whose rate has been locked.
    error InterestRateIsFixed();

    /**
     * @notice Initialises the fixed-rate capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _initData Rate value and decimal precision to write at initialisation.
     */
    function initializeFixedRate(FixedRateData calldata _initData) external;

    /**
     * @notice Updates the fixed interest rate.
     * @dev Reverts with `InterestRateIsFixed` if the rate has been locked.
     *      Requires an authorised operator role.
     * @param _newRate         New scaled rate value.
     * @param _newRateDecimals Decimal precision for `_newRate`.
     */
    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    /**
     * @notice Returns the current fixed interest rate and its decimal precision.
     * @return rate_     Scaled rate value.
     * @return decimals_ Decimal precision; divide `rate_` by `10 ** decimals_` for the
     *                   effective rate.
     */
    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
