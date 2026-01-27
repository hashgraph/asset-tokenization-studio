// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../constants/storagePositions.sol";
import {
    ScheduledCrossOrderedTasksStorageWrapper
} from "../../layer_0/scheduledTasks/scheduledCrossOrderedTasks/ScheduledCrossOrderedTasksStorageWrapper.sol";
import {
    IAdjustBalancesStorageWrapper
} from "../../layer_2/interfaces/adjustBalances/IAdjustBalancesStorageWrapper.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";

abstract contract AdjustBalancesStorageWrapper1 is
    IAdjustBalancesStorageWrapper,
    ScheduledCrossOrderedTasksStorageWrapper
{
    struct AdjustBalancesStorage {
        // Mapping from investor to their partitions labaf
        mapping(address => uint256[]) labafUserPartition;
        // Aggregated Balance Adjustment
        uint256 abaf;
        // Last Aggregated Balance Adjustment per account
        mapping(address => uint256) labaf;
        // Last Aggregated Balance Adjustment per partition
        mapping(bytes32 => uint256) labafByPartition;
        // Last Aggregated Balance Adjustment per allowance
        mapping(address => mapping(address => uint256)) labafsAllowances;
        // Locks
        mapping(address => uint256) labafLockedAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) labafLockedAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafLockedAmountByAccountPartitionAndId;
        // holdsByAccountPartitionAndId
        mapping(address => uint256) labafHeldAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) labafHeldAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafHeldAmountByAccountPartitionAndId;
        // Clearings
        mapping(address => uint256) labafClearedAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) labafClearedAmountByAccountAndPartition;
        // solhint-disable max-line-length
        mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => mapping(uint256 => uint256)))) labafClearedAmountByAccountPartitionTypeAndId;
        // freezeByAccountPartitionAndId
        mapping(address => uint256) labafFrozenAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) labafFrozenAmountByAccountAndPartition;
    }

    modifier validateFactor(uint256 _factor) override {
        _checkFactor(_factor);
        _;
    }

    function _updateAbaf(uint256 factor) internal override {
        _adjustBalancesStorage().abaf = _calculateNewAbaf(_getAbaf(), factor);
    }

    function _updateLabafByPartition(bytes32 partition) internal override {
        AdjustBalancesStorage storage adjustBalancesStorage = _adjustBalancesStorage();
        adjustBalancesStorage.labafByPartition[partition] = adjustBalancesStorage.abaf;
    }

    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal override {
        _adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal override {
        delete _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal override {
        delete _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    function _removeLabafClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal override {
        delete _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    function _setLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal override {
        _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    function _setHeldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal override {
        _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalFreezeLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _labaf
    ) internal override {
        _adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal override {
        _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ] = _labaf;
    }

    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _labaf
    ) internal override {
        _adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal override {
        _adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal override {
        _adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function _calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(abaf, _adjustBalancesStorage().labaf[tokenHolder]);
    }

    function _calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(abaf, _adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1]);
    }

    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(
            _getAbafAdjustedAt(timestamp),
            _adjustBalancesStorage().labafLockedAmountByAccount[tokenHolder]
        );
    }

    function _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(
            _getAbafAdjustedAt(timestamp),
            _adjustBalancesStorage().labafFrozenAmountByAccount[tokenHolder]
        );
    }

    function _calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(
            _getAbafAdjustedAt(timestamp),
            _adjustBalancesStorage().labafHeldAmountByAccount[tokenHolder]
        );
    }

    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view override returns (uint256 factor) {
        factor = _calculateFactor(
            _getAbafAdjustedAt(timestamp),
            _adjustBalancesStorage().labafClearedAmountByAccount[tokenHolder]
        );
    }

    function _getAbaf() internal view override returns (uint256) {
        return _adjustBalancesStorage().abaf;
    }

    function _getAbafAdjustedAt(uint256 _timestamp) internal view override returns (uint256) {
        uint256 abaf = _getAbaf();
        if (abaf == 0) abaf = 1;
        (uint256 pendingAbaf, ) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return abaf * pendingAbaf;
    }

    function _getLabafByUser(address _account) internal view override returns (uint256) {
        return _adjustBalancesStorage().labaf[_account];
    }

    function _getLabafByPartition(bytes32 _partition) internal view override returns (uint256) {
        return _adjustBalancesStorage().labafByPartition[_partition];
    }

    function _getAllowanceLabaf(address _owner, address _spender) internal view override returns (uint256) {
        return _adjustBalancesStorage().labafsAllowances[_owner][_spender];
    }

    function _getTotalLockLabaf(address _tokenHolder) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder];
    }

    function _getTotalLockLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view override returns (uint256) {
        return _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    function _getTotalHeldLabaf(address _tokenHolder) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder];
    }

    function _getTotalHeldLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _getTotalFrozenLabaf(address _tokenHolder) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder];
    }

    function _getTotalFrozenLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view override returns (uint256) {
        return _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    function _getTotalClearedLabaf(address _tokenHolder) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder];
    }

    function _getTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 labaf_) {
        return _adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view override returns (uint256) {
        return
            _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                    _clearingOperationIdentifier.clearingId
                ];
    }

    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure override returns (uint256 factor_) {
        if (_abaf == 0) return 1;
        if (_labaf == 0) return _abaf;
        factor_ = _abaf / _labaf;
    }

    function _adjustBalancesStorage() internal pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }

    function _checkFactor(uint256 _factor) private pure {
        if (_factor == 0) revert FactorIsZero();
    }

    function _calculateNewAbaf(uint256 abaf, uint256 factor) private pure returns (uint256) {
        return abaf == 0 ? factor : abaf * factor;
    }
}
