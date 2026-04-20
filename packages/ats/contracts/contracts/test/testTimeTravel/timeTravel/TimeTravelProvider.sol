// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelStorageWrapper } from "./TimeTravelStorageWrapper.sol";

/// @title TimeTravelProvider
/// @notice Test-only mixin providing timestamp/block-number overrides via TimeTravelStorageWrapper storage slots.
/// @dev TimeTravel variant facets inherit this alongside the production facet. In production the slots are 0
///      and native block values are returned; TimeTravelFacet writes to them during tests (chainId 1337).
abstract contract TimeTravelProvider {
    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return TimeTravelStorageWrapper.getBlockTimestamp();
    }

    function _getBlockNumber() internal view virtual returns (uint256) {
        return TimeTravelStorageWrapper.getBlockNumber();
    }
}
