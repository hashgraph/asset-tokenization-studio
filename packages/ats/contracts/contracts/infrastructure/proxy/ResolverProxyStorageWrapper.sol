// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _RESOLVER_PROXY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @dev ResolverProxy storage for diamond pattern state
struct ResolverProxyStorage {
    IBusinessLogicResolver resolver;
    bytes32 resolverProxyConfigurationId;
    uint256 version;
}

/// @dev Facet ID and selector position mapping
struct FacetIdsAndSelectorPosition {
    bytes32 facetId;
    uint16 selectorPosition;
}

/// @title ResolverProxyStorageWrapper — Resolver proxy state management library
/// @notice Centralized resolver proxy functionality extracted from ResolverProxyStorageWrapper.sol
/// @dev Uses free function storage accessors from ExternalStorage.sol, no inheritance
library ResolverProxyStorageWrapper {
    // State-changing functions
    /// @dev Sets the BusinessLogicResolver address
    function setResolver(IBusinessLogicResolver resolver) internal {
        resolverProxyStorage().resolver = resolver;
    }

    /// @dev Sets the configuration ID
    function setConfigurationId(bytes32 configurationId) internal {
        resolverProxyStorage().resolverProxyConfigurationId = configurationId;
    }

    /// @dev Sets the version
    function setVersion(uint256 version_) internal {
        resolverProxyStorage().version = version_;
    }

    /// @dev Updates configuration ID and version while keeping the same resolver
    function updateConfig(bytes32 newConfigurationId, uint256 newVersion) internal {
        ResolverProxyStorage storage rps = resolverProxyStorage();
        rps.resolverProxyConfigurationId = newConfigurationId;
        rps.version = newVersion;
    }

    /// @dev Updates version while keeping the same resolver and configuration ID
    function updateVersion(uint256 newVersion) internal {
        resolverProxyStorage().version = newVersion;
    }

    /// @dev Updates all resolver proxy state: resolver, configuration ID, and version
    function updateAll(IBusinessLogicResolver newResolver, bytes32 newConfigurationId, uint256 newVersion) internal {
        ResolverProxyStorage storage rps = resolverProxyStorage();
        rps.resolver = newResolver;
        rps.resolverProxyConfigurationId = newConfigurationId;
        rps.version = newVersion;
    }

    // View functions
    /// @dev Returns the current BusinessLogicResolver (facet registry)
    function getResolver() internal view returns (IBusinessLogicResolver) {
        return resolverProxyStorage().resolver;
    }

    /// @dev Returns the configuration ID for this proxy
    function getConfigurationId() internal view returns (bytes32) {
        return resolverProxyStorage().resolverProxyConfigurationId;
    }

    /// @dev Returns the version of the current configuration
    function getVersion() internal view returns (uint256) {
        return resolverProxyStorage().version;
    }

    /// @dev Returns a JSON string with resolver proxy metadata
    // solhint-disable quotes
    function version() internal view returns (string memory) {
        ResolverProxyStorage storage rps = resolverProxyStorage();
        return
            string(
                abi.encodePacked(
                    "{",
                    '"Resolver": "',
                    Strings.toHexString(uint160(address(rps.resolver)), 20),
                    '", ',
                    '"Config ID": "',
                    Strings.toHexString(uint256(rps.resolverProxyConfigurationId), 32),
                    '", ',
                    '"Version": "',
                    Strings.toString(rps.version),
                    '"',
                    "}"
                )
            );
    }
    // solhint-enable quotes

    /// @dev Access resolver proxy storage
    function resolverProxyStorage() internal pure returns (ResolverProxyStorage storage resolverProxy_) {
        bytes32 pos = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            resolverProxy_.slot := pos
        }
    }
}
