// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { CapStorageWrapper } from "../core/CapStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAdjustBalances } from "../../facets/layer_2/adjustBalance/IAdjustBalances.sol";

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
    // --- INTERNAL STATE-CHANGING FUNCTIONS ---

    // --- ABAF core functions ---

    function updateAbaf(uint256 factor) internal {
        _adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    // --- LABAF by user ---

    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        _adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    // --- LABAF by partition ---

    function updateLabafByPartition(bytes32 partition) internal {
        _adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    // --- LABAF by user and partition ---

    function pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        _adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    // --- Allowance LABAF ---

    function updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        _adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    // --- Lock LABAF ---

    function setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    function setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    // --- Hold LABAF ---

    function setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    function setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    // --- Freeze LABAF ---

    function setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    // --- Clearing LABAF ---

    function setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ] = _labaf;
    }

    function setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    function setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    function removeLabafClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        delete _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    // --- Balance adjustment operations (from AdjustBalancesStorageWrapper2) ---

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

    // --- INTERNAL VIEW FUNCTIONS ---

    function getLabafByUser(address _account) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labaf[_account]);
    }

    function getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafByPartition[_partition]);
    }

    function getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        uint256 partitionsIndex = ERC1410StorageWrapper.erc1410BasicStorage().partitionToIndex[_account][_partition];
        if (partitionsIndex == 0) return 1;
        return zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][partitionsIndex - 1]);
    }

    function getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view returns (uint256) {
        if (_partitionIndex == 0) return 1;
        return zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }

    function getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    function getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    function getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            );
    }

    function getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    function getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId]
            );
    }

    function getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    function getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    function getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    function getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                    _clearingOperationIdentifier.tokenHolder
                ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                        _clearingOperationIdentifier.clearingId
                    ]
            );
    }

    // --- Factor calculation helpers ---

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
        uint256 factor = calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByPartition(_partition));
        return ERC1410StorageWrapper.totalSupplyByPartition(_partition) * factor;
    }

    function balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        uint256 factor = calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUser(_tokenHolder));
        return ERC1410StorageWrapper.balanceOf(_tokenHolder) * factor;
    }

    function balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = calculateFactor(
            getAbafAdjustedAt(_timestamp),
            getLabafByUserAndPartition(_partition, _tokenHolder)
        );
        return ERC1410StorageWrapper.balanceOfByPartition(_partition, _tokenHolder) * factor;
    }

    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(_timestamp);
    }

    function getAbaf() internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().abaf);
    }

    function getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        uint256 abaf = getAbaf();
        (uint256 pendingAbaf, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return abaf * pendingAbaf;
    }

    // --- INTERNAL PURE FUNCTIONS ---

    function calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    function zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    function requireValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    function _adjustBalancesStorage() internal pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }
}
