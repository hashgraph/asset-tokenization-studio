// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "./IBondTypes.sol";

/// @title IBondRead
/// @notice Read functions for Bond domain operations
interface IBondRead is IBondTypes {
    /**
     * @notice Emitted once when the bond-USA read capability is initialised on a token.
     * @dev Fires exclusively from `initializeBondUSARead`.
     */
    event BondUSAReadInitialized();

    /**
     * @notice Initialises the bond-USA read capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBondUSARead() external;

    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);
}
