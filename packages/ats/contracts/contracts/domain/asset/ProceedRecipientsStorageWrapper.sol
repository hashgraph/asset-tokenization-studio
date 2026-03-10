// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { ExternalListsStorageWrapper } from "../core/ExternalListsStorageWrapper.sol";
import { IProceedRecipients } from "../../facets/asset/proceedRecipient/IProceedRecipients.sol";

/// @dev Proceed recipients data storage (mapping of addresses to data)
struct ProceedRecipientsDataStorage {
    mapping(address => bytes) proceedRecipientData;
}

/// @title ProceedRecipientsStorageWrapper
/// @notice Library for proceed recipients management
/// @dev Extracted from ProceedRecipientsStorageWrapper for library-based diamond migration
library ProceedRecipientsStorageWrapper {
    function initialize(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            ExternalListsStorageWrapper.requireValidAddress(_proceedRecipients[index]);
            ExternalListsStorageWrapper.addExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipients[index]
            );
            setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }
        ExternalListsStorageWrapper.setExternalListInitialized(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListsStorageWrapper.addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        setProceedRecipientData(_proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListsStorageWrapper.removeExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
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
        return ExternalListsStorageWrapper.isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
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
        return ExternalListsStorageWrapper.getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function getProceedRecipients(uint256 _pageIndex, uint256 _pageLength) internal view returns (address[] memory) {
        return
            ExternalListsStorageWrapper.getExternalListsMembers(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }

    function isInitialized() internal view returns (bool) {
        return
            ExternalListsStorageWrapper.isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, address(0)) ||
            getProceedRecipientsCount() > 0;
    }

    /// @dev Access proceed recipients data storage
    function proceedRecipientsDataStorage()
        internal
        pure
        returns (ProceedRecipientsDataStorage storage proceedRecipientsData_)
    {
        bytes32 pos = _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            proceedRecipientsData_.slot := pos
        }
    }
}
