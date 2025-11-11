// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ICorporateActions
} from '../interfaces/corporateActions/ICorporateActions.sol';
import {Common} from '../common/Common.sol';
import {_CORPORATE_ACTION_ROLE} from '../constants/roles.sol';

abstract contract CorporateActions is ICorporateActions, Common {
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        (corporateActionId_, corporateActionIndexByType_) = _addCorporateAction(
            _actionType,
            _data
        );

        if (corporateActionId_ == bytes32(0)) {
            revert DuplicatedCorporateAction(_actionType, _data);
        }
        emit CorporateActionAdded(
            _msgSender(),
            _actionType,
            corporateActionId_,
            corporateActionIndexByType_,
            _data
        );
    }

    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view override returns (bytes32 actionType_, uint256 actionTypeIndex_, bytes memory data_) {
        (actionType_, actionTypeIndex_, data_) = _getCorporateAction(_corporateActionId);
    }

    function getCorporateActionCount()
        external
        view
        override
        returns (uint256 corporateActionCount_)
    {
        corporateActionCount_ = _getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = _getCorporateActionIds(_pageIndex, _pageLength);
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
        corporateActionIds_ = _getCorporateActionIdsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }
}
