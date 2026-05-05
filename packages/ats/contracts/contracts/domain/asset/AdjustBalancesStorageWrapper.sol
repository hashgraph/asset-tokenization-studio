// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { CapStorageWrapper } from "../core/CapStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAdjustBalances } from "../../facets/adjustBalances/IAdjustBalances.sol";

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
    mapping(address => mapping(bytes32 => mapping(IClearingTypes.ClearingOperationType => mapping(uint256 => uint256)))) labafClearedAmountByAccountPartitionTypeAndId;
    // Freezes
    mapping(address => uint256) labafFrozenAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafFrozenAmountByAccountAndPartition;
}

library AdjustBalancesStorageWrapper {
    function updateAbaf(uint256 factor) internal {
        adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    function updateLabafByPartition(bytes32 partition) internal {
        adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    function pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    function updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    function setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    function setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    function setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    function setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    function setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function setClearedLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal {
        adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId] = _labaf;
    }

    function setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafClearing(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal {
        delete adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    function adjustBalances(uint256 _factor, uint8 _decimals) internal {
        SnapshotsStorageWrapper.updateDecimalsSnapshot();
        SnapshotsStorageWrapper.updateAbafSnapshot();
        SnapshotsStorageWrapper.updateAssetTotalSupplySnapshot();
        ERC20StorageWrapper.adjustTotalSupply(_factor);
        ERC20StorageWrapper.adjustDecimals(_decimals);
        CapStorageWrapper.adjustMaxSupply(_factor);
        updateAbaf(_factor);

        emit IAdjustBalances.AdjustmentBalanceSet(EvmAccessors.getMsgSender(), _factor, _decimals);
    }

    function adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal {
        uint256 abaf = getAbaf();
        uint256 labaf = getLabafByPartition(_partition);

        if (abaf == labaf) return;

        uint256 factor = calculateFactor(abaf, labaf);

        ERC1410StorageWrapper.adjustTotalSupplyByPartition(_partition, factor);
        CapStorageWrapper.adjustMaxSupplyByPartition(_partition, factor);
        updateLabafByPartition(_partition);
    }

    function getLabafByUser(address _account) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labaf[_account]);
    }

    function getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafByPartition[_partition]);
    }

    function getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        return
            getLabafByUserAndPartitionIndex(
                ERC1410StorageWrapper.erc1410BasicStorage().partitionToIndex[_account][_partition],
                _account
            );
    }

    function getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view returns (uint256) {
        return
            _partitionIndex == 0
                ? 1
                : zeroToOne(adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }

    function getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    function getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    function getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            );
    }

    function getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    function getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId]
            );
    }

    function getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    function getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    function getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getClearingLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                    _clearingOperationIdentifier.tokenHolder
                ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                        _clearingOperationIdentifier.clearingId
                    ]
            );
    }

    function calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUser(tokenHolder));
    }

    function calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    function calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalLockLabaf(tokenHolder));
    }

    function calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalFrozenLabaf(tokenHolder));
    }

    function calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalHeldLabaf(tokenHolder));
    }

    function calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalClearedLabaf(tokenHolder));
    }

    function totalSupplyAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return ERC1410StorageWrapper.totalSupply() * pendingABAF;
    }

    function totalSupplyByPartitionAdjustedAt(bytes32 _partition, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.totalSupplyByPartition(_partition) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByPartition(_partition));
    }

    function balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOf(_tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUser(_tokenHolder));
    }

    function balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOfByPartition(_partition, _tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUserAndPartition(_partition, _tokenHolder));
    }

    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(_timestamp);
    }

    function getAbaf() internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().abaf);
    }

    function getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingAbaf, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return getAbaf() * pendingAbaf;
    }

    function calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    function zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    function checkValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    function adjustBalancesStorage() internal pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }
}
