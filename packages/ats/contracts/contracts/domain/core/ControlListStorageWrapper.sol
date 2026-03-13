// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IControlListStorageWrapper } from "./controlList/IControlListStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { _CONTROL_LIST_STORAGE_POSITION } from "../../constants/storagePositions.sol";

struct ControlListStorage {
    bool isWhiteList;
    bool initialized;
    EnumerableSet.AddressSet list;
}

library ControlListStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    function _controlListStorage() internal pure returns (ControlListStorage storage controlList_) {
        bytes32 position = _CONTROL_LIST_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }

    // --- Guard functions ---

    function _requireListedAllowed(address _account) internal view {
        if (!_isAbleToAccess(_account)) {
            revert IControlListStorageWrapper.AccountIsBlocked(_account);
        }
    }

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ControlList(bool _isWhiteList) internal {
        ControlListStorage storage cls = _controlListStorage();
        cls.isWhiteList = _isWhiteList;
        cls.initialized = true;
    }

    // --- State-changing functions ---

    function _addToControlList(address _account) internal returns (bool success_) {
        success_ = _controlListStorage().list.add(_account);
    }

    function _removeFromControlList(address _account) internal returns (bool success_) {
        success_ = _controlListStorage().list.remove(_account);
    }

    // --- Read functions ---

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
        return (_getControlListType() == _isInControlList(_account) &&
            ExternalListManagementStorageWrapper._isExternallyAuthorized(_account));
    }

    function _isControlListInitialized() internal view returns (bool) {
        return _controlListStorage().initialized;
    }
}
