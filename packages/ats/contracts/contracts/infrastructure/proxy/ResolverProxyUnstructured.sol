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
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) internal {
        _resolver.checkResolverProxyConfigurationRegistered(_resolverProxyConfigurationId, _version);
        _updateResolver(_resolver);
        _updateConfigId(_resolverProxyConfigurationId);
        _updateVersion(_version);
        _assignRbacRoles(_rbacs);
    }

    function _updateResolver(IBusinessLogicResolver _resolver) internal {
        ResolverProxyStorageWrapper.setResolver(_resolver);
    }

    function _updateConfigId(bytes32 _resolverProxyConfigurationId) internal {
        ResolverProxyStorageWrapper.setResolverProxyConfigurationId(_resolverProxyConfigurationId);
    }

    function _updateVersion(uint256 _version) internal {
        ResolverProxyStorageWrapper.setVersion(_version);
    }
    function _assignRbacRoles(IResolverProxy.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (uint256 memberIndex; memberIndex < _rbacs[rbacIndex].members.length; memberIndex++) {
                AccessControlStorageWrapper.grantRole(_rbacs[rbacIndex].role, _rbacs[rbacIndex].members[memberIndex]);
            }
        }
    }

    function _getFacetsLength() internal view returns (uint256 facetsLength_) {
        facetsLength_ = ResolverProxyStorageWrapper.getResolver().getFacetsLengthByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion()
        );
    }

    function _getFacets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        facets_ = ResolverProxyStorageWrapper.getResolver().getFacetsByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetSelectorsLength(bytes32 _facetId) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = ResolverProxyStorageWrapper
            .getResolver()
            .getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getVersion(),
                _facetId
            );
    }

    function _getFacetSelectors(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = ResolverProxyStorageWrapper.getResolver().getFacetSelectorsByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _facetId,
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetIds(uint256 _pageIndex, uint256 _pageLength) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = ResolverProxyStorageWrapper.getResolver().getFacetIdsByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetAddresses(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        facetAddresses_ = ResolverProxyStorageWrapper.getResolver().getFacetAddressesByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetIdBySelector(bytes4 _selector) internal view returns (bytes32 facetId_) {
        facetId_ = ResolverProxyStorageWrapper.getResolver().getFacetIdByConfigurationIdVersionAndSelector(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _selector
        );
    }

    function _getFacet(bytes32 _facetId) internal view returns (IDiamondLoupe.Facet memory facet_) {
        facet_ = ResolverProxyStorageWrapper.getResolver().getFacetByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _facetId
        );
    }

    function _getFacetAddress(bytes4 _selector) internal view returns (address) {
        return
            ResolverProxyStorageWrapper.getResolver().resolveResolverProxyCall(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getVersion(),
                _selector
            );
    }

    function _supportsInterface(bytes4 _interfaceId) internal view returns (bool isSupported_) {
        isSupported_ = ResolverProxyStorageWrapper.getResolver().resolveSupportsInterface(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _interfaceId
        );
    }
}
