// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisStorageWrapper } from "../kpis/KpisStorageWrapper.sol";
import { Internals } from "contracts/layer_0/Internals.sol";
import {
    ProceedRecipientsStorageWrapper
} from "contracts/layer_0/proceedRecipients/ProceedRecipientsStorageWrapper.sol";

abstract contract ProceedRecipientsStorageWrapperSustainabilityPerformanceTargetInterestRate is KpisStorageWrapper {
    function _addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) internal override(Internals, ProceedRecipientsStorageWrapper) {
        _callTriggerPendingScheduledCrossOrderedTasks();
        super._addProceedRecipient(_proceedRecipient, _data);
    }

    function _removeProceedRecipient(
        address _proceedRecipient
    ) internal override(Internals, ProceedRecipientsStorageWrapper) {
        _callTriggerPendingScheduledCrossOrderedTasks();
        super._removeProceedRecipient(_proceedRecipient);
    }
}
