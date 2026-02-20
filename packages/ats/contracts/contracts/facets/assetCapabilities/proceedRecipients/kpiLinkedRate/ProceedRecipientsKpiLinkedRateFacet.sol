// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipients } from "../ProceedRecipients.sol";
import { IProceedRecipients } from "../../interfaces/proceedRecipients/IProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibProceedRecipients } from "../../../../lib/domain/LibProceedRecipients.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract ProceedRecipientsKpiLinkedRateFacet is ProceedRecipients, IStaticFunctionSelectors {
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        LibERC1410.requireValidAddress(_proceedRecipient);
        LibProceedRecipients.checkNotProceedRecipient(_proceedRecipient);

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();

        LibProceedRecipients.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(msg.sender, _proceedRecipient, _data);
    }

    function removeProceedRecipient(address _proceedRecipient) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        LibProceedRecipients.checkIsProceedRecipient(_proceedRecipient);

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();

        LibProceedRecipients.removeProceedRecipient(_proceedRecipient);
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
