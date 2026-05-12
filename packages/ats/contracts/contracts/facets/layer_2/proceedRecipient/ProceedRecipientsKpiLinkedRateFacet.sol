// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "./IProceedRecipients.sol";
import { ProceedRecipients } from "./ProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { DEFAULT_ADMIN_ROLE, PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../constants/roles.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

contract ProceedRecipientsKpiLinkedRateFacet is ProceedRecipients, IStaticFunctionSelectors {
    function initializeProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    )
        external
        override
        onlyFacetNotRegistered(_PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        ProceedRecipientsStorageWrapper.initialize_ProceedRecipients(_proceedRecipients, _data);
        InitializerStorageWrapper.setFacetToReady(_PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY);
    }

    /// @inheritdoc IProceedRecipients
    function reinitializeProceedRecipients(
        uint256[] calldata fromVersions
    )
        external
        override
        onlyFacetRegistered(_PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY, fromVersions)
        onlyFacetNotReady(_PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY);
    }

    function addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) external override onlyUnpaused onlyRole(PROCEED_RECIPIENT_MANAGER_ROLE) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        _addProceedRecipientInternal(_proceedRecipient, _data);
    }

    function removeProceedRecipient(
        address _proceedRecipient
    ) external override onlyUnpaused onlyRole(PROCEED_RECIPIENT_MANAGER_ROLE) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        _removeProceedRecipientInternal(_proceedRecipient);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](9);
        staticFunctionSelectors_[selectorIndex++] = this.initializeProceedRecipients.selector;
        staticFunctionSelectors_[selectorIndex++] = this.reinitializeProceedRecipients.selector;
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
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProceedRecipients).interfaceId;
    }
}
