// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Management is IERC3643Types {
    /**
     * @notice Emitted once when the ERC-3643 management facet is initialised on a token.
     * @dev Fires exclusively from `initializeERC3643` after the storage write succeeds.
     */
    event ERC3643Initialized(address compliance, address identityRegistry);

    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    function initializeERC3643(address _compliance, address _identityRegistry) external;
}
