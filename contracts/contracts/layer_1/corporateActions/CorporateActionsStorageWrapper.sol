pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ICorporateActionsStorageWrapper
} from '../interfaces/corporateActions/ICorporateActionsStorageWrapper.sol';
import {LibCommon} from '../common/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    _CORPORATE_ACTION_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {LocalContext} from '../context/LocalContext.sol';

abstract contract CorporateActionsStorageWrapper is
    ICorporateActionsStorageWrapper,
    LocalContext
{
    using LibCommon for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct ActionData {
        bytes32 actionType;
        bytes data;
        bytes[] results;
    }

    struct CorporateActionDataStorage {
        EnumerableSet.Bytes32Set actions;
        mapping(bytes32 => ActionData) actionsData;
        mapping(bytes32 => EnumerableSet.Bytes32Set) actionsByType;
    }

    modifier checkIndexForCorporateActionByType(
        bytes32 actionType,
        uint256 index
    ) {
        if (_getCorporateActionCountByType(actionType) <= index) {
            revert WrongIndexForAction(index, actionType);
        }
        _;
    }

    // Internal
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        internal
        virtual
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        CorporateActionDataStorage
            storage corporateActions_ = _corporateActionsStorage();
        corporateActionId_ = bytes32(corporateActions_.actions.length() + 1);
        // TODO: Review when it can return false.
        success_ =
            corporateActions_.actions.add(corporateActionId_) &&
            corporateActions_.actionsByType[_actionType].add(
                corporateActionId_
            );
        corporateActions_
            .actionsData[corporateActionId_]
            .actionType = _actionType;
        corporateActions_.actionsData[corporateActionId_].data = _data;
        corporateActionIndexByType_ = _getCorporateActionCountByType(
            _actionType
        );
    }

    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view virtual returns (bytes32 actionType_, bytes memory data_) {
        CorporateActionDataStorage
            storage corporateActions_ = _corporateActionsStorage();
        actionType_ = corporateActions_
            .actionsData[_corporateActionId]
            .actionType;
        data_ = corporateActions_.actionsData[_corporateActionId].data;
    }

    function _getCorporateActionCount()
        internal
        view
        virtual
        returns (uint256 corporateActionCount_)
    {
        return _corporateActionsStorage().actions.length();
    }

    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actions.getFromSet(
            _pageIndex,
            _pageLength
        );
    }

    function _getCorporateActionCountByType(
        bytes32 _actionType
    ) internal view virtual returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actionsByType[_actionType].length();
    }

    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage()
            .actionsByType[_actionType]
            .getFromSet(_pageIndex, _pageLength);
    }

    function _updateCorporateActionResult(
        bytes32 actionId,
        uint256 resultId,
        bytes memory newResult
    ) internal virtual {
        CorporateActionDataStorage
            storage corporateActions_ = _corporateActionsStorage();
        bytes[] memory results = corporateActions_
            .actionsData[actionId]
            .results;

        if (results.length > resultId) {
            corporateActions_.actionsData[actionId].results[
                resultId
            ] = newResult;
            return;
        }

        for (uint256 i = results.length; i < resultId; i++) {
            corporateActions_.actionsData[actionId].results.push('');
        }

        corporateActions_.actionsData[actionId].results.push(newResult);
    }

    function _getResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view virtual returns (bytes memory) {
        bytes memory result;

        if (_getCorporateActionResultCount(actionId) > resultId)
            result = _getCorporateActionResult(actionId, resultId);

        return result;
    }

    function _getCorporateActionResultCount(
        bytes32 actionId
    ) internal view virtual returns (uint256) {
        return _corporateActionsStorage().actionsData[actionId].results.length;
    }

    /**
     * @dev returns a corporate action result.
     *
     * @param actionId The corporate action Id
     */
    function _getCorporateActionResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view virtual returns (bytes memory) {
        return
            _corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    function _corporateActionsStorage()
        internal
        pure
        virtual
        returns (CorporateActionDataStorage storage corporateActions_)
    {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }
}
