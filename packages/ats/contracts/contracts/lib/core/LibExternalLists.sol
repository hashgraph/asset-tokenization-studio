// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { externalListStorage } from "../../storage/ExternalListStorageAccessor.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";

/// @title LibExternalLists — Generic external list management library
/// @notice Centralized external list management (handles add/remove/query for any external list)
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibExternalLists {
    using EnumerableSet for EnumerableSet.AddressSet;
    using LibPagination for EnumerableSet.AddressSet;

    error ZeroAddressNotAllowed();

    function updateExternalLists(
        bytes32 position,
        address[] calldata lists,
        bool[] calldata actives
    ) internal returns (bool) {
        uint256 length = lists.length;
        for (uint256 index; index < length; ) {
            requireValidAddress(lists[index]);
            if (actives[index]) {
                if (!isExternalList(position, lists[index])) {
                    addExternalList(position, lists[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (isExternalList(position, lists[index])) {
                removeExternalList(position, lists[index]);
            }
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function addExternalList(bytes32 position, address list) internal returns (bool) {
        return externalListStorage(position).list.add(list);
    }

    function removeExternalList(bytes32 position, address list) internal returns (bool) {
        return externalListStorage(position).list.remove(list);
    }

    function setExternalListInitialized(bytes32 position) internal {
        externalListStorage(position).initialized = true;
    }

    function isExternalList(bytes32 position, address list) internal view returns (bool) {
        return externalListStorage(position).list.contains(list);
    }

    function getExternalListsCount(bytes32 position) internal view returns (uint256) {
        return externalListStorage(position).list.length();
    }

    function getExternalListsMembers(
        bytes32 position,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory) {
        return externalListStorage(position).list.getFromSet(pageIndex, pageLength);
    }

    function getExternalListAt(bytes32 position, uint256 index) internal view returns (address) {
        return externalListStorage(position).list.at(index);
    }

    function requireValidAddress(address addr) internal pure {
        if (addr == address(0)) revert ZeroAddressNotAllowed();
    }
}
