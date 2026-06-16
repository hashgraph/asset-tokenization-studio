// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "./IResolverProxy.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { AccessControlStorageWrapper, RoleDataStorage } from "../../domain/core/AccessControlStorageWrapper.sol";

// Remember to add the loupe functions from DiamondLoupeFacet.sol.sol to the resolverProxy.
// The loupe functions are required by the EIP2535 ResolverProxys standard
abstract contract ResolverProxyUnstructured {
    using AccessControlStorageWrapper for RoleDataStorage;

    function _initialize(
        IBusinessLogicResolver _resolver,
        IResolverProxy.ResolverProxyConfigurationV2 memory _resolverProxyConfigurationV2,
        IResolverProxy.Rbac[] memory _rbacs
    ) internal {
        _resolver.checkResolverProxyConfigurationRegistered(
            _resolverProxyConfigurationV2.configurationId,
            _resolverProxyConfigurationV2.configurationVersion
        );
        ResolverProxyStorageWrapper.setResolver(_resolver);
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(_resolverProxyConfigurationV2);
        _assignRbacRoles(_rbacs);
    }

    function _assignRbacRoles(IResolverProxy.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (uint256 memberIndex; memberIndex < _rbacs[rbacIndex].members.length; memberIndex++) {
                AccessControlStorageWrapper.grantRole(_rbacs[rbacIndex].role, _rbacs[rbacIndex].members[memberIndex]);
            }
        }
    }

    function _getFacetsLength(ResolverProxyStorage storage _ds) internal view returns (uint256 facetsLength_) {
        facetsLength_ = _ds.resolver.getFacetsLengthByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion()
        );
    }

    function _getFacets(
        ResolverProxyStorage storage _ds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        facets_ = _ds.resolver.getFacetsByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetSelectorsLength(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId
    ) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _ds.resolver.getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _facetId
        );
    }

    function _getFacetSelectors(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _ds.resolver.getFacetSelectorsByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
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
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetAddresses(
        ResolverProxyStorage storage _ds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        facetAddresses_ = _ds.resolver.getFacetAddressesByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetIdBySelector(
        ResolverProxyStorage storage _ds,
        bytes4 _selector
    ) internal view returns (bytes32 facetId_) {
        facetId_ = _ds.resolver.getFacetIdByConfigurationIdVersionAndSelector(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _selector
        );
    }

    function _getFacet(
        ResolverProxyStorage storage _ds,
        bytes32 _facetId
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        facet_ = _ds.resolver.getFacetByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _facetId
        );
    }

    function _getFacetAddress(ResolverProxyStorage storage _ds, bytes4 _selector) internal view returns (address) {
        return _ds.resolver.resolveResolverProxyCall(_ds.resolverProxyConfiguration, _selector);
    }

    function _supportsInterface(
        ResolverProxyStorage storage _ds,
        bytes4 _interfaceId
    ) internal view returns (bool isSupported_) {
        isSupported_ = _ds.resolver.resolveSupportsInterface(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            _interfaceId
        );
    }
}
