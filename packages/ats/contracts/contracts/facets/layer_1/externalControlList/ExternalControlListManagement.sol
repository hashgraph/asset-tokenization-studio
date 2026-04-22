// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "./IExternalControlListManagement.sol";
import { _CONTROL_LIST_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title External Control List Management
 * @notice Manages external control lists for access control purposes
 * @dev Provides functionality to initialise, update, add, remove, and query external control lists.
 *      Integrates with role-based access control and utilises storage wrappers for state management.
 * @author io.builders
 */
abstract contract ExternalControlListManagement is IExternalControlListManagement, Modifiers {
    /**
     * @notice Initialises the external control lists
     * @dev Can only be called once and requires the caller to not have initialised external control lists already
     * @param _controlLists The array of addresses representing initial control lists
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(
        address[] calldata _controlLists
    ) external override onlyNotExternalControlListInitialized {
        ExternalListManagementStorageWrapper.initializeExternalControlLists(_controlLists);
    }

    /**
     * @notice Updates the active status of external control lists
     * @dev Requires the contract to be unpaused and the caller to have the control list manager role.
     * Validates uniqueness of input arrays before updating.
     * Emits an ExternalControlListsUpdated event upon success.
     * Reverts with ExternalControlListsNotUpdated error if update fails.
     * @param _controlLists The array of control list addresses to update
     * @param _actives The array indicating whether each control list is active
     * @return success_ Boolean indicating if the operation was successful
     */
    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_controlLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlLists,
            _actives
        );
        if (!success_) {
            revert ExternalControlListsNotUpdated(_controlLists, _actives);
        }
        emit ExternalControlListsUpdated(EvmAccessors.getMsgSender(), _controlLists, _actives);
    }

    /**
     * @notice Adds a new external control list
     * @dev Requires the contract to be unpaused, caller to have the control list manager role,
     * and the provided address to be valid (non-zero).
     * Reverts with ListedControlList error if addition fails.
     * Emits an AddedToExternalControlLists event upon success.
     * @param _controlList The address of the control list to add
     * @return success_ Boolean indicating if the operation was successful
     */
    function addExternalControlList(
        address _controlList
    )
        external
        override
        onlyUnpaused
        onlyRole(_CONTROL_LIST_MANAGER_ROLE)
        onlyValidAddress(_controlList)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.addExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlList
        );
        if (!success_) {
            revert ListedControlList(_controlList);
        }
        emit AddedToExternalControlLists(EvmAccessors.getMsgSender(), _controlList);
    }

    /**
     * @notice Removes an existing external control list
     * @dev Requires the contract to be unpaused and the caller to have the control list manager role.
     * Reverts with UnlistedControlList error if removal fails.
     * Emits a RemovedFromExternalControlLists event upon success.
     * @param _controlList The address of the control list to remove
     * @return success_ Boolean indicating if the operation was successful
     */
    function removeExternalControlList(
        address _controlList
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlList
        );
        if (!success_) {
            revert UnlistedControlList(_controlList);
        }
        emit RemovedFromExternalControlLists(EvmAccessors.getMsgSender(), _controlList);
    }

    /**
     * @notice Checks if an address is registered as an external control list
     * @dev Queries the storage wrapper to determine if the given address is an external control list
     * @param _controlList The address to check
     * @return Boolean indicating if the address is an external control list
     */
    function isExternalControlList(address _controlList) external view override returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _controlList
            );
    }

    /**
     * @notice Gets the count of registered external control lists
     * @dev Retrieves the total number of external control lists from storage
     * @return externalControlListsCount_ The number of registered external control lists
     */
    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    /**
     * @notice Gets a paginated list of external control list members
     * @dev Returns a slice of the external control lists based on page index and length
     * @param _pageIndex The zero-based index of the page to retrieve
     * @param _pageLength The maximum number of items per page
     * @return members_ An array of addresses representing the requested page of control lists
     */
    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
