// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquity } from "../../layer_2/equity/IEquity.sol";

/// @custom:hash resolverKey Equity
/// @dev Resolver key used to register and resolve the Equity USA capability.
///      Must remain stable across deployments to preserve resolver compatibility.
bytes32 constant RESOLVER_KEY_EQUITY = 0x32d1b4f5d593b1e786f1c491656e2db7e35a80754244b3c5e787a03db7fcef31;

/**
 * @title IEquityUSA
 * @notice Interface for initialising USA-specific equity metadata on a token.
 * @dev Extends the base equity interface with a one-time capability initialiser.
 *      Implementations are expected to enforce admin-only access and registration guards.
 * @author Hashgraph
 */
interface IEquityUSA is IEquity {
    /**
     * @notice Emitted once when the Equity USA capability is initialised on a token.
     * @param equityDetailsData The equity metadata applied during initialisation.
     */
    event EquityUSAInitialized(EquityDetailsData equityDetailsData);

    /**
     * @notice Initialises the Equity USA capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE` and is intended to be called by the factory.
     *      Emits `EquityUSAInitialized` after successful initialisation.
     * @param _equityDetailsData The equity metadata to store for the token.
     */
    function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
}
