// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey FixedRate
bytes32 constant RESOLVER_KEY_FIXED_RATE = 0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521;

interface IFixedRate {
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    /// @notice Emitted once when the FixedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initializeFixedRate` after the storage write succeeds.
    event FixedRateInitialized(FixedRateData initData);

    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    error InterestRateIsFixed();

    function initializeFixedRate(FixedRateData calldata _initData) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
