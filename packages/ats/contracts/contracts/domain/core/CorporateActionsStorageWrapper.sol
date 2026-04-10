// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ICorporateActions } from "../../facets/layer_1/corporateAction/ICorporateActions.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { KPI_CA_ADD_ACTION } from "../../constants/values.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

struct ActionData {
    bytes32 actionType;
    bytes data;
    bytes[] results;
    uint256 actionIdByType;
    bool isDisabled;
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

    function cancelCorporateAction(bytes32 actionId) internal {
        corporateActionsStorage().actionsData[actionId].isDisabled = true;
    }

    function updateCorporateActionData(bytes32 actionId, bytes memory newData) internal {
        corporateActionsStorage().actionsData[actionId].data = newData;
    }

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

    function isCorporateActionDisabled(bytes32 actionId) internal view returns (bool) {
        return corporateActionsStorage().actionsData[actionId].isDisabled;
    }

    function requireMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        if (getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActions.WrongIndexForAction(_index, _actionType);
    }

    function getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_, bool isDisabled_) {
        CorporateActionDataStorage storage ca = corporateActionsStorage();
        actionType_ = ca.actionsData[_corporateActionId].actionType;
        data_ = ca.actionsData[_corporateActionId].data;
        actionTypeId_ = ca.actionsData[_corporateActionId].actionIdByType;
        isDisabled_ = ca.actionsData[_corporateActionId].isDisabled;
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

    function getUintResultAt(bytes32 _actionId, uint256 resultId) internal view returns (uint256 value) {
        bytes memory data = getCorporateActionResult(_actionId, resultId);

        uint256 bytesLength = data.length;
        if (bytesLength < 32) return 0;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            value := mload(add(data, 0x20))
        }
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
