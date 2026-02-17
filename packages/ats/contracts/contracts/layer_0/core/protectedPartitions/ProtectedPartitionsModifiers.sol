// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipientsModifiers } from "../../proceedRecipients/ProceedRecipientsModifiers.sol";

abstract contract ProtectedPartitionsModifiers is ProceedRecipientsModifiers {
    // ===== ProtectedPartitions Modifiers =====
    modifier onlyProtectedPartitions() virtual;
}
