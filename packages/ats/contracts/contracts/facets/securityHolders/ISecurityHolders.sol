// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Securityholders
bytes32 constant RESOLVER_KEY_SECURITYHOLDERS = 0x744edd4f33c7d5e322286e40155d549553e22329ac9503643bf36fc149504bc9;

/**
 * @title ISecurityHolders
 * @notice Interface for security holder operations in the ERC1410 standard
 */
interface ISecurityHolders {
    /**
     * @notice Emitted once when the security-holders capability is initialised on a token.
     * @dev Fires exclusively from `initializeSecurityHolders`.
     */
    event SecurityHoldersInitialized();

    /**
     * @notice Initialises the security-holders capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeSecurityHolders() external;

    /**
     * @notice Gets the security holders (paginated)
     * @param _pageIndex The page index for pagination
     * @param _pageLength The number of items per page
     * @return holders Array of security holder addresses
     */
    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders);

    /**
     * @notice Gets the total number of security holders
     * @return count Total number of security holders
     */
    function getTotalSecurityHolders() external view returns (uint256 count);
}
