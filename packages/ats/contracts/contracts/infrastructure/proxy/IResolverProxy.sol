// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IResolverProxy
 * @author Asset Tokenization Studio Team
 * @notice Interface for the Diamond resolver proxy, defining the RBAC configuration structure
 *         and the error thrown when an unknown function selector is called.
 */
interface IResolverProxy {
    struct ResolverProxyConfigurationGeneric {
        bytes8 resolverProxyVersion;
        bytes content;
    }

    struct ResolverProxyConfigurationV2 {
        bytes32 configurationId;
        uint256 configurationVersion;
        bool replacementEnabled;
    }

    /// @notice Binds an access-control role to the set of addresses that hold it at construction time.
    /// @param role The bytes32 role identifier (e.g. DEFAULT_ADMIN_ROLE).
    /// @param members Addresses granted the role when the proxy is deployed.
    struct Rbac {
        bytes32 role;
        address[] members;
    }

    /// @notice Thrown when no function exists for function called.
    /// @param _functionSelector The four-byte selector that could not be resolved to a facet.
    error FunctionNotFound(bytes4 _functionSelector);

    /// @notice Thrown when the stored configuration carries an unrecognized version tag
    error UnrecognizedResolverProxyConfigurationVersion(uint256 _resolverProxyConfigurationVersion);
}
