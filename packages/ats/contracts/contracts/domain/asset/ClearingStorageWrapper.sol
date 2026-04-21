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

/**
 * @title  ClearingStorageWrapper
 * @notice Internal library providing pure storage operations for the clearing subsystem,
 *         including registration, mutation, removal, and validation of pending clearing
 *         operations across transfer, redeem, and hold-creation types.
 * @dev    Anchors `ClearingDataStorage` at `_CLEARING_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern. All functions are `internal`; orchestration
 *         logic is deliberately separated into `ClearingOps` to keep this library
 *         focused on atomic storage access.
 *
 *         Clearing IDs are per-account, per-partition, per-operation-type sequences,
 *         incremented via `increaseClearingId`. IDs are one-based due to the pre-increment
 *         in that function; a value of `0` therefore never represents a valid clearing ID.
 *
 *         `totalClearedAmountByAccount` and `totalClearedAmountByAccountAndPartition`
 *         track the aggregate token quantity currently locked in pending clearing
 *         operations. These accumulators must remain consistent with the sum of individual
 *         clearing record amounts; callers are responsible for maintaining this invariant
 *         across all mutations.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library ClearingStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    // solhint-disable max-line-length
    /**
     * @notice Diamond Storage struct for the clearing subsystem.
     * @dev    All mappings are keyed first by account address, then by partition, to scope
     *         clearing state to individual token holdings. The `initialized` flag must be
     *         `true` before any clearing operation is accepted; `activated` governs whether
     *         new clearing operations may be submitted.
     *         `nextClearingIdByAccountPartitionAndType` holds the last assigned ID; the
     *         next valid ID is `current + 1`, reflecting the pre-increment in
     *         `increaseClearingId`.
     * @param initialized
     *        True if `initializeClearing` has been called; guards against uninitialised
     *        state.
     * @param activated
     *        True if the clearing mechanism is currently accepting new operations.
     * @param totalClearedAmountByAccount
     *        Aggregate token quantity locked in pending clearing operations per account,
     *        across all partitions and operation types.
     * @param totalClearedAmountByAccountAndPartition
     *        Aggregate token quantity locked in pending clearing operations per account
     *        and partition.
     * @param clearingIdsByAccountAndPartitionAndTypes
     *        Enumerable set of active clearing IDs scoped to account, partition, and
     *        operation type; used for existence checks and paginated enumeration.
     * @param nextClearingIdByAccountPartitionAndType
     *        Monotonically increasing counter tracking the last assigned clearing ID per
     *        account, partition, and operation type.
     * @param clearingTransferByAccountPartitionAndId
     *        Maps account, partition, and clearing ID to the associated transfer clearing
     *        data record.
     * @param clearingRedeemByAccountPartitionAndId
     *        Maps account, partition, and clearing ID to the associated redeem clearing
     *        data record.
     * @param clearingHoldCreationByAccountPartitionAndId
     *        Maps account, partition, and clearing ID to the associated hold-creation
     *        clearing data record.
     * @param clearingThirdPartyByAccountPartitionTypeAndId
     *        Maps account, partition, operation type, and clearing ID to the address of
     *        any third-party operator (e.g. spender) associated with that operation.
     */
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

    /**
     * @notice Initialises the clearing subsystem and sets its initial activation state.
     * @dev    Sets both `initialized` and `activated` in a single storage write sequence.
     *         Calling this more than once overwrites the `activated` flag and re-sets
     *         `initialized`; callers must enforce single-initialisation at the facet level.
     *         Does not reset any existing clearing data or counters.
     * @param clearingActive  True to enable clearing operations immediately upon
     *                        initialisation; false to initialise in a deactivated state.
     */
    function initializeClearing(bool clearingActive) internal {
        ClearingDataStorage storage clearingStorage_ = clearingStorage();
        clearingStorage_.initialized = true;
        clearingStorage_.activated = clearingActive;
    }

    /**
     * @notice Sets the activation state of the clearing mechanism.
     * @dev    Overwrites `ClearingDataStorage.activated` directly. Does not validate
     *         whether the subsystem has been initialised; callers should verify
     *         `isClearingInitialized` before invoking. Does not emit an event; callers
     *         are responsible for any required logging.
     * @param activated  True to enable clearing; false to disable.
     * @return success_  Always `true` on completion.
     */
    function setClearing(bool activated) internal returns (bool success_) {
        clearingStorage().activated = activated;
        return true;
    }

    /**
     * @notice Increments the clearing ID counter for the given account, partition, and
     *         operation type, registers the new ID in the active set, and returns it.
     * @dev    Uses a pre-increment within an `unchecked` block; overflow is theoretically
     *         possible after `2^256 - 1` operations per scope, which is not a practical
     *         concern. The returned ID is always `>= 1`; a value of `0` is never assigned.
     *         Registers the new ID via `setClearingIdByPartitionAndType`.
     * @param _from           Account for which the clearing ID is being allocated.
     * @param _partition      Partition under which the clearing operation is scoped.
     * @param _operationType  Type of clearing operation (Transfer, Redeem, or
     *                        HoldCreation).
     * @return clearingId_    Newly allocated one-based clearing ID for the given scope.
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
     * @notice Stores a transfer clearing data record for the given account, partition,
     *         and clearing ID.
     * @dev    Overwrites any existing record at the same key without reverting. Callers
     *         must ensure `_clearingId` was allocated via `increaseClearingId` before
     *         calling this function. Does not update cleared amount accumulators; call
     *         `increaseClearedAmounts` separately.
     * @param _from                  Source account whose tokens are subject to clearing.
     * @param _partition             Partition under which the transfer is scoped.
     * @param _clearingId            Clearing ID allocated for this operation.
     * @param _amount                Token quantity locked by this clearing operation.
     * @param _expirationTimestamp   Unix timestamp after which this clearing operation
     *                               expires.
     * @param _to                    Destination address for the transfer.
     * @param _data                  Arbitrary transfer data payload.
     * @param _operatorData          Arbitrary operator data payload.
     * @param _operatorType          Classification of the initiating third party.
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
     * @notice Stores a redeem clearing data record for the given account, partition,
     *         and clearing ID.
     * @dev    Overwrites any existing record at the same key without reverting. Callers
     *         must ensure `_clearingId` was allocated via `increaseClearingId` before
     *         calling this function. Does not update cleared amount accumulators; call
     *         `increaseClearedAmounts` separately.
     * @param _from                  Source account whose tokens are subject to clearing.
     * @param _partition             Partition under which the redemption is scoped.
     * @param _clearingId            Clearing ID allocated for this operation.
     * @param _amount                Token quantity locked by this clearing operation.
     * @param _expirationTimestamp   Unix timestamp after which this clearing operation
     *                               expires.
     * @param _data                  Arbitrary redeem data payload.
     * @param _operatorData          Arbitrary operator data payload.
     * @param _operatorType          Classification of the initiating third party.
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
     * @notice Stores a hold-creation clearing data record for the given account,
     *         partition, and clearing ID.
     * @dev    Overwrites any existing record at the same key without reverting. Note that
     *         `holdExpirationTimestamp` within the stored struct is sourced from the
     *         `_holdExpirationTimestamp` parameter, distinct from the clearing operation's
     *         own `_expirationTimestamp`. Callers must ensure `_clearingId` was allocated
     *         via `increaseClearingId` before calling. Does not update cleared amount
     *         accumulators; call `increaseClearedAmounts` separately.
     * @param _from                       Source account whose tokens are subject to
     *                                    clearing.
     * @param _partition                  Partition under which the hold creation is scoped.
     * @param _clearingId                 Clearing ID allocated for this operation.
     * @param _amount                     Token quantity locked by this clearing operation.
     * @param _expirationTimestamp        Unix timestamp after which this clearing operation
     *                                    expires.
     * @param _holdExpirationTimestamp    Unix timestamp after which the resulting hold
     *                                    expires.
     * @param _data                       Arbitrary clearing operation data payload.
     * @param _holdData                   Arbitrary hold data payload passed to the hold.
     * @param _escrow                     Escrow address designated to hold the tokens.
     * @param _to                         Beneficiary address of the hold.
     * @param _operatorData               Arbitrary operator data payload.
     * @param _operatorType               Classification of the initiating third party.
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
     * @notice Scales the total cleared amount for an account across all partitions by a
     *         multiplicative factor.
     * @dev    Intended for token adjustment operations such as splits or consolidations
     *         where all outstanding clearing amounts must be proportionally rescaled.
     *         Callers must ensure `_factor` is non-zero to avoid zeroing the accumulator
     *         unintentionally. Does not update per-partition accumulators; call
     *         `multiplyTotalClearedAmountByPartition` separately for each affected
     *         partition.
     * @param _tokenHolder  Account whose aggregate cleared amount is to be scaled.
     * @param _factor       Multiplicative scaling factor to apply.
     */
    function multiplyTotalClearedAmount(address _tokenHolder, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] *= _factor;
    }

    /**
     * @notice Scales the total cleared amount for an account under a specific partition
     *         by a multiplicative factor.
     * @dev    Intended for token adjustment operations scoped to a single partition.
     *         Callers must ensure `_factor` is non-zero to avoid zeroing the accumulator
     *         unintentionally. Does not update the cross-partition accumulator; call
     *         `multiplyTotalClearedAmount` separately.
     * @param _tokenHolder  Account whose partition-scoped cleared amount is to be scaled.
     * @param _partition    Partition identifier to scope the update.
     * @param _factor       Multiplicative scaling factor to apply.
     */
    function multiplyTotalClearedAmountByPartition(address _tokenHolder, bytes32 _partition, uint256 _factor) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
    }

    /**
     * @notice Associates a third-party operator address with a specific clearing operation.
     * @dev    Overwrites any existing entry at the same key without reverting. The stored
     *         address is retrieved via `getClearingThirdParty` and is used during
     *         operator-initiated cancellations or executions to verify authorisation.
     * @param _partition      Partition under which the clearing operation is scoped.
     * @param _tokenHolder    Account that owns the clearing operation.
     * @param _operationType  Type of clearing operation (Transfer, Redeem, or
     *                        HoldCreation).
     * @param _clearingId     Clearing ID of the target operation.
     * @param _spender        Address of the third-party operator to associate.
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
     * @notice Registers a clearing ID in the active set for the given account, partition,
     *         and operation type.
     * @dev    Delegates to `EnumerableSet.add`; silently no-ops if the ID is already
     *         present. Accepts a storage pointer to avoid a redundant `clearingStorage()`
     *         call in callers that already hold the pointer. This function does not
     *         allocate the ID; allocation is performed by `increaseClearingId`.
     * @param clearingDataStorage  Storage pointer to `ClearingDataStorage`.
     * @param _tokenHolder         Account that owns the clearing operation.
     * @param _partition           Partition under which the clearing operation is scoped.
     * @param _clearingId          Clearing ID to register in the active set.
     * @param _operationType       Type of clearing operation to scope the registration.
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
     * @notice Increments both the per-partition and aggregate cleared amount accumulators
     *         for the given account.
     * @dev    Both accumulators must be updated atomically to preserve the invariant that
     *         `totalClearedAmountByAccount` equals the sum of
     *         `totalClearedAmountByAccountAndPartition` across all partitions for a given
     *         account. Callers must ensure the corresponding clearing data record has
     *         already been written before calling this function.
     * @param _tokenHolder  Account whose cleared amount accumulators are to be increased.
     * @param _partition    Partition identifier for the per-partition accumulator update.
     * @param _amount       Token quantity to add to both accumulators.
     */
    function increaseClearedAmounts(address _tokenHolder, bytes32 _partition, uint256 _amount) internal {
        clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        clearingStorage().totalClearedAmountByAccount[_tokenHolder] += _amount;
    }

    /**
     * @notice Scales the stored amount of a specific clearing operation by a
     *         multiplicative factor, dispatching to the correct data store by operation
     *         type.
     * @dev    Intended for token adjustment operations where individual pending clearing
     *         amounts must be rescaled proportionally. Delegates to the Transfer, Redeem,
     *         or HoldCreation mapping based on `clearingOperationType`. Callers must
     *         update the cleared amount accumulators separately. Callers must ensure
     *         `_factor` is non-zero.
     * @param _clearingOperationIdentifier  Identifier struct specifying the account,
     *                                      partition, clearing ID, and operation type.
     * @param _factor                       Multiplicative scaling factor to apply to the
     *                                      stored amount.
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
     * @notice Fully removes a clearing operation from storage, decrements the cleared
     *         amount accumulators, and delegates balance adjustment cleanup to
     *         `AdjustBalancesStorageWrapper`.
     * @dev    Resolves the clearing amount via `_isClearingBasicInfo` before deletion.
     *         Performs the following mutations atomically within a single storage pointer:
     *           - Decrements both cleared amount accumulators by the resolved amount.
     *           - Removes the clearing ID from the active enumerable set.
     *           - Deletes the third-party operator entry.
     *           - Deletes the type-specific clearing data record.
     *         Finally calls `AdjustBalancesStorageWrapper.removeLabafClearing` to
     *         synchronise balance adjustment state. Callers must ensure the clearing ID
     *         is valid before invoking to avoid underflow in the accumulators.
     * @param _clearingOperationIdentifier  Identifier struct specifying the account,
     *                                      partition, clearing ID, and operation type of
     *                                      the operation to remove.
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
     * @notice Returns whether the clearing subsystem has been initialised.
     * @dev    A `false` return indicates `initializeClearing` has not yet been called;
     *         any clearing operation performed in this state would operate on
     *         uninitialised storage.
     * @return True if `initializeClearing` has been called at least once; false otherwise.
     */
    function isClearingInitialized() internal view returns (bool) {
        return clearingStorage().initialized;
    }

    /**
     * @notice Returns whether the clearing mechanism is currently active.
     * @dev    A `true` return is required for new clearing operations to be accepted.
     *         Does not verify initialisation; callers should check
     *         `isClearingInitialized` where necessary.
     * @return True if clearing is activated; false if it has been deactivated.
     */
    function isClearingActivated() internal view returns (bool) {
        return clearingStorage().activated;
    }

    /**
     * @notice Returns whether the given clearing operation identifier refers to an active,
     *         registered clearing ID.
     * @dev    Performs a set membership check on
     *         `clearingIdsByAccountAndPartitionAndTypes`. Returns `false` for IDs that
     *         have been removed via `removeClearing` or were never allocated.
     * @param clearingOperationIdentifier  Identifier struct specifying the account,
     *                                     partition, clearing ID, and operation type.
     * @return True if the clearing ID is present in the active set; false otherwise.
     */
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
     * @notice Returns the basic info (amount, expiration timestamp, and destination) for
     *         a clearing operation identified by a `calldata` struct.
     * @dev    Public-facing wrapper over `_isClearingBasicInfo` accepting `calldata`
     *         input for gas efficiency in external call paths. Dispatches to the correct
     *         data store based on `clearingOperationType`. For Redeem operations,
     *         `destination` is set to `address(0)` as redemptions have no recipient.
     *         Returns zero-value fields if the clearing ID does not exist.
     * @param _clearingOperationIdentifier  Identifier struct specifying the account,
     *                                      partition, clearing ID, and operation type.
     * @return ClearingOperationBasicInfo struct containing amount, expiration timestamp,
     *         and destination for the specified clearing operation.
     */
    function isClearingBasicInfo(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view returns (IClearingTypes.ClearingOperationBasicInfo memory) {
        return _isClearingBasicInfo(_clearingOperationIdentifier);
    }

    /**
     * @notice Returns the transfer clearing data record for a given account, partition,
     *         and clearing ID.
     * @dev    Returns a zero-value struct if no record exists at the specified key.
     *         Callers should validate the clearing ID via `isClearingIdValid` before
     *         relying on the returned data.
     * @param _partition     Partition under which the clearing transfer is scoped.
     * @param _tokenHolder   Account that owns the clearing operation.
     * @param _clearingId    Clearing ID of the transfer operation to retrieve.
     * @return ClearingTransferData struct for the specified operation.
     */
    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingTransferData memory) {
        return clearingStorage().clearingTransferByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the redeem clearing data record for a given account, partition,
     *         and clearing ID.
     * @dev    Returns a zero-value struct if no record exists at the specified key.
     *         Callers should validate the clearing ID via `isClearingIdValid` before
     *         relying on the returned data.
     * @param _partition     Partition under which the clearing redemption is scoped.
     * @param _tokenHolder   Account that owns the clearing operation.
     * @param _clearingId    Clearing ID of the redeem operation to retrieve.
     * @return ClearingRedeemData struct for the specified operation.
     */
    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingRedeemData memory) {
        return clearingStorage().clearingRedeemByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the hold-creation clearing data record for a given account,
     *         partition, and clearing ID.
     * @dev    Returns a zero-value struct if no record exists at the specified key.
     *         Callers should validate the clearing ID via `isClearingIdValid` before
     *         relying on the returned data.
     * @param _partition     Partition under which the clearing hold creation is scoped.
     * @param _tokenHolder   Account that owns the clearing operation.
     * @param _clearingId    Clearing ID of the hold-creation operation to retrieve.
     * @return ClearingHoldCreationData struct for the specified operation.
     */
    function getClearingHoldCreationForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) internal view returns (IClearingTypes.ClearingHoldCreationData memory) {
        return clearingStorage().clearingHoldCreationByAccountPartitionAndId[_tokenHolder][_partition][_clearingId];
    }

    /**
     * @notice Returns the aggregate token quantity currently locked in pending clearing
     *         operations for a given account across all partitions.
     * @dev    Reads directly from `totalClearedAmountByAccount`. Returns `0` for accounts
     *         with no active clearing operations.
     * @param _tokenHolder  Account to query.
     * @return Aggregate cleared token quantity for `_tokenHolder`.
     */
    function getClearedAmountFor(address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccount[_tokenHolder];
    }

    /**
     * @notice Returns the token quantity currently locked in pending clearing operations
     *         for a given account under a specific partition.
     * @dev    Reads directly from `totalClearedAmountByAccountAndPartition`. Returns `0`
     *         for accounts with no active clearing operations under `_partition`.
     * @param _partition    Partition identifier to scope the query.
     * @param _tokenHolder  Account to query.
     * @return Cleared token quantity for `_tokenHolder` under `_partition`.
     */
    function getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return clearingStorage().totalClearedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /**
     * @notice Returns the third-party operator address associated with a specific clearing
     *         operation.
     * @dev    Returns `address(0)` if no third party was registered or if the clearing
     *         ID does not exist. Callers must validate the clearing ID before interpreting
     *         a zero return as the absence of a third party.
     * @param _partition              Partition under which the clearing operation is scoped.
     * @param _tokenHolder            Account that owns the clearing operation.
     * @param _clearingOperationType  Type of the clearing operation.
     * @param _clearingId             Clearing ID of the operation to query.
     * @return Address of the associated third-party operator; `address(0)` if none.
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
     * @notice Returns the third-party type associated with a specific clearing operation,
     *         dispatching to the correct data store by operation type.
     * @dev    Reads `operatorType` directly from the relevant clearing data struct.
     *         Returns the default enum value if the clearing ID does not exist. Callers
     *         should validate the clearing ID via `isClearingIdValid` before relying on
     *         the returned value.
     * @param _clearingOperationIdentifier  Identifier struct specifying the account,
     *                                      partition, clearing ID, and operation type.
     * @return ThirdPartyType of the operator associated with the clearing operation.
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
     * @notice Returns the number of active clearing operations for a given account,
     *         partition, and operation type.
     * @dev    Reads the length of the underlying `EnumerableSet.UintSet`; O(1) gas cost.
     *         Returns `0` for unrecognised combinations of account, partition, and type.
     * @param _partition              Partition to scope the count.
     * @param _tokenHolder            Account to query.
     * @param _clearingOperationType  Operation type to filter by.
     * @return Number of active clearing IDs for the specified scope.
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
     * @notice Returns a paginated slice of active clearing IDs for a given account,
     *         partition, and operation type.
     * @dev    Delegates pagination to the `Pagination` library extension on
     *         `EnumerableSet.UintSet`. Enumeration order is not guaranteed to be stable
     *         across mutations to the set. Out-of-bounds page parameters may yield a
     *         partial or empty result depending on the `Pagination` implementation.
     * @param _partition              Partition to scope the query.
     * @param _tokenHolder            Account to query.
     * @param _clearingOperationType  Operation type to filter by.
     * @param _pageIndex              Zero-based page number to retrieve.
     * @param _pageLength             Maximum number of IDs to return per page.
     * @return Array of active clearing IDs for the requested page and scope.
     */
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

    /**
     * @notice Reverts if the given clearing operation identifier does not correspond to an
     *         active clearing ID.
     * @dev    Delegates to `isClearingIdValid`. Reverts with
     *         `IClearingTypes.WrongClearingId` on failure. Use as a guard before any
     *         operation that reads or mutates a specific clearing record.
     * @param _clearingOperationIdentifier  Identifier struct to validate.
     */
    function requireValidClearingId(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal view {
        if (!isClearingIdValid(_clearingOperationIdentifier)) revert IClearingTypes.WrongClearingId();
    }

    /**
     * @notice Reverts if the clearing mechanism is not currently active.
     * @dev    Delegates to `isClearingActivated`. Reverts with
     *         `IClearingTypes.ClearingIsDisabled`. Use as a guard at the entry point of
     *         any function that initiates a new clearing operation.
     */
    function requireClearingActivated() internal view {
        if (!isClearingActivated()) revert IClearingTypes.ClearingIsDisabled();
    }

    /**
     * @notice Reverts if the expiration state of a clearing operation does not match the
     *         expected state indicated by `_mustBeExpired`.
     * @dev    Compares the current block timestamp (via `TimeTravelStorageWrapper`) against
     *         the operation's `expirationTimestamp`. The XOR-like logic means:
     *           - If `_mustBeExpired` is `true` and the operation has not yet expired,
     *             reverts with `IClearingTypes.ExpirationDateNotReached`.
     *           - If `_mustBeExpired` is `false` and the operation has already expired,
     *             reverts with `IClearingTypes.ExpirationDateReached`.
     *         Used to enforce temporal preconditions on execution and cancellation paths.
     * @param _clearingOperationIdentifier  Identifier of the clearing operation to check.
     * @param _mustBeExpired                True if the operation must have expired; false
     *                                      if it must still be active.
     */
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

    /**
     * @notice Reverts if the clearing mechanism is currently active.
     * @dev    Inverse guard of `requireClearingActivated`. Reverts with
     *         `IClearingTypes.ClearingIsActivated`. Use as a guard for operations that
     *         are only permitted when clearing is disabled, such as direct transfers that
     *         bypass the clearing queue.
     */
    function checkClearingDisabled() internal view {
        if (isClearingActivated()) revert IClearingTypes.ClearingIsActivated();
    }

    /**
     * @notice Validates all preconditions for an operator-initiated clearing transfer
     *         by partition.
     * @dev    Performs the following checks in order:
     *           1. `_expirationTimestamp` is a valid future timestamp via
     *              `LockStorageWrapper`.
     *           2. `_account`, `_to`, and `_from` are not recovered addresses via
     *              `ERC3643StorageWrapper`.
     *           3. `_partition` matches the default partition if only a single partition
     *              exists via `ERC1410StorageWrapper`.
     *           4. `_from` and `_to` are valid (non-zero, registered) addresses.
     *           5. The caller is an authorised operator for `_partition` on behalf of
     *              `_from`.
     *         Reverts with the appropriate error from each dependency on failure.
     * @param _expirationTimestamp  Unix timestamp for the clearing operation's expiry.
     * @param _account              Address of the operator initiating the transfer.
     * @param _to                   Destination address for the token transfer.
     * @param _from                 Source address whose tokens are to be transferred.
     * @param _partition            Partition under which the transfer is to be executed.
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
     * @notice Validates preconditions for a self-initiated clearing hold-creation by
     *         partition, excluding the operator authorisation check.
     * @dev    Performs the following checks in order:
     *           1. Both `_holdExpirationTimestamp` and `_operationExpirationTimestamp` are
     *              valid future timestamps via `LockStorageWrapper`.
     *           2. `_account`, `_to`, and `_from` are not recovered addresses.
     *           3. `_escrow` and `_from` are valid (non-zero, registered) addresses.
     *           4. `_partition` matches the default partition if only a single partition
     *              exists.
     *         This function is also called as a subroutine by
     *         `checkOperatorClearingCreateHoldByPartition`, which appends the operator
     *         authorisation check.
     * @param _holdExpirationTimestamp       Unix timestamp after which the resulting hold
     *                                       expires.
     * @param _operationExpirationTimestamp  Unix timestamp after which the clearing
     *                                       operation itself expires.
     * @param _account                       Address of the party initiating the hold
     *                                       creation.
     * @param _to                            Beneficiary address of the hold.
     * @param _from                          Source address whose tokens will be held.
     * @param _escrow                        Escrow address to hold the tokens.
     * @param _partition                     Partition under which the hold is to be
     *                                       created.
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
     * @notice Validates all preconditions for an operator-initiated clearing hold-creation
     *         by partition, including the operator authorisation check.
     * @dev    Delegates all base checks to `checkClearingCreateHoldByPartition`, then
     *         additionally verifies that the caller is an authorised operator for
     *         `_partition` on behalf of `_from` via `ERC1410StorageWrapper.requireOperator`.
     *         Reverts with the appropriate error from each dependency on failure.
     * @param _holdExpirationTimestamp       Unix timestamp after which the resulting hold
     *                                       expires.
     * @param _operationExpirationTimestamp  Unix timestamp after which the clearing
     *                                       operation itself expires.
     * @param _account                       Address of the operator initiating the hold
     *                                       creation.
     * @param _to                            Beneficiary address of the hold.
     * @param _from                          Source address whose tokens will be held.
     * @param _escrow                        Escrow address to hold the tokens.
     * @param _partition                     Partition under which the hold is to be
     *                                       created.
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
     * @notice Constructs and returns a `ClearingOperationIdentifier` memory struct from
     *         the provided components.
     * @dev    Pure utility function; performs no storage reads or writes. Intended to
     *         centralise struct construction and reduce inline boilerplate at call sites.
     * @param _tokenHolder           Account that owns the clearing operation.
     * @param _partition             Partition under which the operation is scoped.
     * @param _clearingId            Clearing ID of the operation.
     * @param _clearingOperationType Type of the clearing operation.
     * @return ClearingOperationIdentifier struct populated with the provided values.
     */
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

    /**
     * @notice Constructs and returns a `ClearingTransferData` memory struct from the
     *         provided components.
     * @dev    Pure utility function; performs no storage reads or writes. Intended to
     *         centralise struct construction and reduce inline boilerplate at call sites.
     * @param _amount               Token quantity to be locked by the clearing operation.
     * @param _expirationTimestamp  Unix timestamp after which the clearing operation
     *                              expires.
     * @param _destination          Recipient address for the transfer.
     * @param _data                 Arbitrary transfer data payload.
     * @param _operatorData         Arbitrary operator data payload.
     * @param _operatorType         Classification of the initiating third party.
     * @return ClearingTransferData struct populated with the provided values.
     */
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

    /**
     * @notice Constructs and returns a `ClearingRedeemData` memory struct from the
     *         provided components.
     * @dev    Pure utility function; performs no storage reads or writes. Intended to
     *         centralise struct construction and reduce inline boilerplate at call sites.
     * @param _amount               Token quantity to be locked by the clearing operation.
     * @param _expirationTimestamp  Unix timestamp after which the clearing operation
     *                              expires.
     * @param _data                 Arbitrary redeem data payload.
     * @param _operatorData         Arbitrary operator data payload.
     * @param _operatorType         Classification of the initiating third party.
     * @return ClearingRedeemData struct populated with the provided values.
     */
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

    /**
     * @notice Constructs and returns a `ClearingHoldCreationData` memory struct from the
     *         provided components.
     * @dev    Pure utility function; performs no storage reads or writes. Note that
     *         `holdExpirationTimestamp` is explicitly set to `0` in the returned struct;
     *         callers that require a specific hold expiration must set this field after
     *         construction or use `setClearingHoldCreationData` directly.
     * @param _amount                Token quantity to be locked by the clearing operation.
     * @param _expirationTimestamp   Unix timestamp after which the clearing operation
     *                               expires.
     * @param _data                  Arbitrary clearing operation data payload.
     * @param _holdData              Arbitrary hold data payload passed to the hold.
     * @param _holdEscrow            Escrow address designated to hold the tokens.
     * @param _holdTo                Beneficiary address of the hold.
     * @param _operatorData          Arbitrary operator data payload.
     * @param _operatorType          Classification of the initiating third party.
     * @return ClearingHoldCreationData struct populated with the provided values; note
     *         that `holdExpirationTimestamp` is set to `0`.
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

    /**
     * @notice Returns the basic info (amount, expiration timestamp, and destination) for
     *         a clearing operation identified by a `memory` struct.
     * @dev    Internal implementation shared by both the `calldata` public wrapper
     *         `isClearingBasicInfo` and `removeClearing`. Dispatches to the Transfer,
     *         Redeem, or HoldCreation data store based on `clearingOperationType`. For
     *         Redeem operations, `destination` is always `address(0)`. Returns
     *         zero-value fields for unrecognised clearing IDs.
     * @param _clearingOperationIdentifier  Identifier struct specifying the account,
     *                                      partition, clearing ID, and operation type.
     * @return ClearingOperationBasicInfo struct containing amount, expiration timestamp,
     *         and destination for the specified clearing operation.
     */
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

    /**
     * @notice Returns the Diamond Storage pointer for `ClearingDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot defined
     *         by `_CLEARING_STORAGE_POSITION`, following the ERC-2535 Diamond Storage
     *         Pattern. Slot isolation prevents collisions with other facet storage structs
     *         in the same proxy. Must only be called from within this library.
     * @return clearing_  Storage pointer to the `ClearingDataStorage` struct.
     */
    function clearingStorage() private pure returns (ClearingDataStorage storage clearing_) {
        bytes32 position = _CLEARING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            clearing_.slot := position
        }
    }
}
