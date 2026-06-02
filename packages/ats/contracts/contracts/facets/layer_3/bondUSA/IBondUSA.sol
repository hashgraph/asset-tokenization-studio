// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";

/// @custom:hash resolverKey BondVariableRate
bytes32 constant RESOLVER_KEY_BOND_VARIABLE_RATE = 0xbc8b53a2f8803b138aac441fbeb6b767a51b66a5f4d735c3d15af67cc72b9daa;

/// @custom:hash resolverKey BondVariableRead
bytes32 constant RESOLVER_KEY_BOND_VARIABLE_READ = 0xd9c3cc17a49d3ab289e489c0db3567f929bc463acd01dd1e37f8117aa48a1d74;

/// @custom:hash resolverKey BondKpiLinkedRate
bytes32 constant RESOLVER_KEY_BOND_KPI_LINKED_RATE = 0x1628b61a8f980e7dd8de7d9abd073c894e26e4097e7f4d34c2e213c57e716e98;

/// @custom:hash resolverKey BondKpiLinkedRead
bytes32 constant RESOLVER_KEY_BOND_KPI_LINKED_READ = 0xc823c70498ac1fa7fdafba568d2723060ed434d2ec52665adcf6ee1a619e4524;

/// @custom:hash resolverKey BondFixedRate
bytes32 constant RESOLVER_KEY_BOND_FIXED_RATE = 0xed82bfcb3081f78d7592451f5f09a9a1772cd71df1ab3a248f7c138f76b6b717;

/// @custom:hash resolverKey BondFixedRead
bytes32 constant RESOLVER_KEY_BOND_FIXED_READ = 0x022f5bb77103df6269ed7962189745c5fa816a3f85295ed85df8a5e4c662098f;

interface IBondUSA is IBondTypes {
    /**
     * @notice Emitted once when the bond-USA capability is initialised on a token.
     * @dev Fires exclusively from `initializeBondUSA`.
     * @param bondDetailsData Bond configuration data initialised.
     */
    event BondUSAInitialized(IBondTypes.BondDetailsData bondDetailsData);

    /**
     * @notice Initialises the bond-USA capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _bondDetailsData Bond configuration data to store during initialisation.
     */
    function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
}
