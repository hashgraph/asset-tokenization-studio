// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquity } from "../../layer_2/equity/IEquity.sol";

/// @custom:hash resolverKey Equity
bytes32 constant RESOLVER_KEY_EQUITY = 0x32d1b4f5d593b1e786f1c491656e2db7e35a80754244b3c5e787a03db7fcef31;

interface IEquityUSA is IEquity {
    /**
     * @notice Emitted once when the equity-USA capability is initialised on a token.
     * @dev Fires exclusively from `initializeEquityUSA`.
     */
    event EquityUSAInitialized();

    /**
     * @notice Initialises the equity-USA capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
}
