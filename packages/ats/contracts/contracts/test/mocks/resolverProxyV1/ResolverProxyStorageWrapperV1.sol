// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolverV1 } from "./IBusinessLogicResolverV1.sol";

/// @custom:hash storage ResolverProxy
bytes32 constant STORAGE_LOCATION_RESOLVER_PROXY = 0x688a1184cf65cae3790aef0eb6006209aa488bc22d1dd13eb263813b07a39300;

/**
 * @notice Storage layout backing a resolver-proxy instance.
 * @dev Records the `BusinessLogicResolver` pointer, the active configuration identifier and the
 *      pinned configuration version that together select the facet selectors served by the proxy.
 *      New fields must be appended below the APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.ResolverProxy
 */
struct ResolverProxyStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    IBusinessLogicResolverV1 resolver;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    bytes32 resolverProxyConfigurationId;
    uint256 version;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ResolverProxyStorageWrapperV1
 * @author Asset Tokenization Studio Team
 * @notice Internal library exposing read accessors for the resolver-proxy storage namespace.
 * @dev Mutations of these fields happen at proxy construction or via privileged upgrade flows;
 *      this wrapper only surfaces the values to facets that need to introspect the active
 *      resolver, configuration identifier or version.
 */
library ResolverProxyStorageWrapperV1 {
    /**
     * @notice Initializes the resolver-proxy storage.
     * @param _resolver The `BusinessLogicResolver` instance.
     * @param _resolverProxyConfigurationId The configuration identifier.
     * @param _version The configuration version.
     */
    function initResolverProxyStorage(
        IBusinessLogicResolverV1 _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version
    ) internal {
        ResolverProxyStorage storage ds = resolverProxyStorage();
        ds.resolver = _resolver;
        ds.resolverProxyConfigurationId = _resolverProxyConfigurationId;
        ds.version = _version;
    }

    /**
     * @notice Updates the `BusinessLogicResolver` instance.
     * @param _resolver The new resolver instance.
     */
    function setBusinessLogicResolver(IBusinessLogicResolverV1 _resolver) internal {
        resolverProxyStorage().resolver = _resolver;
    }

    /**
     * @notice Updates the configuration identifier.
     * @param _resolverProxyConfigurationId The new configuration identifier.
     */
    function setResolverProxyConfigurationId(bytes32 _resolverProxyConfigurationId) internal {
        resolverProxyStorage().resolverProxyConfigurationId = _resolverProxyConfigurationId;
    }

    /**
     * @notice Updates the configuration version.
     * @param _version The new configuration version.
     */
    function setResolverProxyVersion(uint256 _version) internal {
        resolverProxyStorage().version = _version;
    }

    /**
     * @notice Returns the `BusinessLogicResolver` contract that supplies the facet selectors.
     * @return The active resolver instance for this proxy.
     */
    function getBusinessLogicResolver() internal view returns (IBusinessLogicResolverV1) {
        return resolverProxyStorage().resolver;
    }

    /**
     * @notice Returns the configuration identifier selecting the facet set served by the proxy.
     * @return The configured `bytes32` identifier.
     */
    function getResolverProxyConfigurationId() internal view returns (bytes32) {
        return resolverProxyStorage().resolverProxyConfigurationId;
    }

    /**
     * @notice Returns the pinned configuration version served by the proxy.
     * @return The configuration version, zero when the proxy tracks the latest.
     */
    function getResolverProxyConfigurationVersion() internal view returns (uint256) {
        return resolverProxyStorage().version;
    }

    /**
     * @notice Returns the storage pointer for the ResolverProxy namespace.
     * @dev Resolves the ERC-7201 slot via inline assembly to obtain a struct reference at
     *      `STORAGE_LOCATION_RESOLVER_PROXY`.
     * @return ds Storage reference to the `ResolverProxyStorage` struct.
     */
    function resolverProxyStorage() private pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = STORAGE_LOCATION_RESOLVER_PROXY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
