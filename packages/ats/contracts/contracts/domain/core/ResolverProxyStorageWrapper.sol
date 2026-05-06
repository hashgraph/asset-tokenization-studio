// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { _RESOLVER_PROXY_STORAGE_POSITION } from "../../constants/storagePositions.sol";

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

    // TODO: restrict to private — currently used directly by DiamondCut and test harnesses;
    //       callers should be migrated to the specific getters above before changing visibility.
    function resolverProxyStorage() internal pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
