// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import { _SNAPSHOT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    ISnapshotsStorageWrapper,
    Snapshots,
    SnapshotsAddress,
    PartitionSnapshots,
    ListOfPartitions,
    HolderBalance
} from "../../facets/layer_1/snapshot/ISnapshots.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { LockStorageWrapper } from "./LockStorageWrapper.sol";
import { HoldStorageWrapper } from "./HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ClearingReadOps } from "../orchestrator/ClearingReadOps.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";

struct SnapshotStorage {
    /// @dev Snapshots for total balances per account
    mapping(address => Snapshots) accountBalanceSnapshots;
    /// @dev Snapshots for balances per account and partition
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
    /// @dev Metadata for partitions associated with each account
    mapping(address => PartitionSnapshots) accountPartitionMetadata;
    /// @dev Snapshots for the total supply
    Snapshots totalSupplySnapshots;
    /// @dev Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
    /// Unique ID for the current snapshot
    CountersUpgradeable.Counter currentSnapshotId;
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
}

library SnapshotsStorageWrapper {
    using ArraysUpgradeable for uint256[];
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // --- Snapshot Creation and Update (state-changing functions) ---

    function takeSnapshot() internal returns (uint256 snapshotID_) {
        snapshotStorage().currentSnapshotId.increment();
        return getCurrentSnapshotId();
    }

    function updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    function updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

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
            ListOfPartitions memory listOfPartitions = ListOfPartitions(partitionIds);
            partitionSnapshots.values.push(listOfPartitions);
        }
    }

    // --- Snapshot Updates for Balance Types ---

    function updateAbafSnapshot() internal {
        updateSnapshot(snapshotStorage().abafSnapshots, AdjustBalancesStorageWrapper.getAbaf());
    }

    function updateDecimalsSnapshot() internal {
        updateSnapshot(snapshotStorage().decimals, ERC20StorageWrapper.decimals());
    }

    function updateAssetTotalSupplySnapshot() internal {
        updateSnapshot(snapshotStorage().totalSupplySnapshots, ERC20StorageWrapper.totalSupply());
    }

    /**
     * @dev Update balance and/or total supply snapshots before the values are modified. This is implemented
     * in the _beforeTokenTransfer hook, which is executed for _mint, _burn, and _transfer operations.
     */
    function updateAccountSnapshot(address account, bytes32 partition) internal {
        uint256 currentSnapshotId = getCurrentSnapshotId();

        if (currentSnapshotId == 0) return;

        uint256 abafAtCurrentSnapshot = abafAtSnapshot(currentSnapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(block.timestamp);

        if (abaf == abafAtCurrentSnapshot) {
            updateAccountSnapshot(
                snapshotStorage().accountBalanceSnapshots[account],
                ERC20StorageWrapper.balanceOf(account),
                snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                snapshotStorage().accountPartitionMetadata[account],
                ERC1410StorageWrapper.balanceOfByPartition(partition, account),
                ERC1410StorageWrapper.partitionsOf(account)
            );
            return;
        }

        uint256 balance = AdjustBalancesStorageWrapper.balanceOfAdjustedAt(account, block.timestamp);
        uint256 balanceForPartition = AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
            partition,
            account,
            block.timestamp
        );
        uint256 factor = abaf / abafAtCurrentSnapshot;

        balance /= factor;
        balanceForPartition /= factor;

        updateAccountSnapshot(
            snapshotStorage().accountBalanceSnapshots[account],
            balance,
            snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
            snapshotStorage().accountPartitionMetadata[account],
            balanceForPartition,
            ERC1410StorageWrapper.partitionsOf(account)
        );
    }

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

    function updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal {
        updateSnapshot(
            snapshotStorage().accountLockedBalanceSnapshots[account],
            LockStorageWrapper.getLockedAmountFor(account)
        );
        updateSnapshot(
            snapshotStorage().accountPartitionLockedBalanceSnapshots[account][partition],
            LockStorageWrapper.getLockedAmountForByPartition(partition, account)
        );
    }

    function updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal {
        updateSnapshot(
            snapshotStorage().accountHeldBalanceSnapshots[account],
            HoldStorageWrapper.getHeldAmountFor(account)
        );
        updateSnapshot(
            snapshotStorage().accountPartitionHeldBalanceSnapshots[account][partition],
            HoldStorageWrapper.getHeldAmountForByPartition(partition, account)
        );
    }

    function updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal {
        updateSnapshot(
            snapshotStorage().accountFrozenBalanceSnapshots[account],
            ERC3643StorageWrapper.getFrozenAmountFor(account)
        );
        updateSnapshot(
            snapshotStorage().accountPartitionFrozenBalanceSnapshots[account][partition],
            ERC3643StorageWrapper.getFrozenAmountForByPartition(partition, account)
        );
    }

    function updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal {
        updateSnapshot(
            snapshotStorage().accountClearedBalanceSnapshots[account],
            ClearingStorageWrapper.getClearedAmountFor(account)
        );
        updateSnapshot(
            snapshotStorage().accountPartitionClearedBalanceSnapshots[account][partition],
            ClearingStorageWrapper.getClearedAmountForByPartition(partition, account)
        );
    }

    function updateTotalSupplySnapshot(bytes32 partition) internal {
        updateSnapshot(snapshotStorage().totalSupplySnapshots, ERC20StorageWrapper.totalSupply());
        updateSnapshot(
            snapshotStorage().totalSupplyByPartitionSnapshots[partition],
            ERC1410StorageWrapper.totalSupplyByPartition(partition)
        );
    }

    function updateTokenHolderSnapshot(address account) internal {
        updateSnapshotAddress(
            snapshotStorage().tokenHoldersSnapshots[ERC1410StorageWrapper.getTokenHolderIndex(account)],
            account
        );
    }

    function updateTotalTokenHolderSnapshot() internal {
        updateSnapshot(snapshotStorage().totalTokenHoldersSnapshots, ERC1410StorageWrapper.getTotalTokenHolders());
    }

    // --- Snapshot Value Queries ---

    function abafAtSnapshot(uint256 snapshotID) internal view returns (uint256 abaf_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotID, snapshotStorage().abafSnapshots);
        return snapshotted ? value : AdjustBalancesStorageWrapper.getAbafAdjustedAt(block.timestamp);
    }

    function decimalsAtSnapshot(uint256 snapshotID) internal view returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotID, snapshotStorage().decimals);
        return snapshotted ? uint8(value) : ERC20StorageWrapper.decimalsAdjustedAt(block.timestamp);
    }

    function balanceOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (uint256 balance_) {
        return balanceOfAt(tokenHolder, snapshotID);
    }

    function balancesOfAtSnapshot(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (HolderBalance[] memory balances_) {
        address[] memory tokenHolders = tokenHoldersAt(snapshotID, pageIndex, pageLength);
        uint256 length = tokenHolders.length;
        balances_ = new HolderBalance[](length);
        for (uint256 i = 0; i < length; ) {
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

    function balanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return balanceOfAtByPartition(partition, tokenHolder, snapshotID);
    }

    function partitionsOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = snapshotStorage().accountPartitionMetadata[tokenHolder];

        (bool found, uint256 index) = indexFor(snapshotID, partitionSnapshots.ids);

        if (!found) {
            return ERC1410StorageWrapper.partitionsOf(tokenHolder);
        }

        return partitionSnapshots.values[index].partitions;
    }

    function totalSupplyAtSnapshot(uint256 snapshotID) internal view returns (uint256 totalSupply_) {
        return totalSupplyAt(snapshotID);
    }

    function balanceOfAt(address tokenHolder, uint256 snapshotId) internal view returns (uint256) {
        return
            balanceOfAtAdjusted(
                snapshotId,
                snapshotStorage().accountBalanceSnapshots[tokenHolder],
                AdjustBalancesStorageWrapper.balanceOfAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function tokenHoldersAt(
        uint256 snapshotId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        address[] memory tk = new address[](Pagination.getSize(start, end, totalTokenHoldersAt(snapshotId)));
        uint256 length = tk.length;
        for (uint256 i = 0; i < length; ) {
            uint256 index = i + 1;
            (bool snapshotted, address value) = addressValueAt(
                snapshotId,
                snapshotStorage().tokenHoldersSnapshots[index]
            );

            tk[i] = snapshotted ? value : ERC1410StorageWrapper.getTokenHolder(index);
            unchecked {
                ++i;
            }
        }

        return tk;
    }

    function totalTokenHoldersAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, snapshotStorage().totalTokenHoldersSnapshots);
        return snapshotted ? value : ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function balanceOfAtByPartition(
        bytes32 partition,
        address account,
        uint256 snapshotId
    ) internal view returns (uint256) {
        return
            balanceOfAtAdjusted(
                snapshotId,
                snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(partition, account, block.timestamp)
            );
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID
    ) internal view returns (uint256 totalSupply_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().totalSupplyByPartitionSnapshots[partition],
                AdjustBalancesStorageWrapper.totalSupplyByPartitionAdjustedAt(partition, block.timestamp)
            );
    }

    function lockedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountLockedBalanceSnapshots[tokenHolder],
                LockStorageWrapper.getLockedAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountPartitionLockedBalanceSnapshots[tokenHolder][partition],
                LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function heldBalanceOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountHeldBalanceSnapshots[tokenHolder],
                HoldStorageWrapper.getHeldAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountPartitionHeldBalanceSnapshots[tokenHolder][partition],
                HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function frozenBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountFrozenBalanceSnapshots[tokenHolder],
                ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountPartitionFrozenBalanceSnapshots[tokenHolder][partition],
                ERC3643StorageWrapper.getFrozenAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function clearedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountClearedBalanceSnapshots[tokenHolder],
                ClearingReadOps.getClearedAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            balanceOfAtAdjusted(
                snapshotID,
                snapshotStorage().accountPartitionClearedBalanceSnapshots[tokenHolder][partition],
                ClearingReadOps.getClearedAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function balanceOfAtAdjusted(
        uint256 snapshotId,
        Snapshots storage snapshots,
        uint256 currentBalanceAdjusted
    ) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnapshot = abafAtSnapshot(snapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(block.timestamp);

        if (abafAtSnapshot == abaf) return currentBalanceAdjusted;

        uint256 factor = abaf / abafAtSnapshot;

        return currentBalanceAdjusted / factor;
    }

    function totalSupplyAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, snapshotStorage().totalSupplySnapshots);
        return snapshotted ? value : ERC20StorageWrapper.totalSupply();
    }

    // --- Snapshot ID and Lookup Helpers ---

    function getCurrentSnapshotId() internal view returns (uint256) {
        return snapshotStorage().currentSnapshotId.current();
    }

    function valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view returns (bool, uint256) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : 0);
    }

    function addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view returns (bool, address) {
        (bool found, uint256 index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : address(0));
    }

    function indexFor(uint256 snapshotId, uint256[] storage ids) internal view returns (bool, uint256) {
        if (snapshotId == 0) {
            revert ISnapshotsStorageWrapper.SnapshotIdNull();
        }
        if (snapshotId > getCurrentSnapshotId()) {
            revert ISnapshotsStorageWrapper.SnapshotIdDoesNotExists(snapshotId);
        }

        uint256 index = ids.findUpperBound(snapshotId);

        if (index == ids.length) {
            return (false, 0);
        } else {
            return (true, index);
        }
    }

    function lastSnapshotId(uint256[] storage ids) internal view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    // --- Storage Access (pure function - must come last) ---

    function snapshotStorage() internal pure returns (SnapshotStorage storage snapshotStorage_) {
        bytes32 position = _SNAPSHOT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotStorage_.slot := position
        }
    }
}
