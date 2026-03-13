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

    // --- Storage Access ---

    function _snapshotStorage() internal pure returns (SnapshotStorage storage snapshotStorage_) {
        bytes32 position = _SNAPSHOT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotStorage_.slot := position
        }
    }

    // --- Snapshot Creation and Update (from SnapshotsStorageWrapper1) ---

    // solhint-disable-next-line ordering
    function _takeSnapshot() internal returns (uint256 snapshotID_) {
        _snapshotStorage().currentSnapshotId.increment();
        return _getCurrentSnapshotId();
    }

    function _updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    function _updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    function _updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValueForPartition);
        }
        if (_lastSnapshotId(partitionSnapshots.ids) < currentId) {
            partitionSnapshots.ids.push(currentId);
            ListOfPartitions memory listOfPartitions = ListOfPartitions(partitionIds);
            partitionSnapshots.values.push(listOfPartitions);
        }
    }

    function _getCurrentSnapshotId() internal view returns (uint256) {
        return _snapshotStorage().currentSnapshotId.current();
    }

    function _valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view returns (bool, uint256) {
        (bool found, uint256 index) = _indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : 0);
    }

    function _addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view returns (bool, address) {
        (bool found, uint256 index) = _indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : address(0));
    }

    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view returns (bool, uint256) {
        if (snapshotId == 0) {
            revert ISnapshotsStorageWrapper.SnapshotIdNull();
        }
        if (snapshotId > _getCurrentSnapshotId()) {
            revert ISnapshotsStorageWrapper.SnapshotIdDoesNotExists(snapshotId);
        }

        uint256 index = ids.findUpperBound(snapshotId);

        if (index == ids.length) {
            return (false, 0);
        } else {
            return (true, index);
        }
    }

    function _lastSnapshotId(uint256[] storage ids) internal view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    // --- Snapshot Updates for Balance Types (from SnapshotsStorageWrapper2) ---

    function _updateAbafSnapshot() internal {
        _updateSnapshot(_snapshotStorage().abafSnapshots, AdjustBalancesStorageWrapper._getAbaf());
    }

    function _updateDecimalsSnapshot() internal {
        _updateSnapshot(_snapshotStorage().decimals, ERC20StorageWrapper._decimals());
    }

    function _updateAssetTotalSupplySnapshot() internal {
        _updateSnapshot(_snapshotStorage().totalSupplySnapshots, ERC20StorageWrapper._totalSupply());
    }

    /**
     * @dev Update balance and/or total supply snapshots before the values are modified. This is implemented
     * in the _beforeTokenTransfer hook, which is executed for _mint, _burn, and _transfer operations.
     */
    function _updateAccountSnapshot(address account, bytes32 partition) internal {
        uint256 currentSnapshotId = _getCurrentSnapshotId();

        if (currentSnapshotId == 0) return;

        uint256 abafAtCurrentSnapshot = _abafAtSnapshot(currentSnapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper._getAbafAdjustedAt(block.timestamp);

        if (abaf == abafAtCurrentSnapshot) {
            _updateAccountSnapshot(
                _snapshotStorage().accountBalanceSnapshots[account],
                ERC20StorageWrapper._balanceOf(account),
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                _snapshotStorage().accountPartitionMetadata[account],
                ERC1410StorageWrapper._balanceOfByPartition(partition, account),
                ERC1410StorageWrapper._partitionsOf(account)
            );
            return;
        }

        uint256 balance = AdjustBalancesStorageWrapper._balanceOfAdjustedAt(account, block.timestamp);
        uint256 balanceForPartition = AdjustBalancesStorageWrapper._balanceOfByPartitionAdjustedAt(
            partition,
            account,
            block.timestamp
        );
        uint256 factor = abaf / abafAtCurrentSnapshot;

        balance /= factor;
        balanceForPartition /= factor;

        _updateAccountSnapshot(
            _snapshotStorage().accountBalanceSnapshots[account],
            balance,
            _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
            _snapshotStorage().accountPartitionMetadata[account],
            balanceForPartition,
            ERC1410StorageWrapper._partitionsOf(account)
        );
    }

    function _updateAccountSnapshot(
        Snapshots storage balanceSnapshots,
        uint256 currentValue,
        Snapshots storage partitionBalanceSnapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal {
        _updateSnapshot(balanceSnapshots, currentValue);
        _updateSnapshotPartitions(
            partitionBalanceSnapshots,
            partitionSnapshots,
            currentValueForPartition,
            partitionIds
        );
    }

    function _updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(
            _snapshotStorage().accountLockedBalanceSnapshots[account],
            LockStorageWrapper._getLockedAmountFor(account)
        );
        _updateSnapshot(
            _snapshotStorage().accountPartitionLockedBalanceSnapshots[account][partition],
            LockStorageWrapper._getLockedAmountForByPartition(partition, account)
        );
    }

    function _updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(
            _snapshotStorage().accountHeldBalanceSnapshots[account],
            HoldStorageWrapper._getHeldAmountFor(account)
        );
        _updateSnapshot(
            _snapshotStorage().accountPartitionHeldBalanceSnapshots[account][partition],
            HoldStorageWrapper._getHeldAmountForByPartition(partition, account)
        );
    }

    function _updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(
            _snapshotStorage().accountFrozenBalanceSnapshots[account],
            ERC3643StorageWrapper._getFrozenAmountFor(account)
        );
        _updateSnapshot(
            _snapshotStorage().accountPartitionFrozenBalanceSnapshots[account][partition],
            ERC3643StorageWrapper._getFrozenAmountForByPartition(partition, account)
        );
    }

    function _updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(
            _snapshotStorage().accountClearedBalanceSnapshots[account],
            ClearingStorageWrapper._getClearedAmountFor(account)
        );
        _updateSnapshot(
            _snapshotStorage().accountPartitionClearedBalanceSnapshots[account][partition],
            ClearingStorageWrapper._getClearedAmountForByPartition(partition, account)
        );
    }

    function _updateTotalSupplySnapshot(bytes32 partition) internal {
        _updateSnapshot(_snapshotStorage().totalSupplySnapshots, ERC20StorageWrapper._totalSupply());
        _updateSnapshot(
            _snapshotStorage().totalSupplyByPartitionSnapshots[partition],
            ERC1410StorageWrapper._totalSupplyByPartition(partition)
        );
    }

    function _updateTokenHolderSnapshot(address account) internal {
        _updateSnapshotAddress(
            _snapshotStorage().tokenHoldersSnapshots[ERC1410StorageWrapper._getTokenHolderIndex(account)],
            account
        );
    }

    function _updateTotalTokenHolderSnapshot() internal {
        _updateSnapshot(_snapshotStorage().totalTokenHoldersSnapshots, ERC1410StorageWrapper._getTotalTokenHolders());
    }

    // --- Snapshot Value Queries ---

    function _abafAtSnapshot(uint256 snapshotID) internal view returns (uint256 abaf_) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotID, _snapshotStorage().abafSnapshots);
        return snapshotted ? value : AdjustBalancesStorageWrapper._getAbafAdjustedAt(block.timestamp);
    }

    function _decimalsAtSnapshot(uint256 snapshotID) internal view returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotID, _snapshotStorage().decimals);
        return snapshotted ? uint8(value) : ERC20StorageWrapper._decimalsAdjustedAt(block.timestamp);
    }

    function _balanceOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (uint256 balance_) {
        return _balanceOfAt(tokenHolder, snapshotID);
    }

    function _balancesOfAtSnapshot(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (HolderBalance[] memory balances_) {
        address[] memory tokenHolders = _tokenHoldersAt(snapshotID, pageIndex, pageLength);
        uint256 length = tokenHolders.length;
        balances_ = new HolderBalance[](length);
        for (uint256 i = 0; i < length; ) {
            address tokenHolder = tokenHolders[i];
            balances_[i] = HolderBalance({
                holder: tokenHolder,
                balance: _balanceOfAtSnapshot(snapshotID, tokenHolder)
            });
            unchecked {
                ++i;
            }
        }
    }

    function _getTotalBalanceOfAtSnapshot(uint256 snapshotId, address tokenHolder) internal view returns (uint256) {
        // Use unchecked block since we're dealing with token balances that shouldn't overflow
        unchecked {
            return
                _balanceOfAtSnapshot(snapshotId, tokenHolder) +
                _clearedBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                _heldBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                _lockedBalanceOfAtSnapshot(snapshotId, tokenHolder) +
                _frozenBalanceOfAtSnapshot(snapshotId, tokenHolder);
        }
    }

    function _balanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return _balanceOfAtByPartition(partition, tokenHolder, snapshotID);
    }

    function _partitionsOfAtSnapshot(uint256 snapshotID, address tokenHolder) internal view returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = _snapshotStorage().accountPartitionMetadata[tokenHolder];

        (bool found, uint256 index) = _indexFor(snapshotID, partitionSnapshots.ids);

        if (!found) {
            return ERC1410StorageWrapper._partitionsOf(tokenHolder);
        }

        return partitionSnapshots.values[index].partitions;
    }

    function _totalSupplyAtSnapshot(uint256 snapshotID) internal view returns (uint256 totalSupply_) {
        return _totalSupplyAt(snapshotID);
    }

    function _balanceOfAt(address tokenHolder, uint256 snapshotId) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountBalanceSnapshots[tokenHolder],
                AdjustBalancesStorageWrapper._balanceOfAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function _tokenHoldersAt(
        uint256 snapshotId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        address[] memory tk = new address[](Pagination.getSize(start, end, _totalTokenHoldersAt(snapshotId)));
        uint256 length = tk.length;
        for (uint256 i = 0; i < length; ) {
            uint256 index = i + 1;
            (bool snapshotted, address value) = _addressValueAt(
                snapshotId,
                _snapshotStorage().tokenHoldersSnapshots[index]
            );

            tk[i] = snapshotted ? value : ERC1410StorageWrapper._getTokenHolder(index);
            unchecked {
                ++i;
            }
        }

        return tk;
    }

    function _totalTokenHoldersAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _snapshotStorage().totalTokenHoldersSnapshots);
        return snapshotted ? value : ERC1410StorageWrapper._getTotalTokenHolders();
    }

    function _balanceOfAtByPartition(
        bytes32 partition,
        address account,
        uint256 snapshotId
    ) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                AdjustBalancesStorageWrapper._balanceOfByPartitionAdjustedAt(partition, account, block.timestamp)
            );
    }

    function _totalSupplyAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID
    ) internal view returns (uint256 totalSupply_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().totalSupplyByPartitionSnapshots[partition],
                AdjustBalancesStorageWrapper._totalSupplyByPartitionAdjustedAt(partition, block.timestamp)
            );
    }

    function _lockedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountLockedBalanceSnapshots[tokenHolder],
                LockStorageWrapper._getLockedAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function _lockedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionLockedBalanceSnapshots[tokenHolder][partition],
                LockStorageWrapper._getLockedAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function _heldBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountHeldBalanceSnapshots[tokenHolder],
                HoldStorageWrapper._getHeldAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function _heldBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionHeldBalanceSnapshots[tokenHolder][partition],
                HoldStorageWrapper._getHeldAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function _frozenBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountFrozenBalanceSnapshots[tokenHolder],
                ERC3643StorageWrapper._getFrozenAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function _frozenBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionFrozenBalanceSnapshots[tokenHolder][partition],
                ERC3643StorageWrapper._getFrozenAmountForByPartitionAdjustedAt(partition, tokenHolder, block.timestamp)
            );
    }

    function _clearedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountClearedBalanceSnapshots[tokenHolder],
                ClearingStorageWrapper._getClearedAmountForAdjustedAt(tokenHolder, block.timestamp)
            );
    }

    function _clearedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                snapshotID,
                _snapshotStorage().accountPartitionClearedBalanceSnapshots[tokenHolder][partition],
                ClearingStorageWrapper._getClearedAmountForByPartitionAdjustedAt(
                    partition,
                    tokenHolder,
                    block.timestamp
                )
            );
    }

    function _balanceOfAtAdjusted(
        uint256 snapshotId,
        Snapshots storage snapshots,
        uint256 currentBalanceAdjusted
    ) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnapshot = _abafAtSnapshot(snapshotId);
        uint256 abaf = AdjustBalancesStorageWrapper._getAbafAdjustedAt(block.timestamp);

        if (abafAtSnapshot == abaf) return currentBalanceAdjusted;

        uint256 factor = abaf / abafAtSnapshot;

        return currentBalanceAdjusted / factor;
    }

    /**
     * @dev Retrieves the total supply at the time `snapshotId` was created.
     */
    function _totalSupplyAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _snapshotStorage().totalSupplySnapshots);
        return snapshotted ? value : ERC20StorageWrapper._totalSupply();
    }
}
