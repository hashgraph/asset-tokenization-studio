// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./OldInternals.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// OLD APPROACH: AdjustBalancesFacet
//
// Applies balance adjustment factors (stock splits, consolidations).
//
// ❌ Inherits ALL of OldInternals — but only uses ~5 functions:
//    _updateAbaf(), _getAbaf(), _adjustBalancesForAllHolders(),
//    _registerCorporateAction(), _requireNotPaused(), _checkRole()
//
// ❌ But because _adjustBalancesForAllHolders() internally calls
//    _getTokenHolders() → _syncBalanceAdjustments() → ERC1410 functions,
//    the REAL dependency set is ~12 functions across 4 sections.
//    You can't see this without reading every line of OldInternals.
// ═══════════════════════════════════════════════════════════════════════════════

contract OldAdjustBalancesFacet is OldInternals {

    /// @notice Apply a balance adjustment factor to all token holders
    /// @param factor The adjustment factor (e.g., 2e18 for 2:1 split)
    /// @param decimals The decimals of the factor
    function adjustBalances(uint256 factor, uint8 decimals)
        external
        onlyRole(ADJUSTMENT_BALANCE_ROLE)
        onlyUnpaused()
        validateFactor(factor)
        returns (bool)
    {
        // Update global ABAF (section 5)
        _updateAbaf(factor);

        // Register corporate action (section 10)
        _registerCorporateAction(
            ADJUSTMENT_ACTION_TYPE,
            abi.encode(factor, decimals),
            abi.encode(_getAbaf())
        );

        return true;
    }

    /// @notice Schedule a future balance adjustment
    function scheduleBalanceAdjustment(
        uint256 timestamp,
        uint256 factor,
        uint8 decimals
    )
        external
        onlyRole(SCHEDULER_ROLE)
        onlyUnpaused()
        onlyValidTimestamp(timestamp)
        validateFactor(factor)
    {
        _addScheduledTask(ScheduledTask({
            timestamp: timestamp,
            taskType: ScheduledTaskType.BALANCE_ADJUSTMENT,
            data: abi.encode(factor, decimals)
        }));
    }

    /// @notice Force sync all holders (expensive, use sparingly)
    function syncAllHolders()
        external
        onlyRole(ADJUSTMENT_BALANCE_ROLE)
        onlyUnpaused()
    {
        // This calls: _getTokenHolders() → _syncBalanceAdjustments()
        // for EVERY holder × EVERY partition. Very expensive.
        // Hidden cost: you'd never know from looking at this call alone.
        _adjustBalancesForAllHolders();
    }

    /// @notice View: Current ABAF
    function getAbaf() external view returns (uint256) {
        return _getAbaf();
    }

    /// @notice View: ABAF-adjusted balance for an account
    function adjustedBalanceOfByPartition(bytes32 partition, address account)
        external view returns (uint256)
    {
        return _adjustedBalanceOfByPartition(partition, account);
    }
}
