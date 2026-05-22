// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "../../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { ExternalListManagementStorageWrapper } from "../core/ExternalListManagementStorageWrapper.sol";

/// @custom:hash storage ProceedRecipients
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_PROCEED_RECIPIENTS = 0x8c2710911f9e802eea5341bf3b90bd3427740e7a3a83a74abc9f43e92db5c600;

/// @custom:hash storage ProceedRecipientsData
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_PROCEED_RECIPIENTS_DATA = 0xc68f265b7453bab62daaefa3ddccae3b15389d80e305d8cccba13ceac0aca300;

struct ProceedRecipientsDataStorage {
    mapping(address => bytes) proceedRecipientData;
}

library ProceedRecipientsStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_proceedRecipients[index]);
            ExternalListManagementStorageWrapper.addExternalList(
                STORAGE_LOCATION_PROCEED_RECIPIENTS,
                _proceedRecipients[index]
            );
            setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }

        ExternalListManagementStorageWrapper.setExternalListInitialized(STORAGE_LOCATION_PROCEED_RECIPIENTS);
    }

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListManagementStorageWrapper.removeExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
        removeProceedRecipientData(_proceedRecipient);
    }

    function setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function removeProceedRecipientData(address _proceedRecipient) internal {
        delete proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function requireProceedRecipient(address _proceedRecipient) internal view {
        if (!isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
    }

    function requireNotProceedRecipient(address _proceedRecipient) internal view {
        if (isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
    }

    function getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(STORAGE_LOCATION_PROCEED_RECIPIENTS, _proceedRecipient);
    }

    function getProceedRecipientsCount() internal view returns (uint256) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_PROCEED_RECIPIENTS);
    }

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

    function isProceedRecipientsInitialized() internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.externalListStorage(STORAGE_LOCATION_PROCEED_RECIPIENTS).initialized;
    }

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
