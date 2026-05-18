// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";

/// @custom:hash storage ResolverProxy
bytes32 constant STORAGE_LOCATION_RESOLVER_PROXY = 0x688a1184cf65cae3790aef0eb6006209aa488bc22d1dd13eb263813b07a39300;

/// @custom:storage-location erc7201:security.token.standard.storage.ResolverProxy
struct ResolverProxyStorage {
    IBusinessLogicResolver resolver;
    bytes32 resolverProxyConfigurationId;
    uint256 version;
}

library ResolverProxyStorageWrapper {
    function getBusinessLogicResolver() internal view returns (IBusinessLogicResolver) {
        return resolverProxyStorage().resolver;
    }

    function getResolverProxyConfigurationId() internal view returns (bytes32) {
        return resolverProxyStorage().resolverProxyConfigurationId;
    }

    function getResolverProxyVersion() internal view returns (uint256) {
        return resolverProxyStorage().version;
    }

    function resolverProxyStorage() internal pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = STORAGE_LOCATION_RESOLVER_PROXY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
