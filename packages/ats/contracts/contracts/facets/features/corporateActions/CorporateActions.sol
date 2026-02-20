// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "../interfaces/ICorporateActions.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";

abstract contract CorporateActions is ICorporateActions {
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) external override returns (bytes32 corporateActionId_, uint256 corporateActionIdByType_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        (corporateActionId_, corporateActionIdByType_) = LibCorporateActions.addCorporateAction(_actionType, _data);

        if (corporateActionId_ == bytes32(0)) {
            revert DuplicatedCorporateAction(_actionType, _data);
        }
        emit CorporateActionAdded(msg.sender, _actionType, corporateActionId_, corporateActionIdByType_, _data);
    }

    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view override returns (bytes32 actionType_, uint256 actionTypeId_, bytes memory data_) {
        (actionType_, actionTypeId_, data_) = LibCorporateActions.getCorporateAction(_corporateActionId);
    }

    function getCorporateActionCount() external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = LibCorporateActions.getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = LibCorporateActions.getCorporateActionIds(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = LibCorporateActions.getCorporateActionCountByType(_actionType);
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = LibCorporateActions.getCorporateActionIdsByType(_actionType, _pageIndex, _pageLength);
    }

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool) {
        return LibCorporateActions.actionContentHashExists(_contentHash);
    }
}
