// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

/**
 * @title IDiamondCutManager
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing diamond facet configurations and resolving selectors.
 * @dev Maintains a versioned registry of facet configurations per configuration ID.
 *   Each configuration stores facet IDs with their associated selectors and
 *   interface IDs, enabling the ResolverProxy to route function calls to the
 *   correct facet implementation.
 */
interface IDiamondCutManager {
    /// @notice Facet identity within a configuration version.
    /// @param id Unique facet identifier.
    /// @param version Facet implementation version.
    struct FacetConfiguration {
        bytes32 id;
        uint256 version;
    }

    /// @notice Emitted when a new configuration is created in a single transaction.
    /// @param configurationId Identifier for the created configuration.
    /// @param facetConfigurations List of facets and their versions.
    /// @param version Configuration version number.
    event DiamondConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        uint256 version
    );

    /// @notice Emitted when a batch configuration creation progresses.
    /// @param configurationId Identifier for the batched configuration.
    /// @param facetConfigurations Partial list of facets in this batch.
    /// @param _isLastBatch True when this is the final batch for the configuration.
    /// @param version Configuration version number.
    event DiamondBatchConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        bool _isLastBatch,
        uint256 version
    );

    /// @notice Emitted when a batch configuration creation is cancelled.
    /// @param configurationId Identifier of the cancelled configuration.
    event DiamondBatchConfigurationCanceled(bytes32 configurationId);

    /// @notice Thrown when bytes32(0) is used as a configuration identifier.
    error DefaultValueForConfigurationIdNotPermitted();

    /// @notice Thrown when a facet identifier is not found in the registry.
    /// @param configurationId Configuration being queried.
    /// @param facetId Facet identifier that is not registered.
    error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId);

    /// @notice Thrown when the same facet appears twice in a configuration list.
    /// @param facetId Duplicated facet identifier.
    error DuplicatedFacetInConfiguration(bytes32 facetId);

    /// @notice Thrown when querying a configuration that has not been registered.
    /// @param resolverProxyConfigurationId Configuration identifier queried.
    /// @param version Version that does not exist.
    error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version);

    /// @notice Thrown when a blacklisted selector is added to a configuration.
    /// @param selector The blacklisted function selector.
    error SelectorBlacklisted(bytes4 selector);

    /// @notice Thrown when a selector is already registered for a facet in the configuration.
    /// @param configurationId Configuration where the collision occurred.
    /// @param version Configuration version.
    /// @param facetId Facet that already owns the selector.
    /// @param selector The duplicate selector.
    error SelectorAlreadyRegistered(bytes32 configurationId, uint256 version, bytes32 facetId, bytes4 selector);

    /**
     * @notice Creates a new configuration with the given facets at their latest versions.
     * @param _configurationId Unique identifier for the configuration (must not be bytes32(0)).
     * @param _facetConfigurations List of facet IDs and their target versions.
     */
    function createConfiguration(bytes32 _configurationId, FacetConfiguration[] calldata _facetConfigurations) external;

    /**
     * @notice Creates a configuration incrementally across multiple transactions.
     * @dev Useful when a single transaction would exceed gas limits.  Call repeatedly
     *   with partial facet lists, then signal completion via _isLastBatch.
     * @param _configurationId Unique identifier for the configuration.
     * @param _facetConfigurations Partial list of facets for this batch.
     * @param _isLastBatch True to finalise the configuration after this batch.
     */
    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) external;

    /**
     * @notice Cancels an in-progress batch configuration.
     * @dev Discards all facet data accumulated across prior batches for this ID.
     * @param _configurationId Identifier of the batch configuration to cancel.
     */
    function cancelBatchConfiguration(bytes32 _configurationId) external;

    /**
     * @notice Reverts if the given config+version pair has not been registered.
     * @param _configurationId Configuration identifier to check.
     * @param _version Version to check.
     */
    function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external;

    /**
     * @notice Resolves the facet address for a selector within a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves the latest version.
     * @param _selector Function selector to look up.
     * @return facetAddress_ Address of the facet handling the selector, or
     *   address(0) when not found.
     */
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (address facetAddress_);

    /**
     * @notice Resolves whether an interface ID is supported in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves the latest version.
     * @param _interfaceId Interface ID to test.
     * @return exists_ True when the interface is part of the configuration.
     */
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view returns (bool exists_);

    /**
     * @notice Checks whether a config+version pair is registered.
     * @param _configurationId Configuration identifier.
     * @param _version Version to check.
     * @return True when the pair exists in the registry.
     */
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (bool);

    /**
     * @notice Returns the total number of registered configurations.
     * @return configurationsLength_ Total count.
     */
    function getConfigurationsLength() external view returns (uint256 configurationsLength_);

    /**
     * @notice Returns a paginated list of registered configuration identifiers.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Number of entries per page.
     * @return configurationIds_ List of configuration identifiers.
     */
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory configurationIds_);

    /**
     * @notice Returns the highest version number registered for a configuration.
     * @param _configurationId Configuration identifier.
     * @return latestVersion_ Latest version; 0 if the configuration has no versions.
     */
    function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_);

    /**
     * @notice Returns the number of facets in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @return facetsLength_ Total facet count.
     */
    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (uint256 facetsLength_);

    /**
     * @notice Returns a paginated list of facet metadata for a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Number of entries per page.
     * @return facets_ List of facet metadata (address, selectors, interface IDs).
     */
    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (IDiamondLoupe.Facet[] memory facets_);

    /**
     * @notice Returns the number of selectors a facet contributes in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facetSelectorsLength_ Selector count.
     */
    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetSelectorsLength_);

    /**
     * @notice Returns the selectors a facet contributes in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Number of entries per page.
     * @return facetSelectors_ List of function selectors.
     */
    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory facetSelectors_);

    /**
     * @notice Returns a paginated list of facet identifiers for a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Number of entries per page.
     * @return facetIds_ List of facet identifiers.
     */
    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory facetIds_);

    /**
     * @notice Returns a slice of facet configurations for a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _start Start index (inclusive).
     * @param _end End index (exclusive).
     * @return facetConfigurations_ Array of facet ID + version pairs.
     */
    function getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    ) external view returns (FacetConfiguration[] memory facetConfigurations_);

    /**
     * @notice Returns the facet addresses for a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Number of entries per page.
     * @return facetAddresses_ List of facet contract addresses.
     */
    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory facetAddresses_);

    /**
     * @notice Resolves the facet identifier that owns a selector in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _selector Function selector to look up.
     * @return facetId_ Facet identifier owning the selector.
     */
    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (bytes32 facetId_);

    /**
     * @notice Returns full facet metadata for a specific facet in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facet_ Facet metadata including address, selectors, and interface IDs.
     */
    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (IDiamondLoupe.Facet memory facet_);

    /**
     * @notice Returns the facet implementation address for a config+version+facet.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facetAddress_ Facet contract address.
     */
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (address facetAddress_);

    /**
     * @notice Returns the implementation version of a facet in a config+version.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facetVersion_ Facet implementation version number.
     */
    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetVersion_);
}
