// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { LockStorageWrapper } from "./LockStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";

/// @custom:hash storage Clearing
bytes32 constant STORAGE_LOCATION_CLEARING = 0xd7a6e2f3304ec7238486e8af625921e3cfd501a713f0b2036d4a701fd3e81800;

// solhint-disable max-line-length
/**
 * @notice Persistent storage layout for the Clearing facet.
 * @dev Holds the activation flags, aggregate cleared amounts per holder and partition,
 *      per-operation-type id sets, monotonically increasing next-id counters, and the
 *      per-operation payload mappings for transfer / redeem / hold-creation flows plus
 *      the third-party authorisation map. New fields must be appended below the marker
 *      to preserve ERC-7201 slot offsets.
 * @custom:storage-location erc7201:security.token.standard.storage.Clearing
 */
struct ClearingDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool activated; // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
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
    // ─── APPEND-ONLY ZONE BELOW ───
}
// solhint-enable max-line-length

/// @title ClearingStorageWrapper - Pure Storage Operations
/// @author Asset Tokenization Studio Team
/// @notice Contains ONLY storage operations for clearing data.
/// @dev Orchestration logic moved to ClearingOps. This library manages storage slot access.
library ClearingStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    /**
     * @notice Initialises the clearing storage with the supplied activation flag.
     * @dev Sets both the initialised and the activated booleans in one operation. Should
     *      be invoked exactly once during facet bootstrap.
     * @param clearingActive Whether clearing operations are active immediately after init.
     */
    function initializeClearing(bool clearingActive) internal {
        clearingStorage().activated = clearingActive;
    }

    /**
     * @notice Sets the clearing activation flag.
     * @param activated The new activation flag.
     * @return success_ Always true; reserved for future failure modes.
     */
    function setClearing(bool activated) internal returns (bool success_) {
        clearingStorage().activated = activated;
        return true;
    }

    /**
     * @notice Indicates whether clearing operations are currently active.
     * @return Whether new clearing operations may be created on this token.
     */
    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    /**
     * @notice Returns the storage reference at the ERC-7201 slot for the clearing namespace.
     * @dev Resolved via inline assembly against {STORAGE_LOCATION_CLEARING}.
     * @return clearing_ The storage reference for the clearing data struct.
     */
    function clearingStorage() internal pure returns (ClearingDataStorage storage clearing_) {
        bytes32 position = STORAGE_LOCATION_CLEARING;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }

    /**
     * @notice Indicates whether a clearing identifier is registered for the given context.
     * @param clearingOperationIdentifier The (holder, partition, operation type, id) tuple.
     * @return Whether the id is present in the corresponding {EnumerableSet.UintSet}.
     */
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

    /**
     * @notice Increments and returns the next clearing ID for the given holder, partition,
     *         and operation type.
     * @dev Monotonically increments a counter stored at the intersection of holder, partition,
     *      and operation type, registering the new ID in the enumerable set for pagination.
     * @param _from The token holder address.
     * @param _partition The partition to which the clearing belongs.
     * @param _operationType The clearing operation type (Transfer, Redeem, HoldCreation).
     * @return clearingId_ The newly incremented clearing ID.
     */
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

    /**
     * @notice Stores clearing transfer data in the clearing registry.
     * @dev Persists the transfer payload for the given holder, partition, and clearing ID
     *      to support subsequent retrieval, validation, and execution.
     * @param _from The token holder.
     * @param _partition The partition.
     * @param _clearingId The clearing operation ID.
     * @param _amount The transfer amount.
     * @param _expirationTimestamp Unix timestamp at which the clearing expires.
     * @param _to The transfer destination.
     * @param _data Transfer metadata.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator classification (AUTHORIZED, OPERATOR, PROTECTED).
     */
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

    /**
     * @notice Stores clearing redeem data in the clearing registry.
     * @dev Persists the redeem payload for the given holder, partition, and clearing ID
     *      to support subsequent retrieval, validation, and execution.
     * @param _from The token holder.
     * @param _partition The partition.
     * @param _clearingId The clearing operation ID.
     * @param _amount The redeem amount.
     * @param _expirationTimestamp Unix timestamp at which the clearing expires.
     * @param _data Redeem metadata.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator classification (AUTHORIZED, OPERATOR, PROTECTED).
     */
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

    /**
     * @notice Stores clearing hold creation data in the clearing registry.
     * @dev Persists the hold creation payload for the given holder, partition, and clearing
     *      ID to support subsequent retrieval, validation, and execution.
     * @param _from The token holder.
     * @param _partition The partition.
     * @param _clearingId The clearing operation ID.
     * @param _amount The hold amount.
     * @param _expirationTimestamp Unix timestamp at which the clearing expires.
     * @param _holdExpirationTimestamp Unix timestamp at which the hold expires.
     * @param _data Clearing metadata.
     * @param _holdData Hold-specific metadata.
     * @param _escrow The escrow account for the held tokens.
     * @param _to The hold beneficiary.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator classification (AUTHORIZED, OPERATOR, PROTECTED).
     */
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

    /**
     * @notice Multiplies the total cleared amount for a holder by the supplied factor.
     * @dev Used during rebalancing and snapshot operations to adjust historical clearing
     *      totals.
     * @param _tokenHolder The token holder.
     * @param _factor The multiplication factor.
     */
    function multiplyTotalClearedAmount(address _tokenHolder, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] *= _factor;
    }

    /**
     * @notice Multiplies the cleared amount for a holder and partition by the supplied
     *         factor.
     * @dev Used during rebalancing and snapshot operations to adjust historical clearing
     *      totals per partition.
     * @param _tokenHolder The token holder.
     * @param _partition The partition.
     * @param _factor The multiplication factor.
     */
    function multiplyTotalClearedAmountByPartition(address _tokenHolder, bytes32 _partition, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
    }

    /**
     * @notice Registers the third-party authoriser for a clearing operation.
     * @dev Stores the spender (operator) for subsequent authorisation and delegation
     *      checks.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _operationType The clearing operation type (Transfer, Redeem, HoldCreation).
     * @param _clearingId The clearing operation ID.
     * @param _spender The authorised third party.
     */
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

    /**
     * @notice Adds the supplied clearing ID to the enumerable set indexed by holder,
     *         partition, and operation type.
     * @dev Called during clearing creation to register the ID for pagination and
     *      existence checks.
     * @param clearingDataStorage The clearing storage reference.
     * @param _tokenHolder The token holder.
     * @param _partition The partition.
     * @param _clearingId The clearing operation ID to register.
     * @param _operationType The clearing operation type (Transfer, Redeem, HoldCreation).
     */
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

    /**
     * @notice Increases both the total cleared amount and the partition-scoped cleared
     *         amount for the given holder.
     * @dev Maintains two aggregates: account-wide and partition-specific.
     * @param _tokenHolder The token holder.
     * @param _partition The partition.
     * @param _amount The amount to add to both aggregates.
     */
    function increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] += _amount;
    }

    /**
     * @notice Multiplies the amount of the identified clearing operation by the supplied
     *         factor.
     * @dev Dispatches to the appropriate clearing data struct (Transfer, Redeem, or
     *      HoldCreation) based on operation type; used during rebalancing.
     * @param _clearingOperationIdentifier The clearing operation identifier (holder,
     *        partition, operation type, ID).
     * @param _factor The multiplication factor.
     */
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

    /**
     * @notice Deletes all state associated with the identified clearing operation.
     * @dev Removes the clearing ID from its enumerable set, decrements both aggregates,
     *      and deletes all payloads and authorisations.
     * @param _clearingOperationIdentifier The clearing operation identifier (holder,
     *        partition, operation type, ID).
     */
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

    /**
     * @notice Returns the basic clearing info (amount, expiration, destination) for the
     *         given clearing operation.
     * @dev Adaptor for calldata parameters; delegates to {_isClearingBasicInfo} with
     *      memory conversion.
     * @param _clearingOperationIdentifier The clearing operation identifier (calldata).
     * @return info_ Basic clearing information (amount, expiration timestamp,
     *         destination).
     */
    function isClearingBasicInfo(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (IClearingTypes.ClearingOperationBasicInfo memory info_) {
        return _isClearingBasicInfo(_clearingOperationIdentifier);
    }

    /**
     * @notice Returns the clearing transfer data for the given holder and partition.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingId The clearing operation ID.
     * @return data_ The clearing transfer data struct.
     */
    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingTransferData memory data_) {
        return clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the clearing redeem data for the given holder and partition.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingId The clearing operation ID.
     * @return data_ The clearing redeem data struct.
     */
    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingRedeemData memory data_) {
        return clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the clearing hold creation data for the given holder and partition.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingId The clearing operation ID.
     * @return data_ The clearing hold creation data struct.
     */
    function getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingHoldCreationData memory data_) {
        return clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the total amount cleared across all partitions for a holder.
     * @param _tokenHolder The token holder.
     * @return The total cleared amount.
     */
    function getClearedAmountFor(address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccount[_tokenHolder];
    }

    /**
     * @notice Returns the amount cleared for a holder in a specific partition.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @return The partition-specific cleared amount.
     */
    function getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /**
     * @notice Returns the authorised third party for the identified clearing operation.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingOperationType The clearing operation type.
     * @param _clearingId The clearing operation ID.
     * @return The third-party address.
     */
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

    /**
     * @notice Returns the operator type (AUTHORIZED, OPERATOR, PROTECTED) for the
     *         identified clearing operation.
     * @dev Dispatches to the appropriate clearing data struct based on operation type.
     * @param _clearingOperationIdentifier The clearing operation identifier.
     * @return The third-party operator type.
     */
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

    /**
     * @notice Returns the number of clearing operations for a holder, partition, and
     *         operation type.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingOperationType The clearing operation type.
     * @return The count of clearing operations.
     */
    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) internal view returns (uint256) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].length();
    }

    /**
     * @notice Returns a paginated list of clearing IDs for a holder, partition, and
     *         operation type.
     * @param _partition The partition.
     * @param _tokenHolder The token holder.
     * @param _clearingOperationType The clearing operation type.
     * @param _pageIndex The zero-based page index.
     * @param _pageLength The number of items per page.
     * @return ids_ A paginated array of clearing IDs.
     */
    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory ids_) {
        return
            clearingStorage()
            .clearingIdsByAccountAndPartitionAndTypes[_tokenHolder][_partition][_clearingOperationType].getFromSet(
                    _pageIndex,
                    _pageLength
                );
    }

    /**
     * @notice Constructs a clearing operation identifier struct from its components.
     * @param _tokenHolder The token holder.
     * @param _partition The partition.
     * @param _clearingId The clearing operation ID.
     * @param _clearingOperationType The clearing operation type.
     * @return id_ A clearing operation identifier struct.
     */
    function buildClearingOperationIdentifier(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _clearingId,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) internal pure returns (IClearingTypes.ClearingOperationIdentifier memory id_) {
        return
            IClearingTypes.ClearingOperationIdentifier({
                tokenHolder: _tokenHolder,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _clearingOperationType
            });
    }

    /**
     * @notice Constructs a clearing transfer data struct from its components.
     * @param _amount The transfer amount.
     * @param _expirationTimestamp The expiration timestamp.
     * @param _destination The transfer destination.
     * @param _data Transfer metadata.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator type.
     * @return data_ A clearing transfer data struct.
     */
    function buildClearingTransferData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        address _destination,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearingTypes.ClearingTransferData memory data_) {
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

    /**
     * @notice Constructs a clearing redeem data struct from its components.
     * @param _amount The redeem amount.
     * @param _expirationTimestamp The expiration timestamp.
     * @param _data Redeem metadata.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator type.
     * @return data_ A clearing redeem data struct.
     */
    function buildClearingRedeemData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearingTypes.ClearingRedeemData memory data_) {
        return
            IClearingTypes.ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _expirationTimestamp,
                data: _data,
                operatorData: _operatorData,
                operatorType: _operatorType
            });
    }

    /**
     * @notice Constructs a clearing hold creation data struct from its components.
     * @param _amount The hold amount.
     * @param _expirationTimestamp The clearing expiration timestamp.
     * @param _data Clearing metadata.
     * @param _holdData Hold-specific metadata.
     * @param _holdEscrow The hold escrow account.
     * @param _holdTo The hold beneficiary.
     * @param _operatorData Operator metadata.
     * @param _operatorType The operator type.
     * @return data_ A clearing hold creation data struct.
     */
    function buildClearingHoldCreationData(
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _holdData,
        address _holdEscrow,
        address _holdTo,
        bytes memory _operatorData,
        ThirdPartyType _operatorType
    ) internal pure returns (IClearingTypes.ClearingHoldCreationData memory data_) {
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

    /**
     * @notice Reverts if the clearing ID is not registered.
     * @param _clearingOperationIdentifier The clearing operation identifier.
     */
    function requireValidClearingId(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view {
        if (!isClearingIdValid(_clearingOperationIdentifier)) revert IClearingTypes.WrongClearingId();
    }

    /**
     * @notice Reverts if clearing operations are not currently activated.
     */
    function requireClearingActivated() internal view {
        if (!isClearingActivated()) revert IClearingTypes.ClearingIsDisabled();
    }

    /**
     * @notice Reverts if the clearing operation's expiration state does not match the
     *         supplied condition.
     * @param _clearingOperationIdentifier The clearing operation identifier.
     * @param _mustBeExpired True to require expiration, false to require non-expiration.
     */
    function requireExpirationTimestamp(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) internal view {
        if (
            TimeTravelStorageWrapper.getBlockTimestamp() >=
            isClearingBasicInfo(_clearingOperationIdentifier).expirationTimestamp !=
            _mustBeExpired
        ) {
            if (_mustBeExpired) revert IClearingTypes.ExpirationDateNotReached();
            revert IClearingTypes.ExpirationDateReached();
        }
    }

    /**
     * @notice Reverts if clearing operations are currently activated.
     */
    function checkClearingDisabled() internal view {
        if (isClearingActivated()) revert IClearingTypes.ClearingIsActivated();
    }

    /**
     * @notice Validates operator clearing transfer parameters; reverts on any violation.
     * @dev Checks expiration, account recovery, partitioning rules, and operator
     *      authorisation.
     * @param _expirationTimestamp The clearing operation expiration timestamp.
     * @param _account The account triggering the operation.
     * @param _to The transfer destination.
     * @param _from The token holder (transfer source).
     * @param _partition The partition.
     */
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

    /**
     * @notice Validates clearing hold creation parameters; reverts on any violation.
     * @dev Checks expiration, account recovery, partitioning rules, and address validity.
     * @param _holdExpirationTimestamp The hold expiration timestamp.
     * @param _operationExpirationTimestamp The clearing operation expiration timestamp.
     * @param _account The account triggering the operation.
     * @param _to The hold beneficiary.
     * @param _from The token holder.
     * @param _escrow The escrow account.
     * @param _partition The partition.
     */
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

    /**
     * @notice Validates operator clearing hold creation parameters; reverts on any
     *         violation.
     * @dev Delegates to {checkClearingCreateHoldByPartition} then verifies operator
     *      authorisation.
     * @param _holdExpirationTimestamp The hold expiration timestamp.
     * @param _operationExpirationTimestamp The clearing operation expiration timestamp.
     * @param _account The account triggering the operation.
     * @param _to The hold beneficiary.
     * @param _from The token holder.
     * @param _escrow The escrow account.
     * @param _partition The partition.
     */
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

    /**
     * @notice Internal helper returning basic clearing info for memory-typed identifiers.
     * @dev Dispatches to the appropriate clearing data struct (Transfer, Redeem, or
     *      HoldCreation) and extracts amount, expiration, and destination.
     * @param _clearingOperationIdentifier The clearing operation identifier (memory).
     * @return info_ Basic clearing information (amount, expiration timestamp,
     *         destination).
     */
    function _isClearingBasicInfo(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) private view returns (IClearingTypes.ClearingOperationBasicInfo memory info_) {
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

    /**
     * @notice Reverts with `InvalidClearingAmount` if the supplied token amount is zero.
     * @param _amount Token quantity to validate before registering a clearing operation.
     */
    function checkNonZeroClearingAmount(uint256 _amount) internal pure {
        if (_amount == 0) revert IClearingTypes.InvalidClearingAmount();
    }
}
