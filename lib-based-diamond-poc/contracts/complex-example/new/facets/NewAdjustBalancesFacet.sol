// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// ═══════════════════════════════════════════════════════════════════════════════
// NEW APPROACH: AdjustBalancesFacet
//
// ✅ IMPORTS — exactly what this facet touches:
//    LibPause            → pause checks
//    LibAccess           → role authorization
//    LibABAF             → ABAF/LABAF balance adjustment logic
//    LibCorporateActions → register adjustment as corporate action
//    LibScheduledTasks   → schedule future adjustments
//    LibERC1410          → adjusted balance queries
//
// That's 6 libraries, each with a clear responsibility.
//
// ✅ ABAF/LABAF EXPLAINED:
//    A 2:1 stock split means every holder gets 2x tokens.
//    NAIVE approach: loop through ALL holders, update ALL balances → O(n) gas
//    ABAF approach:  update ONE number (ABAF), lazy-sync on access → O(1) gas
//
//    adjustedBalance = rawBalance × (ABAF / LABAF)
//
//    When ABAF changes (split/consolidation):
//      - ABAF is multiplied immediately (1 SSTORE)
//      - Individual LABAFs are updated lazily (on next transfer/query)
//      - Snapshots record ABAF at capture time for accurate historical queries
//
// ═══════════════════════════════════════════════════════════════════════════════

import "../../storage/ComplexStorage.sol";
import "../lib/LibPause.sol";
import "../lib/LibAccess.sol";
import "../lib/LibABAF.sol";
import "../lib/LibCorporateActions.sol";
import "../lib/LibScheduledTasks.sol";
import "../lib/LibERC1410.sol";

contract NewAdjustBalancesFacet {

    /// @notice Apply a balance adjustment factor immediately
    /// @param factor The adjustment factor (e.g., 2e18 for 2:1 split)
    function adjustBalances(uint256 factor, uint8 /* decimals */)
        external returns (bool)
    {
        LibAccess.checkRole(ADJUSTMENT_BALANCE_ROLE);
        LibPause.requireNotPaused();

        // Update global ABAF — O(1) operation!
        LibABAF.updateAbaf(factor);

        // Register corporate action for audit trail
        LibCorporateActions.registerAction(
            ADJUSTMENT_ACTION_TYPE,
            abi.encode(factor),
            abi.encode(LibABAF.getAbaf())
        );

        return true;
    }

    /// @notice Schedule a future balance adjustment
    function scheduleBalanceAdjustment(
        uint256 timestamp,
        uint256 factor,
        uint8 decimals
    ) external {
        LibAccess.checkRole(SCHEDULER_ROLE);
        LibPause.requireNotPaused();

        LibScheduledTasks.addTask(ScheduledTask({
            timestamp: timestamp,
            taskType: ScheduledTaskType.BALANCE_ADJUSTMENT,
            data: abi.encode(factor, decimals)
        }));
    }

    /// @notice Force sync a specific account+partition to current ABAF
    /// Use when you need guaranteed up-to-date balance before a specific operation
    function syncAccountBalance(address account, bytes32 partition) external {
        LibAccess.checkRole(ADJUSTMENT_BALANCE_ROLE);
        LibABAF.syncBalanceAdjustments(account, partition);
    }

    // ─── View functions ─────────────────────────────────────────────────

    /// @notice Current global ABAF
    function getAbaf() external view returns (uint256) {
        return LibABAF.getAbaf();
    }

    /// @notice ABAF-adjusted balance (what the user actually "has")
    function adjustedBalanceOfByPartition(bytes32 partition, address account)
        external view returns (uint256)
    {
        return LibERC1410.adjustedBalanceOfByPartition(partition, account);
    }

    /// @notice ABAF-adjusted total supply
    function adjustedTotalSupply() external view returns (uint256) {
        return LibERC1410.adjustedTotalSupply();
    }

    /// @notice Raw (un-adjusted) balance for debugging
    function rawBalanceOfByPartition(bytes32 partition, address account)
        external view returns (uint256)
    {
        return LibERC1410.rawBalanceOfByPartition(partition, account);
    }
}
