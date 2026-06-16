// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { IResolverProxy } from "../../infrastructure/proxy/IResolverProxy.sol";
import { RESOLVER_PROXY_VERSION_V2 } from "../../constants/values.sol";

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
    IBusinessLogicResolver resolver;
    bytes resolverProxyConfiguration; //IResolverProxy.ResolverProxyConfigurationGeneric resolverProxyConfiguration;
}

/**
 * @title ResolverProxyStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal library exposing read accessors for the resolver-proxy storage namespace.
 * @dev Mutations of these fields happen at proxy construction or via privileged upgrade flows;
 *      this wrapper only surfaces the values to facets that need to introspect the active
 *      resolver, configuration identifier or version.
 */
library ResolverProxyStorageWrapper {
    function setResolver(IBusinessLogicResolver _resolver) internal {
        resolverProxyStorage().resolver = _resolver;
    }

    /**
     * @notice Stores a V2 configuration payload as a version-tagged envelope.
     * @dev Serialises `_v2` into the generic envelope (`RESOLVER_PROXY_VERSION_V2` + ABI-encoded
     *      payload) and writes it to the single `bytes` slot consumed by `resolveResolverProxyCall`.
     * @param _v2 The V2 configuration to persist.
     */
    function setResolverProxyConfigurationV2(IResolverProxy.ResolverProxyConfigurationV2 memory _v2) internal {
        resolverProxyStorage().resolverProxyConfiguration = abi.encode(
            IResolverProxy.ResolverProxyConfigurationGeneric({
                resolverProxyVersion: RESOLVER_PROXY_VERSION_V2,
                content: abi.encode(_v2)
            })
        );
    }

    /**
     * @notice Returns the `BusinessLogicResolver` contract that supplies the facet selectors.
     * @return The active resolver instance for this proxy.
     */
    function getBusinessLogicResolver() internal view returns (IBusinessLogicResolver) {
        return resolverProxyStorage().resolver;
    }

    /**
     * @notice Returns the pinned resolver proxy version served by the proxy.
     * @return The resolver proxy version.
     */
    function getResolverProxyVersion() internal view returns (bytes8) {
        return _decodeGeneric().resolverProxyVersion;
    }

    /**
     * @notice Returns the configuration identifier selecting the facet set served by the proxy.
     * @return The configured `bytes32` identifier.
     */
    function getResolverProxyConfigurationId() internal view returns (bytes32) {
        return _decodeV2().configurationId;
    }

    /**
     * @notice Returns the pinned configuration version served by the proxy.
     * @return The configuration version.
     */
    function getResolverProxyConfigurationVersion() internal view returns (uint256) {
        return _decodeV2().configurationVersion;
    }

    /**
     * @notice Returns the replacement enabled flag served by the proxy.
     * @return The replacement enabled flag.
     */
    function getResolverProxyReplacementEnabled() internal view returns (bool) {
        return _decodeV2().replacementEnabled;
    }

    /**
     * @notice Returns the full V2 configuration payload served by the proxy.
     * @return The decoded V2 configuration.
     */
    function getResolverProxyConfigurationV2()
        internal
        view
        returns (IResolverProxy.ResolverProxyConfigurationV2 memory)
    {
        return _decodeV2();
    }

    /**
     * @notice Returns the storage pointer for the ResolverProxy namespace.
     * @dev Resolves the ERC-7201 slot via inline assembly to obtain a struct reference at
     *      `STORAGE_LOCATION_RESOLVER_PROXY`.
     * @return ds Storage reference to the `ResolverProxyStorage` struct.
     */
    function resolverProxyStorage() internal pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = STORAGE_LOCATION_RESOLVER_PROXY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    /**
     * @notice Decodes the version-tagged configuration envelope held in storage.
     * @dev The outer `ResolverProxyConfigurationGeneric` shape is fixed across versions, so this
     *      decode succeeds regardless of which payload version `content` carries.
     * @return generic The decoded generic configuration.
     */
    function _decodeGeneric() private view returns (IResolverProxy.ResolverProxyConfigurationGeneric memory generic) {
        generic = abi.decode(
            resolverProxyStorage().resolverProxyConfiguration,
            (IResolverProxy.ResolverProxyConfigurationGeneric)
        );
    }

    /**
     * @notice Decodes the V2 payload carried inside the configuration envelope.
     * @return v2 The decoded V2 configuration.
     */
    function _decodeV2() private view returns (IResolverProxy.ResolverProxyConfigurationV2 memory v2) {
        IResolverProxy.ResolverProxyConfigurationGeneric memory generic = _decodeGeneric();
        v2 = abi.decode(generic.content, (IResolverProxy.ResolverProxyConfigurationV2));
    }
}
