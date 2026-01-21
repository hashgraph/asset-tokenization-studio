// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Modifiers } from "./Modifiers.sol";
import { CheckpointsLib } from "./common/libraries/CheckpointsLib.sol";
import { IClearing } from "../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../layer_1/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../layer_1/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "./common/types/ThirdPartyType.sol";
import { Hold, HoldData, HoldIdentifier, OperationType, ProtectedHold } from "../layer_1/interfaces/hold/IHold.sol";
import { Snapshots, PartitionSnapshots, SnapshotsAddress } from "../layer_1/interfaces/snapshots/ISnapshots.sol";
import { ILock } from "../layer_1/interfaces/lock/ILock.sol";
import { ISecurity } from "../layer_3/interfaces/ISecurity.sol";
import { IBondRead } from "../layer_2/interfaces/bond/IBondRead.sol";
import { RegulationData, AdditionalSecurityData } from "../layer_3/constants/regulation.sol";
import { ICap } from "../layer_1/interfaces/cap/ICap.sol";
import { IERC20 } from "../layer_1/interfaces/ERC1400/IERC20.sol";
import { IEquity } from "../layer_2/interfaces/equity/IEquity.sol";
import { IKpiLinkedRate } from "../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { IKyc } from "../layer_1/interfaces/kyc/IKyc.sol";
import { ITransferAndLock } from "../layer_3/interfaces/ITransferAndLock.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IssueData, OperatorTransferData, BasicTransferInfo } from "../layer_1/interfaces/ERC1400/IERC1410.sol";
import { IIdentityRegistry } from "../layer_1/interfaces/ERC3643/IIdentityRegistry.sol";
import { ICompliance } from "../layer_1/interfaces/ERC3643/ICompliance.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

