// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { erc3643Storage } from "../../storage/ExternalStorage.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { IERC3643StorageWrapper } from "../../facets/features/interfaces/ERC3643/IERC3643StorageWrapper.sol";
import { LibABAF } from "./LibABAF.sol";

/// @title LibFreeze
/// @notice Leaf library for freeze/unfreeze token management
/// @dev Extracted from ERC3643StorageWrapper2 for library-based diamond migration
library LibFreeze {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL FREEZE/UNFREEZE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Freeze tokens by partition for an account
    /// @dev Updates frozen token state in storage
    /// @param partition The partition identifier
    /// @param account The account to freeze tokens for
    /// @param amount The amount of tokens to freeze
    function freezeTokensByPartition(bytes32 partition, address account, uint256 amount) internal {
        IERC3643Management.ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[account] += amount;
        st.frozenTokensByPartition[account][partition] += amount;
    }

    /// @notice Unfreeze tokens by partition for an account
    /// @dev Updates frozen token state in storage
    /// @param partition The partition identifier
    /// @param account The account to unfreeze tokens for
    /// @param amount The amount of tokens to unfreeze
    function unfreezeTokensByPartition(bytes32 partition, address account, uint256 amount) internal {
        IERC3643Management.ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[account] -= amount;
        st.frozenTokensByPartition[account][partition] -= amount;
    }

    /// @notice Update frozen token amounts by factor (for balance adjustments)
    /// @dev Multiplies frozen amounts by the given factor
    /// @param account The account to update
    /// @param factor The multiplication factor
    function updateFrozenAmountByFactor(address account, uint256 factor) internal {
        erc3643Storage().frozenTokens[account] *= factor;
    }

    /// @notice Update frozen token amounts by partition by factor
    /// @dev Multiplies frozen amounts by the given factor
    /// @param partition The partition identifier
    /// @param account The account to update
    /// @param factor The multiplication factor
    function updateFrozenAmountByPartitionByFactor(bytes32 partition, address account, uint256 factor) internal {
        erc3643Storage().frozenTokensByPartition[account][partition] *= factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS - FROZEN TOKENS STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get total frozen tokens for an account
    /// @param account The account to check
    /// @return frozenAmount Total frozen tokens
    function getFrozenTokens(address account) internal view returns (uint256 frozenAmount) {
        return erc3643Storage().frozenTokens[account];
    }

    /// @notice Get frozen tokens by partition for an account
    /// @param account The account to check
    /// @param partition The partition identifier
    /// @return frozenAmount Frozen tokens in the partition
    function getFrozenTokensByPartition(
        address account,
        bytes32 partition
    ) internal view returns (uint256 frozenAmount) {
        return erc3643Storage().frozenTokensByPartition[account][partition];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ABAF-ADJUSTED QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get ABAF-adjusted frozen amount for an account at a timestamp
    /// @dev Replaces _getFrozenAmountForAdjustedAt from ERC3643StorageWrapper2
    function getFrozenAmountAdjustedAt(address account, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);
        return erc3643Storage().frozenTokens[account] * factor;
    }

    /// @notice Get ABAF-adjusted frozen amount by partition at a timestamp
    /// @dev Replaces _getFrozenAmountForByPartitionAdjustedAt from ERC3643StorageWrapper2
    function getFrozenAmountByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(timestamp),
            LibABAF.getTotalFrozenLabafByPartition(partition, account)
        );
        return erc3643Storage().frozenTokensByPartition[account][partition] * factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LABAF SYNC OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Sync frozen amount LABAF with current ABAF
    /// @dev Replaces _updateTotalFreeze from ERC3643StorageWrapper2
    function updateTotalFreeze(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getTotalFrozenLabaf(tokenHolder);
        uint256 labafByPartition = LibABAF.getTotalFrozenLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = LibABAF.calculateFactor(abaf_, labaf);
            updateFrozenAmountByFactor(tokenHolder, factor);
            LibABAF.setTotalFreezeLabaf(tokenHolder, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = LibABAF.calculateFactor(abaf_, labafByPartition);
            updateFrozenAmountByPartitionByFactor(partition, tokenHolder, factorByPartition);
            LibABAF.setTotalFreezeLabafByPartition(partition, tokenHolder, abaf_);
        }
    }

    /// @notice Check if unfreeze amount is valid
    /// @dev Replaces _checkUnfreezeAmount from ERC3643StorageWrapper2
    function checkUnfreezeAmount(bytes32 partition, address account, uint256 amount) internal view {
        uint256 frozenAmount = getFrozenAmountByPartitionAdjustedAt(partition, account, block.timestamp);
        if (frozenAmount < amount) {
            revert IERC3643StorageWrapper.InsufficientFrozenBalance(account, amount, frozenAmount, partition);
        }
    }
}
