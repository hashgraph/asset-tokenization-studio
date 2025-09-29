// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IResolverProxy
} from '../../../interfaces/resolver/resolverProxy/IResolverProxy.sol';
import {
    IBusinessLogicResolver
} from '../../../interfaces/resolver/IBusinessLogicResolver.sol';
import {
    IDiamondLoupe
} from '../../../interfaces/resolver/resolverProxy/IDiamondLoupe.sol';
import {
    AccessControlStorageWrapper
} from '../../../layer_0/core/accessControl/AccessControlStorageWrapper.sol';
import {
    PauseStorageWrapper
} from '../../../layer_0/core/pause/PauseStorageWrapper.sol';
import {
    _RESOLVER_PROXY_STORAGE_POSITION
} from '../../../layer_1/constants/storagePositions.sol';

// Remember to add the loupe functions from DiamondLoupeFacet.sol.sol to the resolverProxy.
// The loupe functions are required by the EIP2535 ResolverProxys standard
abstract contract ResolverProxyUnstructured is
    AccessControlStorageWrapper,
    PauseStorageWrapper
{
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

    function _initialize(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) internal {
        _resolver.checkResolverProxyConfigurationRegistered(
            _resolverProxyConfigurationId,
            _version
        );
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        _updateResolver(ds, _resolver);
        _updateConfigId(ds, _resolverProxyConfigurationId);
        _updateVersion(ds, _version);
        _assignRbacRoles(_rbacs);
    }

    function _updateResolver(
        ResolverProxyStorage storage _ds,
        IBusinessLogicResolver _resolver
    ) internal {
        _ds.resolver = _resolver;
    }

    function _updateConfigId(
        ResolverProxyStorage storage _ds,
        bytes32 _resolverProxyConfigurationId
    ) internal {
        _ds.resolverProxyConfigurationId = _resolverProxyConfigurationId;
    }

    function _updateVersion(
        ResolverProxyStorage storage _ds,
        uint256 _version
    ) internal {
        _ds.version = _version;
    }

    function _assignRbacRoles(IResolverProxy.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (
                uint256 memberIndex;
                memberIndex < _rbacs[rbacIndex].members.length;
                memberIndex++
            ) {
                _grantRole(
                    _rbacs[rbacIndex].role,
                    _rbacs[rbacIndex].members[memberIndex]
                );
            }
        }
    }

    function _getFacetsLength(
        ResolverProxyStorage storage _ds
    ) internal view returns (uint256 facetsLength_) {
        facetsLength_ = _ds.resolver.getFacetsLengthByConfigurationIdAndVersion(
            _ds.resolverProxyConfigurationId,
            _ds.version
        );
    }

    function _getFacets(
        ResolverProxyStorage storage _ds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        facets_ = _ds.resolver.getFacetsByConfigurationIdAndVersion(
            _ds.resolverProxyConfigurationId,
            _ds.version,
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetSelectorsLength(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId
    ) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _ds
            .resolver
            .getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
                _ds.resolverProxyConfigurationId,
                _ds.version,
                _facetId
            );
    }

    function _getFacetSelectors(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _ds
            .resolver
            .getFacetSelectorsByConfigurationIdVersionAndFacetId(
                _ds.resolverProxyConfigurationId,
                _ds.version,
                _facetId,
                _pageIndex,
                _pageLength
            );
    }

    function _getFacetIds(
        ResolverProxyStorage storage _ds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = _ds.resolver.getFacetIdsByConfigurationIdAndVersion(
            _ds.resolverProxyConfigurationId,
            _ds.version,
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetAddresses(
        ResolverProxyStorage storage _ds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        facetAddresses_ = _ds
            .resolver
            .getFacetAddressesByConfigurationIdAndVersion(
                _ds.resolverProxyConfigurationId,
                _ds.version,
                _pageIndex,
                _pageLength
            );
    }

    function _getFacetIdBySelector(
        ResolverProxyStorage storage _ds,
        bytes4 _selector
    ) internal view returns (bytes32 facetId_) {
        facetId_ = _ds.resolver.getFacetIdByConfigurationIdVersionAndSelector(
            _ds.resolverProxyConfigurationId,
            _ds.version,
            _selector
        );
    }

    function _getFacet(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        facet_ = _ds.resolver.getFacetByConfigurationIdVersionAndFacetId(
            _ds.resolverProxyConfigurationId,
            _ds.version,
            _facetId
        );
    }

    function _getFacetAddress(
        ResolverProxyStorage storage _ds,
        bytes4 _selector
    ) internal view returns (address) {
        return
            _ds.resolver.resolveResolverProxyCall(
                _ds.resolverProxyConfigurationId,
                _ds.version,
                _selector
            );
    }

    function _supportsInterface(
        ResolverProxyStorage storage _ds,
        bytes4 _interfaceId
    ) internal view returns (bool isSupported_) {
        isSupported_ = _ds.resolver.resolveSupportsInterface(
            _ds.resolverProxyConfigurationId,
            _ds.version,
            _interfaceId
        );
    }

    function _resolverProxyStorage()
        internal
        pure
        returns (ResolverProxyStorage storage ds)
    {
        bytes32 position = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
