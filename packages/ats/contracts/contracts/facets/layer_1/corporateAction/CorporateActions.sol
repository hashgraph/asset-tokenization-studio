// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "./ICorporateActions.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";

abstract contract CorporateActions is ICorporateActions, Modifiers {
    function getCorporateAction(
        bytes32 _corporateActionId
    )
        external
        view
        override
        returns (bytes32 actionType_, uint256 actionIdByType_, bytes memory data_, bool isDisabled_)
    {
        (actionType_, actionIdByType_, data_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(
            _corporateActionId
        );
    }

    function getCorporateActions(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionIdByType_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        (actionTypes_, actionIdByType_, datas_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateActions(
            _pageIndex,
            _pageLength
        );
    }

    function getCorporateActionCount() external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper.getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper.getCorporateActionIds(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper.getCorporateActionCountByType(_actionType);
    }

    function getCorporateActionsByType(
        bytes32 actionType,
        uint256 pageIndex,
        uint256 pageLength
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
        (actionTypes_, actionTypeIds_, datas_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateActionsByType(
            actionType,
            pageIndex,
            pageLength
        );
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper.getCorporateActionIdsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool) {
        return CorporateActionsStorageWrapper.actionContentHashExists(_contentHash);
    }
}
