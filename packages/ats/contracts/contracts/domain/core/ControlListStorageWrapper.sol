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

/**
 * @title ControlListStorageWrapper
 * @dev Library providing control list storage operations with Diamond Storage Pattern
 *
 * This library uses ERC-2535 Diamond Storage Pattern to store control list data in a specific storage slot.
 * It provides storage operations, read functions, and guard checks for whitelist/blacklist access control.
 *
 * @notice Call these library functions to manage control list
 * @author Asset Tokenization Studio Team
 */
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

    // --- Initialization ---

    // solhint-disable-next-line ordering
    function initializeControlList(bool _isWhiteList) internal {
        ControlListStorage storage cls = controlListStorage();
        cls.isWhiteList = _isWhiteList;
        cls.initialized = true;
    }

    function isControlListInitialized() internal view returns (bool) {
        return controlListStorage().initialized;
    }

    // --- Guard functions ---

    function checkControlList(address _account) internal view {
        if (!isAbleToAccess(_account)) {
            revert IControlListStorageWrapper.AccountIsBlocked(_account);
        }
    }

    // solhint-disable-next-line ordering
    function _checkControlList(address _account) internal view {
        if (!isAbleToAccess(_account)) {
            revert IControlListStorageWrapper.AccountIsBlocked(_account);
        }
    }

    // --- Control list operations ---

    function addToControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.add(_account);
    }

    function removeFromControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.remove(_account);
    }

    // solhint-disable-next-line ordering
    function isInControlList(address _account) internal view returns (bool) {
        return controlListStorage().list.contains(_account);
    }

    // ✅ Internal function - ERC1594StorageWrapper calls this directly
    function isAbleToAccess(address _account) internal view returns (bool) {
        ControlListStorage storage cls = controlListStorage();
        return (cls.isWhiteList == cls.list.contains(_account) &&
            ExternalListManagementStorageWrapper.isExternallyAuthorized(_account));
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
        members_ = controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }
}
