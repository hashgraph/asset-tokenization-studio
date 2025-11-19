// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IFixedRate {
    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    function initialize_FixedRate(uint256 _initialRate, uint8 _initialRateDecimals) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
