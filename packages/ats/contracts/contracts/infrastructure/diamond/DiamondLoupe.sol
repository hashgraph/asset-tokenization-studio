// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// The functions in DiamondLoupeFacet.sol.sol MUST be added to a resolverProxy.
// The EIP-2535 ResolverProxy standard requires these functions.
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title Diamond Loupe
 * @notice Exposes read-only introspection helpers for resolver-proxy facet metadata.
 * @dev Implements the EIP-2535 loupe view surface over resolver-proxy storage. All queries are
 *      read-only and delegate pagination, selector, facet and ERC-165 lookups to inherited
 *      storage helpers.
 * @author Asset Tokenization Studio Team
 */
abstract contract DiamondLoupe is IDiamondLoupe, IERC165, ResolverProxyUnstructured {
    /// @inheritdoc IDiamondLoupe
    function getFacets() external view override returns (Facet[] memory facets_) {
        facets_ = _getFacets(0, _getFacetsLength());
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetsLength() external view override returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLength();
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (Facet[] memory facets_) {
        facets_ = _getFacets(_pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetSelectors(bytes32 _facetId) external view override returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _getFacetSelectors(_facetId, 0, _getFacetSelectorsLength(_facetId));
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetSelectorsLength(bytes32 _facetId) external view override returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _getFacetSelectorsLength(_facetId);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetSelectorsByPage(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _getFacetSelectors(_facetId, _pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetIds() external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIds(0, _getFacetsLength());
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetIdsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIds(_pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetAddresses() external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = _getFacetAddresses(0, _getFacetsLength());
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetAddressesByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = _getFacetAddresses(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the facet identifier registered for a function selector.
     * @dev Reads resolver-proxy selector metadata and returns zero when the selector is absent.
     * @param _selector Function selector to resolve.
     * @return facetId_ Facet identifier associated with the selector.
     */
    function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_) {
        facetId_ = _getFacetIdBySelector(_selector);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacet(bytes32 _facetId) external view override returns (Facet memory facet_) {
        facet_ = _getFacet(_facetId);
    }

    /// @inheritdoc IDiamondLoupe
    function getFacetAddress(bytes4 _selector) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddress(_selector);
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
        return _supportsInterface(_interfaceId);
    }
}
