// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CAP_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { MAX_UINT256 } from "../../constants/values.sol";
import { ICap } from "../../facets/cap/ICap.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

struct CapDataStorage {
    uint256 maxSupply;
    mapping(bytes32 => uint256) maxSupplyByPartition;
    bool initialized;
}

library CapStorageWrapper {
    function initializeCap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal {
        CapDataStorage storage cs = capStorage();
        cs.maxSupply = maxSupply;
        uint256 length = partitionCap.length;
        for (uint256 i; i < length; ) {
            cs.maxSupplyByPartition[partitionCap[i].partition] = partitionCap[i].maxSupply;
            unchecked {
                ++i;
            }
        }
        cs.initialized = true;
    }

    function setMaxSupply(uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupply = getMaxSupplyAdjustedAt(_timestamp);
        capStorage().maxSupply = _maxSupply;
        emit ICap.MaxSupplySet(EvmAccessors.getMsgSender(), _maxSupply, previousMaxSupply);
    }

    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupplyByPartition = getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        capStorage().maxSupplyByPartition[_partition] = _maxSupply;
        emit ICap.MaxSupplyByPartitionSet(
            EvmAccessors.getMsgSender(),
            _partition,
            _maxSupply,
            previousMaxSupplyByPartition
        );
    }

    function adjustMaxSupply(uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupply = (cs.maxSupply > limit) ? MAX_UINT256 : cs.maxSupply * factor;
    }

    function adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupplyByPartition[partition] = (cs.maxSupplyByPartition[partition] > limit)
            ? MAX_UINT256
            : cs.maxSupplyByPartition[partition] * factor;
    }

    function requireWithinMaxSupply(uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupply = getMaxSupplyAdjustedAt(_timestamp);
        if (!isCorrectMaxSupply(ERC1410StorageWrapper.totalSupply() + _amount, maxSupply))
            revert ICap.MaxSupplyReached(maxSupply);
    }

    function requireWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupplyForPartition = getMaxSupplyByPartitionAdjustedAt(_partition, _timestamp);
        if (
            !isCorrectMaxSupply(
                ERC1410StorageWrapper.totalSupplyByPartition(_partition) + _amount,
                maxSupplyForPartition
            )
        ) {
            revert ICap.MaxSupplyReachedForPartition(_partition, maxSupplyForPartition);
        }
    }

    function requireValidNewMaxSupply(uint256 _newMaxSupply, uint256 _timestamp) internal view {
        if (_newMaxSupply == 0) {
            revert ICap.NewMaxSupplyCannotBeZero();
        }
        uint256 totalSupply = AdjustBalancesStorageWrapper.totalSupplyAdjustedAt(_timestamp);
        if (totalSupply > _newMaxSupply) {
            revert ICap.NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
    }

    function requireValidNewMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _newMaxSupply,
        uint256 _timestamp
    ) internal view {
        if (_newMaxSupply == 0) return;
        uint256 totalSupplyForPartition = AdjustBalancesStorageWrapper.totalSupplyByPartitionAdjustedAt(
            _partition,
            _timestamp
        );
        if (totalSupplyForPartition > _newMaxSupply) {
            revert ICap.NewMaxSupplyForPartitionTooLow(_partition, _newMaxSupply, totalSupplyForPartition);
        }
        uint256 maxSupplyOverall = getMaxSupplyAdjustedAt(_timestamp);
        if (_newMaxSupply > maxSupplyOverall) {
            revert ICap.NewMaxSupplyByPartitionTooHigh(_partition, _newMaxSupply, maxSupplyOverall);
        }
    }

    function getMaxSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        (uint256 pendingAbaf, ) = AdjustBalancesStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return (cs.maxSupply > (MAX_UINT256 / pendingAbaf)) ? MAX_UINT256 : cs.maxSupply * pendingAbaf;
    }

    function getMaxSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getLabafByPartition(partition)
        );

        uint256 limit = MAX_UINT256 / factor;
        return (cs.maxSupplyByPartition[partition] > limit) ? MAX_UINT256 : cs.maxSupplyByPartition[partition] * factor;
    }

    function isCapInitialized() internal view returns (bool) {
        return capStorage().initialized;
    }

    function capStorage() internal pure returns (CapDataStorage storage cap_) {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }

    function isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }
}
