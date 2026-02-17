// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisStorageWrapper } from "./KpisStorageWrapper.sol";
import { ProceedRecipientsInternals } from "contracts/layer_0/proceedRecipients/ProceedRecipientsInternals.sol";
import {
    ProceedRecipientsStorageWrapper
} from "contracts/layer_0/proceedRecipients/ProceedRecipientsStorageWrapper.sol";

abstract contract ProceedRecipientsStorageWrapperKpiInterestRate is KpisStorageWrapper {
    function _addProceedRecipient(
        address _proceedRecipient,
        bytes calldata _data
    ) internal override(ProceedRecipientsInternals, ProceedRecipientsStorageWrapper) {
        _callTriggerPendingScheduledCrossOrderedTasks();
        super._addProceedRecipient(_proceedRecipient, _data);
    }

    function _removeProceedRecipient(
        address _proceedRecipient
    ) internal override(ProceedRecipientsInternals, ProceedRecipientsStorageWrapper) {
        _callTriggerPendingScheduledCrossOrderedTasks();
        super._removeProceedRecipient(_proceedRecipient);
    }
}
