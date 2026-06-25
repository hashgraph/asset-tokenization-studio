// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "../../facets/proceedRecipients/IProceedRecipients.sol";
import { ExternalListManagementStorageWrapper } from "../core/ExternalListManagementStorageWrapper.sol";
import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";

/// @custom:hash storage ProceedRecipients
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_PROCEED_RECIPIENTS = 0x8c2710911f9e802eea5341bf3b90bd3427740e7a3a83a74abc9f43e92db5c600;

/// @custom:hash storage ProceedRecipientsData
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_PROCEED_RECIPIENTS_DATA = 0xc68f265b7453bab62daaefa3ddccae3b15389d80e305d8cccba13ceac0aca300;

/**
 * @title ProceedRecipientsDataStorage
 * @notice Backing storage mapping each proceed recipient to opaque payload bytes.
 * @dev The recipient membership set is kept in the shared external-list storage indexed
 *      by `STORAGE_LOCATION_PROCEED_RECIPIENTS`; this struct only holds the per-recipient
 *      payload data so adds and removes coordinate across both slots.
 * @param proceedRecipientData Payload bytes associated with each recipient address.
 * @custom:storage-location erc7201:security.token.standard.storage.ProceedRecipientsData
 */
struct ProceedRecipientsDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => bytes) proceedRecipientData;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ProceedRecipientsStorageWrapper
 * @notice Library managing the proceed-recipient membership list and associated payload data.
 * @dev Membership is delegated to `ExternalListManagementStorageWrapper` keyed by
 *      `STORAGE_LOCATION_PROCEED_RECIPIENTS`; per-recipient bytes live at the dedicated
 *      `STORAGE_LOCATION_PROCEED_RECIPIENTS_DATA` slot.
 * @author Asset Tokenization Studio Team
 */
library ProceedRecipientsStorageWrapper {
    /**
     * @notice Initialises the proceed-recipient list and persists their payload data.
     * @dev Validates each address before adding it to the external list and writing the
     *      paired payload. Marks the underlying external list as initialised at the end.
     *      Caller must ensure `_proceedRecipients.length == _data.length`.
     * @param _proceedRecipients Addresses to register as proceed recipients.
     * @param _data Payload bytes associated 1:1 with each recipient.
     */
    function initializeProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            DefaultValueValidation.checkZeroAddress(_proceedRecipients[index]);
            addProceedRecipient(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Adds a proceed recipient and stores its associated payload bytes.
     * @param _proceedRecipient Address to register.
     * @param _data Payload bytes paired with the recipient.
     */
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    /**
     * @notice Removes a proceed recipient and clears its associated payload bytes.
     * @param _proceedRecipient Address to remove.
     */
    function removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListManagementStorageWrapper.removeExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
        removeProceedRecipientData(_proceedRecipient);
    }

    /**
     * @notice Writes the payload bytes associated with a proceed recipient.
     * @param _proceedRecipient The recipient address.
     * @param _data The payload bytes to persist.
     */
    function setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    /**
     * @notice Deletes the payload bytes associated with a proceed recipient.
     * @param _proceedRecipient The recipient address.
     */
    function removeProceedRecipientData(address _proceedRecipient) internal {
        delete proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    /**
     * @notice Reverts when the supplied address is not a registered proceed recipient.
     * @param _proceedRecipient Address to check.
     */
    function checkProceedRecipient(address _proceedRecipient) internal view {
        if (!isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
    }

    /**
     * @notice Reverts when the supplied address is already a registered proceed recipient.
     * @param _proceedRecipient Address to check.
     */
    function checkNotProceedRecipient(address _proceedRecipient) internal view {
        if (isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
    }

    /**
     * @notice Reads the payload bytes stored for a proceed recipient.
     * @param _proceedRecipient Address to query.
     * @return data_ The stored payload bytes (empty when no data has been set).
     */
    function getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory data_) {
        return proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    /**
     * @notice Reports whether `_proceedRecipient` is registered in the recipient list.
     * @param _proceedRecipient Address to query.
     * @return True when the address is a member of the proceed-recipient list.
     */
    function isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
    }

    /**
     * @notice Returns the number of registered proceed recipients.
     * @return Count of recipients currently in the external list.
     */
    function getProceedRecipientsCount() internal view returns (uint256) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_PROCEED_RECIPIENTS);
    }

    /**
     * @notice Returns a paginated slice of the proceed-recipient list.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Page size.
     * @return proceedRecipients_ The slice of recipient addresses for the requested page.
     */
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory proceedRecipients_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                STORAGE_LOCATION_PROCEED_RECIPIENTS,
                _pageIndex,
                _pageLength
            );
    }

    /**
     * @notice Returns the storage pointer for proceed-recipient payload data.
     * @dev Uses inline assembly to load the ERC-7201 slot from a precomputed constant.
     * @return proceedRecipientsDataStorage_ Storage pointer to `ProceedRecipientsDataStorage`.
     */
    function proceedRecipientsDataStorage()
        internal
        pure
        returns (ProceedRecipientsDataStorage storage proceedRecipientsDataStorage_)
    {
        bytes32 position = STORAGE_LOCATION_PROCEED_RECIPIENTS_DATA;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            proceedRecipientsDataStorage_.slot := position
        }
    }
}
