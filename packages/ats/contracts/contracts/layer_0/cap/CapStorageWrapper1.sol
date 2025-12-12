// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper1 } from "../adjustBalances/AdjustBalancesStorageWrapper1.sol";
import { _CAP_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { MAX_UINT256 } from "../constants/values.sol";
import { ICap } from "contracts/layer_1/interfaces/cap/ICap.sol";

abstract contract CapStorageWrapper1 is AdjustBalancesStorageWrapper1 {
    struct CapDataStorage {
        uint256 maxSupply;
        mapping(bytes32 => uint256) maxSupplyByPartition;
        bool initialized;
    }

    function _initialize_Cap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal override {
        CapDataStorage storage capStorage = _capStorage();

        capStorage.maxSupply = maxSupply;

        for (uint256 i = 0; i < partitionCap.length; i++) {
            capStorage.maxSupplyByPartition[partitionCap[i].partition] = partitionCap[i].maxSupply;
        }

        capStorage.initialized = true;
    }

    function _adjustMaxSupply(uint256 factor) internal override {
        CapDataStorage storage capStorage = _capStorage();
        if (capStorage.maxSupply == MAX_UINT256) return;
        capStorage.maxSupply *= factor;
    }

    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal override {
        CapDataStorage storage capStorage = _capStorage();
        if (capStorage.maxSupplyByPartition[partition] == MAX_UINT256) return;
        capStorage.maxSupplyByPartition[partition] *= factor;
    }

    function _getMaxSupply() internal view override returns (uint256) {
        return _capStorage().maxSupply;
    }

    function _getMaxSupplyByPartition(bytes32 partition) internal view override returns (uint256) {
        return _capStorage().maxSupplyByPartition[partition];
    }

    function _getMaxSupplyAdjusted() internal view override returns (uint256 maxSupply_) {
        return _getMaxSupplyAdjustedAt(_blockTimestamp());
    }

    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view override returns (uint256) {
        CapDataStorage storage capStorage = _capStorage();
        if (capStorage.maxSupply == MAX_UINT256) return MAX_UINT256;
        (uint256 pendingAbaf, ) = _getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return capStorage.maxSupply * pendingAbaf;
    }

    function _getMaxSupplyByPartitionAdjusted(bytes32 _partition) internal view override returns (uint256 maxSupply_) {
        return _getMaxSupplyByPartitionAdjustedAt(_partition, _blockTimestamp());
    }

    function _getMaxSupplyByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getLabafByPartition(partition));
        return _getMaxSupplyByPartition(partition) * factor;
    }

    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure override returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }

    function _isCapInitialized() internal view override returns (bool) {
        return _capStorage().initialized;
    }

    function _capStorage() internal pure returns (CapDataStorage storage cap_) {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }
}
