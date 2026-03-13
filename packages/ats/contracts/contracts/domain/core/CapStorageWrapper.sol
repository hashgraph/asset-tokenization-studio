// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CAP_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { MAX_UINT256 } from "../../constants/values.sol";
import { ICap } from "../../facets/layer_1/cap/ICap.sol";
import { ICapStorageWrapper } from "../asset/cap/ICapStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";

struct CapDataStorage {
    uint256 maxSupply;
    mapping(bytes32 => uint256) maxSupplyByPartition;
    bool initialized;
}

library CapStorageWrapper {
    // --- Storage accessor (pure) ---

    function _capStorage() internal pure returns (CapDataStorage storage cap_) {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }

    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
    function _requireWithinMaxSupply(uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupply = _getMaxSupplyAdjustedAt(_timestamp);
        if (!_isCorrectMaxSupply(ERC1410StorageWrapper._totalSupply() + _amount, maxSupply)) {
            revert ICapStorageWrapper.MaxSupplyReached(maxSupply);
        }
    }

    function _requireWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupplyForPartition = _getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        if (
            !_isCorrectMaxSupply(
                ERC1410StorageWrapper._totalSupplyByPartition(_partition) + _amount,
                maxSupplyForPartition
            )
        ) {
            revert ICapStorageWrapper.MaxSupplyReachedForPartition(_partition, maxSupplyForPartition);
        }
    }

    function _requireValidNewMaxSupply(uint256 _newMaxSupply, uint256 _timestamp) internal view {
        if (_newMaxSupply == 0) {
            revert ICapStorageWrapper.NewMaxSupplyCannotBeZero();
        }
        uint256 totalSupply = AdjustBalancesStorageWrapper._totalSupplyAdjustedAt(_timestamp);
        if (totalSupply > _newMaxSupply) {
            revert ICapStorageWrapper.NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
    }

    function _requireValidNewMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _newMaxSupply,
        uint256 _timestamp
    ) internal view {
        if (_newMaxSupply == 0) return;
        uint256 totalSupplyForPartition = AdjustBalancesStorageWrapper._totalSupplyByPartitionAdjustedAt(
            _partition,
            _timestamp
        );
        if (totalSupplyForPartition > _newMaxSupply) {
            revert ICapStorageWrapper.NewMaxSupplyForPartitionTooLow(
                _partition,
                _newMaxSupply,
                totalSupplyForPartition
            );
        }
        uint256 maxSupplyOverall = _getMaxSupplyAdjustedAt(_timestamp);
        if (_newMaxSupply > maxSupplyOverall) {
            revert ICapStorageWrapper.NewMaxSupplyByPartitionTooHigh(_partition, _newMaxSupply, maxSupplyOverall);
        }
    }

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_Cap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal {
        CapDataStorage storage cs = _capStorage();
        cs.maxSupply = maxSupply;
        for (uint256 i = 0; i < partitionCap.length; i++) {
            cs.maxSupplyByPartition[partitionCap[i].partition] = partitionCap[i].maxSupply;
        }
        cs.initialized = true;
    }

    // --- State-changing functions ---

    function _setMaxSupply(uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupply = _getMaxSupplyAdjustedAt(_timestamp);
        _capStorage().maxSupply = _maxSupply;
        emit ICapStorageWrapper.MaxSupplySet(msg.sender, _maxSupply, previousMaxSupply);
    }

    function _setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupplyByPartition = _getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        _capStorage().maxSupplyByPartition[_partition] = _maxSupply;
        emit ICapStorageWrapper.MaxSupplyByPartitionSet(
            msg.sender,
            _partition,
            _maxSupply,
            previousMaxSupplyByPartition
        );
    }

    function _adjustMaxSupply(uint256 factor) internal {
        CapDataStorage storage cs = _capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (cs.maxSupply > limit) cs.maxSupply = MAX_UINT256;
        else cs.maxSupply *= factor;
    }

    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal {
        CapDataStorage storage cs = _capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (cs.maxSupplyByPartition[partition] > limit) cs.maxSupplyByPartition[partition] = MAX_UINT256;
        else cs.maxSupplyByPartition[partition] *= factor;
    }

    // --- Read functions ---

    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = _capStorage();
        (uint256 pendingAbaf, ) = AdjustBalancesStorageWrapper._getPendingScheduledBalanceAdjustmentsAt(timestamp);

        uint256 limit = MAX_UINT256 / pendingAbaf;
        if (cs.maxSupply > limit) return MAX_UINT256;
        return cs.maxSupply * pendingAbaf;
    }

    function _getMaxSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = _capStorage();
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getLabafByPartition(partition)
        );

        uint256 limit = MAX_UINT256 / factor;
        if (cs.maxSupplyByPartition[partition] > limit) return MAX_UINT256;
        return cs.maxSupplyByPartition[partition] * factor;
    }

    function _isCapInitialized() internal view returns (bool) {
        return _capStorage().initialized;
    }
}
