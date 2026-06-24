// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import { Snapshots, SnapshotsAddress, SnapshotsBytes32, HolderBalance } from "../../facets/snapshots/ISnapshots.sol";
import { ISnapshotsTypes } from "../../facets/snapshots/ISnapshotsTypes.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { LockStorageWrapper } from "./LockStorageWrapper.sol";
import { HoldStorageWrapper } from "./HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ClearingReadOps } from "../orchestrator/ClearingReadOps.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { NominalValueStorageWrapper } from "./NominalValueStorageWrapper.sol";

import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
/// @custom:hash storage Snapshot
bytes32 constant STORAGE_LOCATION_SNAPSHOT = 0x2e9cb27cc6da952dbadc3ddf8f7c0573a7ed5a7613f07ac9a8da248ab9442000;

/**
 * @notice Central storage layout for all snapshot-related data across the token system.
 * @dev Stores historical snapshots for balances, partitions, locked, held, frozen, cleared,
 *      total supply, adjustment factors, decimals, token holder lists, and token holder counts.
 *      Slot is derived from the ERC-7201 namespace and pinned via the
 *      `STORAGE_LOCATION_SNAPSHOT` constant; only append new fields in the marked zone to
 *      preserve layout stability across upgrades.
 * @custom:storage-location erc7201:security.token.standard.storage.Snapshot
 */
struct SnapshotStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    /**
     * @dev Unique ID of the current snapshot. Ids increase monotonically, with the first value
     *      being 1; an id of 0 is reserved as "no snapshot taken".
     */
    CountersUpgradeable.Counter currentSnapshotId;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    /// @dev Snapshots for total balances per account
    mapping(address => Snapshots) accountBalanceSnapshots;
    /// @dev Snapshots for balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
    /// @dev Per-holder, per-partition-index history of the partition `bytes32` at that index.
    ///      Mirrors the `tokenHoldersSnapshots[index]` pattern so the partition list can be
    ///      reconstructed slot-by-slot in `partitionsOfAtSnapshot` without copying the whole
    ///      array on every mutation.
    mapping(address => mapping(uint256 => SnapshotsBytes32)) accountPartitionsByIndexSnapshots;
    /// @dev Per-holder history of the partition-list length. Pairs with
    ///      `accountPartitionsByIndexSnapshots` to drive the reconstruction reader.
    mapping(address => Snapshots) accountTotalPartitionsSnapshots;
    /// @dev Snapshots for the total supply
    Snapshots totalSupplySnapshots;
    /// @dev Snapshots for locked balances per account
    mapping(address => Snapshots) accountLockedBalanceSnapshots;
    /// @dev Snapshots for locked balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionLockedBalanceSnapshots;
    /// @dev Snapshots for the total supply by partition
    mapping(bytes32 => Snapshots) totalSupplyByPartitionSnapshots;
    /// @dev Snapshots for held balances per account
    mapping(address => Snapshots) accountHeldBalanceSnapshots;
    /// @dev Snapshots for held balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionHeldBalanceSnapshots;
    /// @dev Snapshots for cleared balances per account
    mapping(address => Snapshots) accountClearedBalanceSnapshots;
    /// @dev Snapshots for cleared balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionClearedBalanceSnapshots;
    /// @dev Snapshots for Adjustment Before Adjustment Factor values
    Snapshots abafSnapshots;
    /// @dev Snapshots for decimal precision values
    Snapshots decimals;
    /// @dev Snapshots for frozen balances per account
    mapping(address => Snapshots) accountFrozenBalanceSnapshots;
    /// @dev Snapshots for frozen balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionFrozenBalanceSnapshots;
    /// @dev Snapshots of token holders by snapshot ID
    mapping(uint256 => SnapshotsAddress) tokenHoldersSnapshots;
    /// @dev Snapshots for total number of token holders
    Snapshots totalTokenHoldersSnapshots;
    /// @dev Snapshots for the nominal value
    Snapshots nominalValueSnapshots;
    /// @dev Snapshots for the nominal value decimals
    Snapshots nominalValueDecimalsSnapshots;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title Snapshot storage and retrieval library
 * @notice Provides internal functions to manage snapshot histories for balances, partitions,
 *         locked, held, frozen, and cleared state, as well as total supply and token holder data.
 * @dev All modifications to snapshot state should be performed via this library to ensure
 *      data consistency. The library relies on a single unstrucutred storage slot for the
 *      SnapshotStorage struct. Functions assume the current snapshot ID has been incremented
 *      before use. Reverts from ISnapshots are propagated on invalid snapshot IDs.
 * @author Asset Tokenization Studio Team
 */
