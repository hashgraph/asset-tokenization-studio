pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IControlList} from '../interfaces/controlList/IControlList.sol';
import {Common} from '../common/Common.sol';
import {_CONTROL_LIST_ROLE} from '../constants/roles.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_CONTROL_LIST_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract ControlList is IControlList, IStaticFunctionSelectors, Common {
    // TODO: UNPAUSED
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(
        bool _isWhiteList
    )
        external
        virtual
        override
        onlyUninitialized(_controlListStorage().initialized)
        returns (bool success_)
    {
        ControlListStorage storage controlListStorage = _controlListStorage();
        controlListStorage.isWhiteList = _isWhiteList;
        controlListStorage.initialized = true;
        success_ = true;
    }

    function addToControlList(
        address _account
    )
        external
        virtual
        override
        onlyRole(_CONTROL_LIST_ROLE)
        onlyUnpaused
        returns (bool success_)
    {
        success_ = _addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(_msgSender(), _account);
    }

    function removeFromControlList(
        address _account
    )
        external
        virtual
        override
        onlyRole(_CONTROL_LIST_ROLE)
        onlyUnpaused
        returns (bool success_)
    {
        success_ = _removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(_msgSender(), _account);
    }

    function getControlListType()
        external
        view
        virtual
        override
        returns (bool)
    {
        return _getControlListType();
    }

    function isInControlList(
        address _account
    ) external view virtual override returns (bool) {
        return _isInControlList(_account);
    }

    function getControlListCount()
        external
        view
        virtual
        override
        returns (uint256 controlListCount_)
    {
        controlListCount_ = _getControlListCount();
    }

    // returns the list of members from _start (included) to _end (not included)
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory members_) {
        members_ = _getControlListMembers(_pageIndex, _pageLength);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _CONTROL_LIST_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_ControlList
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .addToControlList
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .removeFromControlList
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isInControlList
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getControlListType
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getControlListCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getControlListMembers
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
        staticInterfaceIds_[selectorsIndex++] = type(IControlList).interfaceId;
    }
}
