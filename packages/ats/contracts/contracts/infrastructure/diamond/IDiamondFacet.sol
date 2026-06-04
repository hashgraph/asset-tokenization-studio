// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDiamondFacet
 * @notice Interface for the Diamond facet initialisation function.
 * @dev Separated from IDiamond (EIP-2535 standard) so the standard interface
 *      remains unmodified.
 */
interface IDiamondFacet {
    /**
     * @notice Emitted once when the diamond facet is initialised.
     * @dev Fires exclusively from `initializeDiamondCut`.
     */
    event DiamondCutInitialized();

    /**
     * @notice Initialises the diamond facet and registers it in the initialiser registry.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeDiamondCut() external;
}
