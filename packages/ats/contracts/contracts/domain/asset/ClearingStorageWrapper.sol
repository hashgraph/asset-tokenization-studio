// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CLEARING_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { IClearingStorageWrapper } from "./clearing/IClearingStorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";

/// @title ClearingStorageWrapper - Pure Storage Operations
/// @notice Contains ONLY storage operations for clearing data.
/// @dev Orchestration logic moved to ClearingOps. This library manages storage slot access.
library ClearingStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    // ============ Init & Config (internal first) ============

    function initializeClearing(bool clearingActive) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = clearingStorage();
        clearingStorage_.initialized = true;
        clearingStorage_.activated = clearingActive;
    }

    function setClearing(bool activated) internal returns (bool success_) {
        clearingStorage().activated = activated;
        return true;
    }

    // ============ State Checks (internal view) ============

    function isClearingInitialized() internal view returns (bool) {
        return clearingStorage().initialized;
    }

    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    // ============ Storage Accessor (internal pure last) ============

    function clearingStorage() internal pure returns (IClearing.ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    // solhint-disable-next-line ordering
    function isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view returns (bool) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType].contains(clearingOperationIdentifier.clearingId);
    }

    // ============ Pure Storage Write Functions ============

    /// @notice Get next clearing ID and increment - pure storage operation
    function increaseClearingId(
        address _from,
        bytes32 _partition,
        IClearing.ClearingOperationType _operationType
    ) internal returns (uint256 clearingId_) {
        IClearing.ClearingDataStorage storage clearingDataStorage = clearingStorage();
        unchecked {
            clearingId_ = ++clearingDataStorage.nextClearingIdByAccountPartitionAndType[_from][_partition][
                _operationType
            ];
        }
        setClearingIdByPartitionAndType(clearingDataStorage, _from, _partition, clearingId_, _operationType);
    }

    /// @notice Set clearing transfer data - pure storage operation
    function setClearingTransferData(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _to,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingTransferByAccountPartitionAndId[_from][_partition][_clearingId] = IClearing
            .ClearingTransferData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                destination: _to,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    /// @notice Set clearing redeem data - pure storage operation
    function setClearingRedeemData(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingRedeemByAccountPartitionAndId[_from][_partition][_clearingId] = IClearing
            .ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    /// @notice Set clearing hold creation data - pure storage operation
    function setClearingHoldCreationData(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        uint256 _holdExpirationTimestamp,
        bytes memory _data,
        bytes memory _holdData,
        address _escrow,
        address _to,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingHoldCreationByAccountPartitionAndId[_from][_partition][_clearingId] = IClearing
            .ClearingHoldCreationData({
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

    /// @notice Multiply total cleared amount by factor - pure storage operation
    function multiplyTotalClearedAmount(address _tokenHolder, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] *= _factor;
    }

    /// @notice Multiply total cleared amount by partition by factor - pure storage operation
    function multiplyTotalClearedAmountByPartition(address _tokenHolder, bytes32 _partition, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
    }

    /// @notice Set clearing third party - pure storage operation
    function setClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId,
        address _spender
    ) internal {
        clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][_operationType][
            _clearingId
        ] = _spender;
    }

    /// @notice Set clearing ID by partition and type - pure storage operation
    function setClearingIdByPartitionAndType(
        IClearing.ClearingDataStorage storage clearingDataStorage,
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal {
        clearingDataStorage.clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_operationType].add(
            _clearingId
        );
    }

    /// @notice Increase cleared amounts - pure storage operation
    function increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] += _amount;
    }

    /// @notice Update clearing amount by ID - pure storage operation
    function updateClearingAmountById(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _factor
    ) internal {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            clearingStorage()
            .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].amount *= _factor;
            return;
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            clearingStorage()
            .clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].amount *= _factor;
            return;
        }
        clearingStorage()
        .clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingId].amount *= _factor;
    }

    /// @notice Remove clearing - pure storage operation
    function removeClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        IClearing.ClearingDataStorage storage clearingStorage_ = clearingStorage();
        uint256 amount = _isClearingBasicInfo(_clearingOperationIdentifier).amount;

        clearingStorage_.totalClearedAmountByAccount[_clearingOperationIdentifier.tokenHolder] -= amount;
        clearingStorage_.totalClearedAmountByAccountAndPartition[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ] -= amount;

        clearingStorage_
        .clearingIdsByAccountAndPartitionAndTypes[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType].remove(_clearingOperationIdentifier.clearingId);

        delete clearingStorage_.clearingThirdPartyByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId];

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer)
            delete clearingStorage_.clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem)
            delete clearingStorage_.clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else
            delete clearingStorage_.clearingHoldCreationByAccountPartitionAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];

        AdjustBalancesStorageWrapper.removeLabafClearing(_clearingOperationIdentifier);
    }

    // ============ Read Functions (Pure) ============

    /// @notice Get clearing basic info (calldata version for external calls)
    function isClearingBasicInfo(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (IClearing.ClearingOperationBasicInfo memory) {
        return _isClearingBasicInfo(_clearingOperationIdentifier);
    }

    /// @notice Internal helper for memory parameter
    function _isClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (IClearing.ClearingOperationBasicInfo memory) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            IClearing.ClearingTransferData memory data = clearingStorage().clearingTransferByAccountPartitionAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];
            return
                IClearing.ClearingOperationBasicInfo({
                    amount: data.amount,
                    expirationTimestamp: data.expirationTimestamp,
                    destination: data.destination
                });
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            IClearing.ClearingRedeemData memory data = clearingStorage().clearingRedeemByAccountPartitionAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];
            return
                IClearing.ClearingOperationBasicInfo({
                    amount: data.amount,
                    expirationTimestamp: data.expirationTimestamp,
                    destination: address(0)
                });
        }
        IClearing.ClearingHoldCreationData memory data = clearingStorage().clearingHoldCreationByAccountPartitionAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];
        return
            IClearing.ClearingOperationBasicInfo({
                amount: data.amount,
                expirationTimestamp: data.expirationTimestamp,
                destination: data.holdTo
            });
    }

    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearing.ClearingTransferData memory) {
        return clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearing.ClearingRedeemData memory) {
        return clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    function getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearing.ClearingHoldCreationData memory) {
        return clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    function getClearedAmountFor(address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccount[_tokenHolder];
    }

    function getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _clearingId
    ) internal view returns (address) {
        return
            clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][
                _clearingOperationType
            ][_clearingId];
    }

    function getClearingThirdPartyType(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (ThirdPartyType) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            return
                clearingStorage()
                .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId].operatorType;
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            return
                clearingStorage()
                .clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId].operatorType;
        } else {
            return
                clearingStorage()
                .clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId].operatorType;
        }
    }

    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal view returns (uint256) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].length();
    }

    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].getFromSet(
                    _pageIndex,
                    _pageLength
                );
    }

    // ============ Build Functions ============

    function buildClearingOperationIdentifier(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal pure returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: _tokenHolder,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _clearingOperationType
            });
    }

    function buildClearingTransferData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _destination,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearing.ClearingTransferData memory) {
        return
            IClearing.ClearingTransferData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                destination: _destination,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    function buildClearingRedeemData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearing.ClearingRedeemData memory) {
        return
            IClearing.ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    function buildClearingHoldCreationData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _holdData,
        address _holdEscrow,
        address _holdTo,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearing.ClearingHoldCreationData memory) {
        return
            IClearing.ClearingHoldCreationData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                holdExpirationTimestamp: 0,
                holdEscrow: _holdEscrow,
                holdTo: _holdTo,
                holdData: _holdData,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    // ============ Guard Functions ============

    function requireValidClearingId(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view {
        if (!isClearingIdValid(_clearingOperationIdentifier)) revert IClearing.WrongClearingId();
    }

    function requireClearingActivated() internal view {
        if (!isClearingActivated()) revert IClearing.ClearingIsDisabled();
    }

    function requireExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view {
        if (isClearingBasicInfo(_clearingOperationIdentifier).expirationTimestamp > block.timestamp != _mustBeExpired) {
            if (_mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    function _checkClearingDisabled() internal view {
        if (isClearingActivated()) {
            revert IClearing.ClearingIsActivated();
        }
    }
}
