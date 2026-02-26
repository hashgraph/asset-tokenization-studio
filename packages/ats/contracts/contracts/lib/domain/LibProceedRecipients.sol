// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { proceedRecipientsDataStorage } from "../../storage/ExternalStorageAccessor.sol";
import { _PROCEED_RECIPIENTS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { LibExternalLists } from "../core/LibExternalLists.sol";
import { IProceedRecipients } from "../../facets/assetCapabilities/interfaces/proceedRecipients/IProceedRecipients.sol";

/// @title LibProceedRecipients
/// @notice Library for proceed recipients management
/// @dev Extracted from ProceedRecipientsStorageWrapper for library-based diamond migration
library LibProceedRecipients {
    function initialize(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            LibExternalLists.requireValidAddress(_proceedRecipients[index]);
            LibExternalLists.addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipients[index]);
            setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }
        LibExternalLists.setExternalListInitialized(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        LibExternalLists.addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) internal {
        LibExternalLists.removeExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        removeProceedRecipientData(_proceedRecipient);
    }

    function setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function removeProceedRecipientData(address _proceedRecipient) internal {
        delete proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return LibExternalLists.isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
    }

    function checkIsProceedRecipient(address _proceedRecipient) internal view {
        if (!isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
    }

    function checkNotProceedRecipient(address _proceedRecipient) internal view {
        if (isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
    }

    function getProceedRecipientsCount() internal view returns (uint256) {
        return LibExternalLists.getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function getProceedRecipients(uint256 _pageIndex, uint256 _pageLength) internal view returns (address[] memory) {
        return LibExternalLists.getExternalListsMembers(_PROCEED_RECIPIENTS_STORAGE_POSITION, _pageIndex, _pageLength);
    }

    function isInitialized() internal view returns (bool) {
        return
            LibExternalLists.isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, address(0)) ||
            getProceedRecipientsCount() > 0;
    }
}
