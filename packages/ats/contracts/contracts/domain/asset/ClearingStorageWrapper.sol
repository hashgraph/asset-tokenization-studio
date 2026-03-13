// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CLEARING_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { IClearingActions } from "../../facets/layer_1/clearing/IClearingActions.sol";
import { IClearingTransfer } from "../../facets/layer_1/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/layer_1/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/layer_1/clearing/IClearingHoldCreation.sol";
import { IClearingStorageWrapper } from "./clearing/IClearingStorageWrapper.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { Hold } from "../../facets/layer_1/hold/IHold.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { checkNounceAndDeadline } from "../../infrastructure/utils/ERC712Lib.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "./HoldStorageWrapper.sol";
import { ERC1594StorageWrapper } from "./ERC1594StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";

library ClearingStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    // ============ Guard Functions ============

    function _requireValidClearingId(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view {
        if (!_isClearingIdValid(clearingOperationIdentifier)) revert IClearing.WrongClearingId();
    }

    function _requireClearingActivated() internal view {
        if (!_isClearingActivated()) revert IClearing.ClearingIsDisabled();
    }

    function _requireExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        bool mustBeExpired
    ) internal view {
        if (_isClearingBasicInfo(clearingOperationIdentifier).expirationTimestamp > block.timestamp != mustBeExpired) {
            if (mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    // ============ Storage Accessor ============

    function _clearingStorage() internal pure returns (IClearing.ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    // ============ Init & Config ============

    // solhint-disable-next-line ordering
    function _initializeClearing(bool clearingActive) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = _clearingStorage();
        clearingStorage_.initialized = true;
        clearingStorage_.activated = clearingActive;
    }

    function _setClearing(bool activated) internal returns (bool success_) {
        _clearingStorage().activated = activated;
        return true;
    }

    // ============ Read Functions (from ClearingStorageWrapper1) ============

    function _isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view returns (bool) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType].contains(clearingOperationIdentifier.clearingId);
    }

    function _isClearingActivated() internal view returns (bool) {
        return _clearingStorage().activated;
    }

    function _isClearingInitialized() internal view returns (bool) {
        return _clearingStorage().initialized;
    }

    function _getClearingCountForByPartition(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType clearingOperationType
    ) internal view returns (uint256) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[tokenHolder][partition][clearingOperationType].length();
    }

    function _isClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier
    ) internal view returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_) {
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            IClearingTransfer.ClearingRedeemData memory clearingRedeemData = _getClearingRedeemForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
            return
                _buildClearingOperationBasicInfo(
                    clearingRedeemData.expirationTimestamp,
                    clearingRedeemData.amount,
                    address(0)
                );
        }

        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            IClearingTransfer.ClearingTransferData memory clearingTransferData = _getClearingTransferForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
            return
                _buildClearingOperationBasicInfo(
                    clearingTransferData.expirationTimestamp,
                    clearingTransferData.amount,
                    clearingTransferData.destination
                );
        }

        IClearingTransfer.ClearingHoldCreationData
            memory clearingHoldCreationData = _getClearingHoldCreationForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
        return
            _buildClearingOperationBasicInfo(
                clearingHoldCreationData.expirationTimestamp,
                clearingHoldCreationData.amount,
                clearingHoldCreationData.holdTo
            );
    }

    function _getClearingsIdForByPartition(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType clearingOperationType,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory clearingsId_) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[tokenHolder][partition][clearingOperationType].getFromSet(
                    pageIndex,
                    pageLength
                );
    }

    function _getClearingThirdParty(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType operationType,
        uint256 clearingId
    ) internal view returns (address thirdParty_) {
        thirdParty_ = _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[tokenHolder][partition][
            operationType
        ][clearingId];
    }

    function _getClearingTransferForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = _clearingStorage().clearingTransferByAccountPartitionAndId[tokenHolder][partition][
            clearingId
        ];
    }

    function _getClearingRedeemForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = _clearingStorage().clearingRedeemByAccountPartitionAndId[tokenHolder][partition][
            clearingId
        ];
    }

    function _getClearingHoldCreationForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = _clearingStorage().clearingHoldCreationByAccountPartitionAndId[tokenHolder][
            partition
        ][clearingId];
    }

    function _getClearedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return _clearingStorage().totalClearedAmountByAccount[tokenHolder];
    }

    function _getClearedAmountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 amount_) {
        return _clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition];
    }

    // ============ Build Helpers (Pure Functions) ============

    function _buildClearingTransferData(
        uint256 amount,
        uint256 expirationTimestamp,
        address to,
        bytes memory data,
        bytes memory operatorData,
        ThirdPartyType operatorType
    ) internal pure returns (IClearing.ClearingTransferData memory) {
        return
            IClearing.ClearingTransferData({
                amount: amount,
                expirationTimestamp: expirationTimestamp,
                destination: to,
                data: data,
                operatorData: operatorData,
                operatorType: operatorType
            });
    }

    function _buildClearingRedeemData(
        uint256 amount,
        uint256 expirationTimestamp,
        bytes memory data,
        bytes memory operatorData,
        ThirdPartyType operatorType
    ) internal pure returns (IClearing.ClearingRedeemData memory) {
        return
            IClearing.ClearingRedeemData({
                amount: amount,
                expirationTimestamp: expirationTimestamp,
                data: data,
                operatorData: operatorData,
                operatorType: operatorType
            });
    }

    function _buildClearingHoldCreationData(
        uint256 amount,
        uint256 expirationTimestamp,
        uint256 holdExpirationTimestamp,
        bytes memory data,
        bytes memory holdData,
        address escrow,
        address to,
        bytes memory operatorData,
        ThirdPartyType operatorType
    ) internal pure returns (IClearing.ClearingHoldCreationData memory) {
        return
            IClearing.ClearingHoldCreationData({
                amount: amount,
                expirationTimestamp: expirationTimestamp,
                data: data,
                holdEscrow: escrow,
                holdExpirationTimestamp: holdExpirationTimestamp,
                holdTo: to,
                holdData: holdData,
                operatorData: operatorData,
                operatorType: operatorType
            });
    }

    function _buildClearingOperationIdentifier(
        address from,
        bytes32 partition,
        uint256 clearingId,
        IClearing.ClearingOperationType operationType
    ) internal pure returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: from,
                partition: partition,
                clearingId: clearingId,
                clearingOperationType: operationType
            });
    }

    function _buildClearingOperationBasicInfo(
        uint256 expirationTimestamp,
        uint256 amount,
        address destination
    ) internal pure returns (IClearing.ClearingOperationBasicInfo memory) {
        return
            IClearing.ClearingOperationBasicInfo({
                expirationTimestamp: expirationTimestamp,
                amount: amount,
                destination: destination
            });
    }

    // ============ State-Changing Functions (from ClearingStorageWrapper2) ============

    function _protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        address to,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper._getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkClearingTransferSignature(
            protectedClearingOperation,
            amount,
            to,
            signature
        );

        NonceStorageWrapper._setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = _clearingTransferCreation(
            protectedClearingOperation.clearingOperation,
            amount,
            to,
            protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory protectedClearingOperation,
        Hold calldata hold,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper._getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkClearingCreateHoldSignature(
            protectedClearingOperation,
            hold,
            signature
        );

        NonceStorageWrapper._setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = _clearingHoldCreationCreation(
            protectedClearingOperation.clearingOperation,
            protectedClearingOperation.from,
            hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper._getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkClearingRedeemSignature(protectedClearingOperation, amount, signature);

        NonceStorageWrapper._setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = _clearingRedeemCreation(
            protectedClearingOperation.clearingOperation,
            amount,
            protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function _operateClearingCreation(
        IClearing.ClearingOperation memory clearingOperation,
        address from,
        uint256 amount,
        IClearing.ClearingOperationType operationType
    ) internal returns (uint256 clearingId_) {
        bytes32 partition = clearingOperation.partition;

        IClearing.ClearingDataStorage storage clearingDataStorage = _clearingStorage();

        unchecked {
            clearingId_ = ++clearingDataStorage.nextClearingIdByAccountPartitionAndType[from][partition][operationType];
        }

        _beforeClearingOperation(
            _buildClearingOperationIdentifier(from, partition, clearingId_, operationType),
            address(0)
        );

        ERC1410StorageWrapper._reduceBalanceByPartition(from, amount, partition);

        _setClearingIdByPartitionAndType(clearingDataStorage, from, partition, clearingId_, operationType);

        _increaseClearedAmounts(from, partition, amount);

        emit IERC1410StorageWrapper.TransferByPartition(
            partition,
            msg.sender,
            from,
            address(0),
            amount,
            clearingOperation.data,
            ""
        );
        emit IERC20StorageWrapper.Transfer(from, address(0), amount);
    }

    function _clearingTransferCreation(
        IClearing.ClearingOperation memory clearingOperation,
        uint256 amount,
        address to,
        address from,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        bytes memory data = clearingOperation.data;
        uint256 expirationTimestamp = clearingOperation.expirationTimestamp;

        clearingId_ = _operateClearingCreation(
            clearingOperation,
            from,
            amount,
            IClearing.ClearingOperationType.Transfer
        );

        _clearingStorage().clearingTransferByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = _buildClearingTransferData(amount, expirationTimestamp, to, data, operatorData, thirdPartyType);

        _emitClearedTransferEvent(
            from,
            to,
            clearingOperation.partition,
            clearingId_,
            amount,
            expirationTimestamp,
            data,
            operatorData,
            thirdPartyType
        );

        success_ = true;
    }

    function _clearingRedeemCreation(
        IClearing.ClearingOperation memory clearingOperation,
        uint256 amount,
        address from,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(clearingOperation, from, amount, IClearing.ClearingOperationType.Redeem);

        _clearingStorage().clearingRedeemByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = _buildClearingRedeemData(
            amount,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            operatorData,
            thirdPartyType
        );

        _emitClearedRedeemEvent(
            from,
            clearingOperation.partition,
            clearingId_,
            amount,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            operatorData,
            thirdPartyType
        );

        success_ = true;
    }

    function _clearingHoldCreationCreation(
        IClearing.ClearingOperation memory clearingOperation,
        address from,
        Hold calldata hold,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            clearingOperation,
            from,
            hold.amount,
            IClearing.ClearingOperationType.HoldCreation
        );

        _clearingStorage().clearingHoldCreationByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = _buildClearingHoldCreationData(
            hold.amount,
            clearingOperation.expirationTimestamp,
            hold.expirationTimestamp,
            clearingOperation.data,
            hold.data,
            hold.escrow,
            hold.to,
            operatorData,
            thirdPartyType
        );

        _emitClearedHoldByPartitionEvent(
            from,
            clearingOperation.partition,
            clearingId_,
            hold,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            operatorData,
            thirdPartyType
        );

        success_ = true;
    }

    function _approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            _handleClearingOperationByPartition(
                clearingOperationIdentifier,
                IClearingActions.ClearingActionType.Approve
            );
    }

    function _cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Cancel
        );
    }

    function _reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Reclaim
        );
    }

    function _handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        IClearingActions.ClearingActionType operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        _beforeClearingOperation(
            clearingOperationIdentifier,
            _isClearingBasicInfo(clearingOperationIdentifier).destination
        );
        uint256 amount;
        ThirdPartyType operatorType;
        (success_, amount, operatorType, operationData_, partition_) = _operateClearingAction(
            clearingOperationIdentifier,
            operationType
        );
        _restoreAllowanceAndRemoveClearing(operationType, operatorType, clearingOperationIdentifier, amount);
    }

    function _operateClearingAction(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        IClearingActions.ClearingActionType operation
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
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            (success_, amount_, operatorType_, partition_) = _clearingTransferExecution(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId,
                operation
            );
            return (success_, amount_, operatorType_, operationData_, partition_);
        }

        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            (success_, amount_, operatorType_) = _clearingRedeemExecution(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId,
                operation
            );
            return (success_, amount_, operatorType_, operationData_, bytes32(0));
        }

        (success_, amount_, operatorType_, operationData_) = _clearingHoldCreationExecution(
            clearingOperationIdentifier.partition,
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.clearingId,
            operation
        );

        return (success_, amount_, operatorType_, operationData_, bytes32(0));
    }

    function _transferClearingBalance(bytes32 partition, address to, uint256 amount) internal {
        if (ERC1410StorageWrapper._validPartitionForReceiver(partition, to)) {
            ERC1410StorageWrapper._increaseBalanceByPartition(to, amount, partition);
            emit IERC1410StorageWrapper.TransferByPartition(partition, msg.sender, address(0), to, amount, "", "");
            emit IERC20StorageWrapper.Transfer(address(0), to, amount);
            return;
        }
        ERC1410StorageWrapper._addPartitionTo(amount, to, partition);
        emit IERC1410StorageWrapper.TransferByPartition(partition, msg.sender, address(0), to, amount, "", "");
        emit IERC20StorageWrapper.Transfer(address(0), to, amount);
    }

    function _removeClearing(IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = _clearingStorage();

        uint256 amount = _isClearingBasicInfo(clearingOperationIdentifier).amount;

        clearingStorage_.totalClearedAmountByAccount[clearingOperationIdentifier.tokenHolder] -= amount;
        clearingStorage_.totalClearedAmountByAccountAndPartition[clearingOperationIdentifier.tokenHolder][
            clearingOperationIdentifier.partition
        ] -= amount;

        clearingStorage_
        .clearingIdsByAccountAndPartitionAndTypes[clearingOperationIdentifier.tokenHolder][
            clearingOperationIdentifier.partition
        ][clearingOperationIdentifier.clearingOperationType].remove(clearingOperationIdentifier.clearingId);

        delete clearingStorage_.clearingThirdPartyByAccountPartitionTypeAndId[clearingOperationIdentifier.tokenHolder][
            clearingOperationIdentifier.partition
        ][clearingOperationIdentifier.clearingOperationType][clearingOperationIdentifier.clearingId];

        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer)
            delete clearingStorage_.clearingTransferByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId];
        else if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem)
            delete clearingStorage_.clearingRedeemByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId];
        else
            delete clearingStorage_.clearingHoldCreationByAccountPartitionAndId[
                clearingOperationIdentifier.tokenHolder
            ][clearingOperationIdentifier.partition][clearingOperationIdentifier.clearingId];

        AdjustBalancesStorageWrapper._removeLabafClearing(clearingOperationIdentifier);
    }

    function _beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        address to
    ) internal {
        _adjustClearingBalances(clearingOperationIdentifier, to);
        SnapshotsStorageWrapper._updateAccountSnapshot(
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.partition
        );
        SnapshotsStorageWrapper._updateAccountSnapshot(to, clearingOperationIdentifier.partition);
        SnapshotsStorageWrapper._updateAccountClearedBalancesSnapshot(
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.partition
        );
    }

    function _adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        address to
    ) internal {
        ERC1410StorageWrapper._triggerAndSyncAll(
            clearingOperationIdentifier.partition,
            clearingOperationIdentifier.tokenHolder,
            to
        );

        _updateClearing(
            clearingOperationIdentifier,
            _updateTotalCleared(clearingOperationIdentifier.partition, clearingOperationIdentifier.tokenHolder)
        );
    }

    function _updateClearing(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        uint256 abaf
    ) internal {
        uint256 clearingLabaf = AdjustBalancesStorageWrapper._getClearingLabafById(clearingOperationIdentifier);

        if (abaf == clearingLabaf) {
            return;
        }
        _updateClearingAmountById(
            clearingOperationIdentifier,
            AdjustBalancesStorageWrapper._calculateFactor(abaf, clearingLabaf)
        );
        AdjustBalancesStorageWrapper._setClearedLabafById(clearingOperationIdentifier, abaf);
    }

    function _updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        uint256 factor
    ) internal {
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            _clearingStorage()
            .clearingTransferByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId].amount *= factor;
            return;
        }
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            _clearingStorage()
            .clearingRedeemByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId].amount *= factor;
            return;
        }
        _clearingStorage()
        .clearingHoldCreationByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
            clearingOperationIdentifier.partition
        ][clearingOperationIdentifier.clearingId].amount *= factor;
    }

    function _increaseClearedAmounts(address tokenHolder, bytes32 partition, uint256 amount) internal {
        _clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition] += amount;
        _clearingStorage().totalClearedAmountByAccount[tokenHolder] += amount;
    }

    function _updateTotalCleared(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper._getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper._getTotalClearedLabaf(tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper._getTotalClearedLabafByPartition(
            partition,
            tokenHolder
        );

        if (abaf_ != labaf) {
            _updateTotalClearedAmountAndLabaf(
                tokenHolder,
                AdjustBalancesStorageWrapper._calculateFactor(abaf_, labaf),
                abaf_
            );
        }

        if (abaf_ != labafByPartition) {
            _updateTotalClearedAmountAndLabafByPartition(
                partition,
                tokenHolder,
                AdjustBalancesStorageWrapper._calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    function _updateTotalClearedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        _clearingStorage().totalClearedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper._setTotalClearedLabaf(tokenHolder, abaf);
    }

    function _updateTotalClearedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        _clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
        AdjustBalancesStorageWrapper._setTotalClearedLabafByPartition(partition, tokenHolder, abaf);
    }

    function _setClearingIdByPartitionAndType(
        IClearing.ClearingDataStorage storage clearingDataStorage,
        address tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IClearing.ClearingOperationType operationType
    ) internal {
        clearingDataStorage.clearingIdsByAccountAndPartitionAndTypes[tokenHolder][partition][operationType].add(
            clearingId
        );
    }

    function _decreaseAllowedBalanceForClearing(
        bytes32 partition,
        uint256 clearingId,
        IClearing.ClearingOperationType clearingOperationType,
        address from,
        uint256 amount
    ) internal {
        address spender = msg.sender;
        ERC20StorageWrapper._decreaseAllowedBalance(from, spender, amount);
        _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[from][partition][clearingOperationType][
            clearingId
        ] = spender;
    }

    // ============ Adjusted Read Functions ============

    function _getClearedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactorForClearedAmountByTokenHolderAdjustedAt(
            tokenHolder,
            timestamp
        );
        return _getClearedAmountFor(tokenHolder) * factor;
    }

    function _getClearedAmountForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getTotalClearedLabafByPartition(partition, tokenHolder)
        );
        return _getClearedAmountForByPartition(partition, tokenHolder) * factor;
    }

    function _getClearingTransferForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = _getClearingTransferForByPartition(partition, tokenHolder, clearingId);

        clearingTransferData_.amount *= AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getClearingLabafById(
                _buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.Transfer
                )
            )
        );
    }

    function _getClearingRedeemForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = _getClearingRedeemForByPartition(partition, tokenHolder, clearingId);

        clearingRedeemData_.amount *= AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getClearingLabafById(
                _buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.Redeem
                )
            )
        );
    }

    function _getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = _getClearingHoldCreationForByPartition(partition, tokenHolder, clearingId);

        clearingHoldCreationData_.amount *= AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getClearingLabafById(
                _buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.HoldCreation
                )
            )
        );
    }

    // ============ Private Helper Functions ============

    function _clearingTransferExecution(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes32 partition_) {
        IClearing.ClearingTransferData memory clearingTransferData = _getClearingTransferForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        address destination = tokenHolder;

        if (operation == IClearingActions.ClearingActionType.Approve) {
            ERC1594StorageWrapper._checkIdentity(tokenHolder, clearingTransferData.destination);
            ERC1594StorageWrapper._checkCompliance(tokenHolder, clearingTransferData.destination, false);

            destination = clearingTransferData.destination;

            partition_ = partition;
        }

        _transferClearingBalance(partition, destination, clearingTransferData.amount);

        if (
            tokenHolder != destination &&
            ERC3643StorageWrapper._erc3643Storage().compliance != address(0) &&
            partition == _DEFAULT_PARTITION
        ) {
            (ERC3643StorageWrapper._erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    tokenHolder,
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
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_) {
        IClearing.ClearingRedeemData memory clearingRedeemData = _getClearingRedeemForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        if (operation == IClearingActions.ClearingActionType.Approve) {
            ERC1594StorageWrapper._checkIdentity(tokenHolder, address(0));
            ERC1594StorageWrapper._checkCompliance(tokenHolder, address(0), false);
        } else _transferClearingBalance(partition, tokenHolder, clearingRedeemData.amount);

        success_ = true;
        amount_ = clearingRedeemData.amount;
        operatorType_ = clearingRedeemData.operatorType;
    }

    function _clearingHoldCreationExecution(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes memory operationData_) {
        IClearing.ClearingHoldCreationData memory clearingHoldCreationData = _getClearingHoldCreationForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        _transferClearingBalance(partition, tokenHolder, clearingHoldCreationData.amount);

        if (operation == IClearingActions.ClearingActionType.Approve) {
            uint256 holdId;
            (, holdId) = HoldStorageWrapper._createHoldByPartition(
                partition,
                tokenHolder,
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
        IClearingActions.ClearingActionType operation,
        ThirdPartyType operatorType,
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        uint256 amount
    ) private {
        _restoreClearingAllowance(operation, operatorType, clearingOperationIdentifier, amount);
        _removeClearing(
            _buildClearingOperationIdentifier(
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.clearingId,
                clearingOperationIdentifier.clearingOperationType
            )
        );
    }

    function _restoreClearingAllowance(
        IClearingActions.ClearingActionType operation,
        ThirdPartyType operatorType,
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        uint256 amount
    ) private {
        if (!(operation != IClearingActions.ClearingActionType.Approve && operatorType == ThirdPartyType.AUTHORIZED))
            return;

        ERC20StorageWrapper._increaseAllowedBalance(
            clearingOperationIdentifier.tokenHolder,
            _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType][clearingOperationIdentifier.clearingId],
            amount
        );
    }

    function _emitClearedTransferEvent(
        address tokenHolder,
        address to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes memory data,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) private {
        if (thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingStorageWrapper.ClearedTransferByPartition(
                msg.sender,
                tokenHolder,
                to,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingStorageWrapper.ClearedTransferFromByPartition(
                msg.sender,
                tokenHolder,
                to,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingStorageWrapper.ClearedOperatorTransferByPartition(
                msg.sender,
                tokenHolder,
                to,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        emit IClearingStorageWrapper.ProtectedClearedTransferByPartition(
            msg.sender,
            tokenHolder,
            to,
            partition,
            clearingId,
            amount,
            expirationDate,
            data,
            operatorData
        );
    }

    function _emitClearedRedeemEvent(
        address tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes memory data,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) private {
        if (thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingStorageWrapper.ClearedRedeemByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingStorageWrapper.ClearedRedeemFromByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingStorageWrapper.ClearedOperatorRedeemByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                amount,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        emit IClearingStorageWrapper.ProtectedClearedRedeemByPartition(
            msg.sender,
            tokenHolder,
            partition,
            clearingId,
            amount,
            expirationDate,
            data,
            operatorData
        );
    }

    function _emitClearedHoldByPartitionEvent(
        address tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        Hold calldata hold,
        uint256 expirationDate,
        bytes memory data,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) private {
        if (thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingStorageWrapper.ClearedHoldByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                hold,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingStorageWrapper.ClearedHoldFromByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                hold,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        if (thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingStorageWrapper.ClearedOperatorHoldByPartition(
                msg.sender,
                tokenHolder,
                partition,
                clearingId,
                hold,
                expirationDate,
                data,
                operatorData
            );
            return;
        }
        emit IClearingStorageWrapper.ProtectedClearedHoldByPartition(
            msg.sender,
            tokenHolder,
            partition,
            clearingId,
            hold,
            expirationDate,
            data,
            operatorData
        );
    }

    function _fromClearingHoldCreationDataToHold(
        IClearing.ClearingHoldCreationData memory clearingHoldCreationData
    ) private pure returns (Hold memory) {
        return
            Hold(
                clearingHoldCreationData.amount,
                clearingHoldCreationData.holdExpirationTimestamp,
                clearingHoldCreationData.holdEscrow,
                clearingHoldCreationData.holdTo,
                clearingHoldCreationData.holdData
            );
    }
}
