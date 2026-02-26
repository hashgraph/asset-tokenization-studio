// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { clearingStorage, ClearingDataStorage } from "../../storage/FinancialOpsStorageAccessor.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title LibClearing
/// @notice Library for managing clearing operations and state in the token contract
/// @dev Internal functions only - designed to be used within storage wrappers and facets
library LibClearing {
    using EnumerableSet for EnumerableSet.UintSet;

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION & CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initialize clearing system
    /// @param _clearingActive Whether clearing is activated by default
    function initializeClearing(bool _clearingActive) internal {
        ClearingDataStorage storage clearing = clearingStorage();
        clearing.initialized = true;
        clearing.activated = _clearingActive;
    }

    /// @notice Check if clearing system is initialized
    /// @return Whether clearing has been initialized
    function isClearingInitialized() internal view returns (bool) {
        return clearingStorage().initialized;
    }

    /// @notice Check if clearing is currently activated
    /// @return Whether clearing system is active
    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    /// @notice Check if a clearing ID is valid
    /// @param _clearingOperationIdentifier The clearing operation identifier
    /// @return Whether the clearing ID exists and is valid
    function isClearingIdValid(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (bool) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingOperationType].contains(_clearingOperationIdentifier.clearingId);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Enable or disable clearing system
    /// @param _activated New activation status
    /// @return success_ Whether the operation succeeded
    // solhint-disable-next-line ordering
    function setClearing(bool _activated) internal returns (bool success_) {
        clearingStorage().activated = _activated;
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING OPERATION CREATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Create a clearing transfer operation
    /// @param _partition The partition for the clearing
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing operation ID
    /// @param _amount The amount being cleared
    /// @param _expirationTimestamp When the clearing expires
    /// @param _destination The destination address for transfer
    /// @param _data Additional transfer data
    /// @param _operatorData Operator-provided data
    /// @param _operatorType Type of operator performing the operation
    function setClearingTransferData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _destination,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][
            _clearingId
        ] = IClearingTransfer.ClearingTransferData({
            amount: _amount,
            expirationTimestamp: _expirationTimestamp,
            destination: _destination,
            data: _data,
            operatorData: _operatorData,
            operatorType: _operatorType
        });
    }

    /// @notice Create a clearing redeem operation
    /// @param _partition The partition for the clearing
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing operation ID
    /// @param _amount The amount being redeemed
    /// @param _expirationTimestamp When the clearing expires
    /// @param _data Additional redeem data
    /// @param _operatorData Operator-provided data
    /// @param _operatorType Type of operator performing the operation
    function setClearingRedeemData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId] = IClearingRedeem
            .ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    /// @notice Create a clearing hold creation operation
    /// @param _partition The partition for the clearing
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing operation ID
    /// @param _amount The amount being held
    /// @param _expirationTimestamp When the clearing expires
    /// @param _holdExpirationTimestamp When the hold itself expires
    /// @param _data Additional clearing data
    /// @param _holdData Hold-specific data
    /// @param _holdEscrow The escrow address for the hold
    /// @param _holdTo The recipient of the held amount
    /// @param _operatorData Operator-provided data
    /// @param _operatorType Type of operator performing the operation
    function setClearingHoldCreationData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        uint256 _holdExpirationTimestamp,
        bytes memory _data,
        bytes memory _holdData,
        address _holdEscrow,
        address _holdTo,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal {
        clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][
            _clearingId
        ] = IClearingHoldCreation.ClearingHoldCreationData({
            amount: _amount,
            expirationTimestamp: _expirationTimestamp,
            data: _data,
            holdEscrow: _holdEscrow,
            holdExpirationTimestamp: _holdExpirationTimestamp,
            holdTo: _holdTo,
            holdData: _holdData,
            operatorData: _operatorData,
            operatorType: _operatorType
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING DATA RETRIEVAL
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get clearing transfer data for a specific clearing
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing ID
    /// @return clearingTransferData_ The clearing transfer data
    function getClearingTransferData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        return clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Get clearing redeem data for a specific clearing
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing ID
    /// @return clearingRedeemData_ The clearing redeem data
    function getClearingRedeemData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        return clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Get clearing hold creation data for a specific clearing
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _clearingId The clearing ID
    /// @return clearingHoldCreationData_ The clearing hold creation data
    function getClearingHoldCreationData(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        return clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Get basic information about a clearing operation
    /// @param _clearingOperationIdentifier The clearing operation identifier
    /// @return expirationTimestamp_ When the clearing expires
    /// @return amount_ The amount involved
    /// @return destination_ The destination address (for transfers) or zero address
    function getClearingBasicInfo(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256 expirationTimestamp_, uint256 amount_, address destination_) {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            IClearingRedeem.ClearingRedeemData memory clearingRedeemData = getClearingRedeemData(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );
            return (clearingRedeemData.expirationTimestamp, clearingRedeemData.amount, address(0));
        }

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            IClearingTransfer.ClearingTransferData memory clearingTransferData = getClearingTransferData(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );
            return (
                clearingTransferData.expirationTimestamp,
                clearingTransferData.amount,
                clearingTransferData.destination
            );
        }

        IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData = getClearingHoldCreationData(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.clearingId
        );
        return (
            clearingHoldCreationData.expirationTimestamp,
            clearingHoldCreationData.amount,
            clearingHoldCreationData.holdTo
        );
    }

    /// @notice Get the third party associated with a clearing operation
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _operationType The type of clearing operation
    /// @param _clearingId The clearing ID
    /// @return thirdParty_ The third party address
    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId
    ) internal view returns (address thirdParty_) {
        return
            clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][_operationType][
                _clearingId
            ];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING ENUMERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get the count of clearings for a specific type
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _clearingOperationType The type of clearing operation
    /// @return Count of clearings
    function getClearingCount(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType
    ) internal view returns (uint256) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].length();
    }

    /// @notice Get clearing IDs for pagination
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @param _clearingOperationType The type of clearing operation
    /// @param _pageIndex The page index for pagination
    /// @param _pageLength The number of items per page
    /// @return clearingsId_ Array of clearing IDs
    function getClearingIds(
        bytes32 _partition,
        address _tokenHolder,
        IClearing.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory clearingsId_) {
        EnumerableSet.UintSet storage clearingIds = clearingStorage().clearingIdsByAccountAndPartitionAndTypes[
            _tokenHolder
        ][_partition][_clearingOperationType];

        uint256 totalLength = clearingIds.length();
        uint256 startIndex = _pageIndex * _pageLength;
        uint256 endIndex = startIndex + _pageLength;

        // Calculate actual items to return
        if (startIndex >= totalLength) {
            return new uint256[](0);
        }

        if (endIndex > totalLength) {
            endIndex = totalLength;
        }

        uint256 resultLength = endIndex - startIndex;
        clearingsId_ = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            clearingsId_[i] = clearingIds.at(startIndex + i);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARED AMOUNTS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get the total cleared amount for an account across all partitions
    /// @param _tokenHolder The token holder's address
    /// @return amount_ The total cleared amount
    function getClearedAmount(address _tokenHolder) internal view returns (uint256 amount_) {
        return clearingStorage().totalClearedAmountByAccount[_tokenHolder];
    }

    /// @notice Get the cleared amount for an account in a specific partition
    /// @param _partition The partition
    /// @param _tokenHolder The token holder's address
    /// @return amount_ The cleared amount for the partition
    function getClearedAmountByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /// @notice Increase cleared amounts when a clearing is created
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _amount The amount being cleared
    function increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal {
        ClearingDataStorage storage clearing = clearingStorage();
        clearing.totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        clearing.totalClearedAmountByAccount[_tokenHolder] += _amount;
    }

    /// @notice Update the amount in an existing clearing (e.g., due to LABAF adjustments)
    /// @param _clearingOperationIdentifier The clearing operation identifier
    /// @param _factor The multiplication factor to apply
    function updateClearingAmount(
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

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING REMOVAL
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Remove a clearing operation from storage
    /// @param _clearingOperationIdentifier The clearing operation identifier
    function removeClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        ClearingDataStorage storage clearing = clearingStorage();
        uint256 amount = getClearedAmountByPartition(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder
        );

        clearing.totalClearedAmountByAccount[_clearingOperationIdentifier.tokenHolder] -= amount;
        clearing.totalClearedAmountByAccountAndPartition[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ] -= amount;

        clearing
        .clearingIdsByAccountAndPartitionAndTypes[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType].remove(_clearingOperationIdentifier.clearingId);

        delete clearing.clearingThirdPartyByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId];

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer)
            delete clearing.clearingTransferByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem)
            delete clearing.clearingRedeemByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
        else
            delete clearing.clearingHoldCreationByAccountPartitionAndId[_clearingOperationIdentifier.tokenHolder][
                _clearingOperationIdentifier.partition
            ][_clearingOperationIdentifier.clearingId];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Register a clearing ID for an account, partition, and operation type
    /// @param _clearingDataStorage Reference to clearing data storage
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID to register
    /// @param _operationType The type of clearing operation
    function setClearingIdByPartitionAndType(
        ClearingDataStorage storage _clearingDataStorage,
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal {
        _clearingDataStorage.clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_operationType].add(
            _clearingId
        );
    }

    /// @notice Register a third party for a clearing operation
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    /// @param _operationType The type of clearing operation
    /// @param _tokenHolder The token holder's address
    /// @param _thirdParty The third party address
    function setClearingThirdParty(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType,
        address _tokenHolder,
        address _thirdParty
    ) internal {
        clearingStorage().clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][_operationType][
            _clearingId
        ] = _thirdParty;
    }

    /// @notice Get and increment the next clearing ID
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _operationType The type of clearing operation
    /// @return nextClearingId_ The next clearing ID to use
    function getAndIncrementNextClearingId(
        address _tokenHolder,
        bytes32 _partition,
        IClearing.ClearingOperationType _operationType
    ) internal returns (uint256 nextClearingId_) {
        ClearingDataStorage storage clearing = clearingStorage();
        unchecked {
            nextClearingId_ = ++clearing.nextClearingIdByAccountPartitionAndType[_tokenHolder][_partition][
                _operationType
            ];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SET CLEARING DATA BY STRUCT (for orchestrator convenience)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Set clearing transfer data using struct
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    /// @param _data The clearing transfer data struct
    function setClearingTransferDataStruct(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingTransfer.ClearingTransferData memory _data
    ) internal {
        ClearingDataStorage storage cs = clearingStorage();
        cs.clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId] = _data;
        cs
        .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][IClearing.ClearingOperationType.Transfer]
            .add(_clearingId);
    }

    /// @notice Set clearing redeem data using struct
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    /// @param _data The clearing redeem data struct
    function setClearingRedeemDataStruct(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingRedeem.ClearingRedeemData memory _data
    ) internal {
        ClearingDataStorage storage cs = clearingStorage();
        cs.clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId] = _data;
        cs
        .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][IClearing.ClearingOperationType.Redeem].add(
                _clearingId
            );
    }

    /// @notice Set clearing hold creation data using struct
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    /// @param _data The clearing hold creation data struct
    function setClearingHoldCreationDataStruct(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingHoldCreation.ClearingHoldCreationData memory _data
    ) internal {
        ClearingDataStorage storage cs = clearingStorage();
        cs.clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId] = _data;
        cs
        .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][
            IClearing.ClearingOperationType.HoldCreation
        ].add(_clearingId);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOTAL CLEARED AMOUNT UPDATES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Update total cleared amount by account with ABAF factor
    /// @param _tokenHolder The token holder's address
    /// @param _factor The multiplication factor
    function updateTotalClearedAmountByAccount(address _tokenHolder, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] *= _factor;
    }

    /// @notice Update total cleared amount by account and partition with ABAF factor
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _factor The multiplication factor
    function updateTotalClearedAmountByAccountAndPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _factor
    ) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
    }

    /// @notice Decrease total cleared amounts
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _amount The amount to decrease
    function decreaseTotalClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal {
        ClearingDataStorage storage clearing = clearingStorage();
        clearing.totalClearedAmountByAccount[_tokenHolder] -= _amount;
        clearing.totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] -= _amount;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING ID MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Remove a clearing ID from the enumerable set
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _operationType The operation type
    /// @param _clearingId The clearing ID to remove
    function removeClearingId(
        address _tokenHolder,
        bytes32 _partition,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId
    ) internal {
        clearingStorage().clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_operationType].remove(
            _clearingId
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARING DATA DELETION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Delete clearing transfer data
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    function deleteClearingTransferData(address _tokenHolder, bytes32 _partition, uint256 _clearingId) internal {
        delete clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Delete clearing redeem data
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    function deleteClearingRedeemData(address _tokenHolder, bytes32 _partition, uint256 _clearingId) internal {
        delete clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Delete clearing hold creation data
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _clearingId The clearing ID
    function deleteClearingHoldCreationData(address _tokenHolder, bytes32 _partition, uint256 _clearingId) internal {
        delete clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /// @notice Delete clearing third party
    /// @param _tokenHolder The token holder's address
    /// @param _partition The partition
    /// @param _operationType The operation type
    /// @param _clearingId The clearing ID
    function deleteClearingThirdParty(
        address _tokenHolder,
        bytes32 _partition,
        IClearing.ClearingOperationType _operationType,
        uint256 _clearingId
    ) internal {
        ClearingDataStorage storage cs = clearingStorage();
        delete cs.clearingThirdPartyByAccountPartitionTypeAndId[_tokenHolder][_partition][_operationType][_clearingId];
    }
}
