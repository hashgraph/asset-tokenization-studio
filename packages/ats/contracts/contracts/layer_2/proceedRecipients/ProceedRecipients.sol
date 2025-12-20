// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "../interfaces/proceedRecipients/IProceedRecipients.sol";
import { Internals } from "../../layer_0/Internals.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../constants/roles.sol";
import { _PROCEED_RECIPIENTS_STORAGE_POSITION } from "../../layer_0/constants/storagePositions.sol";

abstract contract ProceedRecipients is IProceedRecipients, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) external override onlyUninitialized(_isProceedRecipientsInitialized()) {
        _initialize_ProceedRecipients(_proceedRecipients, _data);
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
        emit ProceedRecipientDataUpdated(_msgSender(), _proceedRecipient, _data);
    }

    function isProceedRecipient(address _proceedRecipient) external view override returns (bool) {
        return _isProceedRecipient(_proceedRecipient);
    }

    function getProceedRecipientData(address _proceedRecipient) external view override returns (bytes memory) {
        return _getProceedRecipientData(_proceedRecipient);
    }

    function getProceedRecipientsCount() external view override returns (uint256) {
        return _getProceedRecipientsCount();
    }

    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return _getProceedRecipients(_pageIndex, _pageLength);
    }
}
