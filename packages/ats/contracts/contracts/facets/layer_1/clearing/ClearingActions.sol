// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";

abstract contract ClearingActions is IClearingActions, Modifiers {
    function initializeClearing(bool _clearingActive) external onlyNotClearingInitialized {
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }
}
