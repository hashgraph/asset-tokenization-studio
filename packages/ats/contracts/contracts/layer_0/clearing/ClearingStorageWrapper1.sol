// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CLEARING_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { HoldStorageWrapper1 } from "../hold/HoldStorageWrapper1.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../../layer_1/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../layer_1/interfaces/clearing/IClearingRedeem.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { IClearingHoldCreation } from "../../layer_1/interfaces/clearing/IClearingHoldCreation.sol";
import { LibCommon } from "../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ThirdPartyType } from "../common/types/ThirdPartyType.sol";

abstract contract ClearingStorageWrapper1 is HoldStorageWrapper1 {
    using LibCommon for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    modifier onlyWithValidClearingId(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) {
        _checkClearingId(_clearingOperationIdentifier);
        _;
    }

    modifier onlyClearingActivated() {
        _checkClearingActivated();
        _;
    }

    modifier validateExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) {
        _checkExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired);
        _;
    }

    function _setClearing(bool _activated) internal override returns (bool success_) {
        _clearingStorage().activated = _activated;
        success_ = true;
    }

    function _isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view override returns (bool) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingOperationType].contains(_clearingOperationIdentifier.clearingId);
    }

    function _isClearingActivated() internal view override returns (bool) {
        return _clearingStorage().activated;
    }

    function _getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal view override returns (uint256) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].length();
    }

    function _getClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view override returns (IClearing.ClearingOperationBasicInfo memory clearingOperationBasicInfo_) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            IClearingTransfer.ClearingRedeemData memory clearingRedeemData = _getClearingRedeemForByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );
            return
                _buildClearingOperationBasicInfo(
                    clearingRedeemData.expirationTimestamp,
                    clearingRedeemData.amount,
                    address(0)
                );
        }

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            IClearingTransfer.ClearingTransferData memory clearingTransferData = _getClearingTransferForByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
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
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );
        return
            _buildClearingOperationBasicInfo(
                clearingHoldCreationData.expirationTimestamp,
                clearingHoldCreationData.amount,
                clearingHoldCreationData.holdTo
            );
    }

    function _getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (uint256[] memory clearingsId_) {
        return
            _clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].getFromSet(
                    _pageIndex,
                    _pageLength
                );
    }

    function _getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId
    ) internal view override returns (address thirdParty_) {
        thirdParty_ = _clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][
            _operationType
        ][_clearingId];
    }

    function _getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view override returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = _clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][
            _clearingId
        ];
    }

    function _getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view override returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = _clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][
            _clearingId
        ];
    }

    function _getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view override returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = _clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][
            _partition
        ][_clearingId];
    }

    function _getClearedAmountFor(address _tokenHolder) internal view override returns (uint256 amount_) {
        return _clearingStorage().totalClearedAmountByAccount[_tokenHolder];
    }

    function _getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 amount_) {
        return _clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _checkExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view {
        if (_isExpired(_getClearingBasicInfo(_clearingOperationIdentifier).expirationTimestamp) != _mustBeExpired) {
            if (_mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    function _buildClearingTransferData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _to,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure override returns (IClearing.ClearingTransferData memory) {
        return
            IClearing.ClearingTransferData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                destination: _to,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    function _buildClearingRedeemData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure override returns (IClearing.ClearingRedeemData memory) {
        return
            IClearing.ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

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
    ) internal pure override returns (IClearing.ClearingHoldCreationData memory) {
        return
            IClearing.ClearingHoldCreationData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                holdEscrow: _escrow,
                holdExpirationTimestamp: _holdExpirationTimestamp,
                holdTo: _to,
                holdData: _holdData,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    function _buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal pure override returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: _from,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _operationType
            });
    }

    function _clearingStorage() internal pure returns (IClearing.ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    function _checkClearingId(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) private view {
        if (!_isClearingIdValid(_clearingOperationIdentifier)) revert IClearing.WrongClearingId();
    }

    function _checkClearingActivated() private view {
        if (!_isClearingActivated()) revert IClearing.ClearingIsDisabled();
    }

    function _buildClearingOperationBasicInfo(
        uint256 _expirationTimestamp,
        uint256 _amount,
        address _destination
    ) private pure returns (IClearing.ClearingOperationBasicInfo memory) {
        return
            IClearing.ClearingOperationBasicInfo({
                expirationTimestamp: _expirationTimestamp,
                amount: _amount,
                destination: _destination
            });
    }
}
