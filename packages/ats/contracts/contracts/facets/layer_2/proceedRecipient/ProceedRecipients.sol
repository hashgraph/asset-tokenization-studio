// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "./IProceedRecipients.sol";
import { ROLE_PROCEED_RECIPIENT_MANAGER } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProceedRecipientsStorageWrapper } from "../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { DefaultValueValidation } from "../../../infrastructure/utils/DefaultValueValidation.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ProceedRecipients is IProceedRecipients, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) external override onlyNotProceedRecipientsInitialized {
        ProceedRecipientsStorageWrapper.initialize_ProceedRecipients(_proceedRecipients, _data);
    }

    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) external virtual override onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        _addProceedRecipientInternal(_proceedRecipient, _data);
    }

    function removeProceedRecipient(
        address _proceedRecipient
    ) external virtual override onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        _removeProceedRecipientInternal(_proceedRecipient);
    }

    function updateProceedRecipientData(
        address _proceedRecipient,
        bytes calldata _data
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER)
        notZeroAddress(_proceedRecipient)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        ProceedRecipientsStorageWrapper.setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(EvmAccessors.getMsgSender(), _proceedRecipient, _data);
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

    function _addProceedRecipientInternal(address _proceedRecipient, bytes calldata _data) internal {
        DefaultValueValidation.checkZeroAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.requireNotProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(EvmAccessors.getMsgSender(), _proceedRecipient, _data);
    }

    function _removeProceedRecipientInternal(address _proceedRecipient) internal {
        ProceedRecipientsStorageWrapper.requireProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(EvmAccessors.getMsgSender(), _proceedRecipient);
    }
}
