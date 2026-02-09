// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibABAF — Aggregated Balance Adjustment Factor (75 lines of logic)
/// @notice Manages the ABAF/LABAF system for lazy balance adjustments.
///
/// @dev HOW ABAF/LABAF WORKS:
///
///   When a 2:1 stock split happens (factor = 2e18):
///     1. Global ABAF is multiplied: 1e18 → 2e18
///     2. Individual balances are NOT touched (O(1) instead of O(n))
///     3. Each account has a LABAF (Last-seen ABAF)
///     4. Query: adjustedBalance = rawBalance × (ABAF / LABAF)
///     5. Before transfer: sync LABAF to current ABAF, adjust raw balance
///
///   LABAF is tracked at multiple levels:
///     - Per account (global)
///     - Per account+partition (for ERC1410)
///     - Per allowance pair
///     - Per frozen/locked/held amounts
///
///   This is the MOST complex part of the system and the CORE reason
///   the Internals monster exists — because ERC1410 needs ABAF to return
///   adjusted balances, and ABAF needs ERC1410 to adjust raw balances.
///
///   With libraries, this circular dependency is a non-issue:
///     LibERC1410 calls LibABAF.sync()     ← compiles fine
///     LibABAF reads tokenStorage() directly ← no need to call LibERC1410
///
/// COMPOSITION: This library is CALLED BY LibERC1410 and LibScheduledTasks.
///              It reads tokenStorage() directly (no circular dep needed).
library LibABAF {
    error InvalidFactor(uint256 factor);
    event ABAFUpdated(uint256 oldAbaf, uint256 newAbaf, uint256 factor);
    event BalanceAdjustmentSynced(address indexed account, bytes32 indexed partition, uint256 factor);

    function getDecimals() internal view returns (uint8) {
        return abafStorage().abafDecimals;
    }

    function getAbaf() internal view returns (uint256) {
        uint256 abaf = abafStorage().abaf;
        return abaf == 0 ? 10 ** abafStorage().abafDecimals : abaf;
    }

    function getLabaf(address account) internal view returns (uint256) {
        uint256 labaf = abafStorage().labaf[account];
        return labaf == 0 ? 10 ** abafStorage().abafDecimals : labaf;
    }

    function getLabafByPartition(address account, bytes32 partition)
        internal view returns (uint256)
    {
        uint256 labaf = abafStorage().labafByPartition[account][partition];
        return labaf == 0 ? 10 ** abafStorage().abafDecimals : labaf;
    }

    /// @dev Calculates factor to multiply raw balance: ABAF / LABAF
    function calculateAdjustmentFactor(address account, bytes32 partition)
        internal view returns (uint256)
    {
        uint256 currentAbaf = getAbaf();
        uint256 accountLabaf = getLabafByPartition(account, partition);
        uint256 decimals = 10 ** abafStorage().abafDecimals;
        return (currentAbaf * decimals) / accountLabaf;
    }

    /// @dev Updates global ABAF: ABAF_new = ABAF_old × factor / 10^decimals
    function updateAbaf(uint256 factor) internal {
        if (factor == 0) revert InvalidFactor(factor);

        ABAFStorage storage abs_ = abafStorage();
        uint256 oldAbaf = getAbaf();
        uint256 decimals = 10 ** abs_.abafDecimals;
        uint256 newAbaf = (oldAbaf * factor) / decimals;

        abs_.abaf = newAbaf;
        abs_.abafTimestamps.push(block.timestamp);
        abs_.abafValues.push(newAbaf);

        emit ABAFUpdated(oldAbaf, newAbaf, factor);
    }

    /// @dev Syncs account+partition to current ABAF
    ///      Reads tokenStorage() DIRECTLY — no circular dependency needed!
    function syncBalanceAdjustments(address account, bytes32 partition) internal {
        ABAFStorage storage abs_ = abafStorage();
        uint256 currentAbaf = getAbaf();
        uint256 accountLabaf = getLabafByPartition(account, partition);

        if (currentAbaf != accountLabaf) {
            // Read raw balance directly from token storage
            TokenStorage storage ts = tokenStorage();
            uint256 decimals = 10 ** abs_.abafDecimals;
            uint256 factor = (currentAbaf * decimals) / accountLabaf;

            uint256 rawBalance = ts.partitionBalances[partition][account];
            ts.partitionBalances[partition][account] = (rawBalance * factor) / decimals;

            abs_.labafByPartition[account][partition] = currentAbaf;
            abs_.labaf[account] = currentAbaf;

            emit BalanceAdjustmentSynced(account, partition, factor);
        }
    }

    /// @dev Gets ABAF at a specific timestamp (for historical queries)
    function getAbafAt(uint256 timestamp) internal view returns (uint256) {
        ABAFStorage storage abs_ = abafStorage();
        uint256 len = abs_.abafTimestamps.length;
        if (len == 0) return 10 ** abs_.abafDecimals;

        for (uint256 i = len; i > 0; i--) {
            if (abs_.abafTimestamps[i - 1] <= timestamp) {
                return abs_.abafValues[i - 1];
            }
        }
        return 10 ** abs_.abafDecimals;
    }
}
