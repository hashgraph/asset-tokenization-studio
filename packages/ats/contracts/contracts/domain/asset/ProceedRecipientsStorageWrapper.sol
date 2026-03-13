// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _PROCEED_RECIPIENTS_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { IProceedRecipients } from "../../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { ExternalListManagementStorageWrapper } from "../core/ExternalListManagementStorageWrapper.sol";

struct ProceedRecipientsDataStorage {
    mapping(address => bytes) proceedRecipientData;
}

library ProceedRecipientsStorageWrapper {
    function proceedRecipientsDataStorage()
        internal
        pure
        returns (ProceedRecipientsDataStorage storage proceedRecipientsDataStorage_)
    {
        bytes32 position = _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            proceedRecipientsDataStorage_.slot := position
        }
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
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

    // --- Initialization ---

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

    // --- State-changing functions ---

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListManagementStorageWrapper.addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListManagementStorageWrapper.removeExternalList(
            _PROCEED_RECIPIENTS_STORAGE_POSITION,
            _proceedRecipient
        );
        removeProceedRecipientData(_proceedRecipient);
    }

    function setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function removeProceedRecipientData(address _proceedRecipient) internal {
        delete proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    // --- Read functions ---

    function getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipient
            );
    }

    function getProceedRecipientsCount() internal view returns (uint256) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

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

    function isProceedRecipientsInitialized() internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper.externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION).initialized;
    }
}
