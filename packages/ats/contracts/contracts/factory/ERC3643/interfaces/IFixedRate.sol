// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIFixedRate {
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
