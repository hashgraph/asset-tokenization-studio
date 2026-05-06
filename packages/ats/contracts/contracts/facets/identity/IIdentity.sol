// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IIdentityRegistry } from "../layer_1/ERC3643/IIdentityRegistry.sol";

/**
 * @title IIdentity
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing identity-registry and onchainID accessors plus their authorised
 *         setters, as required by the ERC-3643 surface.
 * @dev Pairs the read-only getters (`identityRegistry`, `onchainID`) with their owner-gated
 *      setters (`setIdentityRegistry`, `setOnchainID`). State-changing functions are expected
 *      to be restricted to `TREX_OWNER_ROLE` and to require the token to be unpaused; consumers
 *      should rely on the implementing facet for those guarantees.
 */
interface IIdentity {
    /**
     * @notice Sets the onchainID of the token to `_onchainID`.
     * @dev Restricted to `TREX_OWNER_ROLE` and only callable when the token is not paused.
     *      Emits an `UpdatedTokenInformation` event from the underlying storage wrapper.
     * @param _onchainID The new onchainID address to associate with the token.
     */
    function setOnchainID(address _onchainID) external;

    /**
     * @notice Sets the identity registry contract address.
     * @dev Restricted to `TREX_OWNER_ROLE` and only callable when the token is not paused.
     *      Emits an `IdentityRegistryAdded` event from the underlying storage wrapper.
     * @param _identityRegistry The new identity registry contract address.
     */
    function setIdentityRegistry(address _identityRegistry) external;

    /**
     * @notice Returns the address of the identity registry contract.
     * @return The current identity registry as `IIdentityRegistry`.
     */
    function identityRegistry() external view returns (IIdentityRegistry);

    /**
     * @notice Returns the onchainID address associated with the token.
     * @return The current onchainID address.
     */
    function onchainID() external view returns (address);
}
