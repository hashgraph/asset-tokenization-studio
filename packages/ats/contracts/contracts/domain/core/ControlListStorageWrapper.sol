// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { _CONTROL_LIST_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/**
 * @notice Persistent storage layout for the control list mechanism.
 * @dev Stored at a deterministic Diamond Storage slot. The `isWhiteList` flag governs
 *      whether listed accounts are permitted (whitelist) or denied (blacklist).
 *      `initialized` must be `true` before any access-control check is performed.
 * @param isWhiteList  True when the list operates in whitelist mode; false for blacklist mode.
 * @param initialized  Guards against uninitialised access; set to `true` on first initialisation.
 * @param list         Enumerable set of addresses subject to the active control policy.
 */
struct ControlListStorage {
    bool isWhiteList;
    bool initialized;
    EnumerableSet.AddressSet list;
}

/**
 * @title  ControlListStorageWrapper
 * @notice Internal library for managing a whitelist or blacklist of addresses using
 *         Diamond Storage, providing membership checks, list mutations, and access guards.
 * @dev    Implements the ERC-2535 Diamond Storage Pattern by anchoring `ControlListStorage`
 *         at `_CONTROL_LIST_STORAGE_POSITION`. All functions are `internal`, making this
 *         library suitable for use exclusively within facets or other internal libraries.
 *
 *         Access evaluation combines the local control list with an external authorisation
 *         check delegated to `ExternalListManagementStorageWrapper`. Both conditions must
 *         be satisfied for an account to be considered accessible.
 *
 *         Callers are responsible for invoking `initializeControlList` exactly once before
 *         any read or write operation; the `initialized` flag is not enforced on-chain but
 *         is exposed via `isControlListInitialized` for defensive checks.
 * @author Hashgraph
 */
library ControlListStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // solhint-disable-next-line ordering

    /**
     * @notice Initialises the control list and sets its operating mode.
     * @dev    Must be called once during facet initialisation. Calling this a second time
     *         will overwrite the `isWhiteList` flag and re-set `initialized`, which may
     *         silently alter access-control semantics for all listed accounts. Callers
     *         should enforce single-initialisation at the facet level.
     * @param _isWhiteList True to operate in whitelist mode; false for blacklist mode.
     */
    function initializeControlList(bool _isWhiteList) internal {
        ControlListStorage storage cls = controlListStorage();
        cls.isWhiteList = _isWhiteList;
        cls.initialized = true;
    }

    /**
     * @notice Adds an account to the control list.
     * @dev    Delegates to `EnumerableSet.add`; returns `false` without reverting if the
     *         account is already present. Does not emit an event; callers are responsible
     *         for emitting any relevant log entries.
     * @param _account Address to add to the control list.
     * @return success_ True if the account was newly added; false if already present.
     */
    function addToControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.add(_account);
    }

    /**
     * @notice Removes an account from the control list.
     * @dev    Delegates to `EnumerableSet.remove`; returns `false` without reverting if the
     *         account is not present. Does not emit an event; callers are responsible for
     *         emitting any relevant log entries.
     * @param _account Address to remove from the control list.
     * @return success_ True if the account was removed; false if it was not present.
     */
    function removeFromControlList(address _account) internal returns (bool success_) {
        success_ = controlListStorage().list.remove(_account);
    }

    /**
     * @notice Returns whether the control list has been initialised.
     * @dev    Reads the `initialized` flag directly from Diamond Storage. A `false` return
     *         indicates that `initializeControlList` has not yet been called, and any
     *         access-control evaluation would be based on uninitialised state.
     * @return True if `initializeControlList` has been called at least once; false otherwise.
     */
    function isControlListInitialized() internal view returns (bool) {
        return controlListStorage().initialized;
    }

    /**
     * @notice Reverts if the given account does not satisfy the active access-control policy.
     * @dev    Evaluates access via `isAbleToAccess`, which combines local list membership
     *         with the external authorisation check. Reverts with
     *         `ICommonErrors.AccountIsBlocked` if access is denied. Use this as a guard at
     *         the start of sensitive operations.
     * @param _account Address whose access eligibility is to be verified.
     */
    function checkControlList(address _account) internal view {
        if (!isAbleToAccess(_account)) {
            revert ICommonErrors.AccountIsBlocked(_account);
        }
    }

    /**
     * @notice Returns whether the given account is present in the control list.
     * @dev    Performs a direct membership query on the underlying `EnumerableSet` without
     *         considering the list type (whitelist or blacklist) or external authorisation.
     *         For a full access eligibility check, use `isAbleToAccess` instead.
     * @param _account Address to query.
     * @return True if the address is a member of the control list; false otherwise.
     */
    function isInControlList(address _account) internal view returns (bool) {
        return controlListStorage().list.contains(_account);
    }

    /**
     * @notice Returns whether the given account is permitted access under the current policy.
     * @dev    Access is granted when two independent conditions are both satisfied:
     *           1. List membership matches the operating mode — the account must be present
     *              in a whitelist, or absent from a blacklist.
     *           2. The account is externally authorised per
     *              `ExternalListManagementStorageWrapper.isExternallyAuthorized`.
     *         If the external authorisation module is not configured, this function may
     *         return `false` for all accounts regardless of list membership.
     * @param _account Address to evaluate.
     * @return True if the account satisfies both the local list policy and external
     *         authorisation; false otherwise.
     */
    function isAbleToAccess(address _account) internal view returns (bool) {
        ControlListStorage storage cls = controlListStorage();
        return (cls.isWhiteList == cls.list.contains(_account) &&
            ExternalListManagementStorageWrapper.isExternallyAuthorized(_account));
    }

    /**
     * @notice Returns the operating mode of the control list.
     * @dev    The return value governs how list membership is interpreted by `isAbleToAccess`:
     *         `true` means listed accounts are permitted; `false` means they are denied.
     * @return True if the list is operating in whitelist mode; false for blacklist mode.
     */
    function getControlListType() internal view returns (bool) {
        return controlListStorage().isWhiteList;
    }

    /**
     * @notice Returns the total number of accounts currently in the control list.
     * @dev    Reads the length of the underlying `EnumerableSet`. Gas cost scales linearly
     *         with set size only for iteration; this call is O(1).
     * @return controlListCount_ The number of addresses currently held in the control list.
     */
    function getControlListCount() internal view returns (uint256 controlListCount_) {
        controlListCount_ = controlListStorage().list.length();
    }

    /**
     * @notice Returns a paginated slice of addresses from the control list.
     * @dev    Delegates pagination to the `Pagination` library extension on
     *         `EnumerableSet.AddressSet`. Callers must supply valid page parameters;
     *         out-of-bounds indices may return a partial or empty array depending on the
     *         `Pagination` implementation. Enumeration order is not guaranteed to be stable
     *         across list mutations.
     * @param _pageIndex  Zero-based index of the page to retrieve.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_   Array of addresses for the requested page.
     */
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = controlListStorage().list.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ControlListStorage`.
     * @dev    Uses inline assembly to position the storage struct at the deterministic slot
     *         defined by `_CONTROL_LIST_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. This prevents storage collisions across facets sharing the
     *         same proxy. Must only be called from within this library.
     * @return controlList_ Storage pointer to the `ControlListStorage` struct.
     */
    function controlListStorage() private pure returns (ControlListStorage storage controlList_) {
        bytes32 position = _CONTROL_LIST_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            controlList_.slot := position
        }
    }
}
