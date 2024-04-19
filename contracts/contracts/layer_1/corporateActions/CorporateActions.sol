pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ICorporateActions
} from '../interfaces/corporateActions/ICorporateActions.sol';
import {Common} from '../common/Common.sol';
import {_CORPORATE_ACTION_ROLE} from '../constants/roles.sol';
import {_CORPORATE_ACTIONS_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {
    CorporateActionsStorageWrapper
} from './CorporateActionsStorageWrapper.sol';

contract CorporateActions is
    ICorporateActions,
    IStaticFunctionSelectors,
    CorporateActionsStorageWrapper,
    Common
{
    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        (
            success_,
            corporateActionId_,
            corporateActionIndexByType_
        ) = _addCorporateAction(_actionType, _data);

        if (!success_) {
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
    )
        external
        view
        virtual
        override
        returns (bytes32 actionType_, bytes memory data_)
    {
        (actionType_, data_) = _getCorporateAction(_corporateActionId);
    }

    function getCorporateActionCount()
        external
        view
        virtual
        override
        returns (uint256 corporateActionCount_)
    {
        corporateActionCount_ = _getCorporateActionCount();
    }

    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        virtual
        override
        returns (bytes32[] memory corporateActionIds_)
    {
        corporateActionIds_ = _getCorporateActionIds(_pageIndex, _pageLength);
    }

    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view virtual override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = _getCorporateActionCountByType(_actionType);
    }

    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        virtual
        override
        returns (bytes32[] memory corporateActionIds_)
    {
        corporateActionIds_ = _getCorporateActionIdsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _CORPORATE_ACTIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this
            .addCorporateAction
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCorporateAction
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCorporateActionCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCorporateActionIds
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCorporateActionCountByType
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getCorporateActionIdsByType
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICorporateActions)
            .interfaceId;
    }
}
