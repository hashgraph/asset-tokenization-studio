// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";

interface IBondUSA is IBondTypes {
    /**
     * @notice Emitted once when the bond-USA capability is initialised on a token.
     * @dev Fires exclusively from `initializeBondUSA`.
     */
    event BondUSAInitialized();

    /**
     * @notice Initialises the bond-USA capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _bondDetailsData Bond configuration data to store during initialisation.
     */
    function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
}
