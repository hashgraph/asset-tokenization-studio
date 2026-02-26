// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapDataStorage, capStorage } from "../../storage/FinancialOpsStorageAccessor.sol";
import { MAX_UINT256 } from "../../constants/values.sol";

/// @title LibCap — Token cap management library
/// @notice Centralized cap functionality extracted from CapStorageWrapper.sol
/// @dev Uses free function storage accessors from AssetStorage.sol, no inheritance
library LibCap {
    event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);
    event MaxSupplyByPartitionSet(
        address indexed operator,
        bytes32 indexed partition,
        uint256 newMaxSupply,
        uint256 previousMaxSupply
    );

    error MaxSupplyReached(uint256 maxSupply);
    error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);
    error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);
    error NewMaxSupplyCannotBeZero();
    error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);
    error NewMaxSupplyByPartitionTooHigh(bytes32 partition, uint256 newMaxSupplyByPartition, uint256 maxSupply);

    /// @dev Initializes cap with global and per-partition limits
    function initializeCap(
        uint256 maxSupply,
        bytes32[] memory partitions,
        uint256[] memory partitionMaxSupplies
    ) internal {
        CapDataStorage storage cap = capStorage();
        cap.maxSupply = maxSupply;
        cap.initialized = true;

        for (uint256 i = 0; i < partitions.length; ++i) {
            cap.maxSupplyByPartition[partitions[i]] = partitionMaxSupplies[i];
        }
    }

    /// @dev Adjusts global max supply by a multiplication factor (for balance adjustments)
    function adjustMaxSupply(uint256 factor) internal {
        CapDataStorage storage cap = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (cap.maxSupply > limit) cap.maxSupply = MAX_UINT256;
        else cap.maxSupply *= factor;
    }

    /// @dev Adjusts partition max supply by a multiplication factor (for balance adjustments)
    function adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal {
        CapDataStorage storage cap = capStorage();
        uint256 limit = MAX_UINT256 / factor;
        if (cap.maxSupplyByPartition[partition] > limit) cap.maxSupplyByPartition[partition] = MAX_UINT256;
        else cap.maxSupplyByPartition[partition] *= factor;
    }

    /// @dev Sets the global max supply
    function setMaxSupply(uint256 newMaxSupply) internal {
        uint256 previousMaxSupply = getMaxSupply();
        capStorage().maxSupply = newMaxSupply;
        emit MaxSupplySet(msg.sender, newMaxSupply, previousMaxSupply);
    }

    /// @dev Sets the max supply for a specific partition
    function setMaxSupplyByPartition(bytes32 partition, uint256 newMaxSupply) internal {
        uint256 previousMaxSupplyByPartition = getMaxSupplyByPartition(partition);
        capStorage().maxSupplyByPartition[partition] = newMaxSupply;
        emit MaxSupplyByPartitionSet(msg.sender, partition, newMaxSupply, previousMaxSupplyByPartition);
    }

    /// @dev Returns true if cap is initialized
    function isCapInitialized() internal view returns (bool) {
        return capStorage().initialized;
    }

    /// @dev Returns the global max supply
    function getMaxSupply() internal view returns (uint256) {
        return capStorage().maxSupply;
    }

    /// @dev Returns the max supply for a specific partition
    function getMaxSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return capStorage().maxSupplyByPartition[partition];
    }

    /// @dev Checks if an amount can be minted without exceeding global cap
    /// @param amount Amount to check
    /// @param currentTotalSupply Current total supply (caller provides to avoid cross-domain dependency)
    function requireWithinMaxSupply(uint256 amount, uint256 currentTotalSupply) internal view {
        uint256 maxSupply = getMaxSupply();
        if (maxSupply == 0) return;
        if (currentTotalSupply + amount > maxSupply) {
            revert MaxSupplyReached(maxSupply);
        }
    }

    /// @dev Checks if an amount can be minted without exceeding partition cap
    /// @param partition Partition to check
    /// @param amount Amount to check
    /// @param currentTotalSupplyByPartition Current total supply for partition (caller provides)
    function requireWithinMaxSupplyByPartition(
        bytes32 partition,
        uint256 amount,
        uint256 currentTotalSupplyByPartition
    ) internal view {
        uint256 maxSupply = getMaxSupplyByPartition(partition);
        if (maxSupply == 0) return;
        if (currentTotalSupplyByPartition + amount > maxSupply) {
            revert MaxSupplyReachedForPartition(partition, maxSupply);
        }
    }

    /// @dev Validates that a new partition cap is valid
    /// @param partition Partition to validate
    /// @param newMaxSupply New cap value for partition
    /// @param currentTotalSupplyByPartition Current total supply for partition (caller provides)
    /// @param globalMaxSupply Global max supply (caller provides)
    function requireValidNewMaxSupplyByPartition(
        bytes32 partition,
        uint256 newMaxSupply,
        uint256 currentTotalSupplyByPartition,
        uint256 globalMaxSupply
    ) internal pure {
        if (newMaxSupply == 0) return;
        if (currentTotalSupplyByPartition > newMaxSupply) {
            revert NewMaxSupplyForPartitionTooLow(partition, newMaxSupply, currentTotalSupplyByPartition);
        }
        if (newMaxSupply > globalMaxSupply) {
            revert NewMaxSupplyByPartitionTooHigh(partition, newMaxSupply, globalMaxSupply);
        }
    }

    /// @dev Validates that a new global cap is >= current total supply
    /// @param newMaxSupply New cap value to validate
    /// @param currentTotalSupply Current total supply (caller provides)
    function requireValidNewMaxSupply(uint256 newMaxSupply, uint256 currentTotalSupply) internal pure {
        if (newMaxSupply == 0) {
            revert NewMaxSupplyCannotBeZero();
        }
        if (currentTotalSupply > newMaxSupply) {
            revert NewMaxSupplyTooLow(newMaxSupply, currentTotalSupply);
        }
    }
}