abstract contract Internals is Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function _CLOCK_MODE() internal view virtual returns (string memory);
    // solhint-disable-next-line func-name-mixedcase
    function _DOMAIN_SEPARATOR() internal view virtual returns (bytes32);
    function _abafAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint256 abaf_);
    function _add(uint256 a, uint256 b) internal pure virtual returns (uint256);
    function _addAgent(address _agent) internal virtual;
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal virtual returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_);
    function _addExternalList(bytes32 _position, address _list) internal virtual returns (bool success_);
    function _addIssuer(address _issuer) internal virtual returns (bool success_);
    function _addNewTokenHolder(address tokenHolder) internal virtual;
    function _addPartitionTo(uint256 _value, address _account, bytes32 _partition) internal virtual;
    function _addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal virtual;
    function _addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes memory _newData) internal virtual;
    function _addToControlList(address _account) internal virtual returns (bool success_);
    function _addToCouponsOrderedList(uint256 _couponID) internal virtual;
    function _addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view virtual returns (bool, address);
    function _adjustBalances(uint256 _factor, uint8 _decimals) internal virtual;
    function _adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal virtual;
    function _adjustDecimals(uint8 decimals) internal virtual;
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _adjustMaxSupply(uint256 factor) internal virtual;
    function _adjustMaxSupplyByPartition(bytes32 partition, uint256 factor) internal virtual;
    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal virtual;
    function _adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal virtual;
    function _adjustTotalSupply(uint256 factor) internal virtual;
    function _adjustTotalSupplyByPartition(bytes32 _partition, uint256 _factor) internal virtual;
    function _afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) internal virtual;
    function _allowance(address _owner, address _spender) internal view virtual returns (uint256);
    function _allowanceAdjusted(address _owner, address _spender) internal view virtual returns (uint256);
    function _allowanceAdjustedAt(
        address _owner,
        address _spender,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal virtual returns (bool success_);
    function _approve(address owner, address spender, uint256 value) internal virtual returns (bool);
    function _approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_, bytes memory operationData_, bytes32 partition_);
    function _arePartitionsProtected() internal view virtual returns (bool);
    function _authorizeOperator(address _operator) internal virtual;
    function _authorizeOperatorByPartition(bytes32 _partition, address _operator) internal virtual;
    function _balanceOf(address _tokenHolder) internal view virtual returns (uint256);
    function _balanceOfAdjusted(address _tokenHolder) internal view virtual returns (uint256);
    function _balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view virtual returns (uint256);
    function _balanceOfAt(address _tokenHolder, uint256 _snapshotId) internal view virtual returns (uint256);
    function _balanceOfAtAdjusted(
        uint256 _snapshotId,
        Snapshots storage _snapshots,
        uint256 _currentBalanceAdjusted
    ) internal view virtual returns (uint256);
    function _balanceOfAtByPartition(
        bytes32 _partition,
        address account,
        uint256 snapshotId
    ) internal view virtual returns (uint256);
    function _balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _balanceOfByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _balanceOfByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _beforeAllowanceUpdate(address _owner, address _spender) internal virtual;
    function _beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal virtual;
    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _beforeFreeze(bytes32 _partition, address _tokenHolder) internal virtual;
    function _beforeHold(bytes32 _partition, address _tokenHolder) internal virtual;
    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _beforeTokenTransfer(bytes32 partition, address from, address to, uint256 amount) internal virtual;
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
    ) internal pure virtual returns (IClearing.ClearingHoldCreationData memory);
    function _buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal pure virtual returns (IClearing.ClearingOperationIdentifier memory);
    function _buildClearingRedeemData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure virtual returns (IClearing.ClearingRedeemData memory);
    function _buildClearingTransferData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _to,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure virtual returns (IClearing.ClearingTransferData memory);
    function _burn(address from, uint256 value) internal virtual;
    function _burnFrom(address account, uint256 value) internal virtual;
    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure virtual returns (uint256 factor_);
    function _calculateFactorBetween(uint256 _fromBlock, uint256 _toBlock) internal view virtual returns (uint256);
    function _calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(
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
    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateRoleForPartition(bytes32 partition) internal pure virtual returns (bytes32 role);
    function _canRecover(address _tokenHolder) internal view virtual returns (bool isEmpty_);
    function _cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view virtual;
    function _checkCanRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) internal view virtual;
    function _checkCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view virtual;
    function _checkClearingCreateHoldSignature(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view virtual;
    function _checkClearingRedeemSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view virtual;
    function _checkClearingTransferSignature(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal view virtual;
    function _checkCompliance(address _from, address _to, bool _checkSender) internal view virtual;
    function _checkControlList(address _account) internal view virtual;
    function _checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view virtual;
    function _checkDefaultPartitionWithSinglePartition(bytes32 _partition) internal view virtual;
    function _checkExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view virtual;
    function _checkExpirationTimestamp(uint256 _expirationTimestamp) internal view virtual;
    function _checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure virtual;
    function _checkIdentity(address _from, address _to) internal view virtual;
    function _checkInputAmountsArrayLength(
        address[] memory _addresses,
        uint256[] memory _amounts
    ) internal pure virtual;
    function _checkInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure virtual;
    function _checkNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) internal view virtual;
    function _checkOperator(bytes32 _partition, address _from) internal view virtual;
    function _checkProtectedPartitions() internal view virtual;
    function _checkRecoveredAddress(address _sender) internal view virtual;
    function _checkRedeemSignature(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual;
    function _checkRole(bytes32 _role, address _account) internal view virtual;
    function _checkRoleForPartition(bytes32 partition, address account) internal view virtual;
    function _checkTransferSignature(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual;
    function _checkUnProtectedPartitionsOrWildCardRole() internal view virtual;
    function _checkUnpaused() internal view virtual;
    function _checkValidAddress(address account) internal pure virtual;
    function _checkValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view virtual;
    function _checkWithinMaxSupply(uint256 _amount) internal view virtual;
    function _checkpoints(
        address account,
        uint256 pos
    ) internal view virtual returns (CheckpointsLib.Checkpoint memory);
    function _clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _clock() internal view virtual returns (uint48);
    function _controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _decimals() internal view virtual returns (uint8);
    function _decimalsAdjusted() internal view virtual returns (uint8);
    function _decimalsAdjustedAt(uint256 _timestamp) internal view virtual returns (uint8);
    function _decimalsAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint8 decimals_);
    function _decreaseAllowance(address spender, uint256 subtractedValue) internal virtual returns (bool);
    function _decreaseAllowedBalance(address from, address spender, uint256 value) internal virtual;
    function _decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) internal virtual;
    function _decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal virtual;
    function _decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (uint256 newHoldBalance_);
    function _delegate(address delegatee) internal virtual;
    function _delegate(address delegator, address delegatee) internal virtual;
    function _delegates(address account) internal view virtual returns (address);
    function _deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal virtual;
    function _executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal virtual returns (bool success_, bytes32 partition_);
    function _finalizeControllable() internal virtual;
    function _freezeTokens(address _account, uint256 _amount) internal virtual;
    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _getAbaf() internal view virtual returns (uint256);
    function _getAbafAdjusted() internal view virtual returns (uint256);
    function _getAbafAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _getAllowanceLabaf(address _owner, address _spender) internal view virtual returns (uint256);
    function _getBondDetails() internal view virtual returns (IBondRead.BondDetailsData memory bondDetails_);
    function _getClearedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_);
    function _getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal view virtual returns (uint256);
    function _getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _getClearingHoldCreationForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (uint256);
    function _getClearingLabafByPartition(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (uint256);
    function _getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_);
    function _getClearingRedeemForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingRedeemData memory clearingRedeemData_);
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
    function _getClearingTransferForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_);
    function _getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory clearingsId_);
    function _getControlListCount() internal view virtual returns (uint256 controlListCount_);
    function _getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getControlListType() internal view virtual returns (bool);
    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view virtual returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_);
    function _getCorporateActionCount() internal view virtual returns (uint256 corporateActionCount_);
    function _getCorporateActionCountByType(
        bytes32 _actionType
    ) internal view virtual returns (uint256 corporateActionCount_);
    function _getCorporateActionData(bytes32 actionId) internal view virtual returns (bytes memory);
    function _getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view virtual returns (bytes32 corporateActionId_);
    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_);
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
    function _getCoupon(
        uint256 _couponID
    ) internal view virtual returns (IBondRead.RegisteredCoupon memory registeredCoupon_);
    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponAmountFor memory couponAmountFor_);
    function _getCouponCount() internal view virtual returns (uint256 couponCount_);
    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view virtual returns (IBondRead.CouponFor memory couponFor_);
    function _getCouponFromOrderedListAt(uint256 _pos) internal view virtual returns (uint256 couponID_);
    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory couponIDs_);
    function _getCouponsOrderedListTotal() internal view virtual returns (uint256 total_);
    function _getCouponsOrderedListTotalAdjusted() internal view virtual returns (uint256 total_);
    function _getCurrentSnapshotId() internal view virtual returns (uint256);
    function _getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) internal view virtual returns (IEquity.DividendAmountFor memory dividendAmountFor_);
    function _getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getDividends(
        uint256 _dividendID
    ) internal view virtual returns (IEquity.RegisteredDividend memory registeredDividend_);
    function _getDividendsCount() internal view virtual returns (uint256 dividendCount_);
    function _getDividendsFor(
        uint256 _dividendID,
        address _account
    ) internal view virtual returns (IEquity.DividendFor memory dividendFor_);
    function _getERC20Metadata() internal view virtual returns (IERC20.ERC20Metadata memory erc20Metadata_);
    function _getERC20MetadataAdjusted() internal view virtual returns (IERC20.ERC20Metadata memory erc20Metadata_);
    function _getERC20MetadataAdjustedAt(
        uint256 _timestamp
    ) internal view virtual returns (IERC20.ERC20Metadata memory erc20Metadata_);
    function _getEquityDetails() internal view virtual returns (IEquity.EquityDetailsData memory equityDetails_);
    function _getExternalListsCount(bytes32 _position) internal view virtual returns (uint256 count_);
    function _getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getFrozenAmountFor(address _userAddress) internal view virtual returns (uint256);
    function _getFrozenAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForByPartition(
        bytes32 _partition,
        address _userAddress
    ) internal view virtual returns (uint256);
    function _getFrozenAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getHeldAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForAdjusted(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getHold(HoldIdentifier memory _holdIdentifier) internal view virtual returns (HoldData memory);
    function _getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
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
    function _getHoldForByPartitionAdjusted(
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
    function _getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) internal view virtual returns (address thirdParty_);
    function _getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory holdsId_);
    function _getImpactData() internal view virtual returns (IKpiLinkedRate.ImpactData memory impactData_);
    function _getInterestRate() internal view virtual returns (IKpiLinkedRate.InterestRate memory interestRate_);
    function _getIssuerListCount() internal view virtual returns (uint256 issuerListCount_);
    function _getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getKpiOracle() internal view virtual returns (address kpiOracle_);
    function _getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view virtual returns (uint256 kycAccountsCount_);
    function _getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory accounts_, IKyc.KycData[] memory kycData_);
    function _getKycFor(address _account) internal view virtual returns (IKyc.KycData memory);
    function _getKycStatusFor(address _account) internal view virtual returns (IKyc.KycStatus kycStatus_);
    function _getLabafByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _getLabafByUser(address _account) internal view virtual returns (uint256);
    function _getLabafByUserAndPartition(bytes32 _partition, address _account) internal view virtual returns (uint256);
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
    function _getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 lockCount_);
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
    function _getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (uint256);
    function _getLockedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getLockedAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory locksId_);
    function _getMaturityDate() internal view virtual returns (uint256 maturityDate_);
    function _getMaxSupply() internal view virtual returns (uint256);
    function _getMaxSupplyAdjusted() internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyAdjustedAt(uint256 timestamp) internal view virtual returns (uint256);
    function _getMaxSupplyByPartition(bytes32 partition) internal view virtual returns (uint256);
    function _getMaxSupplyByPartitionAdjusted(bytes32 _partition) internal view virtual returns (uint256 maxSupply_);
    function _getMaxSupplyByPartitionAdjustedAt(
        bytes32 partition,
        uint256 timestamp
    ) internal view virtual returns (uint256);
    function _getNounceFor(address _account) internal view virtual returns (uint256);
    function _getOnchainID() internal view virtual returns (address);
    function _getPastTotalSupply(uint256 timepoint) internal view virtual returns (uint256);
    function _getPastVotes(address account, uint256 timepoint) internal view virtual returns (uint256);
    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view virtual returns (uint256 pendingABAF_, uint8 pendingDecimals_);
    function _getPendingScheduledCouponListingTotalAt(
        uint256 _timestamp
    ) internal view virtual returns (uint256 total_);
    function _getPrincipalFor(
        address _account
    ) internal view virtual returns (IBondRead.PrincipalFor memory principalFor_);
    function _getProceedRecipientData(address _proceedRecipient) internal view virtual returns (bytes memory);
    function _getProceedRecipientsCount() internal view virtual returns (uint256);
    function _getRate() internal view virtual returns (uint256 rate_, uint8 decimals_);
    function _getRevocationRegistryAddress() internal view virtual returns (address revocationRegistryAddress_);
    function _getRoleAdmin(bytes32 _role) internal view virtual returns (bytes32);
    function _getRoleCountFor(address _account) internal view virtual returns (uint256 roleCount_);
    function _getRoleMemberCount(bytes32 _role) internal view virtual returns (uint256 memberCount_);
    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory roles_);
    function _getSPTImpactDataFor(
        address _project
    ) internal view virtual returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_);
    function _getSPTInterestRate()
        internal
        view
        virtual
        returns (ISustainabilityPerformanceTargetRate.InterestRate memory interestRate_);
    function _getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) internal view virtual returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_);
    function _getScheduledBalanceAdjustmentCount() internal view virtual returns (uint256);
    function _getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledBalanceAdjustment_);
    function _getScheduledBalanceAdjustmentsCount() internal view virtual returns (uint256 balanceAdjustmentCount_);
    function _getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledCouponListing_);
    function _getScheduledCouponListingCount() internal view virtual returns (uint256);
    function _getScheduledCouponListingIdAtIndex(uint256 _index) internal view virtual returns (uint256 couponID_);
    function _getScheduledCrossOrderedTaskCount() internal view virtual returns (uint256);
    function _getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledTask_);
    function _getScheduledSnapshotCount() internal view virtual returns (uint256);
    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledSnapshot_);
    function _getSecurityRegulationData()
        internal
        pure
        virtual
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_);
    function _getSnapshotBalanceForIfDateReached(
        uint256 _date,
        uint256 _snapshotId,
        address _account
    ) internal view virtual returns (uint256 balance_, uint8 decimals_, bool dateReached_);
    function _getTokenHolder(uint256 _index) internal view virtual returns (address);
    function _getTokenHolderIndex(address _tokenHolder) internal view virtual returns (uint256);
    function _getTokenHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getTotalBalance(address _tokenHolder) internal view virtual returns (uint256 totalBalance);
    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 totalBalance);
    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalBalanceOfAtSnapshot(
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotId,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getTotalClearedLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getTotalCouponHolders(uint256 _couponID) internal view virtual returns (uint256);
    function _getTotalDividendHolders(uint256 _dividendID) internal view virtual returns (uint256);
    function _getTotalFrozenLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getTotalHeldLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalHeldLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getTotalLockLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalLockLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _getTotalTokenHolders() internal view virtual returns (uint256);
    function _getTotalVotingHolders(uint256 _voteID) internal view virtual returns (uint256);
    function _getUintResultAt(bytes32 _actionId, uint256 resultId) internal view virtual returns (uint256);
    function _actionContentHashExists(bytes32 _contentHash) internal view virtual returns (bool);
    function _getVotes(address account) internal view virtual returns (uint256);
    function _getVotesAdjusted(
        uint256 timepoint,
        CheckpointsLib.Checkpoint[] storage ckpts
    ) internal view virtual returns (uint256);
    function _getVoting(
        uint256 _voteID
    ) internal view virtual returns (IEquity.RegisteredVoting memory registeredVoting_);
    function _getVotingCount() internal view virtual returns (uint256 votingCount_);
    function _getVotingFor(
        uint256 _voteID,
        address _account
    ) internal view virtual returns (IEquity.VotingFor memory votingFor_);
    function _getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal virtual returns (bool success_);
    function _grantRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view virtual returns (bool);
    function _hasRole(bytes32 _role, address _account) internal view virtual returns (bool);
    function _heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _increaseAllowance(address spender, uint256 addedValue) internal virtual returns (bool);
    function _increaseAllowedBalance(address from, address spender, uint256 value) internal virtual;
    function _increaseBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal virtual;
    function _increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal virtual;
    function _increaseTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal virtual;
    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view virtual returns (bool, uint256);
    function _initBalanceAdjustment(bytes32 _actionId, bytes memory _data) internal virtual;
    function _initCoupon(bytes32 _actionId, IBondRead.Coupon memory _newCoupon) internal virtual;
    function _initDividend(bytes32 _actionId, bytes memory _data) internal virtual;
    function _initVotingRights(bytes32 _actionId, bytes memory _data) internal virtual;
    function _initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_Cap(uint256 maxSupply, ICap.PartitionCap[] calldata partitionCap) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ControlList(bool _isWhiteList) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1594() internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20Permit() internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20Votes(bool _activated) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC3643(address _compliance, address _identityRegistry) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(IBondRead.BondDetailsData calldata _bondDetailsData) internal virtual;
    function _isAbleToAccess(address _account) internal view virtual returns (bool);
    function _isAbleToRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        virtual
        returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details);
    function _isAbleToTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        virtual
        returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details);
    function _isActivated() internal view virtual returns (bool);
    function _isAuthorized(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool);
    function _isBondInitialized() internal view virtual returns (bool);
    function _isCapInitialized() internal view virtual returns (bool);
    function _isClearingActivated() internal view virtual returns (bool);
    function _isClearingCreateHoldSignatureValid(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold memory _hold,
        bytes calldata _signature
    ) internal view virtual returns (bool);
    function _isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view virtual returns (bool);
    function _isClearingInitialized() internal view virtual returns (bool);
    function _isClearingRedeemSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal view virtual returns (bool);
    function _isClearingTransferSignatureValid(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        address _to,
        uint256 _amount,
        bytes calldata _signature
    ) internal view virtual returns (bool);
    function _isControlListInitialized() internal view virtual returns (bool);
    function _isControllable() internal view virtual returns (bool);
    function _isCorrectMaxSupply(uint256 _amount, uint256 _maxSupply) internal pure virtual returns (bool);
    function _isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view virtual returns (bool);
    function _isERC20Initialized() internal view virtual returns (bool);
    function _isERC20PermitInitialized() internal view virtual returns (bool);
    function _isERC20VotesInitialized() internal view virtual returns (bool);
    function _isEscrow(Hold memory _hold, address _escrow) internal pure virtual returns (bool);
    function _isExternalList(bytes32 _position, address _list) internal view virtual returns (bool);
    function _setExternalListInitialized(bytes32 _position) internal virtual;
    function _isExternallyAuthorized(address _account) internal view virtual returns (bool);
    function _isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view virtual returns (bool);
    function _isExternallyPaused() internal view virtual returns (bool);
    function _isHoldExpired(Hold memory _hold) internal view virtual returns (bool);
    function _isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view virtual returns (bool);
    function _isInControlList(address _account) internal view virtual returns (bool);
    function _isInternalKycActivated() internal view virtual returns (bool);
    function _isIssuable() internal view virtual returns (bool);
    function _isIssuer(address _issuer) internal view virtual returns (bool);
    function _isLockIdValid(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
    function _isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
    function _isMultiPartition() internal view virtual returns (bool);
    function _isOperator(address _operator, address _tokenHolder) internal view virtual returns (bool);
    function _isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool);
    function _isPaused() internal view virtual returns (bool);
    function _isProceedRecipient(address _proceedRecipient) internal view virtual returns (bool);
    function _isRecovered(address _sender) internal view virtual returns (bool);
    function _isRedeemSignatureValid(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual returns (bool);
    function _isTransferSignatureValid(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view virtual returns (bool);
    function _issue(address _tokenHolder, uint256 _value, bytes memory _data) internal virtual;
    function _issueByPartition(IssueData memory _issueData) internal virtual;
    function _lastSnapshotId(uint256[] storage ids) internal view virtual returns (uint256);
    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal virtual returns (bool success_, uint256 lockId_);
    function _lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _mint(address to, uint256 value) internal virtual;
    function _moveVotingPower(address src, address dst, uint256 amount) internal virtual;
    function _numCheckpoints(address account) internal view virtual returns (uint256);
    function _onScheduledBalanceAdjustmentTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _onScheduledCouponListingTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _onScheduledCrossOrderedTaskTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _onScheduledSnapshotTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal virtual returns (bool success_);
    function _operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) internal virtual returns (bytes32);
    function _partitionsOf(address _tokenHolder) internal view virtual returns (bytes32[] memory);
    function _partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (bytes32[] memory);
    function _permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal virtual;
    function _protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 clearingId_);
    function _protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _protectedPartitionsRole(bytes32 _partition) internal pure virtual returns (bytes32);
    function _protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal virtual;
    function _protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal virtual returns (bytes32);
    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal virtual;
    function _reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
    function _reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal virtual returns (bool success_, uint256 amount_);
    function _recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) internal virtual returns (bool);
    function _redeem(uint256 _value, bytes memory _data) internal virtual;
    function _redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) internal virtual;
    function _reduceBalanceByPartition(address _from, uint256 _value, bytes32 _partition) internal virtual;
    function _reduceTotalSupplyByPartition(bytes32 _partition, uint256 _value) internal virtual;
    function _releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal virtual returns (bool success_);
    function _releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (bool success_);
    function _removeAgent(address _agent) internal virtual;
    function _removeClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal virtual;
    function _removeExternalList(bytes32 _position, address _list) internal virtual returns (bool success_);
    function _removeFromControlList(address _account) internal virtual returns (bool success_);
    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _removeIssuer(address _issuer) internal virtual returns (bool success_);
    function _removeLabafClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal virtual;
    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal virtual;
    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal virtual;
    function _removeProceedRecipient(address _proceedRecipient) internal virtual;
    function _removeProceedRecipientData(address _proceedRecipient) internal virtual;
    function _removeTokenHolder(address tokenHolder) internal virtual;
    function _replaceTokenHolder(address newTokenHolder, address oldTokenHolder) internal virtual;
    function _revokeKyc(address _account) internal virtual returns (bool success_);
    function _revokeOperator(address _operator) internal virtual;
    function _revokeOperatorByPartition(bytes32 _partition, address _operator) internal virtual;
    function _revokeRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _setActivate(bool _activated) internal virtual;
    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal virtual;
    function _setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal virtual;
    function _setClearing(bool _activated) internal virtual returns (bool success_);
    function _setCompliance(address _compliance) internal virtual;
    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual returns (bytes32 corporateActionId_, uint256 couponID_);
    function _setDividends(
        IEquity.Dividend calldata _newDividend
    ) internal virtual returns (bytes32 corporateActionId_, uint256 dividendId_);
    function _setHeldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setIdentityRegistry(address _identityRegistry) internal virtual;
    function _setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal virtual;
    function _setInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal virtual;
    function _setInternalKyc(bool _activated) internal virtual returns (bool success_);
    function _setKpiOracle(address _kpiOracle) internal virtual;
    function _setLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setMaturityDate(uint256 _maturityDate) internal virtual returns (bool success_);
    function _setMaxSupply(uint256 _maxSupply) internal virtual;
    function _setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) internal virtual;
    function _setNounce(uint256 _nounce, address _account) internal virtual;
    function _setPause(bool _paused) internal virtual;
    function _setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal virtual;
    function _setProtectedPartitions(bool _protected) internal virtual;
    function _setRate(uint256 _newRate, uint8 _newRateDecimals) internal virtual;
    function _setRevocationRegistryAddress(address _revocationRegistryAddress) internal virtual returns (bool success_);
    function _setSPTImpactData(
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData,
        address _project
    ) internal virtual;
    function _setSPTInterestRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate
    ) internal virtual;
    function _setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) internal virtual returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_);
    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _labaf
    ) internal virtual;
    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _setVoting(
        IEquity.Voting calldata _newVoting
    ) internal virtual returns (bytes32 corporateActionId_, uint256 voteID_);
    function _snapshot() internal virtual returns (uint256);
    function _storeBondDetails(IBondRead.BondDetailsData memory _bondDetails) internal virtual;
    function _storeEquityDetails(IEquity.EquityDetailsData memory _equityDetailsData) internal virtual;
    function _storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal virtual;
    function _subtract(uint256 a, uint256 b) internal pure virtual returns (uint256);
    function _syncBalanceAdjustments(bytes32 _partition, address _from, address _to) internal virtual;
    function _takeAbafCheckpoint() internal virtual;
    function _takeSnapshot() internal virtual returns (uint256 snapshotID_);
    function _tokenHoldersAt(
        uint256 snapshotId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory);
    function _totalSupply() internal view virtual returns (uint256);
    function _totalSupplyAdjusted() internal view virtual returns (uint256);
    function _totalSupplyAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _totalSupplyAt(uint256 _snapshotId) internal view virtual returns (uint256);
    function _totalSupplyAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint256 totalSupply_);
    function _totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) internal view virtual returns (uint256 totalSupply_);
    function _totalSupplyByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _totalSupplyByPartitionAdjusted(bytes32 _partition) internal view virtual returns (uint256);
    function _totalTokenHoldersAt(uint256 snapshotId) internal view virtual returns (uint256);
    function _transfer(address from, address to, uint256 value) internal virtual returns (bool);
    function _transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) internal virtual returns (bytes32);
    function _transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _transferFrom(address spender, address from, address to, uint256 value) internal virtual returns (bool);
    function _transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal virtual;
    function _triggerAndSyncAll(bytes32 _partition, address _from, address _to) internal virtual;
    function _triggerScheduledBalanceAdjustments(uint256 _max) internal virtual returns (uint256);
    function _triggerScheduledCouponListing(uint256 _max) internal virtual returns (uint256);
    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal virtual returns (uint256);
    function _callTriggerPendingScheduledCrossOrderedTasks() internal virtual returns (uint256);
    function _triggerScheduledSnapshots(uint256 _max) internal virtual returns (uint256);
    function _triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        function(uint256, uint256, ScheduledTask memory) internal callBack,
        uint256 _max,
        uint256 _timestamp
    ) internal virtual returns (uint256);
    function _unfreezeTokens(address _account, uint256 _amount) internal virtual;
    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _updateAbaf(uint256 factor) internal virtual;
    function _updateAbafSnapshot() internal virtual;
    function _updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAccountSnapshot(
        Snapshots storage balanceSnapshots,
        uint256 currentValue,
        Snapshots storage partitionBalanceSnapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal virtual;
    function _updateAccountSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAllowanceAndLabaf(address _owner, address _spender) internal virtual;
    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal virtual;
    function _updateAssetTotalSupplySnapshot() internal virtual;
    function _updateClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _abaf
    ) internal virtual;
    function _updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _factor
    ) internal virtual;
    function _updateCorporateActionData(bytes32 _actionId, bytes memory _newData) internal virtual;
    function _updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal virtual;
    function _updateCouponRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual;
    function _updateDecimalsSnapshot() internal virtual;
    function _updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal virtual returns (bool success_);
    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal virtual;
    function _updateHoldAmountById(
        bytes32 _partition,
        uint256 _holdId,
        address _tokenHolder,
        uint256 _factor
    ) internal virtual;
    function _updateLabafByPartition(bytes32 partition) internal virtual;
    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal virtual;
    function _updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal virtual;
    function _updateLockAmountById(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _factor
    ) internal virtual;
    function _updateLockByIndex(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _abaf
    ) internal virtual;
    function _updateLockedBalancesBeforeLock(
        bytes32 _partition,
        uint256 /*_amount*/,
        address _tokenHolder,
        uint256 /*_expirationTimestamp*/
    ) internal virtual;
    function _updateLockedBalancesBeforeRelease(
        bytes32 _partition,
        uint256 /*_lockId*/,
        address _tokenHolder
    ) internal virtual;
    function _updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal virtual;
    function _updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal virtual;
    function _updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        // There is a limitation in the number of partitions an account can have, if it has to many the snapshot
        // transaction will run out of gas
        bytes32[] memory partitionIds
    ) internal virtual;
    function _updateTokenHolderSnapshot(address account) internal virtual;
    function _updateTotalCleared(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalClearedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalClearedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalLock(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalLockedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalLockedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateTotalSupplySnapshot(bytes32 partition) internal virtual;
    function _updateTotalTokenHolderSnapshot() internal virtual;
    function _validPartition(bytes32 _partition, address _holder) internal view virtual returns (bool);
    function _validPartitionForReceiver(bytes32 _partition, address _to) internal view virtual returns (bool);
    function _validateParams(bytes32 _partition, uint256 _value) internal pure virtual;
    function _valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view virtual returns (bool, uint256);
    function _verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view virtual returns (bool);
    function _version() internal view virtual returns (string memory);
    // solhint-disable-next-line func-name-mixedcase
    function _initializeClearing(bool _clearingActive) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ProtectedPartitions(bool _protectPartition) internal virtual returns (bool success_);
    // solhint-disable-next-line func-name-mixedcase
    function _isProtectedPartitionInitialized() internal view virtual returns (bool);
    // solhint-disable-next-line func-name-mixedcase
    function _initializeInternalKyc(bool _internalKycActivated) internal virtual;

    function _isKycInitialized() internal view virtual returns (bool);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalControlLists(address[] calldata _controlLists) internal virtual;

    function _isExternalControlListInitialized() internal view virtual returns (bool);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalKycLists(address[] calldata _kycLists) internal virtual;

    function _isKycExternalInitialized() internal view virtual returns (bool);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalPauses(address[] calldata _pauses) internal virtual;

    function _isExternalPauseInitialized() internal view virtual returns (bool);

    function _isERC3643Initialized() internal view virtual returns (bool);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1410(bool _multiPartition) internal virtual;

    function _isERC1410Initialized() internal view virtual returns (bool);

    function _isERC1594Initialized() internal view virtual returns (bool);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1644(bool _controllable) internal virtual;

    function _isERC1644Initialized() internal view virtual returns (bool);

    function _getIdentityRegistry() internal view virtual returns (IIdentityRegistry);

    function _getCompliance() internal view virtual returns (ICompliance);

    function _setName(string calldata _name) internal virtual;

    function _setSymbol(string calldata _symbol) internal virtual;

    function _setOnchainID(address _onchainID) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) internal virtual;

    function _isProceedRecipientsInitialized() internal view virtual returns (bool);

    function _getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory proceedRecipients_);

    function _getPreviousCouponInOrderedList(
        uint256 _couponID
    ) internal view virtual returns (uint256 previousCouponID_);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_SustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) internal virtual;

    function _isSustainabilityPerformanceTargetRateInitialized() internal view virtual returns (bool);
}
