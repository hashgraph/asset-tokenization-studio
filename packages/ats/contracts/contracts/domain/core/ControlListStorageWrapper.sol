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

    function controlListStorage() internal pure returns (ControlListStorage storage controlList_) {
        bytes32 position = _CONTROL_LIST_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }

    // --- Guard functions ---

    function requireListedAllowed(address _account) internal view {
        if (!isAbleToAccess(_account)) {
            revert IControlListStorageWrapper.AccountIsBlocked(_account);
        }
    }

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(bool _isWhiteList) internal {
        ControlListStorage storage cls = controlListStorage();
        cls.isWhiteList = _isWhiteList;
        cls.initialized = true;
    }

    // --- State-changing functions ---

    function addToControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.add(_account);
    }

    function removeFromControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.remove(_account);
    }

    // --- Read functions ---

    function getControlListType() internal view returns (bool) {
        return controlListStorage().isWhiteList;
    }

    function getControlListCount() internal view returns (uint256 controlListCount_) {
        controlListCount_ = controlListStorage().list.length();
    }

    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }

    function isInControlList(address _account) internal view returns (bool) {
        return controlListStorage().list.contains(_account);
    }

    function isAbleToAccess(address _account) internal view returns (bool) {
        return (getControlListType() == isInControlList(_account) &&
            ExternalListManagementStorageWrapper.isExternallyAuthorized(_account));
    }

    function isControlListInitialized() internal view returns (bool) {
        return controlListStorage().initialized;
    }
}
