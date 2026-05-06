// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title GasBenchmarkInitializerHarness
 * @notice Minimal harness for benchmarking the counter-based auto-operational mechanism.
 * @dev Replicates the storage layout and logic of InitializerStorageWrapper without requiring the
 *   full diamond infrastructure (no ResolverProxy, no BusinessLogicResolver).  Suitable only for
 *   gas measurement — not for production use.
 *
 *   Each setFacetToReady call costs O(1) regardless of total facet count:
 *     2 SSTOREs (facetVersionStatus + facetLastVersion) always
 *     1 SLOAD  + 1 SSTORE for the counter (configInitializedCount)
 *     1 SLOAD  for target check (configTargetCount — cold on first call, then warm)
 *     + 1 SSTORE + 1 LOG2 on the final call that triggers auto-activation
 */
contract GasBenchmarkInitializerHarness {
    // ---------------------------------------------------------------------------
    // Storage (mirrors InitializerDataStorage layout)
    // ---------------------------------------------------------------------------

    mapping(bytes32 => mapping(uint256 => uint256)) private _facetVersionStatus;
    mapping(bytes32 => uint256) private _facetLastVersion;
    mapping(bytes32 => mapping(uint256 => uint256)) private _configVersionStatus;
    mapping(bytes32 => mapping(uint256 => uint256)) private _configInitializedCount;
    mapping(bytes32 => mapping(uint256 => uint256)) private _configTargetCount;

    // Active config context (set per scenario via setup)
    bytes32 private _configId;
    uint256 private _versionId;

    // ---------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------

    event TokenOperational(bytes32 indexed configId, uint256 indexed versionId);

    // ---------------------------------------------------------------------------
    // Setup
    // ---------------------------------------------------------------------------

    /**
     * @notice Configures a new scenario: sets the active config context and target count.
     * @param configId Configuration identifier for this benchmark run.
     * @param versionId Version identifier for this benchmark run.
     * @param targetCount Number of setFacetToReady calls expected before auto-activation fires.
     */
    function setup(bytes32 configId, uint256 versionId, uint256 targetCount) external {
        _configId = configId;
        _versionId = versionId;
        _configTargetCount[configId][versionId] = targetCount;
        // Reset counters for clean re-runs
        _configInitializedCount[configId][versionId] = 0;
        _configVersionStatus[configId][versionId] = 0;
    }

    // ---------------------------------------------------------------------------
    // Benchmarked function
    // ---------------------------------------------------------------------------

    /**
     * @notice Marks a facet as ready and attempts auto-activation (O(1) gas).
     * @param facetId Identifier of the facet being registered.
     * @param facetVersion Version being registered.
     */
    function setFacetToReady(bytes32 facetId, uint256 facetVersion) external {
        _facetVersionStatus[facetId][facetVersion] = 1;
        _facetLastVersion[facetId] = facetVersion;
        _tryAutoActivate();
    }

    // ---------------------------------------------------------------------------
    // View helpers
    // ---------------------------------------------------------------------------

    function isOperational(bytes32 configId, uint256 versionId) external view returns (bool) {
        return _configVersionStatus[configId][versionId] == 1;
    }

    function getInitializedCount(bytes32 configId, uint256 versionId) external view returns (uint256) {
        return _configInitializedCount[configId][versionId];
    }

    // ---------------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------------

    function _tryAutoActivate() private {
        bytes32 configId = _configId;
        uint256 versionId = _versionId;

        uint256 target = _configTargetCount[configId][versionId];
        if (target == 0) return;

        uint256 newCount = _configInitializedCount[configId][versionId] + 1;
        _configInitializedCount[configId][versionId] = newCount;

        if (newCount >= target) {
            _configVersionStatus[configId][versionId] = 1;
            emit TokenOperational(configId, versionId);
        }
    }
}
