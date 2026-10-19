// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients, RESOLVER_KEY_PROCEED_RECIPIENTS } from "./IProceedRecipients.sol";
import { ROLE_PROCEED_RECIPIENT_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProceedRecipientsStorageWrapper } from "../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ScheduledTasksOps } from "../../domain/orchestrator/ScheduledTasksOps.sol";
/**
 * @title Proceed Recipients
 * @notice Manages the addresses entitled to receive proceeds and their associated data.
 * @dev Intended for use as a facet. Initialisation is single-use per resolver key, while
 *      mutating operations require an operational, activated and unpaused asset state.
 * @author Hashgraph
 */
abstract contract ProceedRecipients is IProceedRecipients, Modifiers {
    /// @inheritdoc IProceedRecipients
    function initializeProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PROCEED_RECIPIENTS)
        onlyWithSameLength(_proceedRecipients.length, _data.length)
    {
        ProceedRecipientsStorageWrapper.initializeProceedRecipients(_proceedRecipients, _data);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PROCEED_RECIPIENTS);
        emit ProceedRecipientsInitialized(_proceedRecipients, _data);
    }

    /// @inheritdoc IProceedRecipients
    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER)
        validateAddressNotZero(_proceedRecipient)
        onlyIfNotProceedRecipient(_proceedRecipient)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(EvmAccessors.getMsgSender(), _proceedRecipient, _data);
    }

    /// @inheritdoc IProceedRecipients
    function removeProceedRecipient(
        address _proceedRecipient
    )
        external
        virtual
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(EvmAccessors.getMsgSender(), _proceedRecipient);
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
        validateAddressNotZero(_proceedRecipient)
        onlyIfProceedRecipient(_proceedRecipient)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
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
}
