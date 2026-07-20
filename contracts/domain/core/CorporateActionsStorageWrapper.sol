// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ICorporateActions } from "../../facets/corporateActions/ICorporateActions.sol";
import { KPI_CA_ADD_ACTION } from "../../constants/values.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage CorporateAction
bytes32 constant STORAGE_LOCATION_CORPORATE_ACTION = 0xd54242d02bc8c723c5c0855ec1fcbb8ff6efc9ae65b3a86e8e6980a79cf77f00;

/**
 * @notice Data structure encapsulating a single corporate action's metadata and results.
 * @dev Stores the action type, payload data, execution results array, and disabled flag.
 */
struct ActionData {
    bytes32 actionType;
    bytes data;
    bytes[] results;
    uint256 actionIdByType;
    bool isDisabled;
}

/**
 * @notice Storage struct maintaining all corporate action state and indexes.
 * @dev Tracks a set of action IDs, maps actions to their metadata and results, indexes
 *      actions by type, and maintains a content-hash registry to detect duplicates.
 * @custom:storage-location erc7201:security.token.standard.storage.CorporateAction
 */
struct CorporateActionDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    EnumerableSet.Bytes32Set actions;
    mapping(bytes32 => ActionData) actionsData;
    mapping(bytes32 => bytes32[]) actionsByType;
    mapping(bytes32 => bool) actionsContentHashes;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title CorporateActionsStorageWrapper
 * @notice Storage wrapper for corporate action management operations
 * @dev Manages corporate action data including actions, types, and execution results
 * @author Hashgraph
 */
