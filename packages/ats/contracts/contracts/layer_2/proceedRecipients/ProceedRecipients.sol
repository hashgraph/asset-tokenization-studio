// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IProceedRecipients
} from '../interfaces/proceedRecipients/IProceedRecipients.sol';
import {Common} from '../../layer_1/common/Common.sol';
import {_PROCEED_RECIPIENT_MANAGER_ROLE} from '../constants/roles.sol';
import {
    _PROCEED_RECIPIENTS_STORAGE_POSITION
} from '../../layer_0/constants/storagePositions.sol';

contract ProceedRecipients is IProceedRecipients, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    )
        external
        override
        onlyUninitialized(
            _externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION)
                .initialized
        )
    {
        uint256 length = _proceedRecipients.length;
        for (uint256 index; index < length; ) {
            _addExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipients[index]
            );
            _setProceedRecipientData(_proceedRecipients[index], _data[index]);
            unchecked {
                ++index;
            }
        }

        _externalListStorage(_PROCEED_RECIPIENTS_STORAGE_POSITION)
            .initialized = true;
    }

    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyRole(_PROCEED_RECIPIENT_MANAGER_ROLE)
        onlyIfNotProceedRecipient(_proceedRecipient)
    {
        _addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(_msgSender(), _proceedRecipient, _data);
    }

    function removeProceedRecipient(
        address _proceedRecipient
    )
        external
        override
        onlyUnpaused
        onlyRole(_PROCEED_RECIPIENT_MANAGER_ROLE)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        _removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(_msgSender(), _proceedRecipient);
    }

    function updateProceedRecipientData(
        address _proceedRecipient,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyRole(_PROCEED_RECIPIENT_MANAGER_ROLE)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        _setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(
            _msgSender(),
            _proceedRecipient,
            _data
        );
    }

    function isProceedRecipient(
        address _proceedRecipient
    ) external view override returns (bool) {
        return
            _isExternalList(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _proceedRecipient
            );
    }

    function getProceedRecipientData(
        address _proceedRecipient
    ) external view override returns (bytes memory) {
        return _getProceedRecipientData(_proceedRecipient);
    }

    function getProceedRecipientsCount()
        external
        view
        override
        returns (uint256)
    {
        return _getExternalListsCount(_PROCEED_RECIPIENTS_STORAGE_POSITION);
    }

    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return
            _getExternalListsMembers(
                _PROCEED_RECIPIENTS_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
