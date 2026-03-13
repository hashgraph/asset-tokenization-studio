// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "./ICorporateActions.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";

abstract contract CorporateActions is ICorporateActions {
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) external override returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_CORPORATE_ACTION_ROLE, msg.sender);
        (corporateActionId_, corporateActionIdByType_) = CorporateActionsStorageWrapper._addCorporateAction(
            _actionType,
            _data
        );

        if (corporateActionId_ == bytes32(0)) {
            revert DuplicatedCorporateAction(_actionType, _data);
        }
        emit CorporateActionAdded(msg.sender, _actionType, corporateActionId_, corporateActionIdByType_, _data);
    }

    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view override returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_) {
        (actionType_, actionTypeId_, data_) = CorporateActionsStorageWrapper._getCorporateAction(_corporateActionId);
    }

    function getCorporateActionCount() external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper._getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper._getCorporateActionIds(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper._getCorporateActionCountByType(_actionType);
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper._getCorporateActionIdsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool) {
        return CorporateActionsStorageWrapper._actionContentHashExists(_contentHash);
    }
}
