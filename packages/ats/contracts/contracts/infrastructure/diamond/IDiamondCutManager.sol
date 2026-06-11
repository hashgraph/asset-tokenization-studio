// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

/**
 * @title IDiamondCutManager
 * @author Asset Tokenization Studio Team
 * @notice Manages versioned diamond configurations consumed by resolver proxies.
 * @dev Each configuration is keyed by `configurationId` and groups a set of facets at pinned
 *      versions. For every configurationId the manager retains:
 *        - `latestVersion`: monotonically increasing counter of registered versions.
 *        - Per version: the facet list, where each entry exposes the facet id, its selectors,
 *          and its supported interface ids.
 *      Configurations may be registered atomically via {createConfiguration} or incrementally
 *      via {createBatchConfiguration}, with {cancelBatchConfiguration} discarding an
 *      in-progress batch. Resolution helpers ({resolveResolverProxyCall},
 *      {resolveSupportsInterface}) drive the dispatch logic of resolver proxies and require an
 *      explicit non-zero `_version`; callers that want the most recent version must read it
 *      first via {getLatestVersionByConfiguration}. Read helpers expose paginated views over
 *      configurations, facets, and selectors to keep gas bounded.
 */
interface IDiamondCutManager {
    /**
     * @notice Tuple identifying a facet at a specific version inside a configuration.
     * @dev Used as input by configuration-creation entrypoints. `id` references a facet
     *      previously registered in the business-logic resolver; `version` pins the version
     *      to snapshot inside the configuration.
     * @param id Facet identifier (business-logic key).
     * @param version Facet version to pin; must be > 0. The business-logic resolver rejects
     *        0 with {IBusinessLogicResolver.BusinessLogicVersionDoesNotExist}.
     */
    struct FacetConfiguration {
        bytes32 id;
        uint256 version;
    }