library SnapshotsStorageWrapper {
    using ArraysUpgradeable for uint256[];
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /**
     * @notice Increments the global snapshot id and returns the freshly minted identifier.
     * @dev Snapshot ids increase monotonically starting at 1; an id of 0 is reserved as
     *      "no snapshot taken". Callers typically pair this with one or more
     *      `update*Snapshot` calls to record state under the new id.
     * @return snapshotID_ The identifier assigned to the newly opened snapshot.
     */
    function takeSnapshot() internal returns (uint256 snapshotID_) {
        _snapshotStorage().currentSnapshotId.increment();
        return getCurrentSnapshotId();
    }

    /**
     * @notice Records `currentValue` under the active snapshot id if not already recorded.
     * @dev No-ops when the trailing snapshot id already equals the current id, ensuring at
     *      most one entry per snapshot. Storage growth is bounded by the number of distinct
     *      snapshots taken.
     * @param snapshots    The snapshot history to mutate.
     * @param currentValue The value to associate with the active snapshot id.
     */
    function updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    /**
     * @notice Records an address value under the active snapshot id if not already recorded.
     * @dev Mirrors {updateSnapshot} for address-valued series (used by token-holder tracking).
     * @param snapshots    The address-typed snapshot history to mutate.
     * @param currentValue The address to associate with the active snapshot id.
     */
    function updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) >= currentId) return; // solhint-disable-line gas-strict-inequalities
        snapshots.ids.push(currentId);
        snapshots.values.push(currentValue);
    }

    /**
     * @notice Records a `bytes32` value under the active snapshot id if not already recorded.
     * @dev Mirrors {updateSnapshot} for `bytes32`-valued series, used by the per-index partition
     *      snapshot path. Idempotent within a single snapshot id.
     * @param snapshots    The `bytes32`-typed snapshot history to mutate.
     * @param currentValue The value to associate with the active snapshot id.
     */
    function updateSnapshotBytes32(SnapshotsBytes32 storage snapshots, bytes32 currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) >= currentId) return; // solhint-disable-line gas-strict-inequalities
        snapshots.ids.push(currentId);
        snapshots.values.push(currentValue);
    }

    /**
     * @notice Captures the pre-mutation partition id at position `index` for `holder` under the
     *         active snapshot.
     * @dev Must be invoked BEFORE the slot is overwritten or popped so that historical readers
     *      observe the original value. Self-guards via {updateSnapshotBytes32}: a no-op while no
     *      snapshot is active and idempotent within a snapshot. Coupled with
     *      {updateTotalPartitionsSnapshot}, mutations cost O(1) regardless of the partition-list
     *      size — the per-index pattern mirrors {updateTokenHolderSnapshot} for security holders.
     * @param holder Address whose partition slot is being captured.
     * @param index  Zero-based slot of the partition array about to change.
     */
    function updatePartitionAtIndexSnapshot(address holder, uint256 index) internal {
        updateSnapshotBytes32(
            _snapshotStorage().accountPartitionsByIndexSnapshots[holder][index],
            ERC1410StorageWrapper.partitionAt(holder, index)
        );
    }

    /**
     * @notice Captures the pre-mutation length of `holder`'s partition list under the active
     *         snapshot.
     * @dev Must be invoked BEFORE a push or pop on `partitions[holder]`. Pairs with
     *      {updatePartitionAtIndexSnapshot} so {partitionsOfAtSnapshot} can both bound its
     *      reconstruction loop and tell apart slots that existed at snapshot time from slots that
     *      did not. Self-guards via {updateSnapshot}, mirroring {updateTotalTokenHolderSnapshot}.
     * @param holder Address whose partition-list length is being captured.
     */
    function updateTotalPartitionsSnapshot(address holder) internal {
        updateSnapshot(
            _snapshotStorage().accountTotalPartitionsSnapshots[holder],
            ERC1410StorageWrapper.partitionsLength(holder)
        );
    }

    /**
     * @notice Pins the current adjust-balance-adjustment-factor (ABAF) under the active
     *         snapshot id.
     * @dev Pulls the latest ABAF from {AdjustBalancesStorageWrapper} and records it so historic
     *      reads can reconstruct adjusted balances at the snapshot.
     */
    function updateAbafSnapshot() internal {
        updateSnapshot(_snapshotStorage().abafSnapshots, AdjustBalancesStorageWrapper.getAbaf());
    }

    /**
     * @notice Pins the current ERC-20 decimals value under the active snapshot id.
     * @dev Required because decimals may shift due to adjustments; historic readers need the
     *      decimals that were active when the snapshot was taken.
     */
    function updateDecimalsSnapshot() internal {
        updateSnapshot(_snapshotStorage().decimals, ERC20StorageWrapper.decimals());
    }

    /**
     * @notice Pins the current ERC-20 total supply under the active snapshot id.
     * @dev Source of truth for whole-token totals at historic snapshot points.
     */
    function updateAssetTotalSupplySnapshot() internal {
        updateSnapshot(_snapshotStorage().totalSupplySnapshots, ERC20StorageWrapper.totalSupply());
    }

    /**
     * @notice Pins the current nominal value under the active snapshot id.
     * @dev Used by downstream calculations that need the nominal value as it stood at the
     *      snapshot (e.g. coupon and dividend computations).
     */
    function updateNominalValueSnapshot() internal {
        updateSnapshot(_snapshotStorage().nominalValueSnapshots, NominalValueStorageWrapper.getNominalValue());
    }

    /**
     * @notice Pins the current nominal-value decimals under the active snapshot id.
     * @dev Captures the precision that was active for nominal value at the snapshot time.
     */
    function updateNominalValueDecimalsSnapshot() internal {
        updateSnapshot(
            _snapshotStorage().nominalValueDecimalsSnapshots,
            NominalValueStorageWrapper.getNominalValueDecimals()
        );
    }

    /**
     * @notice Captures total and partition balances for an account into the active snapshot.
     * @dev Invoked from the `_beforeTokenTransfer` hook so that mint, burn and transfer operations
     *      preserve pre-mutation balances against the current snapshot id. Short-circuits when no
     *      snapshot is active (`currentSnapshotId == 0`) or when `account` is the zero address.
     *      When the ABAF has drifted since the active snapshot was opened, the recorded values
     *      are back-scaled by `abaf / abafAtSnapshot` so the snapshot stays consistent with the
     *      adjustment factor in force at snapshot time. Does NOT touch the holder's partition
     *      list — that is captured per-index by {updatePartitionAtIndexSnapshot} and
     *      {updateTotalPartitionsSnapshot} at the partition add/remove sites, keeping the
     *      per-transfer hot path free of the O(N) list copy and the partition mutation sites at
     *      O(1) regardless of the holder's partition count.
     * @param account   Token holder whose balances are being snapshotted.
     * @param partition Partition whose balance, along with the account total, is recorded.
     */
    function updateAccountSnapshot(address account, bytes32 partition) internal {
        uint256 currentSnapshotId = getCurrentSnapshotId();

        if (currentSnapshotId == 0 || account == address(0)) return;

        uint256 abafAtCurrentSnapshot = abafAtSnapshot(currentSnapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(EvmAccessors.getBlockTimestamp());

        if (abaf == abafAtCurrentSnapshot) {
            updateAccountSnapshot(
                _snapshotStorage().accountBalanceSnapshots[account],
                ERC20StorageWrapper.balanceOf(account),
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                ERC1410StorageWrapper.balanceOfByPartition(partition, account)
            );
            return;
        }

        uint256 balance = AdjustBalancesStorageWrapper.balanceOfAdjustedAt(account, EvmAccessors.getBlockTimestamp());
        uint256 balanceForPartition = AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
            partition,
            account,
            EvmAccessors.getBlockTimestamp()
        );
        uint256 factor = abaf / abafAtCurrentSnapshot;

        balance /= factor;
        balanceForPartition /= factor;

        updateAccountSnapshot(
            _snapshotStorage().accountBalanceSnapshots[account],
            balance,
            _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
            balanceForPartition
        );
    }

    /**
     * @notice Persists both total and partition balances into the active snapshot for an account.
     * @dev Internal overload used by `updateAccountSnapshot(address,bytes32)` once the values to
     *      record have been resolved (either directly from current state or back-scaled via the
     *      ABAF factor). Each `Snapshots` slot is only written when its last recorded id is older
     *      than the current snapshot, so repeated calls within the same snapshot are idempotent.
     *      Does NOT touch the partition list metadata; that lives behind
     *      {updatePartitionAtIndexSnapshot} and {updateTotalPartitionsSnapshot} and is only
     *      captured at partition add/remove sites.
     * @param balanceSnapshots            Storage handle for the account's total balance history.
     * @param currentValue                Total balance to record for the current snapshot id.
     * @param partitionBalanceSnapshots   Storage handle for the account+partition balance history.
     * @param currentValueForPartition    Partition balance to record for the current snapshot id.
     */
    function updateAccountSnapshot(
        Snapshots storage balanceSnapshots,
        uint256 currentValue,
        Snapshots storage partitionBalanceSnapshots,
        uint256 currentValueForPartition
    ) internal {
        updateSnapshot(balanceSnapshots, currentValue);
        updateSnapshot(partitionBalanceSnapshots, currentValueForPartition);
    }

    /**
     * @notice Records the locked-balance state for `account` at account and partition level.
     * @dev Pulls live locked amounts from {LockStorageWrapper} and pins them under the active
     *      snapshot id.
     * @param account   The token holder whose locked balances are being snapshotted.
     * @param partition The partition whose locked balance is being snapshotted.
     */
    function updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage $ = _snapshotStorage();
        updateSnapshot($.accountLockedBalanceSnapshots[account], LockStorageWrapper.getLockedAmountFor(account));
        updateSnapshot(
            $.accountPartitionLockedBalanceSnapshots[account][partition],
            LockStorageWrapper.getLockedAmountForByPartition(partition, account)
        );
    }

    /**
     * @notice Records the held-balance state for `account` at account and partition level.
     * @dev Pulls live held amounts from {HoldStorageWrapper} and pins them under the active
     *      snapshot id.
     * @param account   The token holder whose held balances are being snapshotted.
     * @param partition The partition whose held balance is being snapshotted.
     */
    function updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage $ = _snapshotStorage();
        updateSnapshot($.accountHeldBalanceSnapshots[account], HoldStorageWrapper.getHeldAmountFor(account));
        updateSnapshot(
            $.accountPartitionHeldBalanceSnapshots[account][partition],
            HoldStorageWrapper.getHeldAmountForByPartition(partition, account)
        );
    }

    /**
     * @notice Records the frozen-balance state for `account` at account and partition level.
     * @dev Pulls live frozen amounts from {ERC3643StorageWrapper} and pins them under the
     *      active snapshot id.
     * @param account   The token holder whose frozen balances are being snapshotted.
     * @param partition The partition whose frozen balance is being snapshotted.
     */
    function updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage $ = _snapshotStorage();
        updateSnapshot($.accountFrozenBalanceSnapshots[account], ERC3643StorageWrapper.getFrozenAmountFor(account));
        updateSnapshot(
            $.accountPartitionFrozenBalanceSnapshots[account][partition],
            ERC3643StorageWrapper.getFrozenAmountForByPartition(partition, account)
        );
    }

    /**
     * @notice Records the cleared-balance state for `account` at account and partition level.
     * @dev Pulls live cleared amounts from {ClearingStorageWrapper} and pins them under the
     *      active snapshot id.
     * @param account   The token holder whose cleared balances are being snapshotted.
     * @param partition The partition whose cleared balance is being snapshotted.
     */
    function updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage $ = _snapshotStorage();
        updateSnapshot($.accountClearedBalanceSnapshots[account], ClearingStorageWrapper.getClearedAmountFor(account));
        updateSnapshot(
            $.accountPartitionClearedBalanceSnapshots[account][partition],
            ClearingStorageWrapper.getClearedAmountForByPartition(partition, account)
        );
    }

    /**
     * @notice Records the total supply and the partition's total supply under the active
     *         snapshot id.
     * @dev Pulls aggregate totals from {ERC20StorageWrapper} and per-partition totals from
     *      {ERC1410StorageWrapper}.
     * @param partition The partition whose total supply is being snapshotted.
     */
    function updateTotalSupplySnapshot(bytes32 partition) internal {
        SnapshotStorage storage $ = _snapshotStorage();
        updateSnapshot($.totalSupplySnapshots, ERC20StorageWrapper.totalSupply());
        updateSnapshot(
            $.totalSupplyByPartitionSnapshots[partition],
            ERC1410StorageWrapper.totalSupplyByPartition(partition)
        );
    }

    /**
     * @notice Records `account` against its current token-holder index under the active
     *         snapshot id.
     * @dev Drives historic membership reads of the token-holder list.
     * @param account The token holder being snapshotted.
     */
    function updateTokenHolderSnapshot(address account) internal {
        updateSnapshotAddress(
            _snapshotStorage().tokenHoldersSnapshots[ERC1410StorageWrapper.getTokenHolderIndex(account)],
            account
        );
    }

    /**
     * @notice Records the total number of token holders under the active snapshot id.
     * @dev Pairs with {updateTokenHolderSnapshot} for paginated historic reads.
     */
    function updateTotalTokenHolderSnapshot() internal {
        updateSnapshot(_snapshotStorage().totalTokenHoldersSnapshots, ERC1410StorageWrapper.getTotalTokenHolders());
    }

    /**
     * @notice Resolves the ABAF value that was active when snapshot `snapshotID` was taken.
     * @dev Falls back to the time-travel-aware live ABAF when no snapshot entry exists at the
     *      requested id.
     * @param snapshotID The snapshot identifier to resolve.
     * @return abaf_     The ABAF value at the requested snapshot.
     */
    function abafAtSnapshot(uint256 snapshotID) internal view returns (uint256 abaf_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotID, _snapshotStorage().abafSnapshots);
        return snapshotted ? value : AdjustBalancesStorageWrapper.getAbafAdjustedAt(EvmAccessors.getBlockTimestamp());
    }

    /**
     * @notice Resolves the ERC-20 decimals value that was active at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-adjusted live decimals when no snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @return decimals_  The decimals precision at the requested snapshot.
     */
    function decimalsAtSnapshot(uint256 snapshotID) internal view returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotID, _snapshotStorage().decimals);
        return snapshotted ? uint8(value) : ERC20StorageWrapper.decimalsAdjustedAt(EvmAccessors.getBlockTimestamp());
    }

    /**
     * @notice Returns the aggregate balance held by `tokenHolder` at snapshot `snapshotID`.
     * @dev Thin alias around {balanceOfAt} that adopts the snapshot-first parameter ordering
     *      used by ISnapshots-facing facets.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose balance is queried.
     * @return balance_   The aggregate balance at the requested snapshot.
     */
    function balanceOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (uint256 balance_) {
        return balanceOfAt(tokenHolder, snapshotID);
    }

    /**
     * @notice Returns a paginated list of holder/balance pairs at snapshot `snapshotID`.
     * @dev Iterates the token-holder list at the snapshot and reads each holder's balance via
     *      {balanceOfAtSnapshot}. Page bounds follow {Pagination} semantics; out-of-range
     *      pages yield an empty array.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param pageIndex   Zero-based page index.
     * @param pageLength  Maximum number of entries per page.
     * @return balances_  The holder/balance pairs in the requested page.
     */
    function balancesOfAtSnapshot(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (HolderBalance[] memory balances_) {
        address[] memory tokenHolders = tokenHoldersAt(snapshotID, pageIndex, pageLength);
        uint256 length = tokenHolders.length;
        balances_ = new HolderBalance[](length);
        for (uint256 i; i < length; ) {
            address tokenHolder = tokenHolders[i];
            balances_[i] = HolderBalance({
                holder: tokenHolder,
                balance: balanceOfAtSnapshot(snapshotID, tokenHolder)
            });
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the sum of free, cleared, held, locked and frozen balance for
     *         `tokenHolder` at `snapshotId`.
     * @dev Wrapped in `unchecked` since each component is independently bounded by the token
     *      supply and their sum cannot exceed `2^256 - 1` on any realistic deployment.
     * @param snapshotId  The snapshot identifier to resolve.
     * @param tokenHolder The account whose total balance is queried.
     * @return            The combined balance across all balance states.
     */
    function getTotalBalanceOfAtSnapshot(uint256 snapshotId, address tokenHolder) internal view returns (uint256) {
        unchecked {
            return
                balanceOfAtSnapshot(snapshotId, tokenHolder) +
                clearedBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                heldBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                lockedBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                frozenBalanceOfAtSnapshot(snapshotId, tokenHolder);
        }
    }

    /**
     * @notice Returns the partition balance of `tokenHolder` in `partition` at snapshot
     *         `snapshotID`.
     * @dev Thin alias around {balanceOfAtByPartition} that adopts the snapshot-first parameter
     *      ordering used by ISnapshots-facing facets.
     * @param partition   The partition to query.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition balance is queried.
     * @return balance_   The partition balance at the requested snapshot.
     */
    function balanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return balanceOfAtByPartition(partition, tokenHolder, snapshotID);
    }

    /**
     * @notice Returns the partition ids that `tokenHolder` held at snapshot `snapshotID`.
     * @dev Reconstructs the list slot-by-slot from the per-index snapshot history. Reads the
     *      historical length from `accountTotalPartitionsSnapshots` (falling back to the live
     *      length when no length capture exists), then for each index queries
     *      `accountPartitionsByIndexSnapshots`, falling back to the live partition slot when no
     *      capture exists — slots that did not change since the snapshot still hold their
     *      original value in `partitions[holder]`. The whole reader is `view`, so the O(N)
     *      reconstruction cost is paid by the caller, never by an on-chain mutation.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition membership is queried.
     * @return partitions_ The partition ids active for `tokenHolder` at the snapshot.
     */
    function partitionsOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (bytes32[] memory partitions_) {
        (bool foundTotal, uint256 snapshottedTotal) = valueAt(
            snapshotID,
            _snapshotStorage().accountTotalPartitionsSnapshots[tokenHolder]
        );
        uint256 total = foundTotal ? snapshottedTotal : ERC1410StorageWrapper.partitionsLength(tokenHolder);

        partitions_ = new bytes32[](total);
        for (uint256 i; i < total; ) {
            (bool foundSlot, bytes32 slotValue) = bytes32ValueAt(
                snapshotID,
                _snapshotStorage().accountPartitionsByIndexSnapshots[tokenHolder][i]
            );
            partitions_[i] = foundSlot ? slotValue : ERC1410StorageWrapper.partitionAt(tokenHolder, i);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the aggregate total supply at snapshot `snapshotID`.
     * @dev Snapshot-first alias around {totalSupplyAt}.
     * @param snapshotID    The snapshot identifier to resolve.
     * @return totalSupply_ The aggregate total supply at the requested snapshot.
     */
    function totalSupplyAtSnapshot(uint256 snapshotID) internal view returns (uint256 totalSupply_) {
        return totalSupplyAt(snapshotID);
    }

    /**
     * @notice Returns the aggregate balance of `tokenHolder` at snapshot `snapshotId`.
     * @dev Delegates to {balanceOfAtAdjusted}; the fallback path supplies the live ABAF-
     *      adjusted balance so callers see consistent values whether or not a snapshot
     *      entry exists at the requested id.
     * @param tokenHolder The account whose balance is queried.
     * @param snapshotId  The snapshot identifier to resolve.
     * @return            The aggregate balance at the requested snapshot.
     */
    function balanceOfAt(address tokenHolder, uint256 snapshotId) internal view returns (uint256) {
        return
            balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountBalanceSnapshots[tokenHolder],
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(tokenHolder, EvmAccessors.getBlockTimestamp())
            );
    }

    /**
     * @notice Returns a paginated slice of token holders captured at snapshot `snapshotId`.
     * @dev For each index in the page, the snapshot-stored holder is preferred; if missing the
     *      live holder list from {ERC1410StorageWrapper} is used. Page bounds follow
     *      {Pagination} semantics — holder indexing is 1-based to match
     *      {ERC1410StorageWrapper.getTokenHolderIndex}.
     * @param snapshotId  The snapshot identifier to resolve.
     * @param pageIndex   Zero-based page index.
     * @param pageLength  Maximum number of entries per page.
     * @return tk         Array of token-holder addresses for the requested page.
     */
    function tokenHoldersAt(
        uint256 snapshotId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory tk) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);
        uint256 length = Pagination.getSize(start, end, totalTokenHoldersAt(snapshotId));
        tk = new address[](length);
        for (uint256 i; i < length; ) {
            uint256 index = start + i + 1;
            (bool snapshotted, address value) = addressValueAt(
                snapshotId,
                _snapshotStorage().tokenHoldersSnapshots[index]
            );

            tk[i] = snapshotted ? value : ERC1410StorageWrapper.getTokenHolder(index);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the number of token holders captured at snapshot `snapshotId`.
     * @dev Falls back to the live total-holder count from {ERC1410StorageWrapper} when no
     *      snapshot entry exists.
     * @param snapshotId  The snapshot identifier to resolve.
     * @return            The token-holder count at the requested snapshot.
     */
    function totalTokenHoldersAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, _snapshotStorage().totalTokenHoldersSnapshots);
        return snapshotted ? value : ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Returns the balance of `account` in `partition` at snapshot `snapshotId`.
     * @dev Delegates to {balanceOfAtAdjusted}; the fallback path uses the time-travel-aware
     *      partition balance so callers always observe a consistent value.
     * @param partition   The partition to query.
     * @param account     The token holder whose partition balance is queried.
     * @param snapshotId  The snapshot identifier to resolve.
     * @return            The partition balance at the requested snapshot.
     */
    function balanceOfAtByPartition(
        bytes32 partition,
        address account,
        uint256 snapshotId
    ) internal view returns (uint256) {
        return
            balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
                    partition,
                    account,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Returns the total supply of `partition` at snapshot `snapshotID`.
     * @dev Delegates to {balanceOfAtAdjusted} reusing its ABAF-aware fallback semantics — the
     *      "balance" being adjusted here is the partition's total supply, not an individual
     *      account balance.
     * @param partition     The partition to query.
     * @param snapshotID    The snapshot identifier to resolve.
     * @return totalSupply_ The partition total supply at the requested snapshot.
     */
    function totalSupplyAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID
    ) internal view returns (uint256 totalSupply_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().totalSupplyByPartitionSnapshots[partition],
                AdjustBalancesStorageWrapper.totalSupplyByPartitionAdjustedAt(
                    partition,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Returns the locked balance of `tokenHolder` at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-aware locked balance when no snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose locked balance is queried.
     * @return balance_   The locked balance at the requested snapshot.
     */
    function lockedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountLockedBalanceSnapshots[tokenHolder],
                LockStorageWrapper.getLockedAmountForAdjustedAt(tokenHolder, EvmAccessors.getBlockTimestamp())
            );
    }

    /**
     * @notice Returns the locked balance of `tokenHolder` in `partition` at snapshot
     *         `snapshotID`.
     * @dev Falls back to the time-travel-aware partition locked balance when no snapshot entry
     *      exists.
     * @param partition   The partition to query.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition locked balance is queried.
     * @return balance_   The partition locked balance at the requested snapshot.
     */
    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionLockedBalanceSnapshots[tokenHolder][partition],
                LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(
                    partition,
                    tokenHolder,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Returns the held balance of `tokenHolder` at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-aware held balance when no snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose held balance is queried.
     * @return balance_   The held balance at the requested snapshot.
     */
    function heldBalanceOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountHeldBalanceSnapshots[tokenHolder],
                HoldStorageWrapper.getHeldAmountForAdjustedAt(tokenHolder, EvmAccessors.getBlockTimestamp())
            );
    }

    /**
     * @notice Returns the held balance of `tokenHolder` in `partition` at snapshot
     *         `snapshotID`.
     * @dev Falls back to the time-travel-aware partition held balance when no snapshot entry
     *      exists.
     * @param partition   The partition to query.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition held balance is queried.
     * @return balance_   The partition held balance at the requested snapshot.
     */
    function heldBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionHeldBalanceSnapshots[tokenHolder][partition],
                HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(
                    partition,
                    tokenHolder,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Returns the frozen balance of `tokenHolder` at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-aware frozen balance from {ERC3643StorageWrapper}
     *      when no snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose frozen balance is queried.
     * @return balance_   The frozen balance at the requested snapshot.
     */
    function frozenBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountFrozenBalanceSnapshots[tokenHolder],
                ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(tokenHolder, EvmAccessors.getBlockTimestamp())
            );
    }

    /**
     * @notice Returns the frozen balance of `tokenHolder` in `partition` at snapshot
     *         `snapshotID`.
     * @dev Falls back to the time-travel-aware partition frozen balance from
     *      {ERC3643StorageWrapper} when no snapshot entry exists.
     * @param partition   The partition to query.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition frozen balance is queried.
     * @return balance_   The partition frozen balance at the requested snapshot.
     */
    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionFrozenBalanceSnapshots[tokenHolder][partition],
                ERC3643StorageWrapper.getFrozenAmountForByPartitionAdjustedAt(
                    partition,
                    tokenHolder,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Returns the cleared balance of `tokenHolder` at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-aware cleared balance from {ClearingReadOps} when no
     *      snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose cleared balance is queried.
     * @return balance_   The cleared balance at the requested snapshot.
     */
    function clearedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountClearedBalanceSnapshots[tokenHolder],
                ClearingReadOps.getClearedAmountForAdjustedAt(tokenHolder, EvmAccessors.getBlockTimestamp())
            );
    }

    /**
     * @notice Returns the cleared balance of `tokenHolder` in `partition` at snapshot
     *         `snapshotID`.
     * @dev Falls back to the time-travel-aware partition cleared balance from
     *      {ClearingReadOps} when no snapshot entry exists.
     * @param partition   The partition to query.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition cleared balance is queried.
     * @return balance_   The partition cleared balance at the requested snapshot.
     */
    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionClearedBalanceSnapshots[tokenHolder][partition],
                ClearingReadOps.getClearedAmountForByPartitionAdjustedAt(
                    partition,
                    tokenHolder,
                    EvmAccessors.getBlockTimestamp()
                )
            );
    }

    /**
     * @notice Resolves a balance at `snapshotId`, preferring the recorded value and falling
     *         back to an ABAF-rescaled live value.
     * @dev When `snapshots` has no entry at `snapshotId`, the live `currentBalanceAdjusted`
     *      is rescaled back from the live ABAF to the ABAF that was active at the snapshot.
     *      Used as the canonical reader by aggregate, partition, locked, held, frozen, and
     *      cleared balance views, so they all share the same fallback semantics.
     * @param snapshotId             The snapshot identifier to resolve.
     * @param snapshots              The snapshot history to consult first.
     * @param currentBalanceAdjusted The live, time-travel-adjusted balance used as fallback.
     * @return                       The balance at the requested snapshot.
     */
    function balanceOfAtAdjusted(
        uint256 snapshotId,
        Snapshots storage snapshots,
        uint256 currentBalanceAdjusted
    ) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnapshot_ = abafAtSnapshot(snapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(EvmAccessors.getBlockTimestamp());

        if (abafAtSnapshot_ == abaf) return currentBalanceAdjusted;

        return currentBalanceAdjusted / (abaf / abafAtSnapshot_);
    }

    /**
     * @notice Returns the aggregate ERC-20 total supply at snapshot `snapshotId`.
     * @dev Falls back to the live total supply when no snapshot entry exists.
     * @param snapshotId The snapshot identifier to resolve.
     * @return           The aggregate total supply at the requested snapshot.
     */
    function totalSupplyAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, _snapshotStorage().totalSupplySnapshots);
        return snapshotted ? value : ERC20StorageWrapper.totalSupply();
    }

    /**
     * @notice Returns the nominal value at snapshot `snapshotId`.
     * @dev Falls back to the live nominal value when no snapshot entry exists.
     * @param snapshotId The snapshot identifier to resolve.
     * @return           The nominal value at the requested snapshot.
     */
    function nominalValueAtSnapshot(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, _snapshotStorage().nominalValueSnapshots);
        return snapshotted ? value : NominalValueStorageWrapper.getNominalValue();
    }

    /**
     * @notice Returns the nominal-value decimals at snapshot `snapshotId`.
     * @dev Falls back to the live nominal-value decimals when no snapshot entry exists.
     * @param snapshotId The snapshot identifier to resolve.
     * @return           The nominal-value decimals at the requested snapshot.
     */
    function nominalValueDecimalsAtSnapshot(uint256 snapshotId) internal view returns (uint8) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, _snapshotStorage().nominalValueDecimalsSnapshots);
        return snapshotted ? uint8(value) : NominalValueStorageWrapper.getNominalValueDecimals();
    }

    /**
     * @notice Returns the most recently taken snapshot id.
     * @dev Returns `0` when no snapshot has ever been taken.
     * @return The current snapshot identifier.
     */
    function getCurrentSnapshotId() internal view returns (uint256) {
        return _snapshotStorage().currentSnapshotId.current();
    }

    /**
     * @notice Reads the recorded uint256 value of `snapshots` at `snapshotId`.
     * @dev Returns `(true, value)` when a record exists, or `(false, 0)` when the id falls
     *      before any recorded entry. Reverts via {indexFor} for invalid ids.
     * @param snapshotId The snapshot identifier to resolve.
     * @param snapshots  The numeric snapshot history to read.
     * @return           True if a record exists for the given snapshot id, false otherwise.
     * @return           The recorded uint256 value, or 0 if no record exists.
     */
    function valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view returns (bool, uint256) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : 0);
    }

    /**
     * @notice Reads the recorded address value of `snapshots` at `snapshotId`.
     * @dev Returns `(true, value)` when a record exists, or `(false, address(0))` otherwise.
     *      Reverts via {indexFor} for invalid ids.
     * @param snapshotId The snapshot identifier to resolve.
     * @param snapshots  The address-typed snapshot history to read.
     * @return           True if a record exists for the given snapshot id, false otherwise.
     * @return           The recorded address value, or address(0) if no record exists.
     */
    function addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view returns (bool, address) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : address(0));
    }

    /**
     * @notice Reads the recorded `bytes32` value of `snapshots` at `snapshotId`.
     * @dev Returns `(true, value)` when a record exists, or `(false, bytes32(0))` otherwise.
     *      Reverts via {indexFor} for invalid ids.
     * @param snapshotId The snapshot identifier to resolve.
     * @param snapshots  The `bytes32`-typed snapshot history to read.
     * @return           True if a record exists for the given snapshot id, false otherwise.
     * @return           The recorded bytes32 value, or bytes32(0) if no record exists.
     */
    function bytes32ValueAt(
        uint256 snapshotId,
        SnapshotsBytes32 storage snapshots
    ) internal view returns (bool, bytes32) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : bytes32(0));
    }

    /**
     * @notice Resolves the array index that holds the value for `snapshotId` inside `ids`.
     * @dev Performs an `ArraysUpgradeable.findUpperBound` lookup. Returns `(false, 0)` when
     *      the upper bound is past the end of the array, signalling that the snapshot
     *      pre-dates the first recorded entry. Reverts with `SnapshotIdNull` when
     *      `snapshotId == 0` and with `SnapshotIdDoesNotExists` when `snapshotId` is greater
     *      than the most recent snapshot.
     * @param snapshotId The snapshot identifier to resolve.
     * @param ids        The ascending list of recorded snapshot ids.
     * @return           True if the snapshot id is found in the list, false otherwise.
     * @return           The array index holding the value for the snapshot id, or 0 if not found.
     */
    function indexFor(uint256 snapshotId, uint256[] storage ids) internal view returns (bool, uint256) {
        if (snapshotId == 0) {
            revert ISnapshotsTypes.SnapshotIdNull();
        }
        if (snapshotId > getCurrentSnapshotId()) {
            revert ISnapshotsTypes.SnapshotIdDoesNotExists(snapshotId);
        }

        uint256 index = ids.findUpperBound(snapshotId);

        if (index == ids.length) {
            return (false, 0);
        } else {
            return (true, index);
        }
    }

    /**
     * @notice Returns the trailing entry of an ascending snapshot-id list, or `0` when empty.
     * @dev Used by the `update*Snapshot` family to enforce one entry per snapshot id.
     * @param ids The ascending list of recorded snapshot ids.
     * @return    The last recorded id, or `0` if the list is empty.
     */
    function lastSnapshotId(uint256[] storage ids) internal view returns (uint256) {
        return (ids.length == 0) ? 0 : ids[ids.length - 1];
    }

    /**
     * @notice Returns the total balance and decimals for `_account` as observed at `_date`,
     *         preferring snapshot data when `_snapshotId` is non-zero.
     * @dev When `_date` is in the future the function returns the default tuple with
     *      `snapshotTaken_ == false`. Otherwise it sets `snapshotTaken_ = true` and reads
     *      either the snapshot or the time-travel-adjusted live values depending on
     *      `_snapshotId`.
     * @param _date          The reference timestamp to evaluate.
     * @param _snapshotId    Optional snapshot identifier; `0` selects the live time-travel
     *                       path.
     * @param _account       The token holder whose balance is queried.
     * @return balance_      The total balance observed for `_account`.
     * @return decimals_     The decimals observed at the same point.
     * @return snapshotTaken_ True when `_date` is in the past and the lookup proceeded.
     */
    function getSnapshotTakenBalance(
        uint256 _date,
        uint256 _snapshotId,
        address _account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool snapshotTaken_) {
        if (_date >= EvmAccessors.getBlockTimestamp()) return (balance_, decimals_, snapshotTaken_);
        snapshotTaken_ = true;

        balance_ = (_snapshotId != 0)
            ? getTotalBalanceOfAtSnapshot(_snapshotId, _account)
            : TokenCoreOps.getTotalBalanceForAdjustedAt(_account, _date);

        decimals_ = (_snapshotId != 0)
            ? decimalsAtSnapshot(_snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(_date);
    }

    /**
     * @notice Returns the {SnapshotStorage} struct pinned at the ERC-7201 namespace slot.
     * @dev Uses inline assembly to load the storage pointer at the deterministic slot held by
     *      `STORAGE_LOCATION_SNAPSHOT`, ensuring layout stability across diamond facet
     *      upgrades.
     * @return snapshotStorage_ Storage pointer to the snapshot namespace.
     */
    function _snapshotStorage() private pure returns (SnapshotStorage storage snapshotStorage_) {
        bytes32 position = STORAGE_LOCATION_SNAPSHOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotStorage_.slot := position
        }
    }
}
