// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IResolverProxy
 * @author Asset Tokenization Studio Team
 * @notice Interface for the Diamond resolver proxy, defining the RBAC configuration structure
 *         and the error thrown when an unknown function selector is called.
 */
interface IResolverProxy {
    /// @notice Version-tagged envelope wrapping the proxy's stored configuration payload.
    /// @dev The outer shape is fixed across versions: `resolverProxyVersion` selects how `content`
    ///      is decoded, allowing the configuration layout to evolve without breaking the storage slot.
    /// @param resolverProxyVersion The eight-byte version tag identifying the payload schema (e.g. V2).
    /// @param content The ABI-encoded version-specific configuration (e.g. `ResolverProxyConfigurationV2`).
    struct ResolverProxyConfigurationGeneric {
        bytes8 resolverProxyVersion;
        bytes content;
    }

    /// @notice Version 2 configuration selecting the facet selectors served by the proxy.
    /// @param configurationId The identifier of the configuration registered in the `BusinessLogicResolver`.
    /// @param configurationVersion The pinned version of that configuration the proxy resolves against.
    /// @param replacementEnabled Whether selector replacement is permitted for this configuration.
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
