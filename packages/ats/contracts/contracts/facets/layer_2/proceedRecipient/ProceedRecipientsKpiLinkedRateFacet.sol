// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients, RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE } from "./IProceedRecipients.sol";
import { ProceedRecipients } from "./ProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { ROLE_PROCEED_RECIPIENT_MANAGER } from "../../../constants/roles.sol";
import { ScheduledTasksOps } from "../../../domain/orchestrator/ScheduledTasksOps.sol";

contract ProceedRecipientsKpiLinkedRateFacet is ProceedRecipients, IStaticFunctionSelectors {
    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) external override onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        _addProceedRecipientInternal(_proceedRecipient, _data);
    }

    function removeProceedRecipient(
        address _proceedRecipient
    ) external override onlyActivated onlyUnpaused onlyRole(ROLE_PROCEED_RECIPIENT_MANAGER) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        _removeProceedRecipientInternal(_proceedRecipient);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProceedRecipients.selector,
                this.addProceedRecipient.selector,
                this.removeProceedRecipient.selector,
                this.updateProceedRecipientData.selector,
                this.isProceedRecipient.selector,
                this.getProceedRecipientData.selector,
                this.getProceedRecipientsCount.selector,
                this.getProceedRecipients.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProceedRecipients).interfaceId);
    }
}
