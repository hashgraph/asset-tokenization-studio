// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IAdjustBalancesStorageWrapper } from "./adjustBalance/IAdjustBalancesStorageWrapper.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { CapStorageWrapper } from "../core/CapStorageWrapper.sol";

struct AdjustBalancesStorage {
    mapping(address => uint256[]) labafUserPartition;
    uint256 abaf;
    mapping(address => uint256) labaf;
    mapping(bytes32 => uint256) labafByPartition;
    mapping(address => mapping(address => uint256)) labafsAllowances;
    // Locks
    mapping(address => uint256) labafLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafLockedAmountByAccountPartitionAndId;
    // Holds
    mapping(address => uint256) labafHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafHeldAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafHeldAmountByAccountPartitionAndId;
    // Clearings
    mapping(address => uint256) labafClearedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafClearedAmountByAccountAndPartition;
    // solhint-disable-next-line max-line-length
    mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => mapping(uint256 => uint256)))) labafClearedAmountByAccountPartitionTypeAndId;
    // Freezes
    mapping(address => uint256) labafFrozenAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafFrozenAmountByAccountAndPartition;
}

library AdjustBalancesStorageWrapper {
    function _adjustBalancesStorage() internal pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }

    // --- Guard functions ---

    function _requireValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalancesStorageWrapper.FactorIsZero();
    }

    // --- ABAF core functions ---

    // solhint-disable-next-line ordering
    function _updateAbaf(uint256 factor) internal {
        _adjustBalancesStorage().abaf = _getAbaf() * factor;
    }

    function _getAbaf() internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().abaf);
    }

    function _getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        uint256 abaf = _getAbaf();
        (uint256 pendingAbaf, ) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return abaf * pendingAbaf;
    }

    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    function _zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    // --- LABAF by user ---

    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        _adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    function _getLabafByUser(address _account) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labaf[_account]);
    }

    // --- LABAF by partition ---

    function _updateLabafByPartition(bytes32 partition) internal {
        _adjustBalancesStorage().labafByPartition[partition] = _getAbaf();
    }

    function _getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafByPartition[_partition]);
    }

    // --- LABAF by user and partition ---

    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    function _updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        _adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    function _getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        uint256 partitionsIndex = ERC1410StorageWrapper._erc1410BasicStorage().partitionToIndex[_account][_partition];
        if (partitionsIndex == 0) return 1;
        return _zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][partitionsIndex - 1]);
    }

    function _getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view returns (uint256) {
        if (_partitionIndex == 0) return 1;
        return _zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }

    // --- Allowance LABAF ---

    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        _adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    function _getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    // --- Lock LABAF ---

    function _setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    function _getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    function _getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function _getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256) {
        return
            _zeroToOne(
                _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            );
    }

    // --- Hold LABAF ---

    function _setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    function _getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    function _getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function _getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view returns (uint256) {
        return
            _zeroToOne(
                _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId]
            );
    }

    // --- Freeze LABAF ---

    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    function _getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    // --- Clearing LABAF ---

    function _setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ] = _labaf;
    }

    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _removeLabafClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        delete _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    function _getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    function _getTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256) {
        return _zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function _getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256) {
        return
            _zeroToOne(
                _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                    _clearingOperationIdentifier.tokenHolder
                ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                        _clearingOperationIdentifier.clearingId
                    ]
            );
    }

    // --- Factor calculation helpers ---

    function _calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(abaf, _getLabafByUser(tokenHolder));
    }

    function _calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(abaf, _getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getTotalLockLabaf(tokenHolder));
    }

    function _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getTotalFrozenLabaf(tokenHolder));
    }

    function _calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getTotalHeldLabaf(tokenHolder));
    }

    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getTotalClearedLabaf(tokenHolder));
    }

    // --- Balance adjustment operations (from AdjustBalancesStorageWrapper2) ---

    function _adjustBalances(uint256 _factor, uint8 _decimals) internal {
        SnapshotsStorageWrapper._updateDecimalsSnapshot();
        SnapshotsStorageWrapper._updateAbafSnapshot();
        SnapshotsStorageWrapper._updateAssetTotalSupplySnapshot();
        ERC20StorageWrapper._adjustTotalSupply(_factor);
        ERC20StorageWrapper._adjustDecimals(_decimals);
        CapStorageWrapper._adjustMaxSupply(_factor);
        _updateAbaf(_factor);
        emit IAdjustBalancesStorageWrapper.AdjustmentBalanceSet(msg.sender, _factor, _decimals);
    }

    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal {
        uint256 abaf = _getAbaf();
        uint256 labaf = _getLabafByPartition(_partition);

        if (abaf == labaf) return;

        uint256 factor = _calculateFactor(abaf, labaf);

        ERC1410StorageWrapper._adjustTotalSupplyByPartition(_partition, factor);
        CapStorageWrapper._adjustMaxSupplyByPartition(_partition, factor);
        _updateLabafByPartition(_partition);
    }

    // --- Delegated read functions ---

    function _totalSupplyAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return ERC1410StorageWrapper._totalSupply() * pendingABAF;
    }

    function _totalSupplyByPartitionAdjustedAt(bytes32 _partition, uint256 _timestamp) internal view returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getLabafByPartition(_partition));
        return ERC1410StorageWrapper._totalSupplyByPartition(_partition) * factor;
    }

    function _balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getLabafByUser(_tokenHolder));
        return ERC1410StorageWrapper._balanceOf(_tokenHolder) * factor;
    }

    function _balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getLabafByUserAndPartition(_partition, _tokenHolder)
        );
        return ERC1410StorageWrapper._balanceOfByPartition(_partition, _tokenHolder) * factor;
    }

    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper._getPendingScheduledBalanceAdjustmentsAt(_timestamp);
    }
}
