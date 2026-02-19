// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibABAF } from "../domain/LibABAF.sol";
import { LibHold } from "../domain/LibHold.sol";
import { LibLock } from "../domain/LibLock.sol";
import { LibFreeze } from "../domain/LibFreeze.sol";
import { LibClearing } from "../domain/LibClearing.sol";

/// @title LibTotalBalance
/// @notice Orchestrator library for total balance calculations
/// @dev Composes multiple domain libraries (ERC1410, ABAF, Hold, Lock, Freeze, Clearing)
///      to compute available and total balances considering all encumbrances
library LibTotalBalance {
    // ═══════════════════════════════════════════════════════════════════════════════
    // TOTAL BALANCE CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get total balance for an account at a timestamp
    /// @dev Composes: adjusted balance + held + locked + frozen + cleared encumbrances
    ///      Encumbrances are deducted from balances[] by their respective operations,
    ///      so total balance must add them back to reconstruct the original minted amount.
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return totalBalance_ The total balance including all sources
    function getTotalBalanceForAdjustedAt(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            LibABAF.balanceOfAdjustedAt(account, timestamp) +
            getAdjustedHeldAmountByAccount(account, timestamp) +
            getAdjustedLockedAmountByAccount(account, timestamp) +
            getAdjustedFrozenAmount(account, timestamp) +
            getAdjustedClearedAmountByAccount(account, timestamp);
    }

    /// @notice Get total balance per partition for an account at a specific timestamp
    /// @dev Composes: adjusted partition balance + held + locked + frozen + cleared per partition
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return totalBalance_ The total balance for the partition
    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            LibABAF.balanceOfByPartitionAdjustedAt(partition, account, timestamp) +
            getAdjustedHeldAmountByPartition(partition, account, timestamp) +
            getAdjustedLockedAmountByPartition(partition, account, timestamp) +
            getAdjustedFrozenAmountByPartition(partition, account, timestamp) +
            getAdjustedClearedAmountByPartition(partition, account, timestamp);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // AVAILABLE BALANCE CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get available balance for an account (total minus encumbrances)
    /// @dev Encumbrances include: held + locked + frozen + cleared amounts
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return availableBalance_ The balance available for transfer
    function getAvailableBalanceAdjustedAt(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 availableBalance_) {
        uint256 totalBalance = getTotalBalanceForAdjustedAt(account, timestamp);
        uint256 encumbrances = getTotalEncumbrancesAdjustedAt(account, timestamp);

        availableBalance_ = totalBalance > encumbrances ? totalBalance - encumbrances : 0;
    }

    /// @notice Get available balance per partition (total minus encumbrances)
    /// @dev Encumbrances include: held + locked + frozen + cleared amounts per partition
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return availableBalance_ The balance available for transfer in the partition
    function getAvailableBalanceByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 availableBalance_) {
        uint256 totalBalance = getTotalBalanceForByPartitionAdjustedAt(partition, account, timestamp);
        uint256 encumbrances = getTotalEncumbrancesByPartitionAdjustedAt(partition, account, timestamp);

        availableBalance_ = totalBalance > encumbrances ? totalBalance - encumbrances : 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENCUMBRANCE CALCULATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get total encumbrances for an account
    /// @dev Sum of: held + locked + frozen + cleared amounts
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return totalEncumbrances_ The sum of all encumbered amounts
    function getTotalEncumbrancesAdjustedAt(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 totalEncumbrances_) {
        uint256 heldAmount = getAdjustedHeldAmountByAccount(account, timestamp);
        uint256 lockedAmount = getAdjustedLockedAmountByAccount(account, timestamp);
        uint256 frozenAmount = getAdjustedFrozenAmount(account, timestamp);
        uint256 clearedAmount = getAdjustedClearedAmountByAccount(account, timestamp);

        totalEncumbrances_ = heldAmount + lockedAmount + frozenAmount + clearedAmount;
    }

    /// @notice Get total encumbrances per partition
    /// @dev Sum of: held + locked + frozen + cleared amounts per partition
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return totalEncumbrances_ The sum of all encumbered amounts in the partition
    function getTotalEncumbrancesByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 totalEncumbrances_) {
        uint256 heldAmount = getAdjustedHeldAmountByPartition(partition, account, timestamp);
        uint256 lockedAmount = getAdjustedLockedAmountByPartition(partition, account, timestamp);
        uint256 frozenAmount = getAdjustedFrozenAmountByPartition(partition, account, timestamp);
        uint256 clearedAmount = getAdjustedClearedAmountByPartition(partition, account, timestamp);

        totalEncumbrances_ = heldAmount + lockedAmount + frozenAmount + clearedAmount;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HELD AMOUNT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get adjusted held amount for account (considers ABAF)
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted held amount
    function getAdjustedHeldAmountByAccount(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 heldAmount = LibHold.getHeldAmountFor(account);
        uint256 factor = LibABAF.calculateFactorForHeldAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = heldAmount * factor;
    }

    /// @notice Get adjusted held amount per partition (considers ABAF)
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted held amount in the partition
    function getAdjustedHeldAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 heldAmount = LibHold.getHeldAmountForByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForHeldAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = heldAmount * factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCKED AMOUNT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get adjusted locked amount for account (considers ABAF)
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted locked amount
    function getAdjustedLockedAmountByAccount(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 lockedAmount = LibLock.getLockedAmountFor(account);
        uint256 factor = LibABAF.calculateFactorForLockedAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = lockedAmount * factor;
    }

    /// @notice Get adjusted locked amount per partition (considers ABAF)
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted locked amount in the partition
    function getAdjustedLockedAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 lockedAmount = LibLock.getLockedAmountForByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForLockedAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = lockedAmount * factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FROZEN AMOUNT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get adjusted frozen amount for account (considers ABAF)
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted frozen amount
    function getAdjustedFrozenAmount(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 frozenAmount = LibFreeze.getFrozenTokens(account);
        uint256 factor = LibABAF.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = frozenAmount * factor;
    }

    /// @notice Get adjusted frozen amount per partition (considers ABAF)
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted frozen amount in the partition
    function getAdjustedFrozenAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 frozenAmount = LibFreeze.getFrozenTokensByPartition(account, partition);
        uint256 factor = LibABAF.calculateFactorForFrozenAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = frozenAmount * factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARED AMOUNT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get adjusted cleared amount for account (considers ABAF)
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted cleared amount
    function getAdjustedClearedAmountByAccount(
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 clearedAmount = LibClearing.getClearedAmount(account);
        uint256 factor = LibABAF.calculateFactorForClearedAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = clearedAmount * factor;
    }

    /// @notice Get adjusted cleared amount per partition (considers ABAF)
    /// @param partition The partition identifier
    /// @param account The token holder address
    /// @param timestamp The timestamp for historical queries
    /// @return adjustedAmount_ The adjusted cleared amount in the partition
    function getAdjustedClearedAmountByPartition(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256 adjustedAmount_) {
        uint256 clearedAmount = LibClearing.getClearedAmountByPartition(partition, account);
        uint256 factor = LibABAF.calculateFactorForClearedAmountAdjustedAt(account, timestamp);

        adjustedAmount_ = clearedAmount * factor;
    }
}
