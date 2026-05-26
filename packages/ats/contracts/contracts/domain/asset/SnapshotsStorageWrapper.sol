// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {
    ISnapshots,
    Snapshots,
    SnapshotsAddress,
    PartitionSnapshots,
    ListOfPartitions,
    HolderBalance
} from "../../facets/layer_1/snapshot/ISnapshots.sol";
import { ISnapshotsTypes } from "../../facets/layer_1/snapshot/ISnapshotsTypes.sol";
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
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { NominalValueStorageWrapper } from "./NominalValueStorageWrapper.sol";

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
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    /// @dev Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
    /// Unique ID for the current snapshot
    CountersUpgradeable.Counter currentSnapshotId;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    /// @dev Snapshots for total balances per account
    mapping(address => Snapshots) accountBalanceSnapshots;
    /// @dev Snapshots for balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
    /// @dev Metadata for partitions associated with each account
    mapping(address => PartitionSnapshots) accountPartitionMetadata;
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
        if (lastSnapshotId(snapshots.ids) >= currentId) return;
        snapshots.ids.push(currentId);
        snapshots.values.push(currentValue);
    }

    /**
     * @notice Records a balance value together with its partition membership under the active
     *         snapshot id.
     * @dev Updates `snapshots` with `currentValueForPartition` and `partitionSnapshots` with
     *      the supplied partition list, each idempotent per snapshot id. Used by per-account
     *      partition flows that must persist both quantity and partition membership.
     * @param snapshots                The numeric snapshot history to update.
     * @param partitionSnapshots       The partition-membership snapshot history to update.
     * @param currentValueForPartition The balance to associate with the active snapshot id.
     * @param partitionIds             The partition identifiers active at snapshot time.
     */
    function updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValueForPartition);
        }
        if (lastSnapshotId(partitionSnapshots.ids) < currentId) {
            partitionSnapshots.ids.push(currentId);
            partitionSnapshots.values.push(ListOfPartitions(partitionIds));
        }
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
     * @notice Records balance, partition balance and partition membership for `account` at the
     *         active snapshot id.
     * @dev Invoked from the `_beforeTokenTransfer` hook (mint, burn, transfer). Skips when no
     *      snapshot has been taken yet or when `account` is the zero address. When the live
     *      ABAF differs from the ABAF pinned at the current snapshot, raw balances are
     *      adjusted back to the snapshot's reference frame before being recorded so historic
     *      reads remain consistent.
     * @param account   The token holder whose balances are being snapshotted.
     * @param partition The partition associated with the balance mutation.
     */
    function updateAccountSnapshot(address account, bytes32 partition) internal {
        uint256 currentSnapshotId = getCurrentSnapshotId();

        if (currentSnapshotId == 0 || account == address(0)) return;

        uint256 abafAtCurrentSnapshot = abafAtSnapshot(currentSnapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (abaf == abafAtCurrentSnapshot) {
            updateAccountSnapshot(
                _snapshotStorage().accountBalanceSnapshots[account],
                ERC20StorageWrapper.balanceOf(account),
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                _snapshotStorage().accountPartitionMetadata[account],
                ERC1410StorageWrapper.balanceOfByPartition(partition, account),
                ERC1410StorageWrapper.partitionsOf(account)
            );
            return;
        }

        uint256 balance = AdjustBalancesStorageWrapper.balanceOfAdjustedAt(
            account,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        uint256 balanceForPartition = AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
            partition,
            account,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        uint256 factor = abaf / abafAtCurrentSnapshot;

        balance /= factor;
        balanceForPartition /= factor;

        updateAccountSnapshot(
            _snapshotStorage().accountBalanceSnapshots[account],
            balance,
            _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
            _snapshotStorage().accountPartitionMetadata[account],
            balanceForPartition,
            ERC1410StorageWrapper.partitionsOf(account)
        );
    }

    /**
     * @notice Records account-level and partition-level balance state under the active
     *         snapshot id in one call.
     * @dev Composes {updateSnapshot} for the aggregate balance with {updateSnapshotPartitions}
     *      for the per-partition balance plus partition list. Overload of
     *      {updateAccountSnapshot} that operates directly on the storage references.
     * @param balanceSnapshots          The account-aggregate balance history to update.
     * @param currentValue              The aggregate balance to associate with the snapshot.
     * @param partitionBalanceSnapshots The per-partition balance history to update.
     * @param partitionSnapshots        The partition-membership history to update.
     * @param currentValueForPartition  The partition balance to associate with the snapshot.
     * @param partitionIds              The partition identifiers active at snapshot time.
     */
    function updateAccountSnapshot(
        Snapshots storage balanceSnapshots,
        uint256 currentValue,
        Snapshots storage partitionBalanceSnapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal {
        updateSnapshot(balanceSnapshots, currentValue);
        updateSnapshotPartitions(partitionBalanceSnapshots, partitionSnapshots, currentValueForPartition, partitionIds);
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
        return
            snapshotted
                ? value
                : AdjustBalancesStorageWrapper.getAbafAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /**
     * @notice Resolves the ERC-20 decimals value that was active at snapshot `snapshotID`.
     * @dev Falls back to the time-travel-adjusted live decimals when no snapshot entry exists.
     * @param snapshotID  The snapshot identifier to resolve.
     * @return decimals_  The decimals precision at the requested snapshot.
     */
    function decimalsAtSnapshot(uint256 snapshotID) internal view returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotID, _snapshotStorage().decimals);
        return
            snapshotted
                ? uint8(value)
                : ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
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
     * @dev Falls back to the live partition list from {ERC1410StorageWrapper} when no
     *      partition-membership entry exists at the requested snapshot.
     * @param snapshotID  The snapshot identifier to resolve.
     * @param tokenHolder The account whose partition membership is queried.
     * @return partitions_ The partition ids active for `tokenHolder` at the snapshot.
     */
    function partitionsOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (bytes32[] memory partitions_) {
        PartitionSnapshots storage partitionSnapshots = _snapshotStorage().accountPartitionMetadata[tokenHolder];

        (bool found, uint256 index) = indexFor(snapshotID, partitionSnapshots.ids);

        if (!found) {
            return ERC1410StorageWrapper.partitionsOf(tokenHolder);
        }

        return partitionSnapshots.values[index].partitions;
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
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(
                    tokenHolder,
                    TimeTravelStorageWrapper.getBlockTimestamp()
                )
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
                LockStorageWrapper.getLockedAmountForAdjustedAt(
                    tokenHolder,
                    TimeTravelStorageWrapper.getBlockTimestamp()
                )
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
                HoldStorageWrapper.getHeldAmountForAdjustedAt(tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp())
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
                ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(
                    tokenHolder,
                    TimeTravelStorageWrapper.getBlockTimestamp()
                )
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
                ClearingReadOps.getClearedAmountForAdjustedAt(tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp())
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
                    TimeTravelStorageWrapper.getBlockTimestamp()
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
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

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
     * @return           Tuple of (found-flag, value).
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
     * @return           Tuple of (found-flag, address-value).
     */
    function addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view returns (bool, address) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : address(0));
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
     * @return           Tuple of (found-flag, array-index).
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
        if (_date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, snapshotTaken_);
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
