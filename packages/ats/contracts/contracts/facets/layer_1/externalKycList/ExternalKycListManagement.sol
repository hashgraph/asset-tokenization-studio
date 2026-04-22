// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "./IExternalKycListManagement.sol";
import { _KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title External KYC List Management
 * @notice Manages external KYC lists used to grant or revoke on-chain KYC status.
 * @dev Provides initialisation, update, add, remove, and query operations for external KYC lists.
 *      Integrates with `ExternalListManagementStorageWrapper` for state management and uses
 *      role-based access control via `Modifiers`.
 * @author io.builders
 */
abstract contract ExternalKycListManagement is IExternalKycListManagement, Modifiers {
    // solhint-disable func-name-mixedcase
    /**
     * @notice Initialises the external KYC lists with an initial set of addresses.
     * @dev Can only be called once; reverts if the KYC external lists have already been
     *      initialised (enforced by `onlyNotKycExternalInitialized`).
     * @param _kycLists The array of external KYC list addresses to initialise.
     */
    function initialize_ExternalKycLists(address[] calldata _kycLists) external override onlyNotKycExternalInitialized {
        ExternalListManagementStorageWrapper.initializeExternalKycLists(_kycLists);
    }
    // solhint-enable func-name-mixedcase

    /**
     * @notice Updates the active status of one or more external KYC lists.
     * @dev Requires the contract to be unpaused and the caller to hold `_KYC_MANAGER_ROLE`.
     *      Validates that `_kycLists` contains no duplicate addresses before updating.
     *      Reverts with `ExternalKycListsNotUpdated` if the storage operation fails.
     *      Emits `ExternalKycListsUpdated` on success.
     * @param _kycLists The addresses of the external KYC lists to update.
     * @param _actives  Whether each corresponding list should be active.
     * @return success_ True if the update succeeded.
     */
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external override onlyUnpaused onlyRole(_KYC_MANAGER_ROLE) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_kycLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _KYC_MANAGEMENT_STORAGE_POSITION,
            _kycLists,
            _actives
        );
        if (!success_) {
            revert ExternalKycListsNotUpdated(_kycLists, _actives);
        }
        emit ExternalKycListsUpdated(EvmAccessors.getMsgSender(), _kycLists, _actives);
    }

    /**
     * @notice Adds a new external KYC list.
     * @dev Requires the contract to be unpaused, the caller to hold `_KYC_MANAGER_ROLE`,
     *      and `_kycLists` to be a non-zero address (enforced by `onlyValidAddress`).
     *      Reverts with `ListedKycList` if the address is already registered.
     *      Emits `AddedToExternalKycLists` on success.
     * @param _kycLists The address of the external KYC list to add.
     * @return success_ True if the addition succeeded.
     */
    function addExternalKycList(
        address _kycLists
    ) external override onlyUnpaused onlyRole(_KYC_MANAGER_ROLE) onlyValidAddress(_kycLists) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /**
     * @notice Removes an existing external KYC list.
     * @dev Requires the contract to be unpaused and the caller to hold `_KYC_MANAGER_ROLE`.
     *      Reverts with `UnlistedKycList` if the address is not currently registered.
     *      Emits `RemovedFromExternalKycLists` on success.
     * @param _kycLists The address of the external KYC list to remove.
     * @return success_ True if the removal succeeded.
     */
    function removeExternalKycList(
        address _kycLists
    ) external override onlyUnpaused onlyRole(_KYC_MANAGER_ROLE) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /**
     * @notice Returns whether an address is registered as an external KYC list.
     * @param _kycList The address to check.
     * @return True if `_kycList` is a registered external KYC list; false otherwise.
     */
    function isExternalKycList(address _kycList) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycList);
    }

    /**
     * @notice Returns whether an account has been externally granted a specific KYC status.
     * @dev Queries all active external KYC lists via the storage wrapper to determine
     *      whether any of them grant `_kycStatus` to `_account`.
     * @param _account   The address whose KYC status is queried.
     * @param _kycStatus The KYC status level to check for.
     * @return True if `_account` holds `_kycStatus` in at least one active external KYC list.
     */
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    /**
     * @notice Returns the total number of registered external KYC lists.
     * @return externalKycListsCount_ The count of registered external KYC lists.
     */
    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    /**
     * @notice Returns a paginated slice of the registered external KYC list addresses.
     * @param _pageIndex  The zero-based page index to retrieve.
     * @param _pageLength The maximum number of entries per page.
     * @return members_ The addresses of the external KYC lists on the requested page.
     */
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _KYC_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
