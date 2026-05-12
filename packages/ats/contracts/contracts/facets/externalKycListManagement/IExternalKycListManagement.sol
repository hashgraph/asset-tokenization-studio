// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../layer_1/kyc/IKyc.sol";

/**
 * @title IExternalKycListManagement
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing external KYC list contracts on a security token. External KYC
 *         lists are trusted third-party contracts consulted during KYC verification: an account's
 *         KYC status is considered externally valid only when every listed provider confirms the
 *         requested status.
 * @dev Part of the Diamond facet system. `KYC_MANAGER_ROLE` is required for all state-mutating
 *      functions after initialisation. The external KYC list and its initialisation flag are
 *      stored in diamond storage at `_KYC_MANAGEMENT_STORAGE_POSITION` via
 *      `ExternalListManagementStorageWrapper`.
 */
interface IExternalKycListManagement {
    /**
     * @notice Emitted when multiple external KYC list addresses are added or removed in a single
     *         batch.
     * @param operator Address of the caller who performed the update.
     * @param kycLists Array of external KYC list contract addresses that were processed.
     * @param actives Corresponding activation flags; `true` means added, `false` means removed.
     */
    event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives);

    /**
     * @notice Emitted when an external KYC list contract is added to the list.
     * @param operator Address of the caller who performed the addition.
     * @param kycList Address of the external KYC list contract that was added.
     */
    event AddedToExternalKycLists(address indexed operator, address kycList);

    /**
     * @notice Emitted when an external KYC list contract is removed from the list.
     * @param operator Address of the caller who performed the removal.
     * @param kycList Address of the external KYC list contract that was removed.
     */
    event RemovedFromExternalKycLists(address indexed operator, address kycList);

    /**
     * @notice Thrown when attempting to add an address already present in the external KYC list.
     * @param kycList The duplicate external KYC list contract address.
     */
    error ListedKycList(address kycList);

    /**
     * @notice Thrown when attempting to remove an address not present in the external KYC list.
     * @param kycList The unlisted external KYC list contract address.
     */
    error UnlistedKycList(address kycList);

    /**
     * @notice Thrown when a batch update of external KYC lists fails to complete.
     * @param kycList Array of external KYC list contract addresses that were submitted.
     * @param actives Corresponding activation flags that were submitted.
     */
    error ExternalKycListsNotUpdated(address[] kycList, bool[] actives);

    /**
     * @notice One-time initialiser that populates the external KYC list at token deployment.
     * @dev Can only be called once; subsequent calls revert via `onlyNotKycExternalInitialized`.
     *      The leading-underscore naming convention signals this is an initialiser function.
     * @param _kycLists Initial array of external KYC list contract addresses to register.
     */
    function initializeExternalKycLists(address[] calldata _kycLists) external;

    /**
     * @notice Adds or removes multiple external KYC list contracts in a single transaction.
     * @dev Requires `KYC_MANAGER_ROLE` and the token to be unpaused. Both arrays must have the
     *      same length and contain no duplicate addresses, validated by
     *      `ArrayValidation.checkUniqueValues`. Reverts with `ExternalKycListsNotUpdated` on
     *      failure. Emits `ExternalKycListsUpdated`.
     * @param _kycLists Array of external KYC list contract addresses to process.
     * @param _actives Corresponding flags; `true` adds the address to the list, `false` removes it.
     * @return success_ True if the batch update completed successfully.
     */
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds an external KYC list contract to the list.
     * @dev Requires `KYC_MANAGER_ROLE`, the token to be unpaused, and a non-zero address.
     *      Reverts with `ListedKycList` if the address is already listed. Emits
     *      `AddedToExternalKycLists`.
     * @param _kycList Address of the external KYC list contract to add.
     * @return success_ True if the contract was added successfully.
     */
    function addExternalKycList(address _kycList) external returns (bool success_);

    /**
     * @notice Removes an external KYC list contract from the list.
     * @dev Requires `KYC_MANAGER_ROLE` and the token to be unpaused. Reverts with
     *      `UnlistedKycList` if the address is not listed. Emits `RemovedFromExternalKycLists`.
     * @param _kycList Address of the external KYC list contract to remove.
     * @return success_ True if the contract was removed successfully.
     */
    function removeExternalKycList(address _kycList) external returns (bool success_);

    /**
     * @notice Checks whether an address is present in the external KYC list.
     * @param _kycList Address to check.
     * @return True if the address is a listed external KYC list contract, false otherwise.
     */
    function isExternalKycList(address _kycList) external view returns (bool);

    /**
     * @notice Checks whether an account holds the requested KYC status across all listed external
     *         KYC list contracts.
     * @dev Iterates every listed external KYC provider and calls `getKycStatus`. Returns `true`
     *      only when all providers confirm the exact `_kycStatus` for `_account` (AND semantics
     *      across providers). Returns `true` when no providers are listed.
     * @param _account Address of the account whose KYC status is being evaluated.
     * @param _kycStatus The `IKyc.KycStatus` value that every provider must confirm.
     * @return True if all listed providers confirm `_kycStatus` for `_account`, false otherwise.
     */
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view returns (bool);

    /**
     * @notice Returns the total number of external KYC list contracts in the list.
     * @return externalKycListsCount_ The current number of listed external KYC list contracts.
     */
    function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_);

    /**
     * @notice Returns a paginated slice of the external KYC list contract list.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the list length.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of external KYC list contract addresses for the requested page.
     */
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
