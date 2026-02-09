// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";
import "./LibABAF.sol";       // ← EXPLICIT: we depend on ABAF for adjusted balances
import "./LibSnapshots.sol";  // ← EXPLICIT: we update snapshots on transfer

/// @title LibERC1410 — Partitioned token operations (95 lines of logic)
/// @notice Handles token balances, transfers, issuance, and redemption.
///
/// @dev COMPOSITION IN ACTION:
///   This library CALLS LibABAF and LibSnapshots.
///   In the OLD architecture, this creates a circular dependency:
///     ERC1410 → ABAF → ERC1410 (for balance info) → CIRCULAR!
///   With libraries, this is perfectly fine:
///     LibERC1410 calls LibABAF.sync() → compiles!
///     LibABAF calls LibERC1410.rawBalance() → compiles!
///   No inheritance cycle because libraries are stateless call targets.
library LibERC1410 {
    error InsufficientBalance(address account, bytes32 partition, uint256 requested, uint256 available);
    error InvalidReceiver(address receiver);
    event TransferByPartition(bytes32 indexed partition, address indexed from, address indexed to, uint256 value);

    // ─── Raw balance (before ABAF adjustment) ───────────────────────────

    function rawBalanceOfByPartition(bytes32 partition, address account)
        internal view returns (uint256)
    {
        return tokenStorage().partitionBalances[partition][account];
    }

    function rawTotalSupply() internal view returns (uint256) {
        return tokenStorage().totalSupply;
    }

    function rawTotalSupplyByPartition(bytes32 partition) internal view returns (uint256) {
        return tokenStorage().partitionTotalSupply[partition];
    }

    // ─── Adjusted balance (after ABAF) ──────────────────────────────────
    // COMPOSITION: LibERC1410 → LibABAF

    function adjustedBalanceOfByPartition(bytes32 partition, address account)
        internal view returns (uint256)
    {
        uint256 raw = rawBalanceOfByPartition(partition, account);
        uint256 factor = LibABAF.calculateAdjustmentFactor(account, partition);
        uint256 decimals = LibABAF.getDecimals();
        return (raw * factor) / (10 ** decimals);
    }

    function adjustedTotalSupply() internal view returns (uint256) {
        uint256 currentAbaf = LibABAF.getAbaf();
        uint256 decimals = LibABAF.getDecimals();
        return (rawTotalSupply() * currentAbaf) / (10 ** decimals);
    }

    // ─── Transfer (with ABAF sync + snapshot update) ────────────────────
    // COMPOSITION: LibERC1410 → LibABAF + LibSnapshots

    function transferByPartition(
        bytes32 partition, address from, address to, uint256 value
    ) internal {
        if (to == address(0)) revert InvalidReceiver(to);

        // Sync ABAF before transfer — COMPOSITION with LibABAF
        LibABAF.syncBalanceAdjustments(from, partition);
        LibABAF.syncBalanceAdjustments(to, partition);

        TokenStorage storage ts = tokenStorage();
        uint256 fromBalance = ts.partitionBalances[partition][from];
        if (fromBalance < value) {
            revert InsufficientBalance(from, partition, value, fromBalance);
        }

        ts.partitionBalances[partition][from] = fromBalance - value;
        ts.partitionBalances[partition][to] += value;

        // Update snapshots — COMPOSITION with LibSnapshots
        LibSnapshots.updateAccountSnapshot(from, partition);
        LibSnapshots.updateAccountSnapshot(to, partition);

        trackTokenHolder(to);
        emit TransferByPartition(partition, from, to, value);
    }

    function issueByPartition(bytes32 partition, address to, uint256 value) internal {
        TokenStorage storage ts = tokenStorage();
        ts.partitionBalances[partition][to] += value;
        ts.partitionTotalSupply[partition] += value;
        ts.totalSupply += value;
        trackTokenHolder(to);
        LibSnapshots.updateAccountSnapshot(to, partition);
    }

    function redeemByPartition(bytes32 partition, address from, uint256 value) internal {
        LibABAF.syncBalanceAdjustments(from, partition);

        TokenStorage storage ts = tokenStorage();
        uint256 fromBalance = ts.partitionBalances[partition][from];
        if (fromBalance < value) {
            revert InsufficientBalance(from, partition, value, fromBalance);
        }

        ts.partitionBalances[partition][from] -= value;
        ts.partitionTotalSupply[partition] -= value;
        ts.totalSupply -= value;
        LibSnapshots.updateAccountSnapshot(from, partition);
    }

    // ─── Token holder tracking ──────────────────────────────────────────

    function trackTokenHolder(address account) internal {
        TokenStorage storage ts = tokenStorage();
        if (!ts.isTokenHolder[account]) {
            ts.isTokenHolder[account] = true;
            ts.tokenHolderIndex[account] = ts.tokenHolders.length;
            ts.tokenHolders.push(account);
        }
    }

    function getTokenHolders(uint256 start, uint256 limit)
        internal view returns (address[] memory)
    {
        TokenStorage storage ts = tokenStorage();
        uint256 total = ts.tokenHolders.length;
        if (start >= total) return new address[](0);
        uint256 end = start + limit > total ? total : start + limit;
        address[] memory holders = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            holders[i - start] = ts.tokenHolders[i];
        }
        return holders;
    }

    function tokenHolderCount() internal view returns (uint256) {
        return tokenStorage().tokenHolders.length;
    }
}
