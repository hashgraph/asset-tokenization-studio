// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IExternalControlListManagement
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing external control list contracts on a security token. External
 *         control lists are trusted third-party contracts that implement `IExternalControlList`
 *         and are consulted during transfer authorisation checks.
 * @dev Part of the Diamond facet system. `CONTROL_LIST_MANAGER_ROLE` is required for all
 *      state-mutating functions after initialisation. The external control list and its
 *      initialisation flag are stored in diamond storage at
 *      `_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION` via `ExternalListManagementStorageWrapper`.
 */
interface IExternalControlListManagement {
    /**
     * @notice Emitted when multiple external control list addresses are added or removed in a
     *         single batch.
     * @param operator Address of the caller who performed the update.
     * @param controlLists Array of external control list contract addresses that were processed.
     * @param actives Corresponding activation flags; `true` means added, `false` means removed.
     */
    event ExternalControlListsUpdated(address indexed operator, address[] controlLists, bool[] actives);

    /**
     * @notice Emitted when an external control list contract is added to the list.
     * @param operator Address of the caller who performed the addition.
     * @param controlList Address of the external control list contract that was added.
     */
    event AddedToExternalControlLists(address indexed operator, address controlList);

    /**
     * @notice Emitted when an external control list contract is removed from the list.
     * @param operator Address of the caller who performed the removal.
     * @param controlList Address of the external control list contract that was removed.
     */
    event RemovedFromExternalControlLists(address indexed operator, address controlList);

    /**
     * @notice Thrown when attempting to add an address already present in the external control
     *         list.
     * @param controlList The duplicate external control list contract address.
     */
    error ListedControlList(address controlList);

    /**
     * @notice Thrown when attempting to remove an address not present in the external control
     *         list.
     * @param controlList The unlisted external control list contract address.
     */
    error UnlistedControlList(address controlList);

    /**
     * @notice Thrown when a batch update of external control lists fails to complete.
     * @param controlLista Array of external control list contract addresses that were submitted.
     * @param actives Corresponding activation flags that were submitted.
     */
    error ExternalControlListsNotUpdated(address[] controlLista, bool[] actives);

    /**
     * @notice One-time initialiser that populates the external control list at token deployment.
     * @dev Can only be called once; subsequent calls revert via
     *      `onlyNotExternalControlListInitialized`. The leading-underscore naming convention
     *      signals this is an initialiser function.
     * @param _controlLists Initial array of external control list contract addresses to register.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(address[] calldata _controlLists) external;

    /**
     * @notice Adds or removes multiple external control list contracts in a single transaction.
     * @dev Requires `CONTROL_LIST_MANAGER_ROLE` and the token to be unpaused. Both arrays must
     *      have the same length and contain no duplicate addresses, validated by
     *      `ArrayValidation.checkUniqueValues`. Reverts with `ExternalControlListsNotUpdated` on
     *      failure. Emits `ExternalControlListsUpdated`.
     * @param _controlLists Array of external control list contract addresses to process.
     * @param _actives Corresponding flags; `true` adds the address to the list, `false` removes
     *        it.
     * @return success_ True if the batch update completed successfully.
     */
    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds an external control list contract to the list.
     * @dev Requires `CONTROL_LIST_MANAGER_ROLE`, the token to be unpaused, and a non-zero
     *      address. Reverts with `ListedControlList` if the address is already listed. Emits
     *      `AddedToExternalControlLists`.
     * @param _controlList Address of the external control list contract to add.
     * @return success_ True if the contract was added successfully.
     */
    function addExternalControlList(address _controlList) external returns (bool success_);

    /**
     * @notice Removes an external control list contract from the list.
     * @dev Requires `CONTROL_LIST_MANAGER_ROLE` and the token to be unpaused. Reverts with
     *      `UnlistedControlList` if the address is not listed. Emits
     *      `RemovedFromExternalControlLists`.
     * @param _controlList Address of the external control list contract to remove.
     * @return success_ True if the contract was removed successfully.
     */
    function removeExternalControlList(address _controlList) external returns (bool success_);

    /**
     * @notice Checks whether an address is present in the external control list.
     * @param _controlList Address to check.
     * @return True if the address is a listed external control list contract, false otherwise.
     */
    function isExternalControlList(address _controlList) external view returns (bool);

    /**
     * @notice Returns the total number of external control list contracts in the list.
     * @return externalControlListsCount_ The current number of listed external control list
     *         contracts.
     */
    function getExternalControlListsCount() external view returns (uint256 externalControlListsCount_);

    /**
     * @notice Returns a paginated slice of the external control list contract list.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the list length.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of external control list contract addresses for the requested page.
     */
    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
