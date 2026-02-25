// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimestampProvider } from "../../infrastructure/lib/TimestampProvider.sol";
import { LibTimeTravel } from "./LibTimeTravel.sol";

/// @title TimeTravelProvider
/// @notice Test-only mixin that overrides TimestampProvider to use LibTimeTravel storage slots.
/// @dev Concrete TimeTravel variant facets inherit both the production facet and this contract.
///      C3 linearization ensures these overrides win over TimestampProvider's defaults.
abstract contract TimeTravelProvider is TimestampProvider {
    function _getBlockTimestamp() internal view virtual override returns (uint256) {
        return LibTimeTravel.getBlockTimestamp();
    }

    function _getBlockNumber() internal view virtual override returns (uint256) {
        return LibTimeTravel.getBlockNumber();
    }
}
