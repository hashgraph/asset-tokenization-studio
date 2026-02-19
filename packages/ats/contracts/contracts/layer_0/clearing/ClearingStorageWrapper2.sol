// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper2 } from "../hold/HoldStorageWrapper2.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingActions } from "../../layer_1/interfaces/clearing/IClearingActions.sol";
import { IClearingTransfer } from "../../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingStorageWrapper } from "../../layer_1/interfaces/clearing/IClearingStorageWrapper.sol";
import { IERC20StorageWrapper } from "../../layer_1/interfaces/ERC1400/IERC20StorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { checkNounceAndDeadline } from "../../layer_0/common/libraries/ERC712Lib.sol";
import { Hold } from "../../layer_1/interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../common/types/ThirdPartyType.sol";
import { ICompliance } from "../../layer_1/interfaces/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { _DEFAULT_PARTITION } from "../constants/values.sol";
import { LowLevelCall } from "../common/libraries/LowLevelCall.sol";

abstract contract ClearingStorageWrapper2 is IClearingStorageWrapper, HoldStorageWrapper2 {
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    function _protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) internal override returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            _getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp()
        );

        _checkClearingTransferSignature(_protectedClearingOperation, _amount, _to, _signature);

        _setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = _clearingTransferCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _to,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) internal override returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            _getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp()
        );

        _checkClearingCreateHoldSignature(_protectedClearingOperation, _hold, _signature);

        _setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = _clearingHoldCreationCreation(
            _protectedClearingOperation.clearingOperation,
            _protectedClearingOperation.from,
            _hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) internal override returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            _getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp()
        );

        _checkClearingRedeemSignature(_protectedClearingOperation, _amount, _signature);

        _setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = _clearingRedeemCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _operateClearingCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        uint256 _amount,
        IClearing.ClearingOperationType _operationType
    ) internal returns (uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        IClearing.ClearingDataStorage storage clearingDataStorage = _clearingStorage();

        unchecked {
            clearingId_ = ++clearingDataStorage.nextClearingIdByAccountPartitionAndType[_from][partition][
                _operationType
            ];
        }

        _beforeClearingOperation(
            _buildClearingOperationIdentifier(_from, partition, clearingId_, _operationType),
            address(0)
        );

        _reduceBalanceByPartition(_from, _amount, partition);

        _setClearingIdByPartitionAndType(clearingDataStorage, _from, partition, clearingId_, _operationType);

        _increaseClearedAmounts(_from, partition, _amount);

        emit TransferByPartition(partition, _msgSender(), _from, address(0), _amount, _clearingOperation.data, "");
        emit IERC20StorageWrapper.Transfer(_from, address(0), _amount);
    }

    function _clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal override returns (bool success_, uint256 clearingId_) {
        bytes memory data = _clearingOperation.data;
        uint256 expirationTimestamp = _clearingOperation.expirationTimestamp;

        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _amount,
            IClearing.ClearingOperationType.Transfer
        );

        _clearingStorage().clearingTransferByAccountPartitionAndId[_from][_clearingOperation.partition][
            clearingId_
        ] = _buildClearingTransferData(_amount, expirationTimestamp, _to, data, _operatorData, _thirdPartyType);

        _emitClearedTransferEvent(
            _from,
            _to,
            _clearingOperation.partition,
            clearingId_,
            _amount,
            expirationTimestamp,
            data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    function _clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal override returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _amount,
            IClearing.ClearingOperationType.Redeem
        );

        _clearingStorage().clearingRedeemByAccountPartitionAndId[_from][_clearingOperation.partition][
            clearingId_
        ] = _buildClearingRedeemData(
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        _emitClearedRedeemEvent(
            _from,
            _clearingOperation.partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    function _clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal override returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _hold.amount,
            IClearing.ClearingOperationType.HoldCreation
        );

        _clearingStorage().clearingHoldCreationByAccountPartitionAndId[_from][_clearingOperation.partition][
            clearingId_
        ] = _buildClearingHoldCreationData(
            _hold.amount,
            _clearingOperation.expirationTimestamp,
            _hold.expirationTimestamp,
            _clearingOperation.data,
            _hold.data,
            _hold.escrow,
            _hold.to,
            _operatorData,
            _thirdPartyType
        );

        _emitClearedHoldByPartitionEvent(
            _from,
            _clearingOperation.partition,
            clearingId_,
            _hold,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    function _approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal override returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            _handleClearingOperationByPartition(
                _clearingOperationIdentifier,
                IClearingActions.ClearingActionType.Approve
            );
    }

    function _cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal override returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Cancel
        );
    }

    function _reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal override returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Reclaim
        );
    }

    function _handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingActions.ClearingActionType operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        _beforeClearingOperation(
            _clearingOperationIdentifier,
            _getClearingBasicInfo(_clearingOperationIdentifier).destination
        );
        uint256 amount;
        ThirdPartyType operatorType;
        (success_, amount, operatorType, operationData_, partition_) = _operateClearingAction(
            _clearingOperationIdentifier,
            operationType
        );
        _restoreAllowanceAndRemoveClearing(operationType, operatorType, _clearingOperationIdentifier, amount);
    }

    function _operateClearingAction(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingActions.ClearingActionType _operation
    )
        internal
        returns (
            bool success_,
            uint256 amount_,
            ThirdPartyType operatorType_,
            bytes memory operationData_,
            bytes32 partition_
        )
    {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            (success_, amount_, operatorType_, partition_) = _clearingTransferExecution(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId,
                _operation
            );
            return (success_, amount_, operatorType_, operationData_, partition_);
        }

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            (success_, amount_, operatorType_) = _clearingRedeemExecution(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId,
                _operation
            );
            return (success_, amount_, operatorType_, operationData_, bytes32(0));
        }

        (success_, amount_, operatorType_, operationData_) = _clearingHoldCreationExecution(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.clearingId,
            _operation
        );

        return (success_, amount_, operatorType_, operationData_, bytes32(0));
    }

    function _transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal override {
        if (_validPartitionForReceiver(_partition, _to)) {
            _increaseBalanceByPartition(_to, _amount, _partition);
            emit TransferByPartition(_partition, _msgSender(), address(0), _to, _amount, "", "");
            emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
            return;
        }
        _addPartitionTo(_amount, _to, _partition);
        emit TransferByPartition(_partition, _msgSender(), address(0), _to, _amount, "", "");
        emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
    }

    function _removeClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal override {
        IClearing.ClearingDataStorage storage clearingStorage = _clearingStorage();

        uint256 amount = _getClearingBasicInfo(_clearingOperationIdentifier).amount;

        clearingStorage.totalClearedAmountByAccount[_clearingOperationIdentifier.tokenHolder] -= amount;
        clearingStorage.totalClearedAmountByAccountAndPartition[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ] -= amount;

        clearingStorage
        .clearingIdsByAccountAndPartitionAndTypes[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType].remove(_clearingOperationIdentifier.clearingId);

        delete clearingStorage.clearingThirdPartyByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId];

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer)
            delete clearingStorage.clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem)
            delete clearingStorage.clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else
            delete clearingStorage.clearingHoldCreationByAccountPartitionAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];

        _removeLabafClearing(_clearingOperationIdentifier);
    }

    function _beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal override {
        _adjustClearingBalances(_clearingOperationIdentifier, _to);
        _updateAccountSnapshot(_clearingOperationIdentifier.tokenHolder, _clearingOperationIdentifier.partition);
        _updateAccountSnapshot(_to, _clearingOperationIdentifier.partition);
        _updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
    }

    function _adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal override {
        _triggerAndSyncAll(_clearingOperationIdentifier.partition, _clearingOperationIdentifier.tokenHolder, _to);

        _updateClearing(
            _clearingOperationIdentifier,
            _updateTotalCleared(_clearingOperationIdentifier.partition, _clearingOperationIdentifier.tokenHolder)
        );
    }

    function _updateClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _abaf
    ) internal override {
        uint256 clearingLabaf = _getClearingLabafById(_clearingOperationIdentifier);

        if (_abaf == clearingLabaf) {
            return;
        }
        _updateClearingAmountById(_clearingOperationIdentifier, _calculateFactor(_abaf, clearingLabaf));
        _setClearedLabafById(_clearingOperationIdentifier, _abaf);
    }

    function _updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _factor
    ) internal override {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            _clearingStorage()
            .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].amount *= _factor;
            return;
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            _clearingStorage()
            .clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].amount *= _factor;
            return;
        }
        _clearingStorage()
        .clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingId].amount *= _factor;
    }

    function _increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal override {
        _clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        _clearingStorage().totalClearedAmountByAccount[_tokenHolder] += _amount;
    }

    function _updateTotalCleared(bytes32 _partition, address _tokenHolder) internal override returns (uint256 abaf_) {
        abaf_ = _getAbaf();

        uint256 labaf = _getTotalClearedLabaf(_tokenHolder);
        uint256 labafByPartition = _getTotalClearedLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            _updateTotalClearedAmountAndLabaf(_tokenHolder, _calculateFactor(abaf_, labaf), abaf_);
        }

        if (abaf_ != labafByPartition) {
            _updateTotalClearedAmountAndLabafByPartition(
                _partition,
                _tokenHolder,
                _calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    function _updateTotalClearedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal override {
        _clearingStorage().totalClearedAmountByAccount[_tokenHolder] *= _factor;
        _setTotalClearedLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalClearedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal override {
        _clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        _setTotalClearedLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function _setClearingIdByPartitionAndType(
        IClearing.ClearingDataStorage storage _clearingDataStorage,
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal {
        _clearingDataStorage.clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_operationType].add(
            _clearingId
        );
    }

    function _decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) internal override {
        address spender = _msgSender();
        _decreaseAllowedBalance(_from, spender, _amount);
        _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_from][_partition][_clearingOperationType][
            _clearingId
        ] = spender;
    }

    function _getClearedAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactorForClearedAmountByTokenHolderAdjustedAt(_tokenHolder, _timestamp);

        return _getClearedAmountFor(_tokenHolder) * factor;
    }

    function _getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        return
            super._getTotalBalanceForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            _getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        return
            super._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _getClearedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function _getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getTotalClearedLabafByPartition(_partition, _tokenHolder)
        );
        return _getClearedAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    function _getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view override returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = _getClearingTransferForByPartition(_partition, _tokenHolder, _clearingId);

        clearingTransferData_.amount *= _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Transfer
                )
            )
        );
    }

    function _getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view override returns (IClearingTransfer.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = _getClearingRedeemForByPartition(_partition, _tokenHolder, _clearingId);

        clearingRedeemData_.amount *= _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Redeem
                )
            )
        );
    }

    function _getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view override returns (IClearingTransfer.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = _getClearingHoldCreationForByPartition(_partition, _tokenHolder, _clearingId);

        clearingHoldCreationData_.amount *= _calculateFactor(
            _getAbafAdjustedAt(_timestamp),
            _getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.HoldCreation
                )
            )
        );
    }

    function _clearingTransferExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes32 partition_) {
        IClearing.ClearingTransferData memory clearingTransferData = _getClearingTransferForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        address destination = _tokenHolder;

        if (_operation == IClearingActions.ClearingActionType.Approve) {
            _checkIdentity(_tokenHolder, clearingTransferData.destination);
            _checkCompliance(_tokenHolder, clearingTransferData.destination, false);

            destination = clearingTransferData.destination;

            partition_ = _partition;
        }

        _transferClearingBalance(_partition, destination, clearingTransferData.amount);

        if (
            _tokenHolder != destination &&
            _erc3643Storage().compliance != address(0) &&
            _partition == _DEFAULT_PARTITION
        ) {
            (_erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    _tokenHolder,
                    destination,
                    clearingTransferData.amount
                ),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        success_ = true;
        amount_ = clearingTransferData.amount;
        operatorType_ = clearingTransferData.operatorType;
    }

    function _clearingRedeemExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_) {
        IClearing.ClearingRedeemData memory clearingRedeemData = _getClearingRedeemForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        if (_operation == IClearingActions.ClearingActionType.Approve) {
            _checkIdentity(_tokenHolder, address(0));
            _checkCompliance(_tokenHolder, address(0), false);
        } else _transferClearingBalance(_partition, _tokenHolder, clearingRedeemData.amount);

        success_ = true;
        amount_ = clearingRedeemData.amount;
        operatorType_ = clearingRedeemData.operatorType;
    }

    function _clearingHoldCreationExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes memory operationData_) {
        IClearing.ClearingHoldCreationData memory clearingHoldCreationData = _getClearingHoldCreationForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        _transferClearingBalance(_partition, _tokenHolder, clearingHoldCreationData.amount);

        if (_operation == IClearingActions.ClearingActionType.Approve) {
            uint256 holdId;
            (, holdId) = _createHoldByPartition(
                _partition,
                _tokenHolder,
                _fromClearingHoldCreationDataToHold(clearingHoldCreationData),
                clearingHoldCreationData.operatorData,
                clearingHoldCreationData.operatorType
            );
            operationData_ = abi.encode(holdId);
        }

        success_ = true;
        amount_ = clearingHoldCreationData.amount;
        operatorType_ = clearingHoldCreationData.operatorType;
    }

    function _restoreAllowanceAndRemoveClearing(
        IClearingActions.ClearingActionType _operation,
        ThirdPartyType _operatorType,
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) private {
        _restoreClearingAllowance(_operation, _operatorType, _clearingOperationIdentifier, _amount);
        _removeClearing(
            _buildClearingOperationIdentifier(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId,
                _clearingOperationIdentifier.clearingOperationType
            )
        );
    }

    function _restoreClearingAllowance(
        IClearingActions.ClearingActionType _operation,
        ThirdPartyType _operatorType,
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) private {
        if (!(_operation != IClearingActions.ClearingActionType.Approve && _operatorType == ThirdPartyType.AUTHORIZED))
            return;

        _increaseAllowedBalance(
            _clearingOperationIdentifier.tokenHolder,
            _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId],
            _amount
        );
    }

    function _emitClearedTransferEvent(
        address _tokenHolder,
        address _to,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationDate,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit ClearedTransferByPartition(
                _msgSender(),
                _tokenHolder,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit ClearedTransferFromByPartition(
                _msgSender(),
                _tokenHolder,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit ClearedOperatorTransferByPartition(
                _msgSender(),
                _tokenHolder,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        emit ProtectedClearedTransferByPartition(
            _msgSender(),
            _tokenHolder,
            _to,
            _partition,
            _clearingId,
            _amount,
            _expirationDate,
            _data,
            _operatorData
        );
    }

    function _emitClearedRedeemEvent(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationDate,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit ClearedRedeemByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit ClearedRedeemFromByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit ClearedOperatorRedeemByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _amount,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        emit ProtectedClearedRedeemByPartition(
            _msgSender(),
            _tokenHolder,
            _partition,
            _clearingId,
            _amount,
            _expirationDate,
            _data,
            _operatorData
        );
    }

    function _emitClearedHoldByPartitionEvent(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        Hold calldata _hold,
        uint256 _expirationDate,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit ClearedHoldByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _hold,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit ClearedHoldFromByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _hold,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit ClearedOperatorHoldByPartition(
                _msgSender(),
                _tokenHolder,
                _partition,
                _clearingId,
                _hold,
                _expirationDate,
                _data,
                _operatorData
            );
            return;
        }
        emit ProtectedClearedHoldByPartition(
            _msgSender(),
            _tokenHolder,
            _partition,
            _clearingId,
            _hold,
            _expirationDate,
            _data,
            _operatorData
        );
    }

    function _fromClearingHoldCreationDataToHold(
        IClearing.ClearingHoldCreationData memory _clearingHoldCreationData
    ) private pure returns (Hold memory) {
        return
            Hold(
                _clearingHoldCreationData.amount,
                _clearingHoldCreationData.holdExpirationTimestamp,
                _clearingHoldCreationData.holdEscrow,
                _clearingHoldCreationData.holdTo,
                _clearingHoldCreationData.holdData
            );
    }
}
