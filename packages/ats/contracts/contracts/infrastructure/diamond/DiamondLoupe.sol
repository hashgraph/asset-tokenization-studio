// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// The functions in DiamondLoupeFacet.sol.sol MUST be added to a resolverProxy.
// The EIP-2535 ResolverProxy standard requires these functions.

import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ResolverProxyStorage, LibResolverProxy } from "../proxy/LibResolverProxy.sol";

abstract contract DiamondLoupe is IDiamondLoupe, IERC165, ResolverProxyUnstructured {
    function getFacets() external view override returns (Facet[] memory facets_) {
        ResolverProxyStorage storage ds = LibResolverProxy.resolverProxyStorage();
        facets_ = _getFacets(ds, 0, _getFacetsLength(ds));
    }

    function getFacetsLength() external view override returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLength(LibResolverProxy.resolverProxyStorage());
    }

    function getFacetsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (Facet[] memory facets_) {
        facets_ = _getFacets(LibResolverProxy.resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetSelectors(bytes32 _facetId) external view override returns (bytes4[] memory facetSelectors_) {
        ResolverProxyStorage storage ds = LibResolverProxy.resolverProxyStorage();
        facetSelectors_ = _getFacetSelectors(ds, _facetId, 0, _getFacetSelectorsLength(ds, _facetId));
    }

    function getFacetSelectorsLength(bytes32 _facetId) external view override returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _getFacetSelectorsLength(LibResolverProxy.resolverProxyStorage(), _facetId);
    }

    function getFacetSelectorsByPage(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _getFacetSelectors(
            LibResolverProxy.resolverProxyStorage(),
            _facetId,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetIds() external view override returns (bytes32[] memory facetIds_) {
        ResolverProxyStorage storage ds = LibResolverProxy.resolverProxyStorage();
        facetIds_ = _getFacetIds(ds, 0, _getFacetsLength(ds));
    }

    function getFacetIdsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIds(LibResolverProxy.resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetAddresses() external view override returns (address[] memory facetAddresses_) {
        ResolverProxyStorage storage ds = LibResolverProxy.resolverProxyStorage();
        facetAddresses_ = _getFacetAddresses(ds, 0, _getFacetsLength(ds));
    }

    function getFacetAddressesByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = _getFacetAddresses(LibResolverProxy.resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_) {
        facetId_ = _getFacetIdBySelector(LibResolverProxy.resolverProxyStorage(), _selector);
    }

    function getFacet(bytes32 _facetId) external view override returns (Facet memory facet_) {
        facet_ = _getFacet(LibResolverProxy.resolverProxyStorage(), _facetId);
    }

    function getFacetAddress(bytes4 _selector) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddress(LibResolverProxy.resolverProxyStorage(), _selector);
    }

    // This implements ERC-165.
    function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
        return _supportsInterface(LibResolverProxy.resolverProxyStorage(), _interfaceId);
    }
}
