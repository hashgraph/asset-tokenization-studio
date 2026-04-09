// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

interface TRexIFixedRate {
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    error InterestRateIsFixed();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
