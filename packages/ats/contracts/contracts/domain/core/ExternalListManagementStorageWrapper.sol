// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalControlList } from "../../facets/layer_1/externalControlList/IExternalControlList.sol";
import { IExternalKycList } from "../../facets/layer_1/externalKycList/IExternalKycList.sol";
import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";

/// @custom:hash storage ControlListManagement
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT = 0x8d3f81a63425a80ad14eecea6638e8ea6f5d633c24e2865dd2228e2b62dc9100;

/// @custom:hash storage KycManagement
bytes32 constant STORAGE_LOCATION_KYC_MANAGEMENT = 0x44eb866201f22832539d72320900218d04c7d97cfb8ebacf9a6d65c395e5e700;

/**
 * @notice Generic external-list layout reused across four ERC-7201 namespaces.
 * @dev The `externalListStorage(bytes32 _position)` accessor instantiates this struct at
 *      FOUR independent ERC-7201 namespaces, one per consumer:
 *        - erc7201:security.token.standard.storage.ControlListManagement
 *        - erc7201:security.token.standard.storage.KycManagement
 *        - erc7201:security.token.standard.storage.PauseManagement
 *          (STORAGE_LOCATION_PAUSE_MANAGEMENT in PauseStorageWrapper.sol)
 *        - erc7201:security.token.standard.storage.ProceedRecipients
 *          (STORAGE_LOCATION_PROCEED_RECIPIENTS in ProceedRecipientsStorageWrapper.sol)
 *      No single `@custom:storage-location` annotation is present because one line cannot
 *      capture the four-slot reuse and would mislead tooling into binding the struct to a
 *      single namespace; each slot is defined by its `STORAGE_LOCATION_*` constant instead.
 */
struct ExternalListDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    EnumerableSet.AddressSet list;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ExternalListManagementStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal library that manages the shared external-list storage struct reused across
 *         the control-list, KYC, pause and proceed-recipients namespaces.
 * @dev Each consumer passes its own `STORAGE_LOCATION_*` constant to the accessor; the same
 *      struct layout is materialised at four independent ERC-7201 slots so consumers never share
 *      state. All entry points are `internal` and intended for consumption by the corresponding
 *      facets and storage wrappers.
 */
library ExternalListManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Bulk-adds or removes external-list entries under `_position` based on parallel
     *         arrays of addresses and activation flags.
     * @dev Assumes `_lists` and `_actives` have equal length; the caller must enforce this. Each
     *      add/remove is idempotent: setting `true` is a no-op when the entry already exists, and
     *      setting `false` is a no-op when it does not. Gas scales linearly with `_lists.length`.
     * @param _position ERC-7201 slot selecting which external list to mutate.
     * @param _lists Addresses to add or remove.
     * @param _actives Parallel activation flags; `true` adds, `false` removes.
     * @return success_ Always `true`; preserves the facet's API contract.
     */
    function updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal returns (bool success_) {
        uint256 length = _lists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_lists[index]);
            if (_actives[index]) {
                if (!isExternalList(_position, _lists[index])) {
                    addExternalList(_position, _lists[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (isExternalList(_position, _lists[index])) {
                removeExternalList(_position, _lists[index]);
            }
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    /**
     * @notice Adds `_list` to the external-list set selected by `_position`.
     * @param _position ERC-7201 slot selecting which external list to mutate.
     * @param _list Address to add.
     * @return success_ True when the entry was newly inserted; false when it was already present.
     */
    function addExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.add(_list);
    }

    /**
     * @notice Removes `_list` from the external-list set selected by `_position`.
     * @param _position ERC-7201 slot selecting which external list to mutate.
     * @param _list Address to remove.
     * @return success_ True when the entry was removed; false when it was not present.
     */
    function removeExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.remove(_list);
    }

    /**
     * @notice Initialises the external control-list namespace with `_controlLists` and marks it
     *         initialised.
     * @dev Each entry is validated for non-zero before insertion. Gas scales with
     *      `_controlLists.length`.
     * @param _controlLists External `IExternalControlList` contracts to register.
     */
    function initializeExternalControlLists(address[] calldata _controlLists) internal {
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_controlLists[index]);
            addExternalList(STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Initialises the external KYC-list namespace with `_kycLists` and marks it initialised.
     * @dev Each entry is validated for non-zero before insertion. Gas scales with `_kycLists.length`.
     * @param _kycLists External `IExternalKycList` contracts to register.
     */
    function initializeExternalKycLists(address[] calldata _kycLists) internal {
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_kycLists[index]);
            addExternalList(STORAGE_LOCATION_KYC_MANAGEMENT, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Reports whether `_list` is registered at the external-list namespace `_position`.
     * @param _position ERC-7201 slot selecting which external list to query.
     * @param _list Address being checked.
     * @return True when `_list` is a member of the set at `_position`.
     */
    function isExternalList(bytes32 _position, address _list) internal view returns (bool) {
        return externalListStorage(_position).list.contains(_list);
    }

    /**
     * @notice Returns the number of registered entries at the external-list namespace `_position`.
     * @param _position ERC-7201 slot selecting which external list to query.
     * @return count_ Number of registered entries.
     */
    function getExternalListsCount(bytes32 _position) internal view returns (uint256 count_) {
        count_ = externalListStorage(_position).list.length();
    }

    /**
     * @notice Returns a paginated slice of the external-list members at `_position`.
     * @dev Uses the `Pagination` library on the `EnumerableSet`.
     * @param _position ERC-7201 slot selecting which external list to query.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of entries in the page.
     * @return members_ Page slice of registered addresses.
     */
    function getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = externalListStorage(_position).list.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Reports whether `_account` is authorised by every registered external control list.
     * @dev Iterates all registered `IExternalControlList` entries and returns false on the first
     *      that rejects `_account`. An empty list trivially returns true. Gas is bounded by the
     *      number of registered control lists.
     * @param _account Address being checked.
     * @return True when every registered control list authorises `_account`.
     */
    function isExternallyAuthorized(address _account) internal view returns (bool) {
        ExternalListDataStorage storage externalControlListStorage = externalListStorage(
            STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT
        );
        uint256 length = getExternalListsCount(STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT);
        for (uint256 index; index < length; ) {
            if (!IExternalControlList(externalControlListStorage.list.at(index)).isAuthorized(_account)) return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    /**
     * @notice Reports whether every registered external KYC list reports `_kycStatus` for `_account`.
     * @dev Returns false on the first registered list whose stored status differs from
     *      `_kycStatus`. An empty list trivially returns true. Gas is bounded by the number of
     *      registered KYC lists.
     * @param _account Address being checked.
     * @param _kycStatus Required KYC status.
     * @return True when every registered KYC list reports `_kycStatus` for `_account`.
     */
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = externalListStorage(STORAGE_LOCATION_KYC_MANAGEMENT);
        uint256 length = getExternalListsCount(STORAGE_LOCATION_KYC_MANAGEMENT);
        for (uint256 index; index < length; ) {
            if (IExternalKycList(externalKycListStorage.list.at(index)).getKycStatus(_account) != _kycStatus)
                return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    /**
     * @notice Reverts when `_addr` equals the zero address.
     * @dev Delegates to `DefaultValueValidation.checkZeroAddress`; used to guard insertions.
     * @param _addr Address being validated.
     */
    function checkValidAddress(address _addr) internal pure {
        DefaultValueValidation.checkZeroAddress(_addr);
    }

    /**
     * @notice Returns the storage pointer for the external-list namespace at `_position`.
     * @dev Resolves the supplied ERC-7201 slot via inline assembly, allowing the same struct
     *      layout to be materialised under multiple independent namespaces.
     * @param _position ERC-7201 slot to resolve.
     * @return externalList_ Storage reference to the `ExternalListDataStorage` struct at `_position`.
     */
    function externalListStorage(
        bytes32 _position
    ) internal pure returns (ExternalListDataStorage storage externalList_) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            externalList_.slot := _position
        }
    }
}