library CorporateActionsStorageWrapper {
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /**
     * @notice Adds a new corporate action and returns its assigned ID.
     * @dev Computes a content hash of the action type and data to detect duplicates.
     *      Assigns a globally unique ID and a type-specific index. Returns (0, 0) if a
     *      duplicate content hash is detected.
     * @param _actionType The kind of corporate action (e.g., dividend, split).
     * @param _data The encoded action payload (actionType-dependent format).
     * @return corporateActionId_ The newly assigned global action ID (or 0 if duplicate).
     * @return corporateActionIdByType_ The action's index within its type (or 0 if duplicate).
     */
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_) {
        CorporateActionDataStorage storage ca = _corporateActionsStorage();

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
     * @notice Marks a corporate action as cancelled (disabled).
     * @param actionId The ID of the action to cancel.
     */
    function cancelCorporateAction(bytes32 actionId) internal {
        _corporateActionsStorage().actionsData[actionId].isDisabled = true;
    }

    /**
     * @notice Updates the payload data of an existing corporate action.
     * @param actionId The ID of the action whose data is being updated.
     * @param newData The new encoded action payload.
     */
    function updateCorporateActionData(bytes32 actionId, bytes memory newData) internal {
        _corporateActionsStorage().actionsData[actionId].data = newData;
    }

    /**
     * @notice Updates or appends a result entry for a corporate action.
     * @dev If the result ID already exists, updates it in-place. Otherwise, pads the
     *      results array with empty entries until the target index and then appends
     *      the new result.
     * @param actionId The ID of the corporate action.
     * @param resultId The index of the result to update or create.
     * @param newResult The encoded result data.
     */
    function updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal {
        CorporateActionDataStorage storage ca = _corporateActionsStorage();
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
     * @notice Returns whether a corporate action has been cancelled.
     * @param actionId The ID of the corporate action.
     * @return True if the action is disabled; false otherwise.
     */
    function isCorporateActionDisabled(bytes32 actionId) internal view returns (bool) {
        return _corporateActionsStorage().actionsData[actionId].isDisabled;
    }

    /**
     * @notice Reverts if a given type-index pair is out of bounds.
     * @dev Used to validate pagination and indexed access to actions of a given type.
     * @param _actionType The action type being indexed.
     * @param _index The type-scoped index to validate.
     */
    function requireMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        // solhint-disable-next-line gas-strict-inequalities
        if (getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActions.WrongIndexForAction(_index, _actionType);
    }

    /**
     * @notice Retrieves the full metadata of a corporate action.
     * @param _corporateActionId The global action ID.
     * @return actionType_ The action type identifier.
     * @return actionTypeId_ The type-scoped index of this action.
     * @return data_ The encoded action payload.
     * @return isDisabled_ Whether the action has been cancelled.
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_, bool isDisabled_) {
        CorporateActionDataStorage storage ca = _corporateActionsStorage();
        actionType_ = ca.actionsData[_corporateActionId].actionType;
        data_ = ca.actionsData[_corporateActionId].data;
        actionTypeId_ = ca.actionsData[_corporateActionId].actionIdByType;
        isDisabled_ = ca.actionsData[_corporateActionId].isDisabled;
    }

    /**
     * @notice Returns the total count of corporate actions registered.
     * @return corporateActionCount_ The number of distinct corporate actions.
     */
    function getCorporateActionCount() internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actions.length();
    }

    /**
     * @notice Retrieves a paginated list of all corporate action IDs.
     * @param _pageIndex The zero-based page number.
     * @param _pageLength The number of results per page.
     * @return corporateActionIds_ Array of action IDs on the requested page.
     */
    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actions.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the total count of actions of a specified type.
     * @param _actionType The action type to count.
     * @return corporateActionCount_ The number of actions with the given type.
     */
    function getCorporateActionCountByType(bytes32 _actionType) internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actionsByType[_actionType].length;
    }

    /**
     * @notice Retrieves the action ID at a given index within a specific action type.
     * @param _actionType The action type being indexed.
     * @param _typeIndex The zero-based index within that type.
     * @return corporateActionId_ The global action ID at the specified position.
     */
    function getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view returns (bytes32 corporateActionId_) {
        return _corporateActionsStorage().actionsByType[_actionType][_typeIndex];
    }

    /**
     * @notice Retrieves a paginated list of action IDs of a specific type.
     * @param _actionType The action type to filter by.
     * @param _pageIndex The zero-based page number.
     * @param _pageLength The number of results per page.
     * @return corporateActionIds_ Array of action IDs of the specified type on the page.
     */
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 length = Pagination.getSize(start, end, getCorporateActionCountByType(_actionType));
        corporateActionIds_ = new bytes32[](length);
        CorporateActionDataStorage storage ca = _corporateActionsStorage();
        unchecked {
            for (uint256 i; i < length; ++i) {
                corporateActionIds_[i] = ca.actionsByType[_actionType][start];
                ++start;
            }
        }
    }

    /**
     * @notice Retrieves a result entry for a corporate action, if it exists.
     * @dev Returns an empty bytes array if the result ID is out of bounds.
     * @param actionId The ID of the corporate action.
     * @param resultId The index of the result to retrieve.
     * @return result_ The encoded result data, or empty bytes if not found.
     */
    function getCorporateActionResult(bytes32 actionId, uint256 resultId) internal view returns (bytes memory result_) {
        if (getCorporateActionResultCount(actionId) > resultId)
            result_ = _corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    /**
     * @notice Returns the count of results recorded for a corporate action.
     * @param actionId The ID of the corporate action.
     * @return The number of result entries stored for the action.
     */
    function getCorporateActionResultCount(bytes32 actionId) internal view returns (uint256) {
        return _corporateActionsStorage().actionsData[actionId].results.length;
    }

    /**
     * @notice Retrieves the payload data of a corporate action.
     * @param actionId The ID of the corporate action.
     * @return data_ The encoded action payload.
     */
    function getCorporateActionData(bytes32 actionId) internal view returns (bytes memory data_) {
        return _corporateActionsStorage().actionsData[actionId].data;
    }

    /**
     * @notice Retrieves a paginated list of all corporate actions with full metadata.
     * @dev Combines getCorporateActionIds and getCorporateAction to return parallel arrays
     *      of types, type-scoped IDs, payloads, and disabled flags.
     * @param pageIndex The zero-based page number.
     * @param pageLength The number of results per page.
     * @return actionTypes_ Array of action type identifiers.
     * @return actionTypeIds_ Array of type-scoped indexes.
     * @return datas_ Array of encoded action payloads.
     * @return isDisabled_ Array of cancellation flags.
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
     * @notice Retrieves a paginated list of corporate actions filtered by type.
     * @dev Similar to getCorporateActions but returns only actions matching the given type.
     * @param actionType The action type to filter by.
     * @param pageIndex The zero-based page number.
     * @param pageLength The number of results per page.
     * @return actionTypes_ Array of action type identifiers (all equal to actionType).
     * @return actionTypeIds_ Array of type-scoped indexes.
     * @return datas_ Array of encoded action payloads.
     * @return isDisabled_ Array of cancellation flags.
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
     * @notice Extracts a uint256 value from an action result at a given index.
     * @dev Reads the first 32 bytes of the result as a uint256. Returns zero if the
     *      result is empty or less than 32 bytes long.
     * @param _actionId The ID of the corporate action.
     * @param resultId The index of the result to decode.
     * @return value The uint256 value extracted from the result, or zero.
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
     * @notice Checks whether a content hash has been registered in the deduplica­tion registry.
     * @dev Used to detect and reject duplicate corporate actions.
     * @param _contentHash The hash of the action type and data to check.
     * @return True if the content hash is registered; false otherwise.
     */
    function actionContentHashExists(bytes32 _contentHash) internal view returns (bool) {
        return _corporateActionsStorage().actionsContentHashes[_contentHash];
    }

    /**
     * @notice Retrieves a reference to the CorporateActions storage location.
     * @dev Uses the ERC-7201 storage location formula to position storage at a
     *      deterministic address based on STORAGE_LOCATION_CORPORATE_ACTION.
     * @return corporateActions_ The storage struct at the designated location.
     */
    function _corporateActionsStorage() private pure returns (CorporateActionDataStorage storage corporateActions_) {
        bytes32 position = STORAGE_LOCATION_CORPORATE_ACTION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }
}
