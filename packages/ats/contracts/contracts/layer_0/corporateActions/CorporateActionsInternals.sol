// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalancesInternals } from "../totalBalances/TotalBalancesInternals.sol";

abstract contract CorporateActionsInternals is TotalBalancesInternals {
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) internal virtual returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_);
    function _updateCorporateActionData(bytes32 _actionId, bytes memory _newData) internal virtual;
    function _updateCorporateActionResult(bytes32 actionId, uint256 resultId, bytes memory newResult) internal virtual;
    function _actionContentHashExists(bytes32 _contentHash) internal view virtual returns (bool);
    function _getCorporateAction(
        bytes32 _corporateActionId
    ) internal view virtual returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_);
    function _getCorporateActionCount() internal view virtual returns (uint256 corporateActionCount_);
    function _getCorporateActionCountByType(
        bytes32 _actionType
    ) internal view virtual returns (uint256 corporateActionCount_);
    function _getCorporateActionData(bytes32 actionId) internal view virtual returns (bytes memory);
    function _getCorporateActionIdByTypeIndex(
        bytes32 _actionType,
        uint256 _typeIndex
    ) internal view virtual returns (bytes32 corporateActionId_);
    function _getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_);
    function _getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory corporateActionIds_);
    function _getCorporateActionResult(
        bytes32 actionId,
        uint256 resultId
    ) internal view virtual returns (bytes memory result_);
    function _getCorporateActionResultCount(bytes32 actionId) internal view virtual returns (uint256);
    function _getUintResultAt(bytes32 _actionId, uint256 resultId) internal view virtual returns (uint256);
}
