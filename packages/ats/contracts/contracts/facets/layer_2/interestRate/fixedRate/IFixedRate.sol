// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IFixedRate {
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    /// @notice Emitted once when the FixedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initialize_FixedRate` after the storage write succeeds.
    /// @param operator The account that invoked initialisation (deployer or upgrade caller).
    event FixedRateInitialized(address indexed operator);

    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    error InterestRateIsFixed();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
