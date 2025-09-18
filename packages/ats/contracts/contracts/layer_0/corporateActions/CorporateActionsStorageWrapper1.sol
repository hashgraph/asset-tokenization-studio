// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from '../../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol';
import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from '../../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol';
import {LibCommon} from '../../layer_0/common/libraries/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    _CORPORATE_ACTION_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {ClearingStorageWrapper1} from '../clearing/ClearingStorageWrapper1.sol';
import {SNAPSHOT_RESULT_ID} from '../constants/values.sol';

abstract contract CorporateActionsStorageWrapper1 is ClearingStorageWrapper1 {
    using LibCommon for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    modifier validateDates(uint256 _firstDate, uint256 _secondDate) {
        _checkDates(_firstDate, _secondDate);
        _;
    }

    function _onScheduledSnapshotTriggered(
        uint256 _snapShotID,
        bytes memory _data
    ) internal {
        if (_data.length > 0) {
            bytes32 actionId = abi.decode(_data, (bytes32));
            _addSnapshotToAction(actionId, _snapShotID);
        }
    }

    function _addSnapshotToAction(
        bytes32 _actionId,
        uint256 _snapshotId
    ) internal {
        _updateCorporateActionResult(
            _actionId,
            SNAPSHOT_RESULT_ID,
            abi.encodePacked(_snapshotId)
        );
    }

    function _updateCorporateActionResult(
        bytes32 actionId,
        uint256 resultId,
        bytes memory newResult
    ) internal {
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

        for (uint256 i = results.length; i < resultId; ++i) {
            corporateActions_.actionsData[actionId].results.push('');
        }

        corporateActions_.actionsData[actionId].results.push(newResult);
    }

    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view returns (bytes32 actionType_, bytes memory data_) {
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
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage().actions.getFromSet(
            _pageIndex,
            _pageLength
        );
    }

    function _getCorporateActionCountByType(
        bytes32 _actionType
    ) internal view returns (uint256 corporateActionCount_) {
        return _corporateActionsStorage().actionsByType[_actionType].length();
    }

    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _corporateActionsStorage()
            .actionsByType[_actionType]
            .getFromSet(_pageIndex, _pageLength);
    }

    function _getResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view returns (bytes memory result_) {
        if (_getCorporateActionResultCount(actionId) > resultId)
            result_ = _getCorporateActionResult(actionId, resultId);
    }

    function _getCorporateActionResultCount(
        bytes32 actionId
    ) internal view returns (uint256) {
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
    ) internal view returns (bytes memory) {
        return
            _corporateActionsStorage().actionsData[actionId].results[resultId];
    }

    function _getCorporateActionData(
        bytes32 actionId
    ) internal view returns (bytes memory) {
        return _corporateActionsStorage().actionsData[actionId].data;
    }

    function _corporateActionsStorage()
        internal
        pure
        returns (CorporateActionDataStorage storage corporateActions_)
    {
        bytes32 position = _CORPORATE_ACTION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            corporateActions_.slot := position
        }
    }

    function _checkDates(uint256 _firstDate, uint256 _secondDate) private pure {
        if (_secondDate < _firstDate) {
            revert ICorporateActionsStorageWrapper.WrongDates(
                _firstDate,
                _secondDate
            );
        }
    }
}
