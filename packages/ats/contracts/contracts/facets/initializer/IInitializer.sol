// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IInitializer
 * @author Asset Tokenization Studio Team
 * @notice Interface for initialising and tracking operational readiness of diamond facets.
 * @dev Defines the errors and getters used during the phased facet-registration process.
 *   Concrete implementations batch status checks to avoid out-of-gas failures.
 */
interface IInitializer {
    /// @notice Emitted when a config+version reaches full operational readiness via the counter mechanism.
    /// @param configId Configuration that became operational.
    /// @param versionId Version that became operational.
    event TokenOperational(bytes32 indexed configId, uint256 indexed versionId);

    /// @notice Thrown when an operation requires a config+version that is not yet fully operational.
    /// @param configId Identifier of the configuration that is not ready.
    /// @param versionId Version that is not ready.
    error AssetNotOperational(bytes32 configId, uint256 versionId);

    /// @notice Thrown when attempting to register a facet that has already been registered.
    /// @param facetId Identifier of the facet already registered.
    /// @param lastVersion Latest version already recorded for the facet.
    error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);

    /// @notice Thrown when a facet's current version does not match any expected previous version.
    /// @param facetId Identifier of the facet being validated.
    /// @param lastVersion Current latest version recorded for the facet.
    /// @param expectedVersions Array of versions that were accepted as valid predecessors.
    error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions);

    /// @notice Thrown when an action expects a facet version that is not yet marked ready.
    /// @param facetId Identifier of the facet not ready.
    /// @param versionId Version that is not ready.
    error FacetReady(bytes32 facetId, uint256 versionId);

    /// @notice Thrown when _prepareReinitialization is called but the BLR diff is not registered.
    /// @param fromConfigId Source configuration identifier.
    /// @param fromVersion Source version.
    /// @param toConfigId Target configuration identifier.
    /// @param toVersion Target version.
    error TransitionDiffNotRegistered(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion);

    /// @notice Thrown when _prepareReinitialization is called while a reinitialization is pending.
    /// @param configId Configuration identifier.
    /// @param pendingVersion Version currently pending initialization.
    error AlreadyPendingReinitialization(bytes32 configId, uint256 pendingVersion);

    /// @notice Thrown when an update method is called while the current version has pending initialization.
    /// @param configId Current configuration identifier.
    /// @param version Current version still pending.
    error StillPending(bytes32 configId, uint256 version);

    /**
     * @notice Verifies operational status for the current config+version, processing in batches.
     * @dev Batching avoids out-of-gas failures on large configs. Progress is persisted so the
     *   next call resumes where the previous one stopped.
     * @return isOperational_ True only when every facet in the config is ready.
     * @return lastFacetIndex_ Index of the last facet processed; equals total facets when complete.
     */
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);

    /**
     * @notice Returns the last version for which TokenOperational was emitted.
     * @return version_ The last operational version.
     */
    function getLastOperationalVersion() external view returns (uint256 version_);

    /**
     * @notice Returns true only when configVersionStatus[configId][versionId] == 1.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return isOperational_ True if operational.
     */
    function isOperational(bytes32 _configId, uint256 _versionId) external view returns (bool isOperational_);

    /**
     * @notice Returns the operational status for a given configuration and version.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return status_ 0 = not started, 1 = operational, >1 = resume index + 1.
     */
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);

    /**
     * @notice Returns the readiness status of a specific facet version.
     * @param _facetId Identifier of the facet.
     * @param _versionId Version to query.
     * @return status_ 1 if the facet version is ready.
     */
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);

    /**
     * @notice Returns the latest registered version for a facet.
     * @param _facetId Identifier of the facet.
     * @return lastVersion_ 0 if the facet has never been registered.
     */
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);

    /**
     * @notice Returns how many facets have already called setFacetToReady for a config+version.
     * @param configId Configuration identifier.
     * @param versionId Version to query.
     * @return count_ Number of facets that have registered so far.
     */
    function getConfigInitializedCount(bytes32 configId, uint256 versionId) external view returns (uint256 count_);

    /**
     * @notice Returns the target facet count configured by _prepareReinitialization.
     * @param configId Configuration identifier.
     * @param versionId Version to query.
     * @return count_ Target set during _prepareReinitialization; 0 means counter not configured.
     */
    function getConfigTargetCount(bytes32 configId, uint256 versionId) external view returns (uint256 count_);
}
