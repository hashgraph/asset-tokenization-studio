// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IExternalPauseManagement
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing external pause contracts on a security token. External pauses are
 *         trusted third-party contracts whose pause state propagates to the token: the token is
 *         considered paused when its own pause flag is set, or when any listed external pause
 *         contract returns `true` from its `isPaused()` call.
 * @dev Part of the Diamond facet system. `PAUSE_MANAGER_ROLE` is required for all state-mutating
 *      functions after initialisation. The external pause list and its initialisation flag are
 *      stored in diamond storage at `_PAUSE_MANAGEMENT_STORAGE_POSITION` via
 *      `ExternalListManagementStorageWrapper`.
 */
interface IExternalPauseManagement {
    /**
     * @notice Emitted when multiple external pause addresses are added or removed in a single
     *         batch.
     * @param operator Address of the caller who performed the update.
     * @param pauses Array of external pause contract addresses that were processed.
     * @param actives Corresponding activation flags; `true` means added, `false` means removed.
     */
    event ExternalPausesUpdated(address indexed operator, address[] pauses, bool[] actives);

    /**
     * @notice Emitted when an external pause contract is added to the list.
     * @param operator Address of the caller who performed the addition.
     * @param pause Address of the external pause contract that was added.
     */
    event AddedToExternalPauses(address indexed operator, address pause);

    /**
     * @notice Emitted when an external pause contract is removed from the list.
     * @param operator Address of the caller who performed the removal.
     * @param pause Address of the external pause contract that was removed.
     */
    event RemovedFromExternalPauses(address indexed operator, address pause);

    /**
     * @notice Thrown when attempting to add an address already present in the external pause list.
     * @param pause The duplicate external pause contract address.
     */
    error ListedPause(address pause);

    /**
     * @notice Thrown when attempting to remove an address not present in the external pause list.
     * @param pause The unlisted external pause contract address.
     */
    error UnlistedPause(address pause);

    /**
     * @notice Thrown when a batch update of external pauses fails to complete.
     * @param pauses Array of external pause contract addresses that were submitted.
     * @param actives Corresponding activation flags that were submitted.
     */
    error ExternalPausesNotUpdated(address[] pauses, bool[] actives);

    /**
     * @notice One-time initialiser that populates the external pause list at token deployment.
     * @dev Can only be called once; subsequent calls revert via `onlyNotExternalPauseInitialized`.
     *      The leading-underscore naming convention signals this is an initialiser function.
     * @param _pauses Initial array of external pause contract addresses to register.
     */
    function initializeExternalPauses(address[] calldata _pauses) external;

    /**
     * @notice Adds or removes multiple external pause contracts in a single transaction.
     * @dev Requires `PAUSE_MANAGER_ROLE` and the token to be unpaused. Both arrays must have the
     *      same length and contain no duplicate addresses, validated by
     *      `ArrayValidation.checkUniqueValues`. Emits `ExternalPausesUpdated`.
     * @param _pauses Array of external pause contract addresses to process.
     * @param _actives Corresponding flags; `true` adds the address to the list, `false` removes it.
     * @return success_ True if the batch update completed successfully.
     */
    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds an external pause contract to the list.
     * @dev Requires `PAUSE_MANAGER_ROLE`, the token to be unpaused, and a non-zero address.
     *      Reverts with `ListedPause` if the address is already listed. Emits
     *      `AddedToExternalPauses`.
     * @param _pause Address of the external pause contract to add.
     * @return success_ True if the contract was added successfully.
     */
    function addExternalPause(address _pause) external returns (bool success_);

    /**
     * @notice Removes an external pause contract from the list.
     * @dev Requires `PAUSE_MANAGER_ROLE` and the token to be unpaused. Reverts with `UnlistedPause`
     *      if the address is not listed. Emits `RemovedFromExternalPauses`.
     * @param _pause Address of the external pause contract to remove.
     * @return success_ True if the contract was removed successfully.
     */
    function removeExternalPause(address _pause) external returns (bool success_);

    /**
     * @notice Checks whether an address is present in the external pause list.
     * @param _pause Address to check.
     * @return True if the address is a listed external pause contract, false otherwise.
     */
    function isExternalPause(address _pause) external view returns (bool);

    /**
     * @notice Returns the total number of external pause contracts in the list.
     * @return externalPausesCount_ The current number of listed external pause contracts.
     */
    function getExternalPausesCount() external view returns (uint256 externalPausesCount_);

    /**
     * @notice Returns a paginated slice of the external pause contract list.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the list length.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of external pause contract addresses for the requested page.
     */
    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
