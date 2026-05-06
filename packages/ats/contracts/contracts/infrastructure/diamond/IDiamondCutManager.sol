// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

/**
 * @title IDiamondCutManager
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing diamond-facet configurations and version resolution.
 * @dev Maintains the mapping between configuration IDs, versions, facets, selectors,
 *   and interface IDs. Each configuration can have multiple versions; each version
 *   contains a set of facets with their selectors and interface IDs. Used by the
 *   Business Logic Resolver to route calls and enumerate supported interfaces.
 */
interface IDiamondCutManager {
    /**
     * @notice Lightweight pairing of a facet identifier with its target version.
     * @param id The facet's business-logic key (resolver key).
     * @param version The version of that facet to include in the configuration.
     */
    struct FacetConfiguration {
        bytes32 id;
        uint256 version;
    }

    /// @notice Emitted when a full configuration is created in a single transaction.
    /// @param configurationId Identifier of the new configuration.
    /// @param facetConfigurations Facets and versions included in the configuration.
    /// @param version Version number assigned to the configuration.
    event DiamondConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        uint256 version
    );

    /// @notice Emitted for each batch when creating a large configuration incrementally.
    /// @param configurationId Identifier of the configuration being built.
    /// @param facetConfigurations Facets added in this batch.
    /// @param _isLastBatch True when this is the final batch completing the configuration.
    /// @param version Version number assigned to the configuration.
    event DiamondBatchConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        bool _isLastBatch,
        uint256 version
    );

    /// @notice Emitted when an in-progress batch configuration is cancelled.
    /// @param configurationId Identifier of the cancelled configuration.
    event DiamondBatchConfigurationCanceled(bytes32 configurationId);

    /// @notice Emitted when a transition diff summary is registered for a config change.
    /// @param fromConfigId Source configuration identifier.
    /// @param fromVersion Source version.
    /// @param toConfigId Target configuration identifier.
    /// @param toVersion Target version.
    event TransitionDiffRegistered(
        bytes32 indexed fromConfigId,
        uint256 indexed fromVersion,
        bytes32 indexed toConfigId,
        uint256 toVersion,
        uint256 totalFacets,
        uint256 unchangedFacets
    );

    /// @notice Thrown when a configuration uses the zero bytes32 value as its identifier.
    error DefaultValueForConfigurationIdNotPermitted();

    /// @notice Thrown when a configuration references a facet ID that has not been registered.
    /// @param configurationId Configuration containing the invalid facet.
    /// @param facetId Facet identifier that was not found.
    error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId);

    /// @notice Thrown when a configuration lists the same facet ID more than once.
    /// @param facetId Duplicate facet identifier.
    error DuplicatedFacetInConfiguration(bytes32 facetId);

    /// @notice Thrown when an operation references an unknown configuration+version pair.
    /// @param resolverProxyConfigurationId Identifier that was not found.
    /// @param version Version that was not found.
    error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version);

    /// @notice Thrown when attempting to register a function selector that is blacklisted.
    /// @param selector The disallowed four-byte selector.
    error SelectorBlacklisted(bytes4 selector);

    /// @notice Thrown when a selector is already registered under a different facet in the same configuration.
    /// @param configurationId Configuration where the collision occurred.
    /// @param version Version where the collision occurred.
    /// @param facetId Facet that already owns the selector.
    /// @param selector Selector that is already taken.
    error SelectorAlreadyRegistered(bytes32 configurationId, uint256 version, bytes32 facetId, bytes4 selector);

    /**
     * @notice Create a new configuration to the latest version of all facets.
     * @param _configurationId unused identifier to the configuration.
     * @param _facetConfigurations.id list of business logics to be registered.
     * @param _facetConfigurations.version list of versions of each _facetIds.
     */
    function createConfiguration(bytes32 _configurationId, FacetConfiguration[] calldata _facetConfigurations) external;

    /**
     * @notice Create a new batch configuration to the latest version of all facets.
     * @param _configurationId unused identifier to the configuration.
     * @param _facetConfigurations.id list of business logics to be registered.
     * @param _facetConfigurations.version list of versions of each _facetIds.
     * @param _isLastBatch boolean to indicate if is the last batch iteration.
     */
    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) external;

    /**
     * @notice Cancel a current batch configuration.
     * @param _configurationId unused identifier to the configuration.
     */
    function cancelBatchConfiguration(bytes32 _configurationId) external;

    /**
     * @notice check if a resolverProxy is registered. If not revert.
     * @param _configurationId the configuration key to be checked.
     * @param _version configured version in the resolverProxy.
     */
    function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external;

    /**
     * @notice Computes and stores the transition diff summary between two config+versions.
     * @param _fromConfigId Source configuration identifier.
     * @param _fromVersion Source version.
     * @param _toConfigId Target configuration identifier.
     * @param _toVersion Target version.
     */
    function computeTransitionDiff(
        bytes32 _fromConfigId,
        uint256 _fromVersion,
        bytes32 _toConfigId,
        uint256 _toVersion
    ) external;

    /**
     * @notice Resolve the facet address knowing configuration, version and selector.
     * @param _configurationId configured key in the resolverProxy.
     * @param _version configured version in the resolverProxy. if is 0, ask for latest version.
     * @param _selector received in the call/tx to be resolver.
     * @return facetAddress_ with the resolver address of the facet.
     *       If facet address cant been resolved, returns address(0).
     */
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (address facetAddress_);

    /**
     * @notice Resolve if an interfaceId is present in the resolverProxy configured version.
     * @param _configurationId configured key in the resolverProxy.
     * @param _version configured version in the resolverProxy. if is 0, ask for latest version.
     * @param _interfaceId received to be tested.
     * @return exists_ a true if the interfaceId is part of the resolverProxy configuration.
     */
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view returns (bool exists_);

    /**
     * @notice if a resolverProxy is registered.
     * @param _configurationId the configuration key to be checked.
     * @param _version configured version in the resolverProxy.
     */
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (bool);

    /**
     * @notice Returns the length of configuration keys
     * @return configurationsLength_
     */
    function getConfigurationsLength() external view returns (uint256 configurationsLength_);

    /**
     * @notice Returns a list of configuration keys
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return configurationIds_ list of business logic keys
     */
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory configurationIds_);

    /**
     * @notice Returns the latest version registered of a resolverProxy configuration.
     * @param _configurationId key to be obtained.
     * @return latestVersion_ latest version registered of a resolverProxy configuration.
     */
    function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_);

    /**
     * @notice Returns the number of facets in a configuration version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @return facetsLength_ Number of facets in the configuration.
     */
    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (uint256 facetsLength_);

    /**
     * @notice Returns the facet details in a paginated list.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _pageIndex Page number (0-based).
     * @param _pageLength Items per page.
     * @return facets_ Array of facet structures (address + selectors).
     */
    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (IDiamondLoupe.Facet[] memory facets_);

    /**
     * @notice Returns the number of selectors registered for a specific facet.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facetSelectorsLength_ Number of selectors.
     */
    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetSelectorsLength_);

    /**
     * @notice Returns the selectors for a specific facet in a paginated list.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @param _pageIndex Page number (0-based).
     * @param _pageLength Items per page.
     * @return facetSelectors_ Array of four-byte selectors.
     */
    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory facetSelectors_);

    /**
     * @notice Returns the list of facet keys.
     * @param _configurationId key to filter the facets.
     * @param _version the version to filter the facets.
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return facetIds_ List of the facet key by key and version
     */
    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory facetIds_);

    /**
     * @notice Returns the facet-version pairings for a configuration in a range.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _start Start index (inclusive).
     * @param _end End index (exclusive).
     * @return facetConfigurations_ Array of facet id + version pairs.
     */
    function getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    ) external view returns (FacetConfiguration[] memory facetConfigurations_);

    /**
     * @notice Returns the facet addresses con configuration
     * @param _configurationId key to filter the facets.
     * @param _version the version to filter the facets.
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return facetAddresses_ List of the facet addresses
     */
    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory facetAddresses_);

    /**
     * @notice Returns the facet ID that owns a given function selector.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _selector Four-byte function selector.
     * @return facetId_ Identifier of the facet that handles the selector.
     */
    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (bytes32 facetId_);

    /**
     * @notice Returns the facet version registered for a specific facet in a configuration.
     * @param _configurationId Configuration identifier.
     * @param _version Configuration version to query.
     * @param _facetId Facet identifier.
     * @return facetVersion_ Version number of the facet within the configuration.
     */
    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetVersion_);

    /**
     * @notice Returns the full facet record for a specific facet in a configuration version.
     * @param _configurationId Configuration identifier.
     * @param _version Configuration version to query.
     * @param _facetId Facet identifier.
     * @return facet_ The facet record (address + selectors).
     */
    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (IDiamondLoupe.Facet memory facet_);

    /**
     * @notice Returns the implementation address for a specific facet in a configuration version.
     * @param _configurationId Configuration identifier.
     * @param _version Configuration version to query.
     * @param _facetId Facet identifier.
     * @return facetAddress_ Address of the facet implementation.
     */
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (address facetAddress_);

    /**
     * @notice Returns the pre-computed transition diff for a pair of configs.
     * @param _fromConfigId Source configuration identifier.
     * @param _fromVersion Source version.
     * @param _toConfigId Target configuration identifier.
     * @param _toVersion Target version.
     * @return totalFacets_ Total facets in new version.
     * @return unchangedFacets_ Facets identical with old config.
     * @return isRegistered_ True if diff was computed.
     */
    function getTransitionDiff(
        bytes32 _fromConfigId,
        uint256 _fromVersion,
        bytes32 _toConfigId,
        uint256 _toVersion
    ) external view returns (uint256 totalFacets_, uint256 unchangedFacets_, bool isRegistered_);
}
