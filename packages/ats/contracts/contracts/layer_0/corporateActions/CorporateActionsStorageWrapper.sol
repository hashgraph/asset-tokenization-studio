// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from "../../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol";
import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from "../../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol";
import { LibCommon } from "../../layer_0/common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { ClearingStorageWrapper1 } from "../clearing/ClearingStorageWrapper1.sol";

abstract contract CorporateActionsStorageWrapper is ClearingStorageWrapper1 {
    using LibCommon for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    modifier validateDates(uint256 _firstDate, uint256 _secondDate) {
        _checkDates(_firstDate, _secondDate);
        _;
    }

    modifier onlyMatchingActionType(bytes32 _actionType, uint256 _index) {
        _checkMatchingActionType(_actionType, _index);
        _;
    }

    // Internal
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal returns (bool success_, bytes32 corporateActionId_, uint256 corporateActionIndexByType_) {
        CorporateActionDataStorage storage corporateActions_ = _corporateActionsStorage();

        bytes32 contentHash = keccak256(abi.encode(_actionType, _data));
        if (corporateActions_.actionsContentHashes[contentHash]) {
            return (false, bytes32(0), 0);
        }
        corporateActions_.actionsContentHashes[contentHash] = true;

        corporateActionId_ = bytes32(corporateActions_.actions.length() + 1);
        success_ =
            corporateActions_.actions.add(corporateActionId_) &&
            corporateActions_.actionsByType[_actionType].add(corporateActionId_);
        corporateActions_.actionsData[corporateActionId_].actionType = _actionType;
        corporateActions_.actionsData[corporateActionId_].data = _data;
        corporateActionIndexByType_ = _getCorporateActionCountByType(_actionType);
    }

    function _updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal {
        CorporateActionDataStorage storage corporateActions_ = _corporateActionsStorage();
        bytes[] memory results = corporateActions_.actionsData[actionId].results;

        if (results.length > resultId) {
            corporateActions_.actionsData[actionId].results[resultId] = newResult;
            return;
        }

        for (uint256 i = results.length; i < resultId; ++i) {
            corporateActions_.actionsData[actionId].results.push("");
        }

        corporateActions_.actionsData[actionId].results.push(newResult);
    }

    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, bytes memory data_) {
        CorporateActionDataStorage storage corporateActions_ = _corporateActionsStorage();
        actionType_ = corporateActions_.actionsData[_corporateActionId].actionType;
        data_ = corporateActions_.actionsData[_corporateActionId].data;
    }

    function _getCorporateActionCount() internal view virtual returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actions.length();
    }

    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actions.getFromSet(_pageIndex, _pageLength);
    }

    function _getCorporateActionCountByType(bytes32 _actionType) internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actionsByType[_actionType].length();
    }

    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actionsByType[_actionType].getFromSet(_pageIndex, _pageLength);
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

    function _corporateActionsStorage() internal pure returns (CorporateActionDataStorage storage corporateActions_) {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }

    function _checkMatchingActionType(bytes32 _actionType, uint256 _index) private view {
        if (_getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActionsStorageWrapper.WrongIndexForAction(_index, _actionType);
    }

    function _checkDates(uint256 _firstDate, uint256 _secondDate) private pure {
        if (_secondDate < _firstDate) {
            revert ICorporateActionsStorageWrapper.WrongDates(_firstDate, _secondDate);
        }
    }
}
