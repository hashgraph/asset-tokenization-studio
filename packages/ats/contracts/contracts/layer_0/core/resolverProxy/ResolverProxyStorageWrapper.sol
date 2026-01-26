// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "../../../interfaces/resolver/IBusinessLogicResolver.sol";
import { _RESOLVER_PROXY_STORAGE_POSITION } from "../../../layer_1/constants/storagePositions.sol";
import { NonceStorageWrapper } from "../nonce/NonceStorageWrapper.sol";

// Remember to add the loupe functions from DiamondLoupeFacet.sol.sol to the resolverProxy.
// The loupe functions are required by the EIP2535 ResolverProxys standard
abstract contract ResolverProxyStorageWrapper is NonceStorageWrapper {
    struct FacetIdsAndSelectorPosition {
        bytes32 facetId;
        uint16 selectorPosition;
    }

    struct ResolverProxyStorage {
        IBusinessLogicResolver resolver;
        bytes32 resolverProxyConfigurationId;
        uint256 version;
        // AccessControl instead of owned. Only DEFAULT_ADMIN role.
    }

    function _getBusinessLogicResolver() internal view override returns (IBusinessLogicResolver) {
        return _resolverProxyStorage().resolver;
    }

    function _getResolverProxyConfigurationId() internal view override returns (bytes32) {
        return _resolverProxyStorage().resolverProxyConfigurationId;
    }

    function _getResolverProxyVersion() internal view override returns (uint256) {
        return _resolverProxyStorage().version;
    }

    /**
     * @dev This belongs to the ResolverProxyUnstructured contract.
     * Since it is not in the common inheritance chain we redeclare it here
     */
    function _resolverProxyStorage() internal pure returns (ResolverProxyStorage storage ds) {
        bytes32 position = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
