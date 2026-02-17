// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycModifiers } from "../core/kyc/KycModifiers.sol";

abstract contract ProceedRecipientsModifiers is KycModifiers {
    // ===== ProceedRecipients Modifiers =====
    modifier onlyIfProceedRecipient(address _proceedRecipient) virtual;
    modifier onlyIfNotProceedRecipient(address _proceedRecipient) virtual;
}
