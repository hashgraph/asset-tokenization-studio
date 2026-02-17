// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapInternals } from "../cap/CapInternals.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../layer_1/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../layer_1/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "../common/types/ThirdPartyType.sol";
import { Hold } from "../../layer_1/interfaces/hold/IHold.sol";

abstract contract ClearingInternals is CapInternals {
    function _adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal virtual;
    function _approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_, bytes memory operationData_, bytes32 partition_);
    function _beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal virtual;
    function _cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
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
    function _decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) internal virtual;
    function _increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initializeClearing(bool _clearingActive) internal virtual;
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
    function _reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal virtual returns (bool success_);
    function _removeClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal virtual;
    function _removeLabafClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal virtual;
    function _setClearedLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal virtual;
    function _setClearing(bool _activated) internal virtual returns (bool success_);
    function _setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _labaf
    ) internal virtual;
    function _transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _abaf
    ) internal virtual;
    function _updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _factor
    ) internal virtual;
    function _updateTotalCleared(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalClearedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalClearedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
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
    function _checkExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view virtual;
    function _checkExpirationTimestamp(uint256 _expirationTimestamp) internal view virtual;
    function _getClearedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
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
    function _getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view virtual returns (IClearingTransfer.ClearingHoldCreationData memory clearingHoldCreationData_);
    function _getClearingLabafById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view virtual returns (uint256);
    function _getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view virtual returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_);
    function _getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
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
    function _getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view virtual returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_);
    function _getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory clearingsId_);
    function _getTotalClearedLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalClearedLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
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
}
