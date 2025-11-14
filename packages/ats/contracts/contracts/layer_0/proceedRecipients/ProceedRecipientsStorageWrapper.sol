// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalancesStorageWrapper } from "../totalBalances/totalBalancesStorageWrapper.sol";
import {
    _PROCEED_RECIPIENTS_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION
} from "../constants/storagePositions.sol";
import { IProceedRecipients } from "../../layer_2/interfaces/proceedRecipients/IProceedRecipients.sol";

abstract contract ProceedRecipientsStorageWrapper is TotalBalancesStorageWrapper {
    struct ProceedRecipientsDataStorage {
        mapping(address => bytes) proceedRecipientData;
    }

    modifier onlyIfProceedRecipient(address _proceedRecipient) {
        if (!_isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
        _;
    }

    modifier onlyIfNotProceedRecipient(address _proceedRecipient) {
        if (_isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
        _;
    }

    function _addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal {
        _addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        _setProceedRecipientData(_proceedRecipient, _data);
    }

    function _removeProceedRecipient(address _proceedRecipient) internal {
        _removeExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        _removeProceedRecipientData(_proceedRecipient);
    }

    function _setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal {
        _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function _removeProceedRecipientData(address _proceedRecipient) internal {
        delete _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function _getProceedRecipientData(address _proceedRecipient) internal view returns (bytes memory) {
        return _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

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
}