    /**
     * @notice Emitted when a configuration is created atomically via {createConfiguration}.
     * @param configurationId Configuration key that was registered.
     * @param facetConfigurations Facets (id, version) that compose the new configuration.
     * @param version Version number assigned to the newly created configuration.
     * @param data Additional data passed to the configuration.
     */
    event DiamondConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        uint256 version,
        bytes data
    );

    /**
     * @notice Emitted on every {createBatchConfiguration} call, including the final batch.
     * @param configurationId Configuration key being assembled.
     * @param facetConfigurations Facets appended in this batch.
     * @param isLastBatch True when this call finalises the configuration version.
     * @param version Version number being assembled for this configuration.
     * @param data Additional data passed to the configuration.
     */
    event DiamondBatchConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        bool isLastBatch,
        uint256 version,
        bytes data
    );

    /**
     * @notice Emitted when an in-progress batch configuration is discarded.
     * @param configurationId Configuration key whose pending batch was cancelled.
     * @param version Version number that was being assembled and is now dropped.
     */
    event DiamondBatchConfigurationCanceled(bytes32 indexed configurationId, uint256 version);

    /// @notice Thrown when `bytes32(0)` is supplied as a configuration id, which is reserved.
    error DefaultValueForConfigurationIdNotPermitted();

    /**
     * @notice Thrown when attempting to activate a configuration that contains no facets,
     *         which would brick any ResolverProxy following the latest version.
     * @param configurationId Configuration key that was supplied with an empty facet list.
     */
    error EmptyFacetConfigurationNotPermitted(bytes32 configurationId);

    /**
     * @notice Thrown when a configuration references a facet id that is not registered in
     *         the business-logic resolver.
     * @param configurationId Configuration being created or modified.
     * @param facetId Unknown facet id that triggered the revert.
     */
    error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId);

    /**
     * @notice Thrown when the same facet id appears more than once within a configuration.
     * @param facetId Duplicated facet id.
     */
    error DuplicatedFacetInConfiguration(bytes32 facetId);

    /**
     * @notice Thrown when {createConfiguration} is called for a configuration id that already
     *         has an in-progress batch, which would prematurely finalise the incomplete batch
     *         and absorb any facets that were intended for subsequent batch additions.
     * @param configurationId Configuration key whose batch is currently open.
     */
    error OngoingBatchConfigurationNotPermitted(bytes32 configurationId);

    /**
     * @notice Thrown when a (configurationId, version) pair is referenced but has not been
     *         registered (or is still mid-batch and therefore not yet finalised).
     * @param resolverProxyConfigurationId Configuration key that was looked up.
     * @param version Version that was looked up.
     */
    error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version);

    /**
     * @notice Thrown when a configuration version of 0 is supplied to an entry point that
     *         requires an explicit version pin.
     * @dev Callers that want the most recent registered version must read it first via
     *      {getLatestVersionByConfiguration} and pass that value.
     * @param configurationId Configuration key that was looked up.
     */
    error VersionZero(bytes32 configurationId);

    /**
     * @notice Thrown when attempting to register a selector that is globally blacklisted.
     * @param selector Function selector that is forbidden.
     */
    error SelectorBlacklisted(bytes4 selector);

    /**
     * @notice Thrown when a selector is already registered under another facet for the same
     *         (configurationId, version), which would create an ambiguous dispatch.
     * @param configurationId Configuration where the clash was detected.
     * @param version Version where the clash was detected.
     * @param facetId Facet attempting to register the selector.
     * @param selector Selector that is already mapped to a different facet.
     */
    error SelectorAlreadyRegistered(bytes32 configurationId, uint256 version, bytes32 facetId, bytes4 selector);

    /**
     * @notice Registers a new configuration atomically, pinning each facet at the supplied
     *         version.
     * @dev Reverts with {DefaultValueForConfigurationIdNotPermitted},
     *      {FacetIdNotRegistered}, {DuplicatedFacetInConfiguration}, {SelectorBlacklisted}
     *      or {SelectorAlreadyRegistered} on invalid input. Facet versions must be > 0;
     *      the business-logic resolver rejects 0. Emits {DiamondConfigurationCreated} on
     *      success.
     * @param _configurationId Unique configuration key to register; must not be `bytes32(0)`.
     * @param _facetConfigurations List of facets (id + pinned version) composing the
     *        configuration; facet ids must be unique within the list.
     * @param _data Additional data to be passed to the configuration.
     */
    function createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bytes calldata _data
    ) external;

    /**
     * @notice Appends facets to a configuration in batches; the configuration becomes
     *         resolvable only after the call flagged as the last batch.
     * @dev Each invocation emits {DiamondBatchConfigurationCreated}. Until `_isLastBatch`
     *      is true the (configurationId, version) pair is not registered and resolution
     *      helpers continue to revert with {ResolverProxyConfigurationNoRegistered}.
     * @param _configurationId Configuration key being assembled; must not be `bytes32(0)`.
     * @param _facetConfigurations Facets appended in this batch; ids must remain unique
     *        across all batches contributing to the same version.
     * @param _isLastBatch True to finalise and register the version, false to keep
     *        accepting further batches.
     * @param _data Additional data to be passed to the configuration.
     */
    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch,
        bytes calldata _data
    ) external;

    /**
     * @notice Discards an in-progress batch configuration, dropping every facet appended so
     *         far for the pending version.
     * @dev Emits {DiamondBatchConfigurationCanceled}. Has no effect once the version has
     *      been finalised via a `_isLastBatch = true` call.
     * @param _configurationId Configuration key whose pending batch should be cancelled.
     */
    function cancelBatchConfiguration(bytes32 _configurationId) external;

    /**
     * @notice Reverts if the (configurationId, version) pair is not a registered, finalised
     *         configuration.
     * @dev Intended to gate resolver-proxy operations; reverts with
     *      {ResolverProxyConfigurationNoRegistered} when the lookup fails.
     * @param _configurationId Configuration key to verify.
     * @param _version Version to verify; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     */
    function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external;

    /**
     * @notice Resolves the facet address that implements a selector for a given
     *         configuration and version.
     * @dev Used by resolver proxies during dispatch. Returns `address(0)` when no facet
     *      claims the selector.
     * @param _configurationId Configuration key bound to the resolver proxy.
     * @param _version Version bound to the resolver proxy; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _selector Function selector being dispatched.
     * @return facetAddress_ Address of the facet that owns `_selector`, or `address(0)` if
     *         the selector is not registered for the given configuration/version.
     */
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (address facetAddress_);

    /**
     * @notice Reports whether an interface id is advertised by any facet inside the given
     *         configuration and version.
     * @dev Powers ERC-165 lookups on resolver proxies.
     * @param _configurationId Configuration key bound to the resolver proxy.
     * @param _version Version bound to the resolver proxy; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _interfaceId Interface identifier to test.
     * @return exists_ True if `_interfaceId` is supported by the configuration version.
     */
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view returns (bool exists_);

    /**
     * @notice Non-reverting variant of {checkResolverProxyConfigurationRegistered}.
     * @param _configurationId Configuration key to check.
     * @param _version Version to check; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @return True when the configuration version is registered and finalised.
     */
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (bool);

    /**
     * @notice Returns the number of distinct configuration keys registered in the manager.
     * @return configurationsLength_ Total count of registered configuration ids.
     */
    function getConfigurationsLength() external view returns (uint256 configurationsLength_);

    /**
     * @notice Returns a paginated slice of registered configuration ids.
     * @dev Pagination is used to keep gas bounded on large registries; out-of-range pages
     *      return an empty array rather than reverting.
     * @param _pageIndex Page index; entries skipped equal `_pageIndex * _pageLength`.
     * @param _pageLength Maximum number of entries to return.
     * @return configurationIds_ Slice of configuration ids for the requested page.
     */
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory configurationIds_);

    /**
     * @notice Returns the latest registered version of a configuration.
     * @param _configurationId Configuration key to query.
     * @return latestVersion_ Latest finalised version, or 0 when no version is registered.
     */
    function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_);

    /**
     * @notice Returns the number of facets registered under a configuration version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @return facetsLength_ Count of facets in the configuration version.
     */
    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (uint256 facetsLength_);

    /**
     * @notice Returns a paginated slice of facets for a configuration version, including
     *         each facet's address, selectors, and advertised interface ids.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _pageIndex Page index; entries skipped equal `_pageIndex * _pageLength`.
     * @param _pageLength Maximum number of entries to return.
     * @return facets_ Slice of {IDiamondLoupe.Facet} entries for the requested page.
     */
    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (IDiamondLoupe.Facet[] memory facets_);

    /**
     * @notice Returns the number of selectors registered for a facet inside a configuration
     *         version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _facetId Facet key whose selectors are counted.
     * @return facetSelectorsLength_ Count of selectors owned by the facet in the version.
     */
    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetSelectorsLength_);

    /**
     * @notice Returns a paginated slice of selectors registered for a facet inside a
     *         configuration version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _facetId Facet key whose selectors are returned.
     * @param _pageIndex Page index; entries skipped equal `_pageIndex * _pageLength`.
     * @param _pageLength Maximum number of entries to return.
     * @return facetSelectors_ Slice of selectors for the requested page.
     */
    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory facetSelectors_);

    /**
     * @notice Returns a paginated slice of facet ids registered for a configuration version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _pageIndex Page index; entries skipped equal `_pageIndex * _pageLength`.
     * @param _pageLength Maximum number of entries to return.
     * @return facetIds_ Slice of facet ids for the requested page.
     */
    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory facetIds_);

    /**
     * @notice Returns the (facet id, facet version) tuples registered for a configuration
     *         version over a half-open index range.
     * @dev Slice semantics differ from the page-based helpers: `_start` is inclusive and
     *      `_end` is exclusive, allowing callers to express arbitrary windows.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _start Inclusive start index of the slice.
     * @param _end Exclusive end index of the slice.
     * @return facetConfigurations_ Slice of {FacetConfiguration} entries for the window.
     */
    function getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    ) external view returns (FacetConfiguration[] memory facetConfigurations_);

    /**
     * @notice Returns a paginated slice of facet addresses registered for a configuration
     *         version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _pageIndex Page index; entries skipped equal `_pageIndex * _pageLength`.
     * @param _pageLength Maximum number of entries to return.
     * @return facetAddresses_ Slice of facet addresses for the requested page.
     */
    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory facetAddresses_);

    /**
     * @notice Returns the facet id that owns a selector inside a configuration version.
     * @dev Returns `bytes32(0)` when the selector is not registered.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _selector Selector to look up.
     * @return facetId_ Facet id owning `_selector`, or `bytes32(0)` if none.
     */
    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (bytes32 facetId_);

    /**
     * @notice Returns the full facet record (id, address, selectors, interface ids) for a
     *         facet inside a configuration version.
     * @dev Returns a zero-valued {IDiamondLoupe.Facet} when the facet is not part of the
     *      configuration version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _facetId Facet key to look up.
     * @return facet_ Facet record for `_facetId`.
     */
    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (IDiamondLoupe.Facet memory facet_);

    /**
     * @notice Returns the address of a facet inside a configuration version.
     * @dev Returns `address(0)` when the facet is not part of the configuration version.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _facetId Facet key to look up.
     * @return facetAddress_ Address of the facet, or `address(0)` if unregistered.
     */
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (address facetAddress_);

    /**
     * @notice Returns the pinned facet version stored inside a configuration version.
     * @dev Reverts with {FacetIdNotRegistered} when the facet is not part of the configuration
     *      version, and with {VersionZero} when `_version` is 0.
     * @param _configurationId Configuration key to query.
     * @param _version Version to query; must be > 0. Read
     *        {getLatestVersionByConfiguration} first when the latest is required.
     * @param _facetId Facet key to look up.
     * @return facetVersion_ Pinned facet version inside the configuration version.
     */
    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetVersion_);
}
