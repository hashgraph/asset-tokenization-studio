// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "./IProceedRecipients.sol";
import { ProceedRecipients } from "./ProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../constants/roles.sol";
import { ScheduledTasksOps } from "../../../domain/orchestrator/ScheduledTasksOps.sol";

contract ProceedRecipientsKpiLinkedRateFacet is ProceedRecipients, IStaticFunctionSelectors {
    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) external override onlyActivated onlyUnpaused onlyRole(PROCEED_RECIPIENT_MANAGER_ROLE) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        _addProceedRecipientInternal(_proceedRecipient, _data);
    }

    function removeProceedRecipient(
        address _proceedRecipient
    ) external override onlyActivated onlyUnpaused onlyRole(PROCEED_RECIPIENT_MANAGER_ROLE) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        _removeProceedRecipientInternal(_proceedRecipient);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initialize_ProceedRecipients.selector,
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
