// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IControlListStorageWrapper } from "../../../layer_1/interfaces/controlList/IControlListStorageWrapper.sol";
import { _CONTROL_LIST_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    ExternalControlListManagementStorageWrapper
} from "../externalControlLists/ExternalControlListManagementStorageWrapper.sol";

abstract contract ControlListStorageWrapper is IControlListStorageWrapper, ExternalControlListManagementStorageWrapper {
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
    modifier onlyListedAllowed(address _account) {
        _checkControlList(_account);
        _;
    }

    // Internal
    function _addToControlList(address _account) internal returns (bool success_) {
        success_ = _controlListStorage().list.add(_account);
    }

    function _removeFromControlList(address _account) internal returns (bool success_) {
        success_ = _controlListStorage().list.remove(_account);
    }

    function _getControlListType() internal view returns (bool) {
        return _controlListStorage().isWhiteList;
    }

    function _getControlListCount() internal view returns (uint256 controlListCount_) {
        controlListCount_ = _controlListStorage().list.length();
    }

    function _getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return _controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }

    function _isInControlList(address _account) internal view returns (bool) {
        return _controlListStorage().list.contains(_account);
    }

    function _isAbleToAccess(address _account) internal view returns (bool) {
        return (_getControlListType() == _isInControlList(_account) && _isExternallyAuthorized(_account));
    }

    function _checkControlList(address _account) internal view {
        if (!_isAbleToAccess(_account)) {
            revert AccountIsBlocked(_account);
        }
    }

    function _controlListStorage() internal pure returns (ControlListStorage storage controlList_) {
        bytes32 position = _CONTROL_LIST_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }
}
