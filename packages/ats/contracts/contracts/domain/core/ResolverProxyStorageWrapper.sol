// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { _RESOLVER_PROXY_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/**
 * @notice Storage structure for the ResolverProxy
 * @param resolver The business logic resolver contract interface
 * @param resolverProxyConfigurationId Unique identifier for the resolver proxy configuration
 * @param version Version number of the resolver proxy
 */
struct ResolverProxyStorage {
    IBusinessLogicResolver resolver;
    bytes32 resolverProxyConfigurationId;
    uint256 version;
}

/**
 * @title Resolver Proxy Storage Wrapper
 * @notice Provides access functions to the ResolverProxy storage
 * @dev This library manages the storage slot for ResolverProxy data using a fixed storage position
 * @author Tokeny Solutions
 */
library ResolverProxyStorageWrapper {
    /**
     * @notice Retrieves the business logic resolver
     * @dev Accesses the resolver from the stored proxy configuration
     * @return The business logic resolver contract interface
     */
    function getBusinessLogicResolver() internal view returns (IBusinessLogicResolver) {
        return resolverProxyStorage().resolver;
    }

    /**
     * @notice Retrieves the resolver proxy configuration ID
     * @dev Accesses the configuration ID from the stored proxy data
     * @return The unique identifier for the resolver proxy configuration
     */
    function getResolverProxyConfigurationId() internal view returns (bytes32) {
        return resolverProxyStorage().resolverProxyConfigurationId;
    }

    /**
     * @notice Retrieves the resolver proxy version
     * @dev Accesses the version from the stored proxy data
     * @return The version number of the resolver proxy
     */
    function getResolverProxyVersion() internal view returns (uint256) {
        return resolverProxyStorage().version;
    }

    /**
     * @notice Returns the storage reference for ResolverProxy data
     * @dev Computes the storage location using a predetermined slot position
     * @return ds Reference to the ResolverProxyStorage struct in storage
     */
    // TODO: internal -> private
    function resolverProxyStorage() internal pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
