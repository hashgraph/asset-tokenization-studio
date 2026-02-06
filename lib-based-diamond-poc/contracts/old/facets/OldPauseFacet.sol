// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../internals/OldInternals.sol";
import "../../diamond/Interfaces.sol";

/**
 * OLD ARCHITECTURE - PauseFacet
 *
 * Notice: This facet ONLY needs pause and access control logic.
 * But because it inherits OldInternals, it also gets ALL token logic
 * compiled into its bytecode (mint, burn, transfer, approve, etc.)
 *
 * This is wasteful and makes the facet larger than necessary.
 */
contract OldPauseFacet is OldInternals, IPauseFacet {

    function paused() external view override returns (bool) {
        return _paused();
    }

    function pause() external override onlyRole(PAUSER_ROLE) whenNotPaused {
        _pause();
    }

    function unpause() external override onlyRole(PAUSER_ROLE) whenPaused {
        _unpause();
    }
}
