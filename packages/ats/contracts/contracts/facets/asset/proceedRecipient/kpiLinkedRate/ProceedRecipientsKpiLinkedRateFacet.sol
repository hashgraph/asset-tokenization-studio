// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipients } from "../ProceedRecipients.sol";
import { IProceedRecipients } from "../../proceedRecipient/IProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/diamond/IStaticFunctionSelectors.sol";
import { _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract ProceedRecipientsKpiLinkedRateFacet is ProceedRecipients, IStaticFunctionSelectors {
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        ERC1410StorageWrapper.requireValidAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.checkNotProceedRecipient(_proceedRecipient);

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();

        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(msg.sender, _proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        ProceedRecipientsStorageWrapper.checkIsProceedRecipient(_proceedRecipient);

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();

        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(msg.sender, _proceedRecipient);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ProceedRecipients.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateProceedRecipientData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipientData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipientsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipients.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IProceedRecipients).interfaceId;
    }
}
