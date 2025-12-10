// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LocalContext } from "./context/LocalContext.sol";
import { IClearing } from "../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../layer_1/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../layer_1/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "./common/types/ThirdPartyType.sol";
import { IHold, Hold, HoldData, HoldIdentifier, OperationType, ProtectedHold } from "../layer_1/interfaces/hold/IHold.sol";
import { ISnapshotsStorageWrapper, Snapshots, PartitionSnapshots } from "../layer_1/interfaces/snapshots/ISnapshots.sol";

/**
 * @title Internals
 * @notice Abstract contract declaring all internal methods for layer_0 contracts
 */

// Struct definitions for snapshots
struct SnapshotsAddress {
    uint256[] ids;
    address[] values;
}

abstract contract Internals is LocalContext {
    // ===== AdjustBalances Methods =====
    function _updateAbaf(uint256 factor) internal virtual;
    function _updateLabafByPartition(bytes32 partition) internal virtual;
    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal virtual;
    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal virtual;
    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal virtual;
    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal virtual;
    function _removeLabafClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal virtual;
    function _setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal virtual;
    function _setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal virtual;
    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setClearedLabafById(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier, uint256 _labaf) internal virtual;
    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _updateLabafByTokenHolderAndPartitionIndex(uint256 labaf, address tokenHolder, uint256 partitionIndex) internal virtual;
    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal virtual;
    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _calculateFactorByAbafAndTokenHolder(uint256 abaf, address tokenHolder) internal view virtual returns (uint256 factor);
    function _calculateFactorByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view virtual returns (uint256);
    function _calculateFactorByTokenHolderAndPartitionIndex(uint256 abaf, address tokenHolder, uint256 partitionIndex) internal view virtual returns (uint256 factor);
    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(address tokenHolder, uint256 timestamp) internal view virtual returns (uint256 factor);
    function _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(address tokenHolder, uint256 timestamp) internal view virtual returns (uint256 factor);
    function _calculateFactorForHeldAmountByTokenHolderAdjustedAt(address tokenHolder, uint256 timestamp) internal view virtual returns (uint256 factor);
    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(address tokenHolder, uint256 timestamp) internal view virtual returns (uint256 factor);
    function _getAbaf() internal view virtual returns (uint256);
    function _getAbafAdjusted() internal view virtual returns (uint256);
    function _getAbafAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _getLabafByUser(address _account) internal view virtual returns (uint256);
    function _getLabafByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _getAllowanceLabaf(address _owner, address _spender) internal view virtual returns (uint256);
    function _getTotalLockLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view virtual returns (uint256);
    function _getTotalHeldLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getHoldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal view virtual returns (uint256);
    function _getTotalClearedLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getClearingLabafById(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal view virtual returns (uint256);
    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure virtual returns (uint256 factor_);

    // ===== Additional AdjustBalances Methods =====
    function _adjustBalances(uint256 _factor, uint8 _decimals) internal virtual;
    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal virtual;

    // ===== Cap Methods =====
    function _adjustMaxSupply(uint256 factor) internal virtual;
    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal virtual;
    function _getMaxSupply() internal view virtual returns (uint256);
    function _getMaxSupplyByPartition(bytes32 partition) internal view virtual returns (uint256);
    function _getMaxSupplyAdjusted() internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view virtual returns (uint256);
    function _getMaxSupplyByPartitionAdjusted(bytes32 _partition) internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view virtual returns (uint256);
    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure virtual returns (bool);

    // ===== Clearing Methods =====
    function _setClearing(bool _activated) internal virtual returns (bool success_);
    function _isClearingIdValid(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) internal view virtual returns (bool);
    function _isClearingActivated() internal view virtual returns (bool);
    function _getClearingCountForByPartition(bytes32 _partition, address _tokenHolder, IClearing.ClearingOperationType _clearingOperationType) internal view virtual returns (uint256);
    function _getClearingBasicInfo(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal view virtual returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_);
    function _getClearingsIdForByPartition(bytes32 _partition, address _tokenHolder, IClearing.ClearingOperationType _clearingOperationType, uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (uint256[] memory clearingsId_);
    function _getClearingThirdParty(bytes32 _partition, address _tokenHolder, IClearing.ClearingOperationType _operationType, uint256 _clearingId) internal view virtual returns (address thirdParty_);
    function _getClearingTransferForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) internal view virtual returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_);
    function _getClearingRedeemForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) internal view virtual returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_);
    function _getClearingHoldCreationForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) internal view virtual returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _getClearedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _buildClearingTransferData(uint256 _amount, uint256 _expirationTimestamp, address _to, bytes memory _data, bytes memory _operatorData, ThirdPartyType _operatorType) internal pure virtual returns (IClearingTransfer.ClearingTransferData memory);
    function _buildClearingRedeemData(uint256 _amount, uint256 _expirationTimestamp, bytes memory _data, bytes memory _operatorData, ThirdPartyType _operatorType) internal pure virtual returns (IClearingRedeem.ClearingRedeemData memory);
    function _buildClearingHoldCreationData(uint256 _amount, uint256 _expirationTimestamp, uint256 _holdExpirationTimestamp, bytes memory _data, bytes memory _holdData, address _escrow, address _to, bytes memory _operatorData, ThirdPartyType _operatorType) internal pure virtual returns (IClearingHoldCreation.ClearingHoldCreationData memory);
    function _buildClearingOperationIdentifier(address _from, bytes32 _partition, uint256 _clearingId, IClearing.ClearingOperationType _operationType) internal pure virtual returns (IClearing.ClearingOperationIdentifier memory);

    // ===== ControlList Methods =====
    function _addToControlList(address _account) internal virtual returns (bool success_);
    function _removeFromControlList(address _account) internal virtual returns (bool success_);
    function _getControlListType() internal view virtual returns (bool);
    function _getControlListCount() internal view virtual returns (uint256 controlListCount_);
    function _getControlListMembers(uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (address[] memory members_);
    function _isInControlList(address _account) internal view virtual returns (bool);
    function _isAbleToAccess(address _account) internal view virtual returns (bool);
    function _checkControlList(address _account) internal view virtual;

    // ===== AccessControl Methods =====
    function _grantRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _revokeRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _applyRoles(bytes32[] calldata _roles, bool[] calldata _actives, address _account) internal virtual returns (bool success_);
    function _getRoleAdmin(bytes32 _role) internal view virtual returns (bytes32);
    function _hasRole(bytes32 _role, address _account) internal view virtual returns (bool);
    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view virtual returns (bool);
    function _getRoleCountFor(address _account) internal view virtual returns (uint256 roleCount_);
    function _getRolesFor(address _account, uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (bytes32[] memory roles_);
    function _getRoleMemberCount(bytes32 _role) internal view virtual returns (uint256 memberCount_);
    function _getRoleMembers(bytes32 _role, uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (address[] memory members_);
    function _checkRole(bytes32 _role, address _account) internal view virtual;
    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view virtual;

    // ===== Hold Methods =====
    function _isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view virtual returns (bool);
    function _getHold(HoldIdentifier memory _holdIdentifier) internal view virtual returns (HoldData memory);
    function _getHeldAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHoldsIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (uint256[] memory holdsId_);
    function _getHoldForByPartition(HoldIdentifier calldata _holdIdentifier) internal view virtual returns (uint256 amount_, uint256 expirationTimestamp_, address escrow_, address destination_, bytes memory data_, bytes memory operatorData_, ThirdPartyType thirdPartType_);
    function _getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _isHoldExpired(Hold memory _hold) internal view virtual returns (bool);
    function _isEscrow(Hold memory _hold, address _escrow) internal pure virtual returns (bool);
    function _checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure virtual;
    function _createHoldByPartition(bytes32 _partition, address _from, Hold memory _hold, bytes memory _operatorData, ThirdPartyType _thirdPartyType) internal virtual returns (bool success_, uint256 holdId_);
    function _decreaseAllowedBalanceForHold(bytes32 _partition, address _from, uint256 _amount, uint256 _holdId) internal virtual;
    function _protectedCreateHoldByPartition(bytes32 _partition, address _from, ProtectedHold memory _protectedHold, bytes calldata _signature) internal virtual returns (bool success_, uint256 holdId_);
    function _executeHoldByPartition(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal virtual returns (bool success_);
    function _releaseHoldByPartition(HoldIdentifier calldata _holdIdentifier, uint256 _amount) internal virtual returns (bool success_);
    function _reclaimHoldByPartition(HoldIdentifier calldata _holdIdentifier) internal virtual returns (bool success_, uint256 amount_);
    function _operateHoldByPartition(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount, OperationType _operation) internal virtual returns (bool success_);
    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal virtual;
    function _decreaseHeldAmount(HoldIdentifier calldata _holdIdentifier, uint256 _amount) internal virtual returns (uint256 newHoldBalance_);
    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalHeldAmountAndLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _beforeHold(bytes32 _partition, address _tokenHolder) internal virtual;
    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _getHeldAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartitionAdjusted(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 amount_);

    // ===== Lock Methods =====
    function _getLockedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _getLockCountForByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 lockCount_);
    function _getLocksIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) internal view virtual returns (uint256[] memory locksId_);
    function _getLockForByPartition(bytes32 partition, address tokenHolder, uint256 lockId) internal view virtual returns (uint256 amount, uint256 expirationTimestamp);
    function _getLockForByPartitionAdjusted(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view virtual returns (uint256 amount_, uint256 expirationTimestamp_);
    function _getLockedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForAdjustedAt(address tokenHolder, uint256 timestamp) internal view virtual returns (uint256 amount_);
    function _getTotalBalanceForByPartitionAdjusted(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _getTotalBalanceForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view virtual returns (uint256);
    function _getTotalBalance(address _tokenHolder) internal view virtual returns (uint256);
    function _getLockedAmountForByPartitionAdjusted(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view virtual returns (uint256);
    function _getLockByIndex(bytes32 _partition, address _tokenHolder, uint256 _lockIndex) internal view virtual returns (uint256);
    function _isLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view virtual returns (bool);
    function _isLockIdValid(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view virtual returns (bool);
    function _lockByPartition(bytes32 _partition, uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) internal virtual returns (bool success_, uint256 lockId_);
    function _releaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) internal virtual returns (bool success_);
    function _updateTotalLock(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateLockByIndex(bytes32 _partition, uint256 _lockId, address _tokenHolder, uint256 _abaf) internal virtual;
    function _updateLockAmountById(bytes32 _partition, uint256 _lockId, address _tokenHolder, uint256 _factor) internal virtual;
    function _updateTotalLockedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalLockedAmountAndLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateLockedBalancesBeforeLock(bytes32 _partition, uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) internal virtual;
    function _updateLockedBalancesBeforeRelease(bytes32 _partition, uint256 _lockId, address _tokenHolder) internal virtual;

    // ===== Snapshots Methods =====
    function _takeSnapshot() internal virtual returns (uint256 snapshotID_);
    function _snapshot() internal virtual returns (uint256);
    function _getCurrentSnapshotId() internal view virtual returns (uint256);
    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view virtual returns (bool, uint256);
    function _lastSnapshotId(uint256[] storage ids) internal view virtual returns (uint256);
    function _updateTotalSupplySnapshot(bytes32 partition) internal virtual;
    function _updateTokenHolderSnapshot(address account) internal virtual;
    function _updateTotalTokenHolderSnapshot() internal virtual;
    function _getTotalBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view virtual returns (uint256);
    function _getTotalBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotId, address _tokenHolder) internal view virtual returns (uint256);
    function _totalTokenHoldersAt(uint256 snapshotId) internal view virtual returns (uint256);

    // ===== ERC3643 (Freezing/Agents/Recovery) Methods =====
    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal virtual;
    function _addAgent(address _agent) internal virtual;
    function _removeAgent(address _agent) internal virtual;
    function _setCompliance(address _compliance) internal virtual;
    function _setIdentityRegistry(address _identityRegistry) internal virtual;
    function _getFrozenAmountFor(address _userAddress) internal view virtual returns (uint256);
    function _getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view virtual returns (uint256);
    function _checkRecoveredAddress(address _sender) internal view virtual;
    function _isRecovered(address _sender) internal view virtual returns (bool);
    function _freezeTokens(address _account, uint256 _amount) internal virtual;
    function _unfreezeTokens(address _account, uint256 _amount) internal virtual;
    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _beforeFreeze(bytes32 _partition, address _tokenHolder) internal virtual;
    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalFreezeAmountAndLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _recoveryAddress(address _lostWallet, address _newWallet) internal virtual returns (bool);
    function _getFrozenAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForByPartitionAdjusted(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _canRecover(address _tokenHolder) internal view virtual returns (bool isEmpty_);

    // ===== Bond Methods =====
    function _addToCouponsOrderedList(uint256 _couponID) internal virtual;
    function _getCouponsOrderedListTotal() internal view virtual returns (uint256 total_);

    // ===== Scheduled Cross Ordered Task Methods =====

    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal virtual returns (uint256);
}
