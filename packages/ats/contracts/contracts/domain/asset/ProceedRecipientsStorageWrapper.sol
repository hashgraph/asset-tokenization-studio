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
    function _proceedRecipientsDataStorage()
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
    function _requireProceedRecipient(address _proceedRecipient) internal view {
        if (!_isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
    }

    function _requireNotProceedRecipient(address _proceedRecipient) internal view {
        if (_isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
    }

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) internal {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper._checkValidAddress(_proceedRecipients[index]);
            ExternalListManagementStorageWrapper._addExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipients[index]
            );
            _setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }

        ExternalListManagementStorageWrapper._setExternalListInitialized(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    // --- State-changing functions ---

    function _addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        ExternalListManagementStorageWrapper._addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        _setProceedRecipientData(_proceedRecipient, _data);
    }

    function _removeProceedRecipient(address _proceedRecipient) internal {
        ExternalListManagementStorageWrapper._removeExternalList(
            _PROCEED_RECIPIENTS_STORAGE_POSITION,
            _proceedRecipient
        );
        _removeProceedRecipientData(_proceedRecipient);
    }

    function _setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function _removeProceedRecipientData(address _proceedRecipient) internal {
        delete _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    // --- Read functions ---

    function _getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function _isProceedRecipient(address _proceedRecipient) internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper._isExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipient
            );
    }

    function _getProceedRecipientsCount() internal view returns (uint256) {
        return ExternalListManagementStorageWrapper._getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function _getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory proceedRecipients_) {
        return
            ExternalListManagementStorageWrapper._getExternalListsMembers(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }

    function _isProceedRecipientsInitialized() internal view returns (bool) {
        return
            ExternalListManagementStorageWrapper._externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION).initialized;
    }
}
