// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "./IResolverProxy.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { AccessControlStorageWrapper, RoleDataStorage } from "../../domain/core/AccessControlStorageWrapper.sol";

// Remember to add the loupe functions from DiamondLoupeFacet.sol.sol to the resolverProxy.
// The loupe functions are required by the EIP2535 ResolverProxys standard

/**
 * @title Resolver Proxy Unstructured Base
 * @notice Provides internal resolver-proxy initialisation, configuration, RBAC, and loupe helpers.
 * @dev Stores resolver-proxy configuration through dedicated storage wrappers and queries facet
 *      metadata from the configured business-logic resolver. Intended to be inherited by proxy
 *      contracts that expose public entry points and delegate calls to resolved facets.
 * @author Asset Tokenization Studio Team
 */
abstract contract ResolverProxyUnstructured {
    using AccessControlStorageWrapper for RoleDataStorage;

    modifier onlyRegisteredResolverProxyConfiguration(
        IBusinessLogicResolver _resolver,
        bytes32 _configurationId,
        uint256 _configurationVersion
    ) {
        _checkResolverProxyConfigurationRegistered(_resolver, _configurationId, _configurationVersion);
        _;
    }

    /**
     * @notice Initialises resolver-proxy storage and grants initial RBAC roles.
     * @dev Requires the resolver to recognise the configuration id and version before storage is
     *      written. Grants each role to each supplied member and may revert from resolver or access
     *      control validation. Intended to be called once during construction or initialisation.
     * @param _resolver Business-logic resolver used for facet and interface resolution.
     * @param _resolverProxyConfigurationV2 Configuration V2 struct served by this proxy.
     * @param _rbacs Initial role assignments to grant.
     */
    function _initialize(
        IBusinessLogicResolver _resolver,
        IResolverProxy.ResolverProxyConfigurationV2 memory _resolverProxyConfigurationV2,
        IResolverProxy.Rbac[] memory _rbacs
    ) internal {
        _checkResolverProxyConfigurationRegistered(
            _resolver,
            _resolverProxyConfigurationV2.configurationId,
            _resolverProxyConfigurationV2.configurationVersion
        );
        ResolverProxyStorageWrapper.initResolverProxyStorage(_resolver, _resolverProxyConfigurationV2);
        _assignRbacRoles(_rbacs);
    }

    /**
     * @notice Grants batches of RBAC roles to their configured members.
     * @dev Iterates over every role/member pair and mutates access-control storage. Duplicate
     *      grants are handled by the access-control wrapper semantics.
     * @param _rbacs Role assignments to grant.
     */
    function _assignRbacRoles(IResolverProxy.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; ) {
            for (uint256 memberIndex; memberIndex < _rbacs[rbacIndex].members.length; ) {
                AccessControlStorageWrapper.grantRole(_rbacs[rbacIndex].role, _rbacs[rbacIndex].members[memberIndex]);
                unchecked {
                    ++memberIndex;
                }
            }
            unchecked {
                ++rbacIndex;
            }
        }
    }

    /**
     * @notice Returns the number of facets in the active resolver-proxy configuration.
     * @dev Reads the active resolver, configuration id, and version from proxy storage, then
     *      delegates the lookup to the business-logic resolver.
     * @return facetsLength_ Number of facets registered for the active configuration version.
     */
    function _getFacetsLength() internal view returns (uint256 facetsLength_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();
        facetsLength_ = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetsLengthByConfigurationIdAndVersion(configId, versionId);
    }

    /**
     * @notice Returns a paginated list of facets for the active configuration version.
     * @dev Performs an external view call to the configured resolver. Pagination semantics are
     *      defined by the resolver implementation.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of facets to return.
     * @return facets_ Page of facet metadata for the active configuration version.
     */
    function _getFacets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facets_ = ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetsByConfigurationIdAndVersion(
            configId,
            versionId,
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns the number of selectors assigned to a facet in the active configuration.
     * @dev Performs an external view call to the configured resolver using the active
     *      configuration id and version.
     * @param _facetId Facet identifier whose selector count is queried.
     * @return facetSelectorsLength_ Number of selectors registered for the facet.
     */
    function _getFacetSelectorsLength(bytes32 _facetId) internal view returns (uint256 facetSelectorsLength_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facetSelectorsLength_ = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(configId, versionId, _facetId);
    }

    /**
     * @notice Returns a paginated selector list for a facet in the active configuration.
     * @dev Performs an external view call to the configured resolver. Pagination semantics are
     *      defined by the resolver implementation.
     * @param _facetId Facet identifier whose selectors are queried.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of selectors to return.
     * @return facetSelectors_ Page of function selectors registered for the facet.
     */
    function _getFacetSelectors(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facetSelectors_ = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetSelectorsByConfigurationIdVersionAndFacetId(
                configId,
                versionId,
                _facetId,
                _pageIndex,
                _pageLength
            );
    }

    /**
     * @notice Returns a paginated list of facet identifiers for the active configuration version.
     * @dev Performs an external view call to the configured resolver. Ordering is determined by the
     *      resolver implementation.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of facet identifiers to return.
     * @return facetIds_ Page of facet identifiers.
     */
    function _getFacetIds(uint256 _pageIndex, uint256 _pageLength) internal view returns (bytes32[] memory facetIds_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facetIds_ = ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetIdsByConfigurationIdAndVersion(
            configId,
            versionId,
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns a paginated list of facet addresses for the active configuration version.
     * @dev Performs an external view call to the configured resolver. Returned addresses align with
     *      resolver-defined facet ordering.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of facet addresses to return.
     * @return facetAddresses_ Page of facet implementation addresses.
     */
    function _getFacetAddresses(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facetAddresses_ = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetAddressesByConfigurationIdAndVersion(configId, versionId, _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the facet identifier that owns a selector in the active configuration.
     * @dev Performs an external view call to the configured resolver and may return the resolver's
     *      default value when the selector is not registered.
     * @param _selector Function selector to resolve.
     * @return facetId_ Facet identifier associated with the selector.
     */
    function _getFacetIdBySelector(bytes4 _selector) internal view returns (bytes32 facetId_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facetId_ = ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetIdByConfigurationIdVersionAndSelector(
            configId,
            versionId,
            _selector
        );
    }

    /**
     * @notice Returns facet metadata for a facet in the active configuration version.
     * @dev Performs an external view call to the configured resolver.
     * @param _facetId Facet identifier to query.
     * @return facet_ Facet metadata registered for the identifier.
     */
    function _getFacet(bytes32 _facetId) internal view returns (IDiamondLoupe.Facet memory facet_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        facet_ = ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetByConfigurationIdVersionAndFacetId(
            configId,
            versionId,
            _facetId
        );
    }

    /**
     * @notice Resolves the facet implementation address for a function selector.
     * @dev Uses the active resolver-proxy configuration and version. Returns the resolver's result,
     *      which is expected to be `address(0)` when the selector cannot be resolved.
     * @param _selector Function selector to resolve.
     * @return Facet implementation address selected for the selector.
     */
    function _getFacetAddress(bytes4 _selector) internal view returns (address) {
        return
            ResolverProxyStorageWrapper.getBusinessLogicResolver().resolveResolverProxyCall(
                ResolverProxyStorageWrapper.getProxyConfiguration(),
                _selector
            );
    }

    /**
     * @notice Reports whether an interface is supported by the active configuration version.
     * @dev Delegates interface support resolution to the configured business-logic resolver.
     * @param _interfaceId ERC-165 interface identifier to check.
     * @return isSupported_ True when the active configuration supports the interface.
     */
    function _supportsInterface(bytes4 _interfaceId) internal view returns (bool isSupported_) {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        isSupported_ = ResolverProxyStorageWrapper.getBusinessLogicResolver().resolveSupportsInterface(
            configId,
            versionId,
            _interfaceId
        );
    }

    function _checkResolverProxyConfigurationRegistered(
        IBusinessLogicResolver _resolver,
        bytes32 _configurationId,
        uint256 _configurationVersion
    ) private {
        _resolver.checkResolverProxyConfigurationRegistered(_configurationId, _configurationVersion);
    }
}
