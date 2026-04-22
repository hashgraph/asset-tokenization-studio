// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalControlList } from "../../facets/layer_1/externalControlList/IExternalControlList.sol";
import { IExternalKycList } from "../../facets/layer_1/externalKycList/IExternalKycList.sol";
import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import {
    _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
    _KYC_MANAGEMENT_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_STORAGE_POSITION,
    _PAUSE_MANAGEMENT_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { IExternalPause } from "../../facets/layer_1/externalPause/IExternalPause.sol";

/**
 * @notice Data structure for managing external lists
 * @param initialized Flag indicating whether the list has been initialised
 * @param list Enumerable set containing addresses of external contracts
 */
struct ExternalListDataStorage {
    bool initialized;
    EnumerableSet.AddressSet list;
}

/**
 * @title External List Management Storage Wrapper
 * @notice Provides utility functions for managing external lists in storage
 * @dev Handles operations such as adding, removing and checking membership of external lists
 * @author Tokeny Solutions
 */
library ExternalListManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Updates multiple external lists based on provided arrays
     * @dev Adds or removes addresses from the list depending on their corresponding active status
     * @param _position The storage position identifier for the specific list
     * @param _lists Array of external list addresses to update
     * @param _actives Boolean array indicating whether each corresponding list should be active
     * @return success_ True if all updates were processed successfully
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
     * @notice Adds an external list to the specified storage position
     * @dev Uses OpenZeppelin's EnumerableSet to manage uniqueness and ordering
     * @param _position The storage position identifier for the list
     * @param _list Address of the external list to add
     * @return success_ True if the list was added successfully
     */
    function addExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.add(_list);
    }

    /**
     * @notice Removes an external list from the specified storage position
     * @dev Uses OpenZeppelin's EnumerableSet to manage removal
     * @param _position The storage position identifier for the list
     * @param _list Address of the external list to remove
     * @return success_ True if the list was removed successfully
     */
    function removeExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.remove(_list);
    }

    /**
     * @notice Sets the initialisation flag for an external list at the given position
     * @dev Marks the external list as having been initialised
     * @param _position The storage position identifier for the list
     */
    function setExternalListInitialized(bytes32 _position) internal {
        externalListStorage(_position).initialized = true;
    }

    /**
     * @notice Initialises external control lists with provided addresses
     * @dev Adds each provided address to the control list and marks it as initialised
     * @param _controlLists Array of addresses representing external control lists
     */
    function initializeExternalControlLists(address[] calldata _controlLists) internal {
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_controlLists[index]);
            addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
        setExternalListInitialized(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    /**
     * @notice Initialises external KYC lists with provided addresses
     * @dev Adds each provided address to the KYC list and marks it as initialised
     * @param _kycLists Array of addresses representing external KYC lists
     */
    function initializeExternalKycLists(address[] calldata _kycLists) internal {
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_kycLists[index]);
            addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
        setExternalListInitialized(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    /**
     * @notice Checks if an address exists in the external list at the given position
     * @dev Queries the enumerable set for membership
     * @param _position The storage position identifier for the list
     * @param _list Address to check for existence
     * @return True if the address exists in the list
     */
    function isExternalList(bytes32 _position, address _list) internal view returns (bool) {
        return externalListStorage(_position).list.contains(_list);
    }

    /**
     * @notice Gets the number of members in the external list at the given position
     * @dev Returns the length of the enumerable set
     * @param _position The storage position identifier for the list
     * @return count_ Number of members in the list
     */
    function getExternalListsCount(bytes32 _position) internal view returns (uint256 count_) {
        count_ = externalListStorage(_position).list.length();
    }

    /**
     * @notice Retrieves a paginated subset of members from the external list
     * @dev Uses pagination utilities to fetch a slice of the enumerable set
     * @param _position The storage position identifier for the list
     * @param _pageIndex Index of the page to retrieve (starting from 0)
     * @param _pageLength Maximum number of items per page
     * @return members_ Array of addresses representing the requested page
     */
    function getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = externalListStorage(_position).list.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Checks if an account is authorised across all external control lists
     * @dev Iterates through registered external control lists to verify authorisation status
     * @param _account Address of the account to check
     * @return True if the account is authorised by all external control lists
     */
    function isExternallyAuthorized(address _account) internal view returns (bool) {
        ExternalListDataStorage storage externalControlListStorage = externalListStorage(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (!IExternalControlList(externalControlListStorage.list.at(index)).isAuthorized(_account)) return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    /**
     * @notice Checks if the external control list has been initialised
     * @dev Reads initialisation flag from external list storage
     * @return True if external control list is initialised
     */
    function isExternalControlListInitialized() internal view returns (bool) {
        return externalListStorage(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    /**
     * @notice Checks if an account has the required KYC status across all external KYC lists
     * @dev Iterates through registered external KYC lists to verify KYC status
     * @param _account Address of the account to check
     * @param _kycStatus Expected KYC status for the account
     * @return True if the account has the specified KYC status in all external lists
     */
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION);
        uint256 length = getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
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
     * @notice Checks if any external pause contract is active
     * @dev Iterates through registered external pause contracts to determine overall pause status
     * @return True if any external pause is active
     */
    function isExternallyPaused() internal view returns (bool) {
        ExternalListDataStorage storage externalPauseDataStorage = externalListStorage(
            _PAUSE_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (IExternalPause(externalPauseDataStorage.list.at(index)).isPaused()) return true;
            unchecked {
                ++index;
            }
        }
        return false;
    }

    /**
     * @notice Checks if external pause list has been initialised
     * @dev Reads initialisation flag from external list storage
     * @return True if external pause list is initialised
     */
    function isExternalPauseInitialized() internal view returns (bool) {
        return externalListStorage(_PAUSE_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    /**
     * @notice Checks if proceed recipients list has been initialised
     * @dev Reads initialisation flag from external list storage
     * @return True if proceed recipients list is initialised
     */
    function isProceedRecipientsInitialized() internal view returns (bool) {
        return externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION).initialized;
    }

    /**
     * @notice Checks if external KYC list has been initialised
     * @dev Reads initialisation flag from external list storage
     * @return True if external KYC list is initialised
     */
    function isKycExternalInitialized() internal view returns (bool) {
        return externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    /**
     * @notice Validates that an address is not zero
     * @dev Reverts if the address is zero
     * @param _addr Address to validate
     */
    function checkValidAddress(address _addr) internal pure {
        AddressValidation.checkZeroAddress(_addr);
    }

    /**
     * @notice Retrieves the external list storage at a given position
     * @dev Accesses storage using inline assembly with the provided position
     * @param _position The storage position identifier for the list
     * @return externalList_ Reference to the ExternalListDataStorage struct
     */
    function externalListStorage(
        bytes32 _position
    ) private pure returns (ExternalListDataStorage storage externalList_) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            externalList_.slot := _position
        }
    }
}
