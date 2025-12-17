// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalancesStorageWrapper } from "../totalBalances/TotalBalancesStorageWrapper.sol";
import {
    _PROCEED_RECIPIENTS_STORAGE_POSITION,
    _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION
} from "../constants/storagePositions.sol";
import { IProceedRecipients } from "../../layer_2/interfaces/proceedRecipients/IProceedRecipients.sol";

abstract contract ProceedRecipientsStorageWrapper is TotalBalancesStorageWrapper {
    struct ProceedRecipientsDataStorage {
        mapping(address => bytes) proceedRecipientData;
    }

    modifier onlyIfProceedRecipient(address _proceedRecipient) override {
        if (!_isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientNotFound(_proceedRecipient);
        }
        _;
    }

    modifier onlyIfNotProceedRecipient(address _proceedRecipient) override {
        if (_isProceedRecipient(_proceedRecipient)) {
            revert IProceedRecipients.ProceedRecipientAlreadyExists(_proceedRecipient);
        }
        _;
    }

    function _initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) internal override {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            _addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipients[index]);
            _setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }

        _setExternalListInitialized(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function _addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal virtual override {
        _addExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        _setProceedRecipientData(_proceedRecipient, _data);
    }

    function _removeProceedRecipient(address _proceedRecipient) internal virtual override {
        _removeExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
        _removeProceedRecipientData(_proceedRecipient);
    }

    function _setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal override {
        _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient] = _data;
    }

    function _removeProceedRecipientData(address _proceedRecipient) internal override {
        delete _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function _getProceedRecipientData(address _proceedRecipient) internal view override returns (bytes memory) {
        return _proceedRecipientsDataStorage().proceedRecipientData[_proceedRecipient];
    }

    function _isProceedRecipient(address _proceedRecipient) internal view override returns (bool) {
        return _isExternalList(_PROCEED_RECIPIENTS_STORAGE_POSITION, _proceedRecipient);
    }

    function _getProceedRecipientsCount() internal view override returns (uint256) {
        return _getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function _getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory proceedRecipients_) {
        return _getExternalListsMembers(_PROCEED_RECIPIENTS_STORAGE_POSITION, _pageIndex, _pageLength);
    }

    function _isProceedRecipientsInitialized() internal view override returns (bool) {
        return _externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION).initialized;
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
