// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CLEARING_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { LockStorageWrapper } from "./LockStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";

/// @title ClearingStorageWrapper - Pure Storage Operations
/// @notice Contains ONLY storage operations for clearing data.
/// @dev Orchestration logic moved to ClearingOps. This library manages storage slot access.
library ClearingStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    // solhint-disable max-line-length
    struct ClearingDataStorage {
        bool initialized;
        bool activated;
        mapping(address => uint256) totalClearedAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) totalClearedAmountByAccountAndPartition;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(IClearingTypes.ClearingOperationType => EnumerableSet.UintSet))) clearingIdsByAccountAndPartitionAndTypes;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(IClearingTypes.ClearingOperationType => uint256))) nextClearingIdByAccountPartitionAndType;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(uint256 => IClearingTypes.ClearingTransferData))) clearingTransferByAccountPartitionAndId;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(uint256 => IClearingTypes.ClearingRedeemData))) clearingRedeemByAccountPartitionAndId;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(uint256 => IClearingTypes.ClearingHoldCreationData))) clearingHoldCreationByAccountPartitionAndId;
        // solhint-disable-next-line max-line-length
        mapping(address => mapping(bytes32 => mapping(IClearingTypes.ClearingOperationType => mapping(uint256 => address)))) clearingThirdPartyByAccountPartitionTypeAndId;
    }
    // solhint-enable max-line-length

    function initializeClearing(bool clearingActive) internal {
        ClearingDataStorage storage clearingStorage_ = clearingStorage();
        clearingStorage_.initialized = true;
        clearingStorage_.activated = clearingActive;
    }

    function setClearing(bool activated) internal returns (bool success_) {
        clearingStorage().activated = activated;
        return true;
    }

    function isClearingInitialized() internal view returns (bool) {
        return clearingStorage().initialized;
    }

    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    function clearingStorage() internal pure returns (ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    // solhint-disable-next-line ordering
    function isClearingIdValid(
        IClearingTypes.ClearingOperationIdentifier calldata clearingOperationIdentifier
    ) internal view returns (bool) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[clearingOperationIdentifier.tokenHolder][
                clearingOperationIdentifier.partition
            ][clearingOperationIdentifier.clearingOperationType].contains(clearingOperationIdentifier.clearingId);
    }

    /// @notice Get next clearing ID and increment - pure storage operation
    function increaseClearingId(
        address _from,
        bytes32 _partition,
        IClearingTypes.ClearingOperationType _operationType
    ) internal returns (uint256 clearingId_) {
        ClearingDataStorage storage clearingDataStorage = clearingStorage();
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
        clearingStorage().clearingTransferByAccountPartitionAndId[_from][_partition][_clearingId] = IClearingTypes
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
        clearingStorage().clearingRedeemByAccountPartitionAndId[_from][_partition][_clearingId] = IClearingTypes
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
        clearingStorage().clearingHoldCreationByAccountPartitionAndId[_from][_partition][_clearingId] = IClearingTypes
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
        IClearingTypes.ClearingOperationType _operationType,
        uint256 _clearingId,
        address _spender
    ) internal {
        clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][_operationType][
            _clearingId
        ] = _spender;
    }

    /// @notice Set clearing ID by partition and type - pure storage operation
    function setClearingIdByPartitionAndType(
        ClearingDataStorage storage clearingDataStorage,
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingTypes.ClearingOperationType _operationType
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
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _factor
    ) internal {
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            clearingStorage()
            .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].amount *= _factor;
            return;
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
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
    function removeClearing(IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        ClearingDataStorage storage clearingStorage_ = clearingStorage();
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

        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer)
            delete clearingStorage_.clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem)
            delete clearingStorage_.clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else
            delete clearingStorage_.clearingHoldCreationByAccountPartitionAndId[
                _clearingOperationIdentifier.tokenHolder
            ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingId];

        AdjustBalancesStorageWrapper.removeLabafClearing(_clearingOperationIdentifier);
    }

    /// @notice Get clearing basic info (calldata version for external calls)
    function isClearingBasicInfo(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (IClearingTypes.ClearingOperationBasicInfo memory) {
        return _isClearingBasicInfo(_clearingOperationIdentifier);
    }

    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingTransferData memory) {
        return clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingRedeemData memory) {
        return clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    function getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingHoldCreationData memory) {
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
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _clearingId
    ) internal view returns (address) {
        return
            clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][
                _clearingOperationType
            ][_clearingId];
    }

    function getClearingThirdPartyType(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (ThirdPartyType) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            return
                clearingStorage()
                .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId].operatorType;
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            return
                clearingStorage()
                .clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId].operatorType;
        }
        return
            clearingStorage()
            .clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId].operatorType;
    }

    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) internal view returns (uint256) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].length();
    }

    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
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

    function buildClearingOperationIdentifier(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) internal pure returns (IClearingTypes.ClearingOperationIdentifier memory) {
        return
            IClearingTypes.ClearingOperationIdentifier({
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
    ) internal pure returns (IClearingTypes.ClearingTransferData memory) {
        return
            IClearingTypes.ClearingTransferData({
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
    ) internal pure returns (IClearingTypes.ClearingRedeemData memory) {
        return
            IClearingTypes.ClearingRedeemData({
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
    ) internal pure returns (IClearingTypes.ClearingHoldCreationData memory) {
        return
            IClearingTypes.ClearingHoldCreationData({
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

    function requireValidClearingId(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view {
        if (!isClearingIdValid(_clearingOperationIdentifier)) revert IClearingTypes.WrongClearingId();
    }

    function requireClearingActivated() internal view {
        if (!isClearingActivated()) revert IClearingTypes.ClearingIsDisabled();
    }

    function requireExpirationTimestamp(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view {
        if (
            TimeTravelStorageWrapper.getBlockTimestamp() >
            isClearingBasicInfo(_clearingOperationIdentifier).expirationTimestamp !=
            _mustBeExpired
        ) {
            if (_mustBeExpired) revert IClearingTypes.ExpirationDateNotReached();
            revert IClearingTypes.ExpirationDateReached();
        }
    }

    function checkClearingDisabled() internal view {
        if (isClearingActivated()) revert IClearingTypes.ClearingIsActivated();
    }

    function checkOperatorClearingTransferByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        bytes32 _partition
    ) internal view {
        LockStorageWrapper.requireValidExpirationTimestamp(_expirationTimestamp);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_account);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_to);
        ERC1410StorageWrapper.requireOperator(_partition, _from);
    }

    function checkClearingCreateHoldByPartition(
        uint256 _holdExpirationTimestamp,
        uint256 _operationExpirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        LockStorageWrapper.requireValidExpirationTimestamp(_holdExpirationTimestamp);
        LockStorageWrapper.requireValidExpirationTimestamp(_operationExpirationTimestamp);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_account);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_escrow);
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
    }

    function checkOperatorClearingCreateHoldByPartition(
        uint256 _holdExpirationTimestamp,
        uint256 _operationExpirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        checkClearingCreateHoldByPartition(
            _holdExpirationTimestamp,
            _operationExpirationTimestamp,
            _account,
            _to,
            _from,
            _escrow,
            _partition
        );
        ERC1410StorageWrapper.requireOperator(_partition, _from);
    }

    /// @notice Internal helper for memory parameter
    function _isClearingBasicInfo(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) private view returns (IClearingTypes.ClearingOperationBasicInfo memory) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            IClearingTypes.ClearingTransferData memory transferData = clearingStorage()
                .clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId];
            return
                IClearingTypes.ClearingOperationBasicInfo({
                    amount: transferData.amount,
                    expirationTimestamp: transferData.expirationTimestamp,
                    destination: transferData.destination
                });
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            IClearingTypes.ClearingRedeemData memory redeemData = clearingStorage()
                .clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                    _clearingOperationIdentifier.partition
                ][_clearingOperationIdentifier.clearingId];
            return
                IClearingTypes.ClearingOperationBasicInfo({
                    amount: redeemData.amount,
                    expirationTimestamp: redeemData.expirationTimestamp,
                    destination: address(0)
                });
        }
        IClearingTypes.ClearingHoldCreationData memory data = clearingStorage()
            .clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        return
            IClearingTypes.ClearingOperationBasicInfo({
                amount: data.amount,
                expirationTimestamp: data.expirationTimestamp,
                destination: data.holdTo
            });
    }
}
