// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IControlList
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing the on-chain control list of a security token. The control list
 *         operates in one of two modes set at initialisation: whitelist (only listed addresses may
 *         transfer) or blacklist (listed addresses are blocked from transferring).
 * @dev Part of the Diamond facet system. Control list state is stored at
 *      `_CONTROL_LIST_STORAGE_POSITION` via `ControlListStorageWrapper`. `CONTROL_LIST_ROLE` is
 *      required for all state-mutating functions after initialisation. Note that
 *      `isInControlList` reflects raw set membership only; effective access is determined by
 *      `ControlListStorageWrapper.isAbleToAccess`, which combines the membership result with the
 *      `isWhiteList` flag and external control list authorisation.
 */
interface IControlList {
    /**
     * @notice Emitted when an account is added to the control list.
     * @param operator Address of the caller who performed the addition.
     * @param account Address of the account that was added.
     */
    event AddedToControlList(address indexed operator, address indexed account);

    /**
     * @notice Emitted when an account is removed from the control list.
     * @param operator Address of the caller who performed the removal.
     * @param account Address of the account that was removed.
     */
    event RemovedFromControlList(address indexed operator, address indexed account);

    /**
     * @notice Thrown when attempting to add an address that is already present in the control
     *         list.
     * @param account The duplicate address.
     */
    error ListedAccount(address account);

    /**
     * @notice Thrown when attempting to remove an address that is not present in the control
     *         list.
     * @param account The address that was not found.
     */
    error UnlistedAccount(address account);

    /**
     * @notice One-time initialiser that sets the control list operating mode.
     * @dev Can only be called once; subsequent calls revert via `onlyNotControlListInitialized`.
     *      The leading-underscore naming convention signals this is an initialiser function.
     * @param _isWhiteList `true` to operate as a whitelist (only listed addresses allowed),
     *        `false` to operate as a blacklist (listed addresses blocked).
     */
    // solhint-disable-next-line func-name-mixedcase
    function initializeControlList(bool _isWhiteList) external;

    /**
     * @notice Adds an address to the control list.
     * @dev Requires `CONTROL_LIST_ROLE` and the token to be unpaused. Reverts with
     *      `ListedAccount` if the address is already present. Emits `AddedToControlList`.
     * @param _account The address to add.
     * @return success_ True if the address was successfully added.
     */
    function addToControlList(address _account) external returns (bool success_);

    /**
     * @notice Removes an address from the control list.
     * @dev Requires `CONTROL_LIST_ROLE` and the token to be unpaused. Reverts with
     *      `UnlistedAccount` if the address is not present. Emits `RemovedFromControlList`.
     * @param _account The address to remove.
     * @return success_ True if the address was successfully removed.
     */
    function removeFromControlList(address _account) external returns (bool success_);

    /**
     * @notice Checks whether an address is present in the control list set.
     * @dev Returns raw set membership regardless of the whitelist/blacklist mode. An address in
     *      the set is allowed in whitelist mode and blocked in blacklist mode.
     * @param _account The address to query.
     * @return True if `_account` is in the control list set, false otherwise.
     */
    function isInControlList(address _account) external view returns (bool);

    /**
     * @notice Returns the operating mode of the control list.
     * @return True if the control list is a whitelist, false if it is a blacklist.
     */
    function getControlListType() external view returns (bool);

    /**
     * @notice Returns the total number of addresses currently in the control list.
     * @return controlListCount_ The number of entries in the control list.
     */
    function getControlListCount() external view returns (uint256 controlListCount_);

    /**
     * @notice Returns a paginated slice of the addresses in the control list.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the list length.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of control list member addresses for the requested page.
     */
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
