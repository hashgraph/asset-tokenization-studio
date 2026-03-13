// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from "../asset/corporateAction/ICorporateActionsStorageWrapper.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../../constants/storagePositions.sol";

library CorporateActionsStorageWrapper {
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Storage accessor (pure) ---

    function _corporateActionsStorage() internal pure returns (CorporateActionDataStorage storage corporateActions_) {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
    function _requireMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        if (_getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActionsStorageWrapper.WrongIndexForAction(_index, _actionType);
    }

    // --- State-changing functions ---

    function _addCorporateAction(
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
        bool success = ca.actions.add(corporateActionId_);
        assert(success);

        ca.actionsByType[_actionType].push(corporateActionId_);

        corporateActionIdByType_ = _getCorporateActionCountByType(_actionType);

        ca.actionsData[corporateActionId_].actionType = _actionType;
        ca.actionsData[corporateActionId_].data = _data;
        ca.actionsData[corporateActionId_].actionIdByType = corporateActionIdByType_;
    }

    function _updateCorporateActionData(bytes32 _actionId, bytes memory _newData) internal {
        _corporateActionsStorage().actionsData[_actionId].data = _newData;
    }

    function _updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal {
        CorporateActionDataStorage storage ca = _corporateActionsStorage();
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

    // --- Read functions ---

    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_) {
        CorporateActionDataStorage storage ca = _corporateActionsStorage();
        actionType_ = ca.actionsData[_corporateActionId].actionType;
        data_ = ca.actionsData[_corporateActionId].data;
        actionTypeId_ = ca.actionsData[_corporateActionId].actionIdByType;
    }

    function _getCorporateActionCount() internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actions.length();
    }

    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actions.getFromSet(_pageIndex, _pageLength);
    }

    function _getCorporateActionCountByType(bytes32 _actionType) internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actionsByType[_actionType].length;
    }

    function _getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view returns (bytes32 corporateActionId_) {
        return _corporateActionsStorage().actionsByType[_actionType][_typeIndex];
    }

    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);

        corporateActionIds_ = new bytes32[](
            Pagination.getSize(start, end, _getCorporateActionCountByType(_actionType))
        );

        CorporateActionDataStorage storage ca = _corporateActionsStorage();

        for (uint256 i = 0; i < corporateActionIds_.length; i++) {
            corporateActionIds_[i] = ca.actionsByType[_actionType][start + i];
        }
    }

    function _getCorporateActionResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view returns (bytes memory result_) {
        if (_getCorporateActionResultCount(actionId) > resultId)
            result_ = _corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    function _getCorporateActionResultCount(bytes32 actionId) internal view returns (uint256) {
        return _corporateActionsStorage().actionsData[actionId].results.length;
    }

    function _getCorporateActionData(bytes32 actionId) internal view returns (bytes memory) {
        return _corporateActionsStorage().actionsData[actionId].data;
    }

    function _getUintResultAt(bytes32 _actionId, uint256 resultId) internal view returns (uint256) {
        bytes memory data = _getCorporateActionResult(_actionId, resultId);

        uint256 bytesLength = data.length;
        if (bytesLength < 32) return 0;

        uint256 value;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            value := mload(add(data, 0x20))
        }

        return value;
    }

    function _actionContentHashExists(bytes32 _contentHash) internal view returns (bool) {
        return _corporateActionsStorage().actionsContentHashes[_contentHash];
    }

    function _requireValidDates(uint256 _firstDate, uint256 _secondDate) internal pure {
        if (_secondDate < _firstDate) {
            revert ICorporateActionsStorageWrapper.WrongDates(_firstDate, _secondDate);
        }
    }
}
