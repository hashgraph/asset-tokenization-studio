// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ISnapshotsStorageWrapper,
    Snapshots,
    PartitionSnapshots
} from "../../layer_1/interfaces/snapshots/ISnapshots.sol";
import { ERC20StorageWrapper2 } from "../ERC1400/ERC20/ERC20StorageWrapper2.sol";
import { LibCommon } from "../../layer_0/common/libraries/LibCommon.sol";

abstract contract SnapshotsStorageWrapper2 is ISnapshotsStorageWrapper, ERC20StorageWrapper2 {
    function _updateAbafSnapshot() internal {
        _updateSnapshot(_snapshotStorage().abafSnapshots, _getAbaf());
    }

    function _updateDecimalsSnapshot() internal {
        _updateSnapshot(_snapshotStorage().decimals, _decimals());
    }

    function _updateAssetTotalSupplySnapshot() internal {
        _updateSnapshot(_snapshotStorage().totalSupplySnapshots, _totalSupply());
    }

    /**
     * @dev Update balance and/or total supply snapshots before the values are modified. This is implemented
     * in the _beforeTokenTransfer hook, which is executed for _mint, _burn, and _transfer operations.
     */
    function _updateAccountSnapshot(address account, bytes32 partition) internal override {
        uint256 currentSnapshotId = _getCurrentSnapshotId();

        if (currentSnapshotId == 0) return;

        uint256 abafAtCurrentSnapshot = _abafAtSnapshot(currentSnapshotId);
        uint256 abaf = _getAbafAdjusted();

        if (abaf == abafAtCurrentSnapshot) {
            _updateAccountSnapshot(
                _snapshotStorage().accountBalanceSnapshots[account],
                _balanceOf(account),
                _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
                _snapshotStorage().accountPartitionMetadata[account],
                _balanceOfByPartition(partition, account),
                _partitionsOf(account)
            );
            return;
        }
        if (abafAtCurrentSnapshot == 0) abafAtCurrentSnapshot = 1;

        uint256 balance = _balanceOfAdjusted(account);
        uint256 balanceForPartition = _balanceOfByPartitionAdjusted(partition, account);
        uint256 factor = abaf / abafAtCurrentSnapshot;

        balance /= factor;
        balanceForPartition /= factor;

        _updateAccountSnapshot(
            _snapshotStorage().accountBalanceSnapshots[account],
            balance,
            _snapshotStorage().accountPartitionBalanceSnapshots[account][partition],
            _snapshotStorage().accountPartitionMetadata[account],
            balanceForPartition,
            _partitionsOf(account)
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
        _updateSnapshot(_snapshotStorage().accountLockedBalanceSnapshots[account], _getLockedAmountFor(account));
        _updateSnapshot(
            _snapshotStorage().accountPartitionLockedBalanceSnapshots[account][partition],
            _getLockedAmountForByPartition(partition, account)
        );
    }

    function _updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(_snapshotStorage().accountHeldBalanceSnapshots[account], _getHeldAmountFor(account));
        _updateSnapshot(
            _snapshotStorage().accountPartitionHeldBalanceSnapshots[account][partition],
            _getHeldAmountForByPartition(partition, account)
        );
    }

    function _updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(_snapshotStorage().accountFrozenBalanceSnapshots[account], _getFrozenAmountFor(account));
        _updateSnapshot(
            _snapshotStorage().accountPartitionFrozenBalanceSnapshots[account][partition],
            _getFrozenAmountForByPartition(partition, account)
        );
    }

    function _updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal {
        _updateSnapshot(_snapshotStorage().accountClearedBalanceSnapshots[account], _getClearedAmountFor(account));
        _updateSnapshot(
            _snapshotStorage().accountPartitionClearedBalanceSnapshots[account][partition],
            _getClearedAmountForByPartition(partition, account)
        );
    }

    function _updateTotalSupplySnapshot(bytes32 partition) internal override {
        _updateSnapshot(_snapshotStorage().totalSupplySnapshots, _totalSupply());
        _updateSnapshot(
            _snapshotStorage().totalSupplyByPartitionSnapshots[partition],
            _totalSupplyByPartition(partition)
        );
    }

    function _updateTokenHolderSnapshot(address account) internal override {
        _updateSnapshotAddress(_snapshotStorage().tokenHoldersSnapshots[_getTokenHolderIndex(account)], account);
    }

    function _updateTotalTokenHolderSnapshot() internal override {
        _updateSnapshot(_snapshotStorage().totalTokenHoldersSnapshots, _getTotalTokenHolders());
    }

    function _abafAtSnapshot(uint256 _snapshotID) internal view returns (uint256 abaf_) {
        (bool snapshotted, uint256 value) = _valueAt(_snapshotID, _snapshotStorage().abafSnapshots);

        return snapshotted ? value : _getAbaf();
    }

    function _decimalsAtSnapshot(uint256 _snapshotID) internal view returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = _valueAt(_snapshotID, _snapshotStorage().decimals);

        return snapshotted ? uint8(value) : _decimalsAdjusted();
    }

    function _balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) internal view returns (uint256 balance_) {
        return _balanceOfAt(_tokenHolder, _snapshotID);
    }

    function _getTotalBalanceOfAtSnapshot(
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view override returns (uint256) {
        // Use unchecked block since we're dealing with token balances that shouldn't overflow
        unchecked {
            return
                _balanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                _clearedBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                _heldBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                _lockedBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                _frozenBalanceOfAtSnapshot(_snapshotId, _tokenHolder);
        }
    }

    function _getTotalBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view override returns (uint256) {
        // Use unchecked block since we're dealing with token balances that shouldn't overflow
        unchecked {
            return
                _balanceOfAtSnapshotByPartition(_partition, _snapshotId, _tokenHolder) +
                _clearedBalanceOfAtSnapshotByPartition(_partition, _snapshotId, _tokenHolder) +
                _heldBalanceOfAtSnapshotByPartition(_partition, _snapshotId, _tokenHolder) +
                _lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotId, _tokenHolder) +
                _frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotId, _tokenHolder);
        }
    }

    function _balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return _balanceOfAtByPartition(_partition, _tokenHolder, _snapshotID);
    }

    function _partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = _snapshotStorage().accountPartitionMetadata[_tokenHolder];

        (bool found, uint256 index) = _indexFor(_snapshotID, partitionSnapshots.ids);

        if (!found) {
            return _partitionsOf(_tokenHolder);
        }

        return partitionSnapshots.values[index].partitions;
    }

    function _totalSupplyAtSnapshot(uint256 _snapshotID) internal view returns (uint256 totalSupply_) {
        return _totalSupplyAt(_snapshotID);
    }

    function _balanceOfAt(address account, uint256 snapshotId) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountBalanceSnapshots[account],
                _balanceOfAdjusted(account)
            );
    }

    function _tokenHoldersAt(
        uint256 snapshotId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        address[] memory tk = new address[](LibCommon.getSize(start, end, _totalTokenHoldersAt(snapshotId)));

        for (uint256 i = 0; i < tk.length; i++) {
            uint256 index = i + 1;
            (bool snapshotted, address value) = _addressValueAt(
                snapshotId,
                _snapshotStorage().tokenHoldersSnapshots[index]
            );

            tk[i] = snapshotted ? value : _getTokenHolder(index);
        }

        return tk;
    }

    function _totalTokenHoldersAt(uint256 snapshotId) internal view override returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _snapshotStorage().totalTokenHoldersSnapshots);

        return snapshotted ? value : _getTotalTokenHolders();
    }

    function _balanceOfAtByPartition(
        bytes32 _partition,
        address account,
        uint256 snapshotId
    ) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                snapshotId,
                _snapshotStorage().accountPartitionBalanceSnapshots[account][_partition],
                _balanceOfByPartitionAdjusted(_partition, account)
            );
    }

    function _totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) internal view returns (uint256 totalSupply_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().totalSupplyByPartitionSnapshots[_partition],
                _totalSupplyByPartitionAdjusted(_partition)
            );
    }

    function _lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountLockedBalanceSnapshots[_tokenHolder],
                _getLockedAmountForAdjustedAt(_tokenHolder, _blockTimestamp())
            );
    }

    function _lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountPartitionLockedBalanceSnapshots[_tokenHolder][_partition],
                _getLockedAmountForByPartitionAdjusted(_partition, _tokenHolder)
            );
    }

    function _heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountHeldBalanceSnapshots[_tokenHolder],
                _getHeldAmountForAdjusted(_tokenHolder)
            );
    }

    function _heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountPartitionHeldBalanceSnapshots[_tokenHolder][_partition],
                _getHeldAmountForByPartitionAdjusted(_partition, _tokenHolder)
            );
    }

    function _frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountFrozenBalanceSnapshots[_tokenHolder],
                _getFrozenAmountForAdjusted(_tokenHolder)
            );
    }

    function _frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountPartitionFrozenBalanceSnapshots[_tokenHolder][_partition],
                _getFrozenAmountForByPartitionAdjusted(_partition, _tokenHolder)
            );
    }

    function _clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountClearedBalanceSnapshots[_tokenHolder],
                _getClearedAmountForAdjusted(_tokenHolder)
            );
    }

    function _clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view returns (uint256 balance_) {
        return
            _balanceOfAtAdjusted(
                _snapshotID,
                _snapshotStorage().accountPartitionClearedBalanceSnapshots[_tokenHolder][_partition],
                _getClearedAmountForByPartitionAdjusted(_partition, _tokenHolder)
            );
    }

    function _balanceOfAtAdjusted(
        uint256 _snapshotId,
        Snapshots storage _snapshots,
        uint256 _currentBalanceAdjusted
    ) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(_snapshotId, _snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnapshot = _abafAtSnapshot(_snapshotId);
        uint256 abaf = _getAbaf();

        if (abafAtSnapshot == abaf) return _currentBalanceAdjusted;
        if (abafAtSnapshot == 0) abafAtSnapshot = 1;

        uint256 factor = abaf / abafAtSnapshot;

        return _currentBalanceAdjusted / factor;
    }

    /**
     * @dev Retrieves the total supply at the time `snapshotId` was created.
     */
    function _totalSupplyAt(uint256 snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _snapshotStorage().totalSupplySnapshots);

        return snapshotted ? value : _totalSupply();
    }
}
