// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Initializer
bytes32 constant RESOLVER_KEY_INITIALIZER = 0xe7caa2e00c841ed2a64c4c95e3981f3bfc29108599fad6e89b04f9483df0bf09;

/**
 * @title IInitializer
 */
interface IInitializer {
    /**
     * @notice Emitted on the first successful call to `initializeInitializer`, which seeds the
     *         initializer storage with its batch size.
     * @param maxInitializerFacetIndex Batch size used by `setOperationalStatus` to bound the
     *        number of facets checked per call.
     */
    event InitializerInitialized(uint256 maxInitializerFacetIndex);

    /**
     * @notice Emitted by `setOperationalStatus` when only part of the facet list could be
     *         validated in the current call. Subsequent calls resume from `lastIndex`.
     * @param sender Address that triggered the partial set.
     * @param configurationId Resolver-proxy configuration being validated.
     * @param version Configuration version being validated.
     * @param lastIndex Index of the first facet not yet validated; the next call resumes here.
     */
    event OperationalStatusPartialSet(address sender, bytes32 configurationId, uint256 version, uint256 lastIndex);

    /**
     * @notice Emitted by `setOperationalStatus` when every facet of the configuration version
     *         has been validated and the configuration becomes fully operational.
     * @param sender Address that triggered the final set.
     * @param configurationId Resolver-proxy configuration that became operational.
     * @param version Configuration version that became operational.
     */
    event OperationalStatusSet(address sender, bytes32 configurationId, uint256 version);

    /**
     * @notice Emitted when `updateMaxInitializerFacetIndex` changes the batch size used by
     *         `setOperationalStatus`.
     * @param sender Address that triggered the update.
     * @param newMaxInitializerFacetIndex New batch size, in number of facets per call.
     */
    event MaxInitializerFacetIndexUpdated(address sender, uint256 newMaxInitializerFacetIndex);

    /**
     * @notice Raised by `InitializerStorageWrapper.checkOperational` (and the related
     *         `isConfigVersionOperational` helper) when an operation is attempted on a
     *         configuration version that has not yet been marked operational.
     * @param configId Resolver-proxy configuration whose operational status was checked.
     * @param versionId Configuration version whose operational status was checked.
     */
    error AssetNotOperational(bytes32 configId, uint256 versionId);

    /**
     * @notice Raised when an initialiser tries to register a facet that already has a non-zero
     *         last registered version (i.e. the facet is being re-initialised on a fresh install).
     * @param facetId Identifier of the offending facet.
     * @param lastVersion Last version recorded for that facet at the time of the check.
     */
    error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);

    /**
     * @notice Raised when an initialiser requires the facet's previously registered version to
     *         match one of an expected set and the current `lastVersion` falls outside that set.
     * @param facetId Identifier of the facet being upgraded.
     * @param lastVersion Last version currently stored for the facet.
     * @param expectedVersions List of acceptable predecessor versions.
     */
    error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions);

    /**
     * @notice Raised by `checkFacetNotReady` when a facet is already marked ready for the
     *         resolver's current version and a subsequent ready-marking attempt would be a
     *         double initialisation.
     * @param facetId Identifier of the facet already flagged as ready.
     * @param versionId Version for which the facet is already ready.
     */
    error FacetReady(bytes32 facetId, uint256 versionId);

    /**
     * @notice Seeds the initializer storage with the batch size used by `setOperationalStatus`
     *         and marks the initializer facet itself as ready for its current version.
     * @dev Restricted to `DEFAULT_ADMIN_ROLE` and guarded against re-registration via
     *      `onlyFacetNotRegistered(RESOLVER_KEY_INITIALIZER)`. Emits `InitializerInitialized`.
     * @param _maxInitializerFacetIndex Maximum number of facets validated per
     *        `setOperationalStatus` call.
     */
    function initializeInitializer(uint256 _maxInitializerFacetIndex) external;

    /**
     * @notice Updates the batch size used by `setOperationalStatus` to bound per-call gas usage.
     * @dev Restricted to `DEFAULT_ADMIN_ROLE`. Emits `MaxInitializerFacetIndexUpdated`.
     * @param _newMaxInitializerFacetIndex New batch size, in number of facets per call.
     */
    function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external;

    /**
     * @notice Walks the facet list of the active resolver-proxy `(configurationId, version)`,
     *         in batches of `maxInitializerFacetIndex`, and marks the configuration operational
     *         once every facet is ready.
     * @dev Idempotent and resumable: if already operational, returns immediately; if partial
     *      progress is stored, resumes from the recorded index; otherwise starts from index 0.
     *      Emits `OperationalStatusSet` on completion or `OperationalStatusPartialSet`
     *      otherwise.
     * @return isOperational_ True when every facet of the configuration version is ready.
     * @return lastFacetIndex_ Index reached in this call; on partial progress, the next call
     *         resumes here. Zero when the configuration was already operational.
     */
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);

    /**
     * @notice Returns the raw operational status for a resolver-proxy configuration version.
     * @dev Encoding: `0` = not started, `1` = fully operational, `>1` = resume facet index + 1.
     * @param _configId Resolver-proxy configuration to query.
     * @param _versionId Configuration version to query.
     * @return status_ Encoded operational status as described above.
     */
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);

    /**
     * @notice Returns the initialisation status of a specific facet version.
     * @dev Encoding: `0` = initialisation not started, `1` = ready, `>1` = initialisation in
     *      progress (intermediate value defined by the facet implementation).
     * @param _facetId Identifier of the facet to query.
     * @param _versionId Version of the facet to query.
     * @return status_ Initialisation status of the requested facet version.
     */
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);

    /**
     * @notice Returns the latest version recorded for a facet. Zero means never registered.
     * @param _facetId Identifier of the facet to query.
     * @return lastVersion_ Most recent version stored for the facet, or zero if absent.
     */
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);

    /**
     * @notice Returns the configured batch size for `setOperationalStatus`.
     * @return maxInitializerFacetIndex_ Maximum number of facets validated per call.
     */
    function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_);
}
