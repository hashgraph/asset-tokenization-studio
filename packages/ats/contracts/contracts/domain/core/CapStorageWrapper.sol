// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CAP_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { MAX_UINT256 } from "../../constants/values.sol";
import { ICap } from "../../facets/layer_1/cap/ICap.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @notice Storage struct for cap management data
struct CapDataStorage {
    uint256 maxSupply;
    mapping(bytes32 => uint256) maxSupplyByPartition;
    bool initialized;
}

/// @title CapStorageWrapper
/// @dev Library providing cap storage operations with Diamond Storage Pattern
/// @author Hashgraph
library CapStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase

    /// @notice Initialises cap data with max supply and partition caps
    /// @param maxSupply Global maximum supply
    /// @param partitionCap Array of partition-specific caps
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

    /// @notice Sets new maximum supply with event emission
    /// @param _maxSupply New maximum supply value
    /// @param _timestamp Timestamp for adjustment calculation
    function setMaxSupply(uint256 _maxSupply, uint256 _timestamp) internal {
        uint256 previousMaxSupply = getMaxSupplyAdjustedAt(_timestamp);
        capStorage().maxSupply = _maxSupply;
        emit ICap.MaxSupplySet(EvmAccessors.getMsgSender(), _maxSupply, previousMaxSupply);
    }

    /// @notice Sets maximum supply for a specific partition
    /// @param _partition Partition to set cap for
    /// @param _maxSupply New maximum supply for partition
    /// @param _timestamp Timestamp for adjustment calculation
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

    /// @notice Adjusts maximum supply by a multiplication factor
    /// @param factor Factor to multiply supply by
    function adjustMaxSupply(uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupply = (cs.maxSupply > limit) ? MAX_UINT256 : cs.maxSupply * factor;
    }

    /// @notice Adjusts maximum supply for a partition by a factor
    /// @param partition Partition to adjust
    /// @param factor Factor to multiply supply by
    function adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal {
        CapDataStorage storage cs = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        cs.maxSupplyByPartition[partition] = (cs.maxSupplyByPartition[partition] > limit)
            ? MAX_UINT256
            : cs.maxSupplyByPartition[partition] * factor;
    }

    /// @notice Validates amount is within global max supply
    /// @param _amount Amount to validate
    /// @param _timestamp Timestamp for adjustment calculation
    function requireWithinMaxSupply(uint256 _amount, uint256 _timestamp) internal view {
        uint256 maxSupply = getMaxSupplyAdjustedAt(_timestamp);
        if (!isCorrectMaxSupply(ERC20StorageWrapper.totalSupply() + _amount, maxSupply))
            revert ICap.MaxSupplyReached(maxSupply);
    }

    /// @notice Validates amount is within partition max supply
    /// @param _partition Partition to check
    /// @param _amount Amount to validate
    /// @param _timestamp Timestamp for adjustment calculation
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

    /// @notice Validates new max supply is greater than total supply
    /// @param _newMaxSupply Proposed new maximum supply
    /// @param _timestamp Timestamp for adjustment calculation
    function requireValidNewMaxSupply(uint256 _newMaxSupply, uint256 _timestamp) internal view {
        if (_newMaxSupply == 0) {
            revert ICap.NewMaxSupplyCannotBeZero();
        }
        uint256 totalSupply = AdjustBalancesStorageWrapper.totalSupplyAdjustedAt(_timestamp);
        if (totalSupply > _newMaxSupply) {
            revert ICap.NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
    }

    /// @notice Validates new partition cap is within global and partition limits
    /// @param _partition Partition to validate
    /// @param _newMaxSupply Proposed new maximum supply
    /// @param _timestamp Timestamp for adjustment calculation
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

    /// @notice Gets max supply adjusted by balance adjustment factor
    /// @param timestamp Timestamp to get adjusted supply for
    /// @return Adjusted maximum supply
    function getMaxSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        (uint256 pendingAbaf, ) = AdjustBalancesStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return (cs.maxSupply > (MAX_UINT256 / pendingAbaf)) ? MAX_UINT256 : cs.maxSupply * pendingAbaf;
    }

    /// @notice Gets partition max supply adjusted by balance adjustment factor
    /// @param partition Partition to get adjusted supply for
    /// @param timestamp Timestamp to get adjusted supply for
    /// @return Adjusted partition maximum supply
    function getMaxSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        CapDataStorage storage cs = capStorage();
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getLabafByPartition(partition)
        );

        uint256 limit = MAX_UINT256 / factor;
        return (cs.maxSupplyByPartition[partition] > limit) ? MAX_UINT256 : cs.maxSupplyByPartition[partition] * factor;
    }

    /// @notice Checks if cap has been initialised
    /// @return True if cap is initialised
    function isCapInitialized() internal view returns (bool) {
        return capStorage().initialized;
    }

    /// @notice Validates amount against max supply
    /// @param _amount Amount to check
    /// @param _maxSupply Maximum supply to compare against
    /// @return True if amount is within supply limit
    function isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure returns (bool) {
        return (_maxSupply == 0) || (_amount <= _maxSupply);
    }

    /// @notice Returns the CapDataStorage storage pointer for the diamond storage position
    /// @return cap_ Storage pointer to CapDataStorage
    function capStorage() private pure returns (CapDataStorage storage cap_) {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }
}
