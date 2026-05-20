// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Management is IERC3643Types {
    /**
     * @notice Emitted once when the ERC-3643 management facet is initialised on a token.
     * @dev Fires exclusively from `initialize_ERC3643` after the storage write succeeds.
     * @param operator The account that invoked initialisation (deployer or upgrade caller).
     */
    event ERC3643Initialized(address indexed operator);

    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external;
}
