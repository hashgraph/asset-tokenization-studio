// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ICorporateActions } from "../../facets/layer_1/corporateAction/ICorporateActions.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../../constants/storagePositions.sol";

struct ActionData {
    bytes32 actionType;
    bytes data;
    bytes[] results;
    uint256 actionIdByType;
}

struct CorporateActionDataStorage {
    EnumerableSet.Bytes32Set actions;
    mapping(bytes32 => ActionData) actionsData;
    mapping(bytes32 => bytes32[]) actionsByType;
    mapping(bytes32 => bool) actionsContentHashes;
}

library CorporateActionsStorageWrapper {
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- State-changing functions ---

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
        bool success = ca.actions.add(corporateActionId_);
        assert(success);

        ca.actionsByType[_actionType].push(corporateActionId_);

        corporateActionIdByType_ = getCorporateActionCountByType(_actionType);

        ca.actionsData[corporateActionId_].actionType = _actionType;
        ca.actionsData[corporateActionId_].data = _data;
        ca.actionsData[corporateActionId_].actionIdByType = corporateActionIdByType_;
    }

    function updateCorporateActionData(bytes32 _actionId, bytes memory _newData) internal {
        corporateActionsStorage().actionsData[_actionId].data = _newData;
    }

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

    function requireMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        if (getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActions.WrongIndexForAction(_index, _actionType);
    }

    function getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        actionType_ = ca.actionsData[_corporateActionId].actionType;
        data_ = ca.actionsData[_corporateActionId].data;
        actionTypeId_ = ca.actionsData[_corporateActionId].actionIdByType;
    }

    function getCorporateActionCount() internal view returns (uint256 corporateActionCount_) {
        return corporateActionsStorage().actions.length();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = corporateActionsStorage().actions.getFromSet(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(bytes32 _actionType) internal view returns (uint256 corporateActionCount_) {
        return corporateActionsStorage().actionsByType[_actionType].length;
    }

    function getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view returns (bytes32 corporateActionId_) {
        return corporateActionsStorage().actionsByType[_actionType][_typeIndex];
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);

        corporateActionIds_ = new bytes32[](Pagination.getSize(start, end, getCorporateActionCountByType(_actionType)));

        CorporateActionDataStorage storage ca = corporateActionsStorage();

        for (uint256 i = 0; i < corporateActionIds_.length; i++) {
            corporateActionIds_[i] = ca.actionsByType[_actionType][start + i];
        }
    }

    function getCorporateActionResult(bytes32 actionId, uint256 resultId) internal view returns (bytes memory result_) {
        if (getCorporateActionResultCount(actionId) > resultId)
            result_ = corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    function getCorporateActionResultCount(bytes32 actionId) internal view returns (uint256) {
        return corporateActionsStorage().actionsData[actionId].results.length;
    }

    function getCorporateActionData(bytes32 actionId) internal view returns (bytes memory) {
        return corporateActionsStorage().actionsData[actionId].data;
    }

    function getUintResultAt(bytes32 _actionId, uint256 resultId) internal view returns (uint256) {
        bytes memory data = getCorporateActionResult(_actionId, resultId);

        uint256 bytesLength = data.length;
        if (bytesLength < 32) return 0;

        uint256 value;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            value := mload(add(data, 0x20))
        }

        return value;
    }

    function actionContentHashExists(bytes32 _contentHash) internal view returns (bool) {
        return corporateActionsStorage().actionsContentHashes[_contentHash];
    }

    function requireValidDates(uint256 _firstDate, uint256 _secondDate) internal pure {
        if (_secondDate < _firstDate) {
            revert ICorporateActions.WrongDates(_firstDate, _secondDate);
        }
    }

    function corporateActionsStorage() internal pure returns (CorporateActionDataStorage storage corporateActions_) {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }
}
