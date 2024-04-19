pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {LibCommon} from '../common/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    IControlListStorageWrapper
} from '../interfaces/controlList/IControlListStorageWrapper.sol';
import {LocalContext} from '../context/LocalContext.sol';
import {
    _CONTROL_LIST_STORAGE_POSITION
} from '../constants/storagePositions.sol';

abstract contract ControlListStorageWrapper is
    IControlListStorageWrapper,
    LocalContext
{
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct ControlListStorage {
        // true : control list is whitelist.
        // false : control list is blacklist.
        bool isWhiteList;
        // true : isWhiteList was set.
        // false : isWhiteList was not set.
        bool initialized;
        EnumerableSet.AddressSet list;
    }

    // modifiers
    modifier checkControlList(address account) {
        if (!_checkControlList(account)) {
            revert AccountIsBlocked(account);
        }
        _;
    }

    // Internal
    function _addToControlList(
        address _account
    ) internal virtual returns (bool success_) {
        success_ = _controlListStorage().list.add(_account);
    }

    function _removeFromControlList(
        address _account
    ) internal virtual returns (bool success_) {
        success_ = _controlListStorage().list.remove(_account);
    }

    function _getControlListType() internal view virtual returns (bool) {
        return _controlListStorage().isWhiteList;
    }

    function _getControlListCount()
        internal
        view
        virtual
        returns (uint256 controlListCount_)
    {
        controlListCount_ = _controlListStorage().list.length();
    }

    function _getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_) {
        return _controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }

    function _isInControlList(
        address _account
    ) internal view virtual returns (bool) {
        return _controlListStorage().list.contains(_account);
    }

    function _checkControlList(
        address account
    ) internal view virtual returns (bool) {
        return _getControlListType() == _isInControlList(account);
    }

    function _controlListStorage()
        internal
        pure
        virtual
        returns (ControlListStorage storage controlList_)
    {
        bytes32 position = _CONTROL_LIST_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }
}
