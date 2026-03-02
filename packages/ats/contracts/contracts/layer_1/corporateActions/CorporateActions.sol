// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "../interfaces/corporateActions/ICorporateActions.sol";
import { Internals } from "../../layer_0/Internals.sol";

abstract contract CorporateActions is ICorporateActions, Internals {
    function getCorporateAction(
        bytes32 _corporateActionId
    )
        external
        view
        override
        returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_, bool isDisabled_)
    {
        (actionType_, actionTypeId_, data_, isDisabled_) = _getCorporateAction(_corporateActionId);
    }

    function getCorporateActionCount() external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = _getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _getCorporateActionIds(_pageIndex, _pageLength);
    }

    function getCorporateActions(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIds_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        (actionTypes_, actionTypeIds_, datas_, isDisabled_) = _getCorporateActions(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = _getCorporateActionCountByType(_actionType);
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _getCorporateActionIdsByType(_actionType, _pageIndex, _pageLength);
    }

    function getCorporateActionsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIds_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        (actionTypes_, actionTypeIds_, datas_, isDisabled_) = _getCorporateActionsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool) {
        return _actionContentHashExists(_contentHash);
    }
}
