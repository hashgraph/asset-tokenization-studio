// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionDataStorage, corporateActionsStorage } from "../../storage/ABAFStorageAccessor.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ICorporateActions } from "../../facets/features/interfaces/ICorporateActions.sol";

/// @title LibCorporateActions — Corporate actions management library
/// @notice Centralized corporate actions functionality extracted from CorporateActionsStorageWrapper.sol
/// @dev Uses free function storage accessors from AssetStorage.sol, no inheritance
library LibCorporateActions {
    using LibPagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /// @dev Adds a new corporate action and returns its ID
    /// @return corporateActionId The unique ID for this action
    /// @return corporateActionIdByType The index of this action within its type
    function addCorporateAction(
        bytes32 actionType,
        bytes memory data
    ) internal returns (bytes32 corporateActionId, uint256 corporateActionIdByType) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();

        bytes32 contentHash = keccak256(abi.encode(actionType, data));
        if (ca.actionsContentHashes[contentHash]) {
            return (bytes32(0), 0);
        }
        ca.actionsContentHashes[contentHash] = true;

        corporateActionId = bytes32(ca.actions.length() + 1);
        bool success = ca.actions.add(corporateActionId);
        assert(success);

        ca.actionsByType[actionType].push(corporateActionId);
        corporateActionIdByType = getCorporateActionCountByType(actionType);

        ca.actionsData[corporateActionId].actionType = actionType;
        ca.actionsData[corporateActionId].data = data;
        ca.actionsData[corporateActionId].actionIdByType = corporateActionIdByType;
    }

    /// @dev Updates the data for a corporate action
    function updateCorporateActionData(bytes32 actionId, bytes memory newData) internal {
        corporateActionsStorage().actionsData[actionId].data = newData;
    }

    /// @dev Updates a result for a corporate action
    function updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        bytes[] memory results = ca.actionsData[actionId].results;

        if (results.length > resultId) {
            ca.actionsData[actionId].results[resultId] = newResult;
            return;
        }

        for (uint256 i = results.length; i < resultId; ++i) {
            ca.actionsData[actionId].results.push("");
        }

        ca.actionsData[actionId].results.push(newResult);
    }

    /// @dev Returns the total number of corporate actions
    function getCorporateActionCount() internal view returns (uint256) {
        return corporateActionsStorage().actions.length();
    }

    /// @dev Returns paginated list of corporate action IDs
    function getCorporateActionIds(uint256 pageIndex, uint256 pageLength) internal view returns (bytes32[] memory) {
        return corporateActionsStorage().actions.getFromSet(pageIndex, pageLength);
    }

    /// @dev Returns the number of actions of a specific type
    function getCorporateActionCountByType(bytes32 actionType) internal view returns (uint256) {
        return corporateActionsStorage().actionsByType[actionType].length;
    }

    /// @dev Returns the action ID at a specific index within a type
    function getCorporateActionIdByTypeIndex(bytes32 actionType, uint256 typeIndex) internal view returns (bytes32) {
        return corporateActionsStorage().actionsByType[actionType][typeIndex];
    }

    /// @dev Returns paginated list of action IDs for a specific type
    function getCorporateActionIdsByType(
        bytes32 actionType,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (bytes32[] memory) {
        (uint256 start, uint256 end) = LibPagination.getStartAndEnd(pageIndex, pageLength);

        uint256 count = getCorporateActionCountByType(actionType);
        uint256 size = LibPagination.getSize(start, end, count);
        bytes32[] memory ids = new bytes32[](size);

        CorporateActionDataStorage storage ca = corporateActionsStorage();

        for (uint256 i = 0; i < size; ++i) {
            ids[i] = ca.actionsByType[actionType][start + i];
        }

        return ids;
    }

    /// @dev Returns a corporate action (actionType, data)
    /// @return actionType The type of action
    /// @return actionTypeId The index within its type
    /// @return data The encoded action data
    function getCorporateAction(
        bytes32 actionId
    ) internal view returns (bytes32 actionType, uint256 actionTypeId, bytes memory data) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        actionType = ca.actionsData[actionId].actionType;
        data = ca.actionsData[actionId].data;
        actionTypeId = ca.actionsData[actionId].actionIdByType;
    }

    /// @dev Returns the number of results for an action
    function getCorporateActionResultCount(bytes32 actionId) internal view returns (uint256) {
        return corporateActionsStorage().actionsData[actionId].results.length;
    }

    /// @dev Returns a specific result for an action
    function getCorporateActionResult(bytes32 actionId, uint256 resultId) internal view returns (bytes memory) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        if (getCorporateActionResultCount(actionId) > resultId) {
            return ca.actionsData[actionId].results[resultId];
        }
        return "";
    }

    /// @dev Returns the encoded data for an action
    function getCorporateActionData(bytes32 actionId) internal view returns (bytes memory) {
        return corporateActionsStorage().actionsData[actionId].data;
    }

    /// @dev Extracts a uint256 from a result (assumes standard abi encoding)
    function getUintResultAt(bytes32 actionId, uint256 resultId) internal view returns (uint256) {
        bytes memory data = getCorporateActionResult(actionId, resultId);

        uint256 bytesLength = data.length;
        if (bytesLength < 32) return 0;

        uint256 value;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            value := mload(add(data, 0x20))
        }

        return value;
    }

    /// @dev Checks if a content hash exists (prevents duplicate actions)
    function actionContentHashExists(bytes32 contentHash) internal view returns (bool) {
        return corporateActionsStorage().actionsContentHashes[contentHash];
    }

    /// @dev Validates that an index corresponds to a specific action type
    function validateMatchingActionType(bytes32 actionType, uint256 index) internal view {
        if (getCorporateActionCountByType(actionType) <= index) {
            revert ICorporateActions.WrongIndexForAction(index, actionType);
        }
    }

    /// @dev Validates that dates are in correct order
    function validateDates(uint256 firstDate, uint256 secondDate) internal pure {
        if (secondDate < firstDate) {
            revert ICorporateActions.WrongDates(firstDate, secondDate);
        }
    }
}
