// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ICorporateActions } from "../../facets/layer_1/corporateAction/ICorporateActions.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { KPI_CA_ADD_ACTION } from "../../constants/values.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @notice Persistent data record for a single corporate action.
 * @dev `actionIdByType` is a one-based sequential counter scoped to `actionType` and is
 *      assigned at creation time; it never changes. `results` is a sparse array — gaps
 *      between existing indices and a newly written `resultId` are filled with empty bytes
 *      by `updateCorporateActionResult`. Once `isDisabled` is set to `true` it is never
 *      cleared by this library; higher-level facets must enforce any re-enable logic.
 * @param actionType      Identifier for the category of corporate action (e.g. dividend,
 *                        split).
 * @param data            ABI-encoded payload describing the action's parameters.
 * @param results         Ordered array of ABI-encoded execution outcomes; may be sparse.
 * @param actionIdByType  One-based sequential position of this action within its type.
 * @param isDisabled      True if the action has been cancelled and must not be executed.
 */
struct ActionData {
    bytes32 actionType;
    bytes data;
    bytes[] results;
    uint256 actionIdByType;
    bool isDisabled;
}

/**
 * @notice Top-level Diamond Storage struct for the corporate action subsystem.
 * @dev Stored at `_CORPORATE_ACTION_STORAGE_POSITION`. All mappings are keyed by the
 *      canonical `bytes32` action ID generated at insertion time. `actionsContentHashes`
 *      provides idempotency by preventing duplicate registrations of identical
 *      (actionType, data) pairs.
 * @param actions               Enumerable set of all registered action IDs; also used to
 *                              derive the next sequential ID on insertion.
 * @param actionsData           Maps each action ID to its full `ActionData` record.
 * @param actionsByType         Maps each action type to an ordered list of action IDs
 *                              belonging to that type.
 * @param actionsContentHashes  Records content hashes of previously registered actions to
 *                              enforce duplicate prevention.
 */
struct CorporateActionDataStorage {
    EnumerableSet.Bytes32Set actions;
    mapping(bytes32 => ActionData) actionsData;
    mapping(bytes32 => bytes32[]) actionsByType;
    mapping(bytes32 => bool) actionsContentHashes;
}

/**
 * @title  CorporateActionsStorageWrapper
 * @notice Internal library for registering, mutating, and querying corporate actions
 *         using the Diamond Storage Pattern.
 * @dev    Anchors `CorporateActionDataStorage` at `_CORPORATE_ACTION_STORAGE_POSITION`
 *         following ERC-2535. All functions are `internal` and are intended for use
 *         exclusively within facets or other internal libraries of the same diamond.
 *
 *         Action IDs are derived from the current set length plus one at insertion time,
 *         producing a one-based, monotonically increasing `bytes32` identifier. This
 *         scheme assumes actions are never removed from the enumerable set; removal would
 *         corrupt ID stability.
 *
 *         Duplicate registrations are prevented by hashing `(actionType, data)` via
 *         `keccak256(abi.encode(...))` and recording the hash in `actionsContentHashes`.
 *         A duplicate submission returns `(bytes32(0), 0)` without reverting.
 *
 *         Unexpected failures during set insertion are surfaced through
 *         `_checkUnexpectedError` using the `KPI_CA_ADD_ACTION` key.
 * @author Hashgraph
 */
