// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients, RESOLVER_KEY_PROCEED_RECIPIENTS } from "./IProceedRecipients.sol";
import { ROLE_PROCEED_RECIPIENT_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProceedRecipientsStorageWrapper } from "../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Proceed Recipients
 * @notice Manages the addresses entitled to receive proceeds and their associated data.
 * @dev Intended for use as a facet. Initialisation is single-use per resolver key, while
 *      mutating operations require an operational, activated and unpaused asset state.
 * @author Hashgraph
 */
abstract contract ProceedRecipients is IProceedRecipients, Modifiers {
    /// @inheritdoc IProceedRecipients
    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) external virtual override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        _addProceedRecipientInternal(_proceedRecipient, _data);
    }

    /// @inheritdoc IProceedRecipients
    function removeProceedRecipient(
        address _proceedRecipient
    ) external virtual override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        _removeProceedRecipientInternal(_proceedRecipient);
    }

    /// @inheritdoc IProceedRecipients
    function updateProceedRecipientData(
        address _proceedRecipient,
        bytes calldata _data
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER)
        onlyAddressNotZero(_proceedRecipient)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        ProceedRecipientsStorageWrapper.setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(EvmAccessors.getMsgSender(), _proceedRecipient, _data);
    }

    /// @inheritdoc IProceedRecipients
    function isProceedRecipient(address _proceedRecipient) external view override returns (bool) {
        return ProceedRecipientsStorageWrapper.isProceedRecipient(_proceedRecipient);
    }

    /// @inheritdoc IProceedRecipients
    function getProceedRecipientData(address _proceedRecipient) external view override returns (bytes memory) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientData(_proceedRecipient);
    }

    /// @inheritdoc IProceedRecipients
    function getProceedRecipientsCount() external view override returns (uint256) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientsCount();
    }

    /// @inheritdoc IProceedRecipients
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return ProceedRecipientsStorageWrapper.getProceedRecipients(_pageIndex, _pageLength);
    }

    /**
     * @notice Adds a proceed recipient and emits the corresponding registration event.
     * @dev Reverts for the zero address or when the address is already registered. Intended for
     *      reuse by external entry points that apply the required access and lifecycle checks.
     * @param _proceedRecipient Address to register as a proceed recipient.
     * @param _data Metadata payload associated with the proceed recipient.
     */
    function _addProceedRecipientInternal(address _proceedRecipient, bytes calldata _data) internal {
        DefaultValueValidation.checkZeroAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.requireNotProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(EvmAccessors.getMsgSender(), _proceedRecipient, _data);
    }

    /**
     * @notice Removes a proceed recipient and emits the corresponding removal event.
     * @dev Reverts when the address is not registered. Intended for reuse by external entry
     *      points that apply the required access and lifecycle checks.
     * @param _proceedRecipient Address to remove from the proceed recipient registry.
     */
    function _removeProceedRecipientInternal(address _proceedRecipient) internal {
        ProceedRecipientsStorageWrapper.requireProceedRecipient(_proceedRecipient);
        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(EvmAccessors.getMsgSender(), _proceedRecipient);
    }
}
