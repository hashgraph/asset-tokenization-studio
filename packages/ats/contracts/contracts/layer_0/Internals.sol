// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Modifiers } from "./Modifiers.sol";
import { IClearing } from "../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../layer_1/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../layer_1/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "./common/types/ThirdPartyType.sol";
import {
    IHold,
    Hold,
    HoldData,
    HoldIdentifier,
    OperationType,
    ProtectedHold
} from "../layer_1/interfaces/hold/IHold.sol";
import {
    ISnapshotsStorageWrapper,
    Snapshots,
    PartitionSnapshots
} from "../layer_1/interfaces/snapshots/ISnapshots.sol";
import { ILock } from "../layer_1/interfaces/lock/ILock.sol";
import { ISecurity } from "../layer_3/interfaces/ISecurity.sol";
import { IBondRead } from "../layer_2/interfaces/bond/IBondRead.sol";
import { RegulationData, AdditionalSecurityData } from "../layer_3/constants/regulation.sol";
import { ICap } from "contracts/layer_1/interfaces/cap/ICap.sol";
import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from "../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol";
/**
 * @title Internals
 * @notice Abstract contract declaring all internal methods for layer_0 contracts
 */

abstract contract Internals is Modifiers {
    // ===== AdjustBalances Methods =====
    function _updateAbaf(uint256 factor) internal virtual;
    function _updateLabafByPartition(bytes32 partition) internal virtual;
    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal virtual;
    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal virtual;
    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal virtual;
    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal virtual;
    function _removeLabafClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal virtual;
    function _setLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setHeldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal virtual;
    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _labaf
    ) internal virtual;
    function _updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal virtual;
    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal virtual;
    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view virtual returns (uint256);
    function _calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _getAbaf() internal view virtual returns (uint256);
    function _getAbafAdjusted() internal view virtual returns (uint256);
    function _getAbafAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _getLabafByUser(address _account) internal view virtual returns (uint256);
    function _getLabafByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _getAllowanceLabaf(address _owner, address _spender) internal view virtual returns (uint256);
    function _getTotalLockLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalLockLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (uint256);
    function _getTotalHeldLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalHeldLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view virtual returns (uint256);
    function _getHoldLabafByPartition(
        bytes32 _partition,
        uint256 _holdId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalClearedLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (uint256);
    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure virtual returns (uint256 factor_);
    function _getLabafByUserAndPartition(bytes32 _partition, address _account) internal view virtual returns (uint256);

    // ===== Additional AdjustBalances Methods =====
    function _adjustBalances(uint256 _factor, uint8 _decimals) internal virtual;
    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal virtual;

    // ===== ERC1410 Methods =====
    function _beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal virtual;
    function _addPartitionTo(uint256 _value, address _account, bytes32 _partition) internal virtual;
    function _afterTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal virtual;

    // ===== Cap Methods =====
    function _initialize_Cap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal virtual;
    function _setMaxSupply(uint256 _maxSupply) internal virtual;
    function _setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) internal virtual;
    function _adjustMaxSupply(uint256 factor) internal virtual;
    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal virtual;
    function _getMaxSupply() internal view virtual returns (uint256);
    function _getMaxSupplyByPartition(bytes32 partition) internal view virtual returns (uint256);
    function _getMaxSupplyAdjusted() internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view virtual returns (uint256);
    function _getMaxSupplyByPartitionAdjusted(bytes32 _partition) internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view virtual returns (uint256);
    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure virtual returns (bool);
    function _isCapInitialized() internal view virtual returns (bool);

    // ===== Clearing Methods =====
    function _clearingStorage() internal pure virtual returns (IClearing.ClearingDataStorage storage clearing_);
    function _getClearingLabafByPartition(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (uint256);
    function _approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_, bytes memory operationData_);
    function _cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
    function _reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
    function _clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _checkExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view virtual;
    function _checkExpirationTimestamp(uint256 _expirationTimestamp) internal view virtual;
    function _checkUnProtectedPartitionsOrWildCardRole() internal view virtual;
    function _decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) internal virtual;
    function _checkOperator(bytes32 _partition, address _from) internal view virtual;
    function _getClearingHoldCreationForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _getClearingRedeemForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingRedeemData memory clearingRedeemData_);
    function _clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _checkValidAddress(address account) internal pure virtual;
    function _protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _getClearingTransferForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_);

    function _checkCompliance(address _from, address _to, bool _checkSender) internal view virtual;

    function _checkIdentity(address _from, address _to) internal view virtual;
    function _setClearing(bool _activated) internal virtual returns (bool success_);
    function _isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view virtual returns (bool);
    function _isClearingActivated() internal view virtual returns (bool);
    function _getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal view virtual returns (uint256);
    function _getClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_);
    function _getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory clearingsId_);
    function _getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId
    ) internal view virtual returns (address thirdParty_);
    function _getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_);
    function _getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_);
    function _getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _getClearedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _buildClearingTransferData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _to,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure virtual returns (IClearingTransfer.ClearingTransferData memory);
    function _buildClearingRedeemData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure virtual returns (IClearingRedeem.ClearingRedeemData memory);
    function _buildClearingHoldCreationData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        uint256 _holdExpirationTimestamp,
        bytes memory _data,
        bytes memory _holdData,
        address _escrow,
        address _to,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure virtual returns (IClearingHoldCreation.ClearingHoldCreationData memory);
    function _buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal pure virtual returns (IClearing.ClearingOperationIdentifier memory);
    function _isClearingInitialized() internal view virtual returns (bool);

    // ===== ControlList Methods =====
    function _addToControlList(address _account) internal virtual returns (bool success_);
    function _removeFromControlList(address _account) internal virtual returns (bool success_);
    function _getControlListType() internal view virtual returns (bool);
    function _getControlListCount() internal view virtual returns (uint256 controlListCount_);
    function _getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _isInControlList(address _account) internal view virtual returns (bool);
    function _isAbleToAccess(address _account) internal view virtual returns (bool);
    function _checkControlList(address _account) internal view virtual;
    function _isControlListInitialized() internal view virtual returns (bool);
    function _initialize_ControlList(bool _isWhiteList) internal virtual;

    // ===== AccessControl Methods =====
    function _grantRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _revokeRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal virtual returns (bool success_);
    function _getRoleAdmin(bytes32 _role) internal view virtual returns (bytes32);
    function _hasRole(bytes32 _role, address _account) internal view virtual returns (bool);
    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view virtual returns (bool);
    function _getRoleCountFor(address _account) internal view virtual returns (uint256 roleCount_);
    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory roles_);
    function _getRoleMemberCount(bytes32 _role) internal view virtual returns (uint256 memberCount_);
    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _checkRole(bytes32 _role, address _account) internal view virtual;
    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view virtual;

    // ===== Hold Methods =====

    // ===== CorporateActions Methods =====
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal virtual returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_);

    function _updateCorporateActionData(bytes32 _actionId, bytes memory _newData) internal virtual;

    function _updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal virtual;

    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view virtual returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_);

    function _getCorporateActionCount() internal view virtual returns (uint256 corporateActionCount_);

    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_);

    function _getCorporateActionCountByType(
        bytes32 _actionType
    ) internal view virtual returns (uint256 corporateActionCount_);

    function _getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view virtual returns (bytes32 corporateActionId_);

    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_);

    function _getCorporateActionResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view virtual returns (bytes memory result_);

    function _getCorporateActionResultCount(bytes32 actionId) internal view virtual returns (uint256);

    function _getCorporateActionData(bytes32 actionId) internal view virtual returns (bytes memory);

    function _getUintResultAt(bytes32 _actionId, uint256 resultId) internal view virtual returns (uint256);

    function _corporateActionsStorage()
        internal
        pure
        virtual
        returns (CorporateActionDataStorage storage corporateActions_);
    function _isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view virtual returns (bool);
    function _getHold(HoldIdentifier memory _holdIdentifier) internal view virtual returns (HoldData memory);
    function _getHeldAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory holdsId_);
    function _getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
        virtual
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        );
    function _getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _isHoldExpired(Hold memory _hold) internal view virtual returns (bool);
    function _isEscrow(Hold memory _hold, address _escrow) internal pure virtual returns (bool);
    function _checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure virtual;
    function _createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal virtual;
    function _protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal virtual returns (bool success_);
    function _releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (bool success_);
    function _reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal virtual returns (bool success_, uint256 amount_);
    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal virtual returns (bool success_);
    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal virtual;
    function _decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (uint256 newHoldBalance_);
    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _beforeHold(bytes32 _partition, address _tokenHolder) internal virtual;
    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _getHeldAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);

    // ===== Lock Methods =====
    function _getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 lockCount_);
    function _getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory locksId_);
    function _getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view virtual returns (uint256 amount, uint256 expirationTimestamp);
    function _getLockForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (uint256 amount_, uint256 expirationTimestamp_);
    function _getLockedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _getTotalBalance(address _tokenHolder) internal view virtual returns (uint256);
    function _getLockedAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getLock(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (ILock.LockData memory);
    function _getLockByIndex(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockIndex
    ) internal view virtual returns (ILock.LockData memory);
    function _isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
    function _isLockIdValid(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal virtual returns (bool success_, uint256 lockId_);
    function _releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal virtual returns (bool success_);
    function _updateTotalLock(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateLockByIndex(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _abaf
    ) internal virtual;
    function _updateLockAmountById(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _factor
    ) internal virtual;
    function _updateTotalLockedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalLockedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateLockedBalancesBeforeLock(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal virtual;
    function _updateLockedBalancesBeforeRelease(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal virtual;

    // ===== Snapshots Methods =====
    function _takeSnapshot() internal virtual returns (uint256 snapshotID_);
    function _snapshot() internal virtual returns (uint256);
    function _getCurrentSnapshotId() internal view virtual returns (uint256);
    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view virtual returns (bool, uint256);
    function _lastSnapshotId(uint256[] storage ids) internal view virtual returns (uint256);
    function _updateTotalSupplySnapshot(bytes32 partition) internal virtual;
    function _updateTokenHolderSnapshot(address account) internal virtual;
    function _updateTotalTokenHolderSnapshot() internal virtual;
    function _updateAccountSnapshot(address account, bytes32 partition) internal virtual;
    function _getTotalBalanceOfAtSnapshot(
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _totalTokenHoldersAt(uint256 snapshotId) internal view virtual returns (uint256);

    // ===== ERC3643 (Freezing/Agents/Recovery) Methods =====
    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal virtual;
    function _addAgent(address _agent) internal virtual;
    function _removeAgent(address _agent) internal virtual;
    function _setCompliance(address _compliance) internal virtual;
    function _setIdentityRegistry(address _identityRegistry) internal virtual;
    function _getFrozenAmountFor(address _userAddress) internal view virtual returns (uint256);
    function _getFrozenAmountForByPartition(
        bytes32 _partition,
        address _userAddress
    ) internal view virtual returns (uint256);
    function _checkRecoveredAddress(address _sender) internal view virtual;
    function _isRecovered(address _sender) internal view virtual returns (bool);
    function _freezeTokens(address _account, uint256 _amount) internal virtual;
    function _unfreezeTokens(address _account, uint256 _amount) internal virtual;
    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _beforeFreeze(bytes32 _partition, address _tokenHolder) internal virtual;
    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _recoveryAddress(address _lostWallet, address _newWallet) internal virtual returns (bool);
    function _getFrozenAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _canRecover(address _tokenHolder) internal view virtual returns (bool isEmpty_);

    // ===== Bond Methods =====
    function _addToCouponsOrderedList(uint256 _couponID) internal virtual;
    function _getCouponsOrderedListTotal() internal view virtual returns (uint256 total_);
    function _getBondDetails() internal view virtual returns (IBondRead.BondDetailsData memory bondDetails_);
    function _getCoupon(
        uint256 _couponID
    ) internal view virtual returns (IBondRead.RegisteredCoupon memory registeredCoupon_);
    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponFor memory couponFor_);
    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponAmountFor memory couponAmountFor_);
    function _getPrincipalFor(
        address _account
    ) internal view virtual returns (IBondRead.PrincipalFor memory principalFor_);
    function _getCouponCount() internal view virtual returns (uint256 couponCount_);
    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getTotalCouponHolders(uint256 _couponID) internal view virtual returns (uint256);
    function _getCouponFromOrderedListAt(uint256 _pos) internal view virtual returns (uint256 couponID_);
    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory couponIDs_);
    function _getCouponsOrderedListTotalAdjusted() internal view virtual returns (uint256 total_);
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual returns (bytes32 corporateActionId_, uint256 couponID_);
    function _setMaturityDate(uint256 _maturityDate) internal virtual returns (bool success_);
    function _getMaturityDate() internal view virtual returns (uint256 maturityDate_);
    function _initialize_bond(IBondRead.BondDetailsData calldata _bondDetailsData) internal virtual;
    function _isBondInitialized() internal view virtual returns (bool);

    // ===== ERC1410 Methods =====
    function _partitionsOf(address _tokenHolder) internal view virtual returns (bytes32[] memory);
    function _balanceOfByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;

    // ===== Security Methods =====
    function _getTokenHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getTotalTokenHolders() internal view virtual returns (uint256);
    function _getSecurityRegulationData() internal pure virtual returns (ISecurity.SecurityRegulationData memory);
    function _initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal virtual;

    // ===== Scheduled Cross Ordered Task Methods =====

    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal virtual returns (uint256);

    function _protectedPartitionsRole(bytes32 _partition) internal pure virtual returns (bytes32);

    function _protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
}
