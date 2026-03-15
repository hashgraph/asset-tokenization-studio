// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "./IProceedRecipients.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract ProceedRecipients is IProceedRecipients {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) external override {
        if (ProceedRecipientsStorageWrapper.isProceedRecipientsInitialized()) revert AlreadyInitialized();
        ProceedRecipientsStorageWrapper.initialize_ProceedRecipients(_proceedRecipients, _data);
    }

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessControlStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE, msg.sender);
        ERC1410StorageWrapper.requireValidAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.requireNotProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(msg.sender, _proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessControlStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE, msg.sender);
        ProceedRecipientsStorageWrapper.requireProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(msg.sender, _proceedRecipient);
    }

    function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessControlStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE, msg.sender);
        ERC1410StorageWrapper.requireValidAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.requireProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(msg.sender, _proceedRecipient, _data);
    }

    function isProceedRecipient(address _proceedRecipient) external view override returns (bool) {
        return ProceedRecipientsStorageWrapper.isProceedRecipient(_proceedRecipient);
    }

    function getProceedRecipientData(address _proceedRecipient) external view override returns (bytes memory) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientData(_proceedRecipient);
    }

    function getProceedRecipientsCount() external view override returns (uint256) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientsCount();
    }

    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return ProceedRecipientsStorageWrapper.getProceedRecipients(_pageIndex, _pageLength);
    }
}
