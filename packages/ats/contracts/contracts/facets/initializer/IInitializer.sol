// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IInitializer
 * @author Asset Tokenization Studio Team
 * @notice Interface defining the initialisation lifecycle for a diamond-structured token.
 * @dev Exposes functions to complete facet initialisation, query operational readiness, and
 *   inspect per-facet version status.  Errors are defined here so that all facets that
 *   import this interface can emit them without coupling to a concrete implementation.
 */
interface IInitializer {
    /// @notice Emitted when the asset continues to be verified as operational.
    /// @param configurationId Configuration identifier for the asset.
    /// @param version Version that became operational.
    event OperationalStatusPartialSet(bytes32 configurationId, uint256 version);

    /// @notice Emitted when the asset transitions to operational status.
    /// @param configurationId Configuration identifier for the asset.
    /// @param version Version that became operational.
    event OperationalStatusSet(bytes32 configurationId, uint256 version);

    /// @notice Thrown when the asset has not been fully initialised.
    /// @param configId Configuration identifier for the asset.
    /// @param versionId Version that is not yet operational.
    error AssetNotOperational(bytes32 configId, uint256 versionId);

    /// @notice Thrown when an initialiser attempts to register a facet that already has a
    ///   non-zero version.
    /// @param facetId Identifier of the facet that is already registered.
    /// @param lastVersion Its existing registered version.
    error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);

    /// @notice Thrown when the facet's previous version is not among the accepted upgrade
    ///   paths.
    /// @param facetId Identifier of the facet.
    /// @param lastVersion The last registered version found on-chain.
    /// @param expectedVersions Array of versions the caller expected to find.
    error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions);

    /// @notice Thrown when a facet version has already been marked ready.
    /// @param facetId Identifier of the facet.
    /// @param versionId The version that is already ready.
    error FacetReady(bytes32 facetId, uint256 versionId);

    /// @notice Thrown when the asset is not yet operational and cannot process transactions.
    /// @param configurationId Configuration identifier for the asset.
    /// @param version Target version requested.
    /// @param facetKey does not set to ready.
    error NotOperational(bytes32 configurationId, uint256 version, bytes32 facetKey);

    /// @notice Marks the Initializer facet itself as ready.
    /// @dev Called once by the deployer after proxy creation. Follows the same
    ///   pattern as every other stateful facet initialize function.
    function initializeInitializer() external;

    /// @notice Checks every facet in the current config+version and transitions the asset to
    ///   operational if all are ready.
    /// @dev Intentionally permissionless: the function can only advance state (0→1) and is
    ///   idempotent once operational. No access control is needed because the outcome is fully
    ///   determined by the facet readiness state already in storage.
    ///   Reverts when a reinitialisation is pending (the counter path handles activation).
    ///   Persists partial progress across calls to avoid out-of-gas on large configs.
    function setOperationalStatus() external;

    /// @notice Returns the operational status for a given config+version.
    /// @param _configId Configuration identifier.
    /// @param _versionId Version to query.
    /// @return status_ 0 = not started, 1 = operational, >1 = resume facet index + 1.
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);

    /// @notice Returns the readiness status of a specific facet version.
    /// @param _facetId Identifier of the facet.
    /// @param _versionId Facet implementation version to query.
    /// @return status_ 1 if the facet version is ready.
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);

    /// @notice Returns the latest registered version for a facet in the current config context.
    /// @param _facetId Identifier of the facet.
    /// @return lastVersion_ Latest registered version; 0 if never registered.
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
}
