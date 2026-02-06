// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../internals/OldInternals.sol";
import "../../diamond/Interfaces.sol";

/**
 * OLD ARCHITECTURE - MintableFacet
 *
 * This facet ONLY needs mint/burn + access control + pause.
 * But because it inherits OldInternals, it also gets:
 * - transfer logic (not used)
 * - approve logic (not used)
 * - allowance logic (not used)
 * - etc.
 */
contract OldMintableFacet is OldInternals, IMintableFacet {

    function mint(address to, uint256 amount) external override onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external override onlyRole(MINTER_ROLE) whenNotPaused {
        _burn(from, amount);
    }
}