library CorporateActionsStorageWrapper {
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /**
     * @notice Registers a new corporate action of the specified type with the given payload.
     * @dev    Computes a content hash of `(_actionType, _data)` to enforce idempotency;
     *         returns `(bytes32(0), 0)` if an identical registration already exists.
     *         The action ID is derived as `bytes32(current set length + 1)`, establishing
     *         a one-based monotonic sequence. Insertion failure triggers
     *         `_checkUnexpectedError` with `KPI_CA_ADD_ACTION`.
     *         The caller must not rely on the zero-value return as an error signal without
     *         first checking `actionContentHashExists`.
     * @param _actionType          Identifier for the category of the corporate action.
     * @param _data                ABI-encoded parameters describing the action.
     * @return corporateActionId_       Unique identifier assigned to the new action;
     *                                  `bytes32(0)` if the content hash is a duplicate.
     * @return corporateActionIdByType_ One-based sequential index of this action within
     *                                  its type; `0` if the content hash is a duplicate.
     */
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();

        bytes32 contentHash = keccak256(abi.encode(_actionType, _data));
        if (ca.actionsContentHashes[contentHash]) {
            return (bytes32(0), 0);
        }
        ca.actionsContentHashes[contentHash] = true;

        corporateActionId_ = bytes32(ca.actions.length() + 1);
        _checkUnexpectedError(!ca.actions.add(corporateActionId_), KPI_CA_ADD_ACTION);

        ca.actionsByType[_actionType].push(corporateActionId_);

        corporateActionIdByType_ = getCorporateActionCountByType(_actionType);

        ca.actionsData[corporateActionId_].actionType = _actionType;
        ca.actionsData[corporateActionId_].data = _data;
        ca.actionsData[corporateActionId_].actionIdByType = corporateActionIdByType_;
    }

    /**
     * @notice Marks a corporate action as disabled, preventing further execution.
     * @dev    Sets `isDisabled` to `true` on the stored `ActionData`. This operation is
     *         irreversible within this library; no `uncancel` path exists. Callers are
     *         responsible for verifying that `actionId` refers to an existing action;
     *         writing to a non-existent ID creates a default-value record in storage.
     * @param actionId  Identifier of the corporate action to disable.
     */
    function cancelCorporateAction(bytes32 actionId) internal {
        corporateActionsStorage().actionsData[actionId].isDisabled = true;
    }

    /**
     * @notice Replaces the encoded payload of an existing corporate action.
     * @dev    Overwrites `ActionData.data` without updating the content hash index, so
     *         after an update the stored hash no longer reflects the current data. Callers
     *         must account for this if duplicate-prevention semantics are required after
     *         mutation. No validation is performed on `actionId` existence.
     * @param actionId  Identifier of the corporate action to update.
     * @param newData   New ABI-encoded payload to store.
     */
    function updateCorporateActionData(bytes32 actionId, bytes memory newData) internal {
        corporateActionsStorage().actionsData[actionId].data = newData;
    }

    /**
     * @notice Writes an execution result at the specified index within a corporate action's
     *         result array, padding with empty entries if the index exceeds the current
     *         array length.
     * @dev    If `resultId` is within the existing bounds, the entry is overwritten in
     *         place. If `resultId` is beyond the current length, empty `bytes` entries are
     *         appended up to `resultId - 1` before the new result is pushed, producing a
     *         sparse array. Gas cost is proportional to the number of gap entries created.
     *         No validation is performed on `actionId` existence.
     * @param actionId   Identifier of the corporate action whose results are being updated.
     * @param resultId   Zero-based index at which to write the result.
     * @param newResult  ABI-encoded result data to store at `resultId`.
     */
    function updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        bytes[] memory results = ca.actionsData[actionId].results;
        uint256 length = results.length;
        if (length > resultId) {
            ca.actionsData[actionId].results[resultId] = newResult;
            return;
        }

        for (uint256 i = length; i < resultId; ) {
            ca.actionsData[actionId].results.push("");
            unchecked {
                ++i;
            }
        }

        ca.actionsData[actionId].results.push(newResult);
    }

    /**
     * @notice Returns whether the specified corporate action has been disabled.
     * @dev    Returns `false` for unknown `actionId` values, as the default value of
     *         `isDisabled` in an uninitialised `ActionData` record is `false`.
     * @param actionId  Identifier of the corporate action to check.
     * @return True if the action's `isDisabled` flag is set; false otherwise.
     */
    function isCorporateActionDisabled(bytes32 actionId) internal view returns (bool) {
        return corporateActionsStorage().actionsData[actionId].isDisabled;
    }

    /**
     * @notice Reverts if the number of registered actions for the given type does not
     *         exceed `_index`, ensuring the index refers to an existing action.
     * @dev    Used as a bounds guard before direct index-based lookups in
     *         `actionsByType`. Reverts with `ICorporateActions.WrongIndexForAction` if
     *         the count is insufficient.
     * @param _actionType  Action type whose registered count is used for validation.
     * @param _index       Zero-based index that must be strictly less than the type count.
     */
    function requireMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        if (getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActions.WrongIndexForAction(_index, _actionType);
    }

    /**
     * @notice Returns the full data record for a corporate action identified by its ID.
     * @dev    All fields are read directly from storage in a single struct access per
     *         field. Returns zero-value defaults for all fields if `_corporateActionId`
     *         does not correspond to a registered action.
     * @param _corporateActionId  Identifier of the corporate action to retrieve.
     * @return actionType_   Category identifier for the action.
     * @return actionTypeId_ One-based sequential index of the action within its type.
     * @return data_         ABI-encoded payload associated with the action.
     * @return isDisabled_   True if the action has been cancelled.
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_, bool isDisabled_) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        actionType_ = ca.actionsData[_corporateActionId].actionType;
        data_ = ca.actionsData[_corporateActionId].data;
        actionTypeId_ = ca.actionsData[_corporateActionId].actionIdByType;
        isDisabled_ = ca.actionsData[_corporateActionId].isDisabled;
    }

    /**
     * @notice Returns the total number of corporate actions registered across all types.
     * @dev    Reads the length of the global `EnumerableSet.Bytes32Set`; O(1) gas cost.
     * @return corporateActionCount_ Total number of registered corporate actions.
     */
    function getCorporateActionCount() internal view returns (uint256 corporateActionCount_) {
        return corporateActionsStorage().actions.length();
    }

    /**
     * @notice Returns a paginated slice of corporate action IDs across all types.
     * @dev    Delegates to the `Pagination` library extension on `EnumerableSet.Bytes32Set`.
     *         Enumeration order reflects insertion order of the underlying set and is not
     *         guaranteed to remain stable if the set implementation changes. Out-of-bounds
     *         page parameters may yield a partial or empty result depending on the
     *         `Pagination` implementation.
     * @param _pageIndex   Zero-based page number to retrieve.
     * @param _pageLength  Maximum number of IDs to return per page.
     * @return corporateActionIds_  Array of action IDs for the requested page.
     */
    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = corporateActionsStorage().actions.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of registered actions for a given action type.
     * @dev    Reads the length of the `actionsByType` dynamic array; O(1) gas cost.
     *         Returns `0` for unrecognised or unused action types.
     * @param _actionType  Action type whose registration count is requested.
     * @return corporateActionCount_  Number of actions registered under `_actionType`.
     */
    function getCorporateActionCountByType(bytes32 _actionType) internal view returns (uint256 corporateActionCount_) {
        return corporateActionsStorage().actionsByType[_actionType].length;
    }

    /**
     * @notice Returns the action ID at a specific position within a given action type.
     * @dev    Performs a direct array index access on `actionsByType[_actionType]`.
     *         Reverts with an out-of-bounds panic if `_typeIndex` meets or exceeds the
     *         array length. Callers should invoke `requireMatchingActionType` to guard
     *         against invalid indices before calling this function.
     * @param _actionType  Action type to query.
     * @param _typeIndex   Zero-based position within the ordered list for `_actionType`.
     * @return corporateActionId_  Action ID stored at the requested index.
     */
    function getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view returns (bytes32 corporateActionId_) {
        return corporateActionsStorage().actionsByType[_actionType][_typeIndex];
    }

    /**
     * @notice Returns a paginated slice of action IDs filtered to a specific action type.
     * @dev    Computes page bounds via `Pagination.getStartAndEnd` and clamps the result
     *         length against the total count for `_actionType`. The loop increments
     *         `start` in-place; callers must pass validated page parameters. Uses
     *         `unchecked` arithmetic for the loop counter and `start` increment.
     *         Gas cost scales linearly with the page size.
     * @param _actionType  Action type to filter by.
     * @param _pageIndex   Zero-based page number to retrieve.
     * @param _pageLength  Maximum number of IDs to return per page.
     * @return corporateActionIds_  Array of action IDs for the requested page and type.
     */
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 length = Pagination.getSize(start, end, getCorporateActionCountByType(_actionType));
        corporateActionIds_ = new bytes32[](length);
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        unchecked {
            for (uint256 i; i < length; ++i) {
                corporateActionIds_[i] = ca.actionsByType[_actionType][start];
                ++start;
            }
        }
    }

    /**
     * @notice Returns the encoded result at a specific index within a corporate action's
     *         result array.
     * @dev    Returns an empty `bytes` value — without reverting — if `resultId` is out of
     *         bounds, including when the results array is empty. Callers that require
     *         distinguishing a stored empty value from a missing index should check
     *         `getCorporateActionResultCount` first.
     * @param actionId   Identifier of the corporate action to query.
     * @param resultId   Zero-based index of the result to retrieve.
     * @return result_   ABI-encoded result data at `resultId`; empty bytes if absent.
     */
    function getCorporateActionResult(bytes32 actionId, uint256 resultId) internal view returns (bytes memory result_) {
        if (getCorporateActionResultCount(actionId) > resultId)
            result_ = corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    /**
     * @notice Returns the number of result entries stored for a corporate action.
     * @dev    Includes any empty `bytes` entries inserted as gap-fillers by
     *         `updateCorporateActionResult`. Returns `0` for unrecognised `actionId`
     *         values.
     * @param actionId  Identifier of the corporate action to query.
     * @return Number of entries in the action's results array, including empty gaps.
     */
    function getCorporateActionResultCount(bytes32 actionId) internal view returns (uint256) {
        return corporateActionsStorage().actionsData[actionId].results.length;
    }

    /**
     * @notice Returns the raw encoded payload associated with a corporate action.
     * @dev    Returns empty bytes for unrecognised `actionId` values. Decoding is the
     *         responsibility of the caller; the encoding scheme is determined at
     *         registration time and is opaque to this library.
     * @param actionId  Identifier of the corporate action to query.
     * @return ABI-encoded data payload for the specified action.
     */
    function getCorporateActionData(bytes32 actionId) internal view returns (bytes memory) {
        return corporateActionsStorage().actionsData[actionId].data;
    }

    /**
     * @notice Returns full data records for a paginated slice of all registered corporate
     *         actions, regardless of type.
     * @dev    Resolves action IDs via `getCorporateActionIds` then fetches each record
     *         with `getCorporateAction`. Gas cost scales linearly with `pageLength`.
     *         Parallel arrays are returned rather than a struct array to avoid ABI
     *         encoding overhead for dynamic struct arrays in view calls.
     * @param pageIndex   Zero-based page number to retrieve.
     * @param pageLength  Maximum number of records to return per page.
     * @return actionTypes_   Action type identifiers for each result.
     * @return actionTypeIds_ One-based sequential indices within each action's type.
     * @return datas_         ABI-encoded payloads for each action.
     * @return isDisabled_    Disabled flags for each action.
     */
    function getCorporateActions(
        uint256 pageIndex,
        uint256 pageLength
    )
        internal
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIds_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        bytes32[] memory corporateActionIds = getCorporateActionIds(pageIndex, pageLength);
        uint256 totalCorporateActions = corporateActionIds.length;

        actionTypes_ = new bytes32[](totalCorporateActions);
        actionTypeIds_ = new uint256[](totalCorporateActions);
        datas_ = new bytes[](totalCorporateActions);
        isDisabled_ = new bool[](totalCorporateActions);

        for (uint256 i = 0; i < totalCorporateActions; ) {
            (actionTypes_[i], actionTypeIds_[i], datas_[i], isDisabled_[i]) = getCorporateAction(corporateActionIds[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns full data records for a paginated slice of corporate actions filtered
     *         to a specific action type.
     * @dev    Resolves filtered IDs via `getCorporateActionIdsByType` then fetches each
     *         record with `getCorporateAction`. Gas cost scales linearly with the effective
     *         page size. Returns empty arrays if no actions exist for `actionType` within
     *         the requested page bounds. Parallel arrays are returned for the same ABI
     *         encoding reasons as `getCorporateActions`.
     * @param actionType  Action type to filter by.
     * @param pageIndex   Zero-based page number to retrieve.
     * @param pageLength  Maximum number of records to return per page.
     * @return actionTypes_   Action type identifiers for each result.
     * @return actionTypeIds_ One-based sequential indices within each action's type.
     * @return datas_         ABI-encoded payloads for each action.
     * @return isDisabled_    Disabled flags for each action.
     */
    function getCorporateActionsByType(
        bytes32 actionType,
        uint256 pageIndex,
        uint256 pageLength
    )
        internal
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIds_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        bytes32[] memory corporateActionIds = getCorporateActionIdsByType(actionType, pageIndex, pageLength);
        uint256 totalCorporateActions = corporateActionIds.length;

        actionTypes_ = new bytes32[](totalCorporateActions);
        actionTypeIds_ = new uint256[](totalCorporateActions);
        datas_ = new bytes[](totalCorporateActions);
        isDisabled_ = new bool[](totalCorporateActions);

        for (uint256 i = 0; i < totalCorporateActions; ) {
            (actionTypes_[i], actionTypeIds_[i], datas_[i], isDisabled_[i]) = getCorporateAction(corporateActionIds[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Decodes and returns the first 32 bytes of a stored result as a `uint256`.
     * @dev    Retrieves the result via `getCorporateActionResult` and reads the value using
     *         inline assembly (`mload`) at offset `0x20` from the bytes array's data
     *         pointer. Returns `0` if the result bytes are shorter than 32 bytes, including
     *         when the result is absent or empty. Callers must ensure the stored result was
     *         encoded as a left-aligned 32-byte word (e.g. via `abi.encode(uint256(...))`).
     * @param _actionId  Identifier of the corporate action to query.
     * @param resultId   Zero-based index of the result from which to extract the value.
     * @return value     Decoded `uint256` from the first 32 bytes of the result; `0` if
     *                   the result is absent or fewer than 32 bytes.
     */
    function getUintResultAt(bytes32 _actionId, uint256 resultId) internal view returns (uint256 value) {
        bytes memory data = getCorporateActionResult(_actionId, resultId);

        uint256 bytesLength = data.length;
        if (bytesLength < 32) return 0;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            value := mload(add(data, 0x20))
        }
    }

    /**
     * @notice Returns whether a given content hash has already been recorded, indicating
     *         a duplicate registration attempt.
     * @dev    Content hashes are computed as `keccak256(abi.encode(actionType, data))` in
     *         `addCorporateAction`. This function allows callers to perform a pre-flight
     *         duplicate check without executing a full registration. Note that
     *         `updateCorporateActionData` does not update the hash index, so a hash may
     *         no longer reflect the live state of its associated action after mutation.
     * @param _contentHash  Hash to check against the recorded set.
     * @return True if the hash exists in storage; false otherwise.
     */
    function actionContentHashExists(bytes32 _contentHash) internal view returns (bool) {
        return corporateActionsStorage().actionsContentHashes[_contentHash];
    }

    /**
     * @notice Returns the Diamond Storage pointer for `CorporateActionDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot defined
     *         by `_CORPORATE_ACTION_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Isolation at a fixed slot prevents collisions with other
     *         facet storage structs in the same proxy. Must only be called from within
     *         this library.
     * @return corporateActions_  Storage pointer to the `CorporateActionDataStorage` struct.
     */
    function corporateActionsStorage() private pure returns (CorporateActionDataStorage storage corporateActions_) {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }
}
