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
import { _checkNounceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
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

    // ============ Init & Config ============

    function initializeClearing(bool clearingActive) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = clearingStorage();
        clearingStorage_.initialized = true;
        clearingStorage_.activated = clearingActive;
    }

    function setClearing(bool activated) internal returns (bool success_) {
        clearingStorage().activated = activated;
        return true;
    }

    // ============ State-Changing Functions (from ClearingStorageWrapper2) ============

    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        address to,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper.checkClearingTransferSignature(
            protectedClearingOperation,
            amount,
            to,
            signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = clearingTransferCreation(
            protectedClearingOperation.clearingOperation,
            amount,
            to,
            protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory protectedClearingOperation,
        Hold calldata hold,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper.checkClearingCreateHoldSignature(
            protectedClearingOperation,
            hold,
            signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = clearingHoldCreationCreation(
            protectedClearingOperation.clearingOperation,
            protectedClearingOperation.from,
            hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata protectedClearingOperation,
        uint256 amount,
        bytes calldata signature
    ) internal returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            protectedClearingOperation.nonce,
            protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(protectedClearingOperation.from),
            protectedClearingOperation.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper.checkClearingRedeemSignature(
            protectedClearingOperation,
            amount,
            signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(protectedClearingOperation.nonce, protectedClearingOperation.from);

        (success_, clearingId_) = clearingRedeemCreation(
            protectedClearingOperation.clearingOperation,
            amount,
            protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function operateClearingCreation(
        IClearing.ClearingOperation memory clearingOperation,
        address from,
        uint256 amount,
        IClearing.ClearingOperationType operationType
    ) internal returns (uint256 clearingId_) {
        bytes32 partition = clearingOperation.partition;

        IClearing.ClearingDataStorage storage clearingDataStorage = clearingStorage();

        unchecked {
            clearingId_ = ++clearingDataStorage.nextClearingIdByAccountPartitionAndType[from][partition][operationType];
        }

        beforeClearingOperation(
            buildClearingOperationIdentifier(from, partition, clearingId_, operationType),
            address(0)
        );

        ERC1410StorageWrapper.reduceBalanceByPartition(from, amount, partition);

        setClearingIdByPartitionAndType(clearingDataStorage, from, partition, clearingId_, operationType);

        increaseClearedAmounts(from, partition, amount);

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

    function clearingTransferCreation(
        IClearing.ClearingOperation memory clearingOperation,
        uint256 amount,
        address to,
        address from,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        bytes memory data = clearingOperation.data;
        uint256 expirationTimestamp = clearingOperation.expirationTimestamp;

        clearingId_ = operateClearingCreation(
            clearingOperation,
            from,
            amount,
            IClearing.ClearingOperationType.Transfer
        );

        clearingStorage().clearingTransferByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = buildClearingTransferData(amount, expirationTimestamp, to, data, operatorData, thirdPartyType);

        emitClearedTransferEvent(
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

    function clearingRedeemCreation(
        IClearing.ClearingOperation memory clearingOperation,
        uint256 amount,
        address from,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = operateClearingCreation(clearingOperation, from, amount, IClearing.ClearingOperationType.Redeem);

        clearingStorage().clearingRedeemByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = buildClearingRedeemData(
            amount,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            operatorData,
            thirdPartyType
        );

        emitClearedRedeemEvent(
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

    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory clearingOperation,
        address from,
        Hold calldata hold,
        bytes memory operatorData,
        ThirdPartyType thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = operateClearingCreation(
            clearingOperation,
            from,
            hold.amount,
            IClearing.ClearingOperationType.HoldCreation
        );

        clearingStorage().clearingHoldCreationByAccountPartitionAndId[from][clearingOperation.partition][
            clearingId_
        ] = buildClearingHoldCreationData(
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

        emitClearedHoldByPartitionEvent(
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

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            handleClearingOperationByPartition(
                clearingOperationIdentifier,
                IClearingActions.ClearingActionType.Approve
            );
    }

    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Cancel
        );
    }

    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Reclaim
        );
    }

    function handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        IClearingActions.ClearingActionType operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        beforeClearingOperation(
            clearingOperationIdentifier,
            isClearingBasicInfo(clearingOperationIdentifier).destination
        );
        uint256 amount;
        ThirdPartyType operatorType;
        (success_, amount, operatorType, operationData_, partition_) = operateClearingAction(
            clearingOperationIdentifier,
            operationType
        );
        restoreAllowanceAndRemoveClearing(operationType, operatorType, clearingOperationIdentifier, amount);
    }

    function operateClearingAction(
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
            (success_, amount_, operatorType_, partition_) = clearingTransferExecution(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId,
                operation
            );
            return (success_, amount_, operatorType_, operationData_, partition_);
        }

        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            (success_, amount_, operatorType_) = clearingRedeemExecution(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId,
                operation
            );
            return (success_, amount_, operatorType_, operationData_, bytes32(0));
        }

        (success_, amount_, operatorType_, operationData_) = clearingHoldCreationExecution(
            clearingOperationIdentifier.partition,
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.clearingId,
            operation
        );

        return (success_, amount_, operatorType_, operationData_, bytes32(0));
    }

    function transferClearingBalance(bytes32 partition, address to, uint256 amount) internal {
        if (ERC1410StorageWrapper.validPartitionForReceiver(partition, to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(to, amount, partition);
            emit IERC1410StorageWrapper.TransferByPartition(partition, msg.sender, address(0), to, amount, "", "");
            emit IERC20StorageWrapper.Transfer(address(0), to, amount);
            return;
        }
        ERC1410StorageWrapper.addPartitionTo(amount, to, partition);
        emit IERC1410StorageWrapper.TransferByPartition(partition, msg.sender, address(0), to, amount, "", "");
        emit IERC20StorageWrapper.Transfer(address(0), to, amount);
    }

    function removeClearing(IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = clearingStorage();

        uint256 amount = isClearingBasicInfo(clearingOperationIdentifier).amount;

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

        AdjustBalancesStorageWrapper.removeLabafClearing(clearingOperationIdentifier);
    }

    function beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        address to
    ) internal {
        adjustClearingBalances(clearingOperationIdentifier, to);
        SnapshotsStorageWrapper.updateAccountSnapshot(
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.partition
        );
        SnapshotsStorageWrapper.updateAccountSnapshot(to, clearingOperationIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(
            clearingOperationIdentifier.tokenHolder,
            clearingOperationIdentifier.partition
        );
    }

    function adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        address to
    ) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(
            clearingOperationIdentifier.partition,
            clearingOperationIdentifier.tokenHolder,
            to
        );

        updateClearing(
            clearingOperationIdentifier,
            updateTotalCleared(clearingOperationIdentifier.partition, clearingOperationIdentifier.tokenHolder)
        );
    }

    function updateClearing(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        uint256 abaf
    ) internal {
        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(clearingOperationIdentifier);

        if (abaf == clearingLabaf) {
            return;
        }
        updateClearingAmountById(
            clearingOperationIdentifier,
            AdjustBalancesStorageWrapper.calculateFactor(abaf, clearingLabaf)
        );
        AdjustBalancesStorageWrapper.setClearedLabafById(clearingOperationIdentifier, abaf);
    }

    function updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier,
        uint256 factor
    ) internal {
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            clearingStorage()
            .clearingTransferByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId].amount *= factor;
            return;
        }
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            clearingStorage()
            .clearingRedeemByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingId].amount *= factor;
            return;
        }
        clearingStorage()
        .clearingHoldCreationByAccountPartitionAndId[clearingOperationIdentifier.tokenHolder][
            clearingOperationIdentifier.partition
        ][clearingOperationIdentifier.clearingId].amount *= factor;
    }

    function increaseClearedAmounts(address tokenHolder, bytes32 partition, uint256 amount) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition] += amount;
        clearingStorage().totalClearedAmountByAccount[tokenHolder] += amount;
    }

    function updateTotalCleared(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalClearedLabaf(tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            updateTotalClearedAmountAndLabaf(
                tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf),
                abaf_
            );
        }

        if (abaf_ != labafByPartition) {
            updateTotalClearedAmountAndLabafByPartition(
                partition,
                tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    function updateTotalClearedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        clearingStorage().totalClearedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper.setTotalClearedLabaf(tokenHolder, abaf);
    }

    function updateTotalClearedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
        AdjustBalancesStorageWrapper.setTotalClearedLabafByPartition(partition, tokenHolder, abaf);
    }

    function setClearingIdByPartitionAndType(
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

    function decreaseAllowedBalanceForClearing(
        bytes32 partition,
        uint256 clearingId,
        IClearing.ClearingOperationType clearingOperationType,
        address from,
        uint256 amount
    ) internal {
        address spender = msg.sender;
        ERC20StorageWrapper.decreaseAllowedBalance(from, spender, amount);
        clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[from][partition][clearingOperationType][
            clearingId
        ] = spender;
    }

    // ============ Guard Functions ============

    function requireValidClearingId(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view {
        if (!isClearingIdValid(clearingOperationIdentifier)) revert IClearing.WrongClearingId();
    }

    function requireClearingActivated() internal view {
        if (!isClearingActivated()) revert IClearing.ClearingIsDisabled();
    }

    function requireExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        bool mustBeExpired
    ) internal view {
        if (isClearingBasicInfo(clearingOperationIdentifier).expirationTimestamp > block.timestamp != mustBeExpired) {
            if (mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    // ============ Read Functions (from ClearingStorageWrapper1) ============

    function isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view returns (bool) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType].contains(clearingOperationIdentifier.clearingId);
    }

    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    function isClearingInitialized() internal view returns (bool) {
        return clearingStorage().initialized;
    }

    function getClearingCountForByPartition(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType clearingOperationType
    ) internal view returns (uint256) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[tokenHolder][partition][clearingOperationType].length();
    }

    function isClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory clearingOperationIdentifier
    ) internal view returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_) {
        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            IClearingTransfer.ClearingRedeemData memory clearingRedeemData = getClearingRedeemForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
            return
                buildClearingOperationBasicInfo(
                    clearingRedeemData.expirationTimestamp,
                    clearingRedeemData.amount,
                    address(0)
                );
        }

        if (clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            IClearingTransfer.ClearingTransferData memory clearingTransferData = getClearingTransferForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
            return
                buildClearingOperationBasicInfo(
                    clearingTransferData.expirationTimestamp,
                    clearingTransferData.amount,
                    clearingTransferData.destination
                );
        }

        IClearingTransfer.ClearingHoldCreationData
            memory clearingHoldCreationData = getClearingHoldCreationForByPartition(
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.clearingId
            );
        return
            buildClearingOperationBasicInfo(
                clearingHoldCreationData.expirationTimestamp,
                clearingHoldCreationData.amount,
                clearingHoldCreationData.holdTo
            );
    }

    function getClearingsIdForByPartition(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType clearingOperationType,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory clearingsId_) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[tokenHolder][partition][clearingOperationType].getFromSet(
                    pageIndex,
                    pageLength
                );
    }

    function getClearingThirdParty(
        bytes32 partition,
        address tokenHolder,
        IClearing.ClearingOperationType operationType,
        uint256 clearingId
    ) internal view returns (address thirdParty_) {
        thirdParty_ = clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[tokenHolder][partition][
            operationType
        ][clearingId];
    }

    function getClearingTransferForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = clearingStorage().clearingTransferByAccountPartitionAndId[tokenHolder][partition][
            clearingId
        ];
    }

    function getClearingRedeemForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = clearingStorage().clearingRedeemByAccountPartitionAndId[tokenHolder][partition][
            clearingId
        ];
    }

    function getClearingHoldCreationForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = clearingStorage().clearingHoldCreationByAccountPartitionAndId[tokenHolder][
            partition
        ][clearingId];
    }

    function getClearedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return clearingStorage().totalClearedAmountByAccount[tokenHolder];
    }

    function getClearedAmountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 amount_) {
        return clearingStorage().totalClearedAmountByAccountAndPartition[tokenHolder][partition];
    }

    // ============ Adjusted Read Functions ============

    function getClearedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactorForClearedAmountByTokenHolderAdjustedAt(
            tokenHolder,
            timestamp
        );
        return getClearedAmountFor(tokenHolder) * factor;
    }

    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(partition, tokenHolder)
        );
        return getClearedAmountForByPartition(partition, tokenHolder) * factor;
    }

    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = getClearingTransferForByPartition(partition, tokenHolder, clearingId);

        clearingTransferData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.Transfer
                )
            )
        );
    }

    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = getClearingRedeemForByPartition(partition, tokenHolder, clearingId);

        clearingRedeemData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.Redeem
                )
            )
        );
    }

    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        uint256 timestamp
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = getClearingHoldCreationForByPartition(partition, tokenHolder, clearingId);

        clearingHoldCreationData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                buildClearingOperationIdentifier(
                    tokenHolder,
                    partition,
                    clearingId,
                    IClearing.ClearingOperationType.HoldCreation
                )
            )
        );
    }

    // ============ Storage Accessor ============

    function clearingStorage() internal pure returns (IClearing.ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    // ============ Build Helpers (Pure Functions) ============

    function buildClearingTransferData(
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

    function buildClearingRedeemData(
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

    function buildClearingHoldCreationData(
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

    function buildClearingOperationIdentifier(
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

    function buildClearingOperationBasicInfo(
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

    // ============ Private Helper Functions ============

    function clearingTransferExecution(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes32 partition_) {
        IClearing.ClearingTransferData memory clearingTransferData = getClearingTransferForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        address destination = tokenHolder;

        if (operation == IClearingActions.ClearingActionType.Approve) {
            ERC1594StorageWrapper.checkIdentity(tokenHolder, clearingTransferData.destination);
            ERC1594StorageWrapper.checkCompliance(tokenHolder, clearingTransferData.destination, false);

            destination = clearingTransferData.destination;

            partition_ = partition;
        }

        transferClearingBalance(partition, destination, clearingTransferData.amount);

        if (
            tokenHolder != destination &&
            ERC3643StorageWrapper.erc3643Storage().compliance != address(0) &&
            partition == _DEFAULT_PARTITION
        ) {
            (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
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

    function clearingRedeemExecution(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_) {
        IClearing.ClearingRedeemData memory clearingRedeemData = getClearingRedeemForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        if (operation == IClearingActions.ClearingActionType.Approve) {
            ERC1594StorageWrapper.checkIdentity(tokenHolder, address(0));
            ERC1594StorageWrapper.checkCompliance(tokenHolder, address(0), false);
        } else transferClearingBalance(partition, tokenHolder, clearingRedeemData.amount);

        success_ = true;
        amount_ = clearingRedeemData.amount;
        operatorType_ = clearingRedeemData.operatorType;
    }

    function clearingHoldCreationExecution(
        bytes32 partition,
        address tokenHolder,
        uint256 clearingId,
        IClearingActions.ClearingActionType operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes memory operationData_) {
        IClearing.ClearingHoldCreationData memory clearingHoldCreationData = getClearingHoldCreationForByPartition(
            partition,
            tokenHolder,
            clearingId
        );

        transferClearingBalance(partition, tokenHolder, clearingHoldCreationData.amount);

        if (operation == IClearingActions.ClearingActionType.Approve) {
            uint256 holdId;
            (, holdId) = HoldStorageWrapper.createHoldByPartition(
                partition,
                tokenHolder,
                fromClearingHoldCreationDataToHold(clearingHoldCreationData),
                clearingHoldCreationData.operatorData,
                clearingHoldCreationData.operatorType
            );
            operationData_ = abi.encode(holdId);
        }

        success_ = true;
        amount_ = clearingHoldCreationData.amount;
        operatorType_ = clearingHoldCreationData.operatorType;
    }

    function restoreAllowanceAndRemoveClearing(
        IClearingActions.ClearingActionType operation,
        ThirdPartyType operatorType,
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        uint256 amount
    ) private {
        restoreClearingAllowance(operation, operatorType, clearingOperationIdentifier, amount);
        removeClearing(
            buildClearingOperationIdentifier(
                clearingOperationIdentifier.tokenHolder,
                clearingOperationIdentifier.partition,
                clearingOperationIdentifier.clearingId,
                clearingOperationIdentifier.clearingOperationType
            )
        );
    }

    function restoreClearingAllowance(
        IClearingActions.ClearingActionType operation,
        ThirdPartyType operatorType,
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier,
        uint256 amount
    ) private {
        if (!(operation != IClearingActions.ClearingActionType.Approve && operatorType == ThirdPartyType.AUTHORIZED))
            return;

        ERC20StorageWrapper.increaseAllowedBalance(
            clearingOperationIdentifier.tokenHolder,
            clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType][clearingOperationIdentifier.clearingId],
            amount
        );
    }

    function emitClearedTransferEvent(
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

    function emitClearedRedeemEvent(
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

    function emitClearedHoldByPartitionEvent(
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

    function fromClearingHoldCreationDataToHold(
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
