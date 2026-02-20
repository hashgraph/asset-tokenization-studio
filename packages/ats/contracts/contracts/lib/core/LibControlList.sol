// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ControlListStorage,
    ExternalListDataStorage,
    controlListStorage,
    externalListStorage
} from "../../storage/CoreStorage.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { IExternalControlList } from "../../facets/features/interfaces/IExternalControlList.sol";
import { IControlListBase } from "../../facets/features/interfaces/controlList/IControlListBase.sol";

/// @title LibControlList — Control list (whitelist/blacklist) library
/// @notice Centralized control list functionality extracted from ControlListStorageWrapper.sol
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibControlList {
    using EnumerableSet for EnumerableSet.AddressSet;
    using LibPagination for EnumerableSet.AddressSet;

    function initializeControlList(bool isWhiteList) internal {
        ControlListStorage storage cls = controlListStorage();
        cls.isWhiteList = isWhiteList;
        cls.initialized = true;
    }

    function addToControlList(address account) internal returns (bool) {
        return controlListStorage().list.add(account);
    }

    function removeFromControlList(address account) internal returns (bool) {
        return controlListStorage().list.remove(account);
    }

    function getControlListType() internal view returns (bool) {
        return controlListStorage().isWhiteList;
    }

    function getControlListCount() internal view returns (uint256) {
        return controlListStorage().list.length();
    }

    function getControlListMembers(uint256 pageIndex, uint256 pageLength) internal view returns (address[] memory) {
        return controlListStorage().list.getFromSet(pageIndex, pageLength);
    }

    function isInControlList(address account) internal view returns (bool) {
        return controlListStorage().list.contains(account);
    }

    function isAbleToAccess(address account) internal view returns (bool) {
        return (getControlListType() == isInControlList(account) && isExternallyAuthorized(account));
    }

    function requireListedAllowed(address account) internal view {
        if (!isAbleToAccess(account)) {
            revert IControlListBase.AccountIsBlocked(account);
        }
    }

    function isControlListInitialized() internal view returns (bool) {
        return controlListStorage().initialized;
    }

    function isExternallyAuthorized(address account) internal view returns (bool) {
        ExternalListDataStorage storage externalControlListStorage = externalListStorage(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = externalControlListStorage.list.length();

        for (uint256 index; index < length; ) {
            if (!IExternalControlList(externalControlListStorage.list.at(index)).isAuthorized(account)) {
                return false;
            }
            unchecked {
                ++index;
            }
        }
        return true;
    }
}
