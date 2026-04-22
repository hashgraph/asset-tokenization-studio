// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _PROCEED_RECIPIENTS_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { IProceedRecipients } from "../../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { ExternalListManagementStorageWrapper } from "../core/ExternalListManagementStorageWrapper.sol";

/**
 * @notice Storage structure for mapping proceed recipient addresses to associated data
 * @param proceedRecipientData Mapping from address to arbitrary data associated with the recipient
 */
struct ProceedRecipientsDataStorage {
    mapping(address => bytes) proceedRecipientData;
}

/**
 * @title Proceed Recipients Storage Wrapper
 * @notice Provides structured access and management of proceed recipients within persistent storage
 * @dev Manages both the list of proceed recipients and their associated data via dedicated storage slots.
 *      Integrates with ExternalListManagementStorageWrapper for list operations and uses inline assembly
 *      for direct slot-based storage access.
 * @author Primitive Finance
 */
library ProceedRecipientsStorageWrapper {
    /**
     * @notice Initialises the proceed recipients list and their data mappings
     * @dev Iterates through the input arrays, validating each address, adding it to the external list,
     *      and setting its associated data. Marks the list as initialised upon completion.
     * @param _proceedRecipients Array of addresses to initialise as proceed recipients
     * @param _data Array of data corresponding to each proceed recipient
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_proceedRecipients[index]);
            ExternalListManagementStorageWrapper.addExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipients[index]
            );
            setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }
        ExternalListManagementStorageWrapper.setExternalListInitialized(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    /**
     * @notice Adds a new proceed recipient and associates data with it
     * @dev Delegates list addition to ExternalListManagementStorageWrapper and stores the provided data.
     * @param _proceedRecipient Address of the new proceed recipient
     * @param _data Data to associate with the proceed recipient
     */
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListManagementStorageWrapper.addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    /**
     * @notice Removes an existing proceed recipient and deletes its associated data
     * @dev Delegates list removal to ExternalListManagementStorageWrapper and clears stored data.
     * @param _proceedRecipient Address of the proceed recipient to remove
     */
    function removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListManagementStorageWrapper.removeExternalList(
            _PROCEED_RECIPIENTS_STORAGE_POSITION,
            _proceedRecipient
        );
        removeProceedRecipientData(_proceedRecipient);
    }

    /**
     * @notice Sets or updates data associated with a proceed recipient
     * @dev Directly writes the data to the storage mapping.
     * @param _proceedRecipient Address of the proceed recipient
     * @param _data Data to store
     */
    function setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    /**
     * @notice Deletes data associated with a proceed recipient
     * @dev Clears the data entry in the storage mapping for the given address.
     * @param _proceedRecipient Address of the proceed recipient whose data is to be removed
     */
    function removeProceedRecipientData(address _proceedRecipient) internal {
        delete proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    /**
     * @notice Ensures that a given address is registered as a proceed recipient
     * @dev Reverts with ProceedRecipientNotFound if the address is not found in the list.
     * @param _proceedRecipient Address to check
     */
    function requireProceedRecipient(address _proceedRecipient) internal view {
        if (!isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
    }

    /**
     * @notice Ensures that a given address is not already registered as a proceed recipient
     * @dev Reverts with ProceedRecipientAlreadyExists if the address is found in the list.
     * @param _proceedRecipient Address to check
     */
    function requireNotProceedRecipient(address _proceedRecipient) internal view {
        if (isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
    }

    /**
     * @notice Retrieves data associated with a specific proceed recipient
     * @dev Accesses data directly from the storage mapping.
     * @param _proceedRecipient Address of the proceed recipient
     * @return Data associated with the proceed recipient
     */
    function getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    /**
     * @notice Checks if an address is registered as a proceed recipient
     * @dev Delegates the check to ExternalListManagementStorageWrapper.
     * @param _proceedRecipient Address to check
     * @return True if the address is a proceed recipient, false otherwise
     */
    function isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipient
            );
    }

    /**
     * @notice Gets the total count of registered proceed recipients
     * @dev Delegates the count retrieval to ExternalListManagementStorageWrapper.
     * @return Total number of proceed recipients
     */
    function getProceedRecipientsCount() internal view returns (uint256) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    /**
     * @notice Retrieves a paginated list of proceed recipients
     * @dev Delegates pagination logic to ExternalListManagementStorageWrapper.
     * @param _pageIndex Index of the page to retrieve
     * @param _pageLength Maximum number of items per page
     * @return proceedRecipients_ The paginated list of proceed recipient addresses.
     */
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory proceedRecipients_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }

    /**
     * @notice Loads the storage reference for proceed recipient data
     * @dev Uses inline assembly to load the storage at a predetermined slot.
     * @return proceedRecipientsDataStorage_ The storage pointer to the proceed recipients data.
     */
    function proceedRecipientsDataStorage()
        private
        pure
        returns (ProceedRecipientsDataStorage storage proceedRecipientsDataStorage_)
    {
        bytes32 position = _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            proceedRecipientsDataStorage_.slot := position
        }
    }
}
