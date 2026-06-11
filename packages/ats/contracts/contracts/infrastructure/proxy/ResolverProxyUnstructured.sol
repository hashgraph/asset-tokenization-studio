// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "./IResolverProxy.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { AccessControlStorageWrapper, RoleDataStorage } from "../../domain/core/AccessControlStorageWrapper.sol";

// Remember to add the loupe functions from DiamondLoupeFacet.sol.sol to the resolverProxy.
// The loupe functions are required by the EIP2535 ResolverProxys standard

/**
 * @title ResolverProxyUnstructured
 * @author Asset Tokenization Studio Team
 * @notice Abstract base for EIP-2535 diamond proxies that store their resolver, configuration
 *         id, and version in ERC-7201 unstructured storage slots rather than at fixed offsets.
 * @dev All resolver queries are forwarded to the `IBusinessLogicResolver` recorded in
 *      `ResolverProxyStorageWrapper`. Concrete proxies (`ResolverProxy`) and abstract facets
 *      (`DiamondCut`, `DiamondLoupe`) inherit this contract to share the same internal helpers.
 */
abstract contract ResolverProxyUnstructured {
    using AccessControlStorageWrapper for RoleDataStorage;

    /**
     * @notice Validates the resolver configuration and initialises all proxy storage fields.
     * @dev Calls `checkResolverProxyConfigurationRegistered` on `_resolver` to prevent
     *      activation of an unknown configuration, then persists resolver, config id, version,
     *      and RBAC roles. Must be called exactly once by the concrete constructor.
     * @param _resolver                     Business Logic Resolver to record.
     * @param _resolverProxyConfigurationId Configuration bundle identifier to activate.
     * @param _version                      Version of the configuration to activate.
     * @param _rbacs                        Initial role-member assignments to grant.
     */
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

    /**
     * @notice Persists a new Business Logic Resolver address in proxy storage.
     * @param _resolver The resolver to record.
     */
    function _updateResolver(IBusinessLogicResolver _resolver) internal {
        ResolverProxyStorageWrapper.setResolver(_resolver);
    }

    /**
     * @notice Persists a new configuration id in proxy storage.
     * @param _resolverProxyConfigurationId The configuration bundle identifier to record.
     */
    function _updateConfigId(bytes32 _resolverProxyConfigurationId) internal {
        ResolverProxyStorageWrapper.setResolverProxyConfigurationId(_resolverProxyConfigurationId);
    }

    /**
     * @notice Persists a new version number in proxy storage.
     * @param _version The version to record.
     */
    function _updateVersion(uint256 _version) internal {
        ResolverProxyStorageWrapper.setVersion(_version);
    }

    /**
     * @notice Grants each role to every member listed in the supplied RBAC array.
     * @dev Iterates the outer array (roles) and the inner array (members per role).
     *      No events are emitted here; role-grant events are emitted by the underlying
     *      `AccessControlStorageWrapper.grantRole`.
     * @param _rbacs Array of `{role, members[]}` tuples to process.
     */
    function _assignRbacRoles(IResolverProxy.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (uint256 memberIndex; memberIndex < _rbacs[rbacIndex].members.length; memberIndex++) {
                AccessControlStorageWrapper.grantRole(_rbacs[rbacIndex].role, _rbacs[rbacIndex].members[memberIndex]);
            }
        }
    }

    /**
     * @notice Returns the total number of facets registered for the proxy's active configuration.
     * @return facetsLength_ Number of facets in the active configuration version.
     */
    function _getFacetsLength() internal view returns (uint256 facetsLength_) {
        facetsLength_ = ResolverProxyStorageWrapper.getResolver().getFacetsLengthByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion()
        );
    }

    /**
     * @notice Returns a paginated slice of `Facet` structs for the proxy's active configuration.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Number of facets per page.
     * @return facets_ Slice of facet descriptors for the requested page.
     */
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

    /**
     * @notice Returns the number of selectors registered under a given facet id.
     * @param _facetId The resolver key identifying the facet.
     * @return facetSelectorsLength_ Number of selectors registered for `_facetId`.
     */
    function _getFacetSelectorsLength(bytes32 _facetId) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = ResolverProxyStorageWrapper
            .getResolver()
            .getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getVersion(),
                _facetId
            );
    }

    /**
     * @notice Returns a paginated slice of function selectors for a given facet id.
     * @param _facetId    The resolver key identifying the facet.
     * @param _pageIndex  Zero-based page index.
     * @param _pageLength Number of selectors per page.
     * @return facetSelectors_ Slice of selectors for the requested page.
     */
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

    /**
     * @notice Returns a paginated slice of facet id keys for the proxy's active configuration.
     * @param _pageIndex  Zero-based page index.
     * @param _pageLength Number of facet ids per page.
     * @return facetIds_ Slice of facet id keys for the requested page.
     */
    function _getFacetIds(uint256 _pageIndex, uint256 _pageLength) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = ResolverProxyStorageWrapper.getResolver().getFacetIdsByConfigurationIdAndVersion(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns a paginated slice of implementation addresses for the active configuration.
     * @param _pageIndex  Zero-based page index.
     * @param _pageLength Number of addresses per page.
     * @return facetAddresses_ Slice of facet implementation addresses for the requested page.
     */
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

    /**
     * @notice Returns the facet id key that owns the given function selector.
     * @param _selector Four-byte function selector to look up.
     * @return facetId_ The resolver key of the facet that covers `_selector`, or `bytes32(0)`.
     */
    function _getFacetIdBySelector(bytes4 _selector) internal view returns (bytes32 facetId_) {
        facetId_ = ResolverProxyStorageWrapper.getResolver().getFacetIdByConfigurationIdVersionAndSelector(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _selector
        );
    }

    /**
     * @notice Returns the full `Facet` descriptor (id, address, selectors, interface ids) for
     *         a given facet id key.
     * @param _facetId The resolver key identifying the facet.
     * @return facet_ The facet descriptor, or an empty struct if not found.
     */
    function _getFacet(bytes32 _facetId) internal view returns (IDiamondLoupe.Facet memory facet_) {
        facet_ = ResolverProxyStorageWrapper.getResolver().getFacetByConfigurationIdVersionAndFacetId(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _facetId
        );
    }

    /**
     * @notice Returns the implementation address that handles the given function selector.
     * @param _selector Four-byte function selector to resolve.
     * @return The facet implementation address, or `address(0)` if not registered.
     */
    function _getFacetAddress(bytes4 _selector) internal view returns (address) {
        return
            ResolverProxyStorageWrapper.getResolver().resolveResolverProxyCall(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getVersion(),
                _selector
            );
    }

    /**
     * @notice Returns whether the proxy's active configuration declares support for an
     *         ERC-165 interface.
     * @param _interfaceId The four-byte ERC-165 interface identifier to query.
     * @return isSupported_ True when the interface is supported.
     */
    function _supportsInterface(bytes4 _interfaceId) internal view returns (bool isSupported_) {
        isSupported_ = ResolverProxyStorageWrapper.getResolver().resolveSupportsInterface(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion(),
            _interfaceId
        );
    }
}
