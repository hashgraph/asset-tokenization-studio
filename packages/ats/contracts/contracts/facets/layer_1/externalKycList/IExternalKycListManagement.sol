// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../kyc/IKyc.sol";

/**
 * @title IExternalKYC List Management Interface
 * @notice Interface for managing external KYC lists that grant on-chain identity verification status.
 * @dev External KYC lists are third-party contracts implementing `IExternalKycList`. This interface
 *      exposes operations to register, activate, deactivate, and query those contracts.
 * @author io.builders
 */
interface IExternalKycListManagement {
    /**
     * @notice Emitted when the active status of one or more external KYC lists is updated.
     * @param operator The address that performed the update.
     * @param kycLists The addresses of the KYC lists whose status changed.
     * @param actives  The new active status for each corresponding list.
     */
    event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives);

    /**
     * @notice Emitted when a new external KYC list is registered.
     * @param operator The address that performed the addition.
     * @param kycList  The address of the newly registered KYC list.
     */
    event AddedToExternalKycLists(address indexed operator, address kycList);

    /**
     * @notice Emitted when an existing external KYC list is deregistered.
     * @param operator The address that performed the removal.
     * @param kycList  The address of the removed KYC list.
     */
    event RemovedFromExternalKycLists(address indexed operator, address kycList);

    /**
     * @notice Thrown when attempting to register a KYC list address that is already listed.
     * @param kycList The address that is already registered.
     */
    error ListedKycList(address kycList);

    /**
     * @notice Thrown when attempting to remove a KYC list address that is not registered.
     * @param kycList The address that is not registered.
     */
    error UnlistedKycList(address kycList);

    /**
     * @notice Thrown when a batch status update of external KYC lists fails.
     * @param kycList The addresses that were submitted for update.
     * @param actives The active flags that were submitted.
     */
    error ExternalKycListsNotUpdated(address[] kycList, bool[] actives);

    /**
     * @notice Initialises the external KYC lists with an initial set of addresses.
     * @dev Can only be called once. Reverts if already initialised.
     * @param _kycLists The initial array of external KYC list addresses.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) external;

    /**
     * @notice Updates the active status of one or more external KYC lists.
     * @param _kycLists The addresses of the external KYC lists to update.
     * @param _actives  Whether each corresponding list should be active.
     * @return success_ True if the update succeeded.
     */
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Registers a new external KYC list.
     * @param _kycList The address of the external KYC list to add.
     * @return success_ True if the registration succeeded.
     */
    function addExternalKycList(address _kycList) external returns (bool success_);

    /**
     * @notice Deregisters an existing external KYC list.
     * @param _kycList The address of the external KYC list to remove.
     * @return success_ True if the removal succeeded.
     */
    function removeExternalKycList(address _kycList) external returns (bool success_);

    /**
     * @notice Returns whether an address is registered as an external KYC list.
     * @param _kycList The address to check.
     * @return True if `_kycList` is a registered external KYC list; false otherwise.
     */
    function isExternalKycList(address _kycList) external view returns (bool);

    /**
     * @notice Returns whether an account holds the specified KYC status across all active
     *         external KYC lists.
     * @param _account   The address whose KYC status is queried.
     * @param _kycStatus The KYC status level to check for.
     * @return True if `_account` holds `_kycStatus` in at least one active external KYC list.
     */
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view returns (bool);

    /**
     * @notice Returns the total number of registered external KYC lists.
     * @return externalKycListsCount_ The count of registered external KYC lists.
     */
    function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_);

    /**
     * @notice Returns a paginated slice of the registered external KYC list addresses.
     * @param _pageIndex  The zero-based page index to retrieve.
     * @param _pageLength The maximum number of entries per page.
     * @return members_ The addresses of the external KYC lists on the requested page.
     */
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
