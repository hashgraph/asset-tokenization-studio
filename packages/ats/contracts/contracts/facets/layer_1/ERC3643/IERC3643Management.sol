// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Management is IERC3643Types {
    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external;

    /**
     * @dev Sets the onchainID of the token to `_onchainID`.
     * @dev Performs a forced transfer of `_amount` tokens from `_from` to `_to`.
     *
     * This function should only be callable by an authorized entities
     *
     * Returns `true` if the transfer was successful.
     *
     * Emits an UpdatedTokenInformation event.
     */
    function setOnchainID(address _onchainID) external;

    /**
     * @dev Sets the identity registry contract address.
     * @dev Mints `_amount` tokens to the address `_to`.
     *
     * Emits an IdentityRegistryAdded event.
     */
    function setIdentityRegistry(address _identityRegistry) external;

    /**
     * @notice Gives an account the agent role
     * @notice Granting an agent role allows the account to perform multiple ERC-1400 actions
     * @dev Can only be called by the role admin
     */
    function addAgent(address _agent) external;

    /**
     * @notice Revokes an account the agent role
     * @dev Can only be called by the role admin
     */
    function removeAgent(address _agent) external;

    /**
     * @notice Transfers the status of a lost wallet to a new wallet
     * @dev Can only be called by the agent
     */
    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool);
}
