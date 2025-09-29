// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ICompliance} from './ICompliance.sol';
import {IIdentityRegistry} from './IIdentityRegistry.sol';

interface IERC3643Read {
    /**
     * @dev Checks if an account has the agent role
     */
    function isAgent(address _agent) external view returns (bool);

    /**
     * @dev Returns the address of the identity registry contract.
     * @dev Returns the version of the contract as a string.
     *
     */
    function identityRegistry() external view returns (IIdentityRegistry);

    /**
     * @dev Returns the onchainID address associated with the token.
     */
    function onchainID() external view returns (address);

    /**
     * @dev Returns the address of the compliance contract.
     */
    function compliance() external view returns (ICompliance);

    /**
     * @notice Retrieves recovery status of a wallet
     */
    function isAddressRecovered(address _wallet) external view returns (bool);

    /**
     * @notice Retrieves the latest version of the contract.
     * @dev The version is represented as a string.
     */
    function version() external view returns (string memory);
}
