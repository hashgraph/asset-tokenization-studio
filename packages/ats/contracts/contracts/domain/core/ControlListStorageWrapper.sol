// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/// @custom:hash storage ControlList
bytes32 constant STORAGE_LOCATION_CONTROL_LIST = 0x880786188890a6f111c4f0814d49de0f01f1a156bdbd97eda824d3baaabba900;

/**
 * @notice Control list data stored at an ERC-7201 namespace slot.
 * @dev Tracks an enumerable set of addresses and a control-list type flag
 *      (whitelist or blacklist) with initialisation guard.
 * @custom:storage-location erc7201:security.token.standard.storage.ControlList
 */
struct ControlListStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool isWhiteList;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    EnumerableSet.AddressSet list;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ControlListStorageWrapper
 * @notice Library for managing control list storage operations.
 * @dev Provides structured access to ControlListStorage at a dedicated storage
 *      slot, supporting whitelist/blacklist access control with enumerable address
 *      sets.
 * @author Asset Tokenization Studio Team
 */
library ControlListStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Initialises the control list as whitelist or blacklist mode.
     * @dev Sets the control list type and marks the system initialised. Must be
     *      guarded by an `onlyNotControlListInitialized` modifier in the calling
     *      facet.
     * @param _isWhiteList True for whitelist mode; false for blacklist mode.
     */
    function initializeControlList(bool _isWhiteList) internal {
        controlListStorage().isWhiteList = _isWhiteList;
    }

    /**
     * @notice Adds an address to the control list.
     * @dev Delegates to `EnumerableSet.add`, which returns false if the address
     *      already exists.
     * @param _account The address to add.
     * @return success_ True if the address was newly added; false if already
     *         present.
     */
    function addToControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.add(_account);
    }

    /**
     * @notice Removes an address from the control list.
     * @dev Delegates to `EnumerableSet.remove`, which returns false if the address
     *      does not exist.
     * @param _account The address to remove.
     * @return success_ True if the address was removed; false if it was not
     *         present.
     */
    function removeFromControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.remove(_account);
    }

    /**
     * @notice Validates that an account is able to access based on control list
     *         membership and external-list authorisation.
     * @dev Reverts with `ICommonErrors.AccountIsBlocked` if the account is
     *      blocked by the control list policy.
     * @param _account The address to check.
     */
    function checkControlList(address _account) internal view {
        if (!canAccess(_account)) {
            revert ICommonErrors.AccountIsBlocked(_account);
        }
    }

    /**
     * @notice Checks whether an address is a member of the control list.
     * @dev Returns true regardless of control-list type (whitelist or blacklist);
     *      use `isAbleToAccess` to evaluate the full access policy.
     * @param _account The address to check.
     * @return True if the address is in the control list; false otherwise.
     */
    function isInControlList(address _account) internal view returns (bool) {
        return controlListStorage().list.contains(_account);
    }

    /**
     * @notice Evaluates whether an account is able to access based on control
     *         list membership and external-list authorisation.
     * @dev Returns true if the account's control-list membership state matches the
     *      control-list type (whitelist/blacklist) AND the account is authorised
     *      by the external-list system. In whitelist mode, only listed accounts
     *      can access; in blacklist mode, unlisted accounts can access.
     * @param _account The address being evaluated.
     * @return True if the account is able to access; false otherwise.
     */
    // ✅ Internal function - ERC1594StorageWrapper calls this directly
    function canAccess(address _account) internal view returns (bool) {
        ControlListStorage storage cls = controlListStorage();
        return (cls.isWhiteList == cls.list.contains(_account) &&
            ExternalListManagementStorageWrapper.isExternallyAuthorized(_account));
    }

    /**
     * @notice Returns the control list type.
     * @dev Returns true if whitelist mode; false if blacklist mode.
     * @return True for whitelist; false for blacklist.
     */
    function getControlListType() internal view returns (bool) {
        return controlListStorage().isWhiteList;
    }

    /**
     * @notice Returns the number of addresses in the control list.
     * @dev Queries the enumerable set's length.
     * @return controlListCount_ The count of addresses in the control list.
     */
    function getControlListCount() internal view returns (uint256 controlListCount_) {
        controlListCount_ = controlListStorage().list.length();
    }

    /**
     * @notice Returns a paginated slice of the control list members.
     * @dev Delegates to `EnumerableSet.getFromSet` via the Pagination library.
     * @param _pageIndex Zero-indexed page to retrieve.
     * @param _pageLength Number of addresses per page.
     * @return members_ Array of control-list members on the requested page.
     */
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Loads the control list storage struct from its ERC-7201 namespace
     *         slot.
     * @dev Uses inline assembly to set the storage slot for the returned reference,
     *      allowing access to the control list data at its designated storage
     *      location.
     * @return controlList_ A storage reference to `ControlListStorage` at the
     *         ERC-7201 slot.
     */
    function controlListStorage() private pure returns (ControlListStorage storage controlList_) {
        bytes32 position = STORAGE_LOCATION_CONTROL_LIST;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }
}
