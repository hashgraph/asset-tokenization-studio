// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/interestRate/fixedRate/IFixedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/// @custom:hash resolverKey FixedRate
bytes32 constant RESOLVER_KEY_FIXED_RATE = 0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521;

interface TRexIFixedRate {
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
