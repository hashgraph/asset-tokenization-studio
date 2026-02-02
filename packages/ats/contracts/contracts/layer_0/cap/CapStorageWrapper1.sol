// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper1 } from "../adjustBalances/AdjustBalancesStorageWrapper1.sol";
import { FacetVersionsStorageWrapper } from "../common/FacetVersionsStorageWrapper.sol";
import { _CAP_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CAP_FACET_KEY } from "../constants/facetKeys.sol";
import { MAX_UINT256 } from "../constants/values.sol";
import { ICap } from "contracts/layer_1/interfaces/cap/ICap.sol";

abstract contract CapStorageWrapper1 is AdjustBalancesStorageWrapper1, FacetVersionsStorageWrapper {
    struct CapDataStorage {
        uint256 maxSupply;
        mapping(bytes32 => uint256) maxSupplyByPartition;
        bool initialized;
    }

    /// @notice Current target version for Cap facet initialization
    uint64 private constant _CAP_TARGET_VERSION = 1;

    /**
     * @notice Initialize Cap with version-based logic
     * @dev Supports both fresh deploy (v0 → v1) and future upgrades
     *      - Fresh deploy: Runs V1 block, sets version to 1
     *      - Migration (initialized=true, v=0): Treated as V1, version set to 1, no blocks run
     *      - Already at V1: Reverts with AlreadyAtLatestVersion
     * @param params The initialization parameters
     */
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_Cap(ICap.CapInitParams calldata params) internal override {
        CapDataStorage storage capStorage = _capStorage();
        uint64 v = _getFacetVersion(_CAP_FACET_KEY);

        // Migration: existing tokens with initialized=true but v=0 → treat as v1
        if (capStorage.initialized && v == 0) {
            _setFacetVersion(_CAP_FACET_KEY, _CAP_TARGET_VERSION);
            return; // Already initialized via old method, nothing to do
        }

        if (v >= _CAP_TARGET_VERSION) {
            revert AlreadyAtLatestVersion(_CAP_FACET_KEY, v, _CAP_TARGET_VERSION);
        }

        // V1 logic (fresh deploy only)
        if (v < 1) {
            capStorage.maxSupply = params.maxSupply;

            for (uint256 i = 0; i < params.partitionCap.length; i++) {
                capStorage.maxSupplyByPartition[params.partitionCap[i].partition] = params.partitionCap[i].maxSupply;
            }

            capStorage.initialized = true;
        }

        // Future V2+ blocks would go here:
        // if (v < 2) { ... }

        _setFacetVersion(_CAP_FACET_KEY, _CAP_TARGET_VERSION);
    }

    function _adjustMaxSupply(uint256 factor) internal override {
        CapDataStorage storage capStorage = _capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (capStorage.maxSupply > limit) capStorage.maxSupply = MAX_UINT256;
        else capStorage.maxSupply *= factor;
    }

    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal override {
        CapDataStorage storage capStorage = _capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (capStorage.maxSupplyByPartition[partition] > limit)
            capStorage.maxSupplyByPartition[partition] = MAX_UINT256;
        else capStorage.maxSupplyByPartition[partition] *= factor;
    }

    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view override returns (uint256) {
        CapDataStorage storage capStorage = _capStorage();

        (uint256 pendingAbaf, ) = _getPendingScheduledBalanceAdjustmentsAt(timestamp);

        uint256 limit = MAX_UINT256 / pendingAbaf;

        if (capStorage.maxSupply > limit) return MAX_UINT256;

        return capStorage.maxSupply * pendingAbaf;
    }

    function _getMaxSupplyByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view override returns (uint256) {
        CapDataStorage storage capStorage = _capStorage();

        uint256 factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getLabafByPartition(partition));

        uint256 limit = MAX_UINT256 / factor;

        if (capStorage.maxSupplyByPartition[partition] > limit) return MAX_UINT256;

        return capStorage.maxSupplyByPartition[partition] * factor;
    }

    function _isCapInitialized() internal view override returns (bool) {
        return _capStorage().initialized;
    }

    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure override returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }

    function _capStorage() internal pure returns (CapDataStorage storage cap_) {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }
}
