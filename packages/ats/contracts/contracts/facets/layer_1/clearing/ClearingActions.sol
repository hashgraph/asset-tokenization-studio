// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { CLEARING_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingActions is IClearingActions, Modifiers {
    function initializeClearing(bool _clearingActive) external onlyNotClearingInitialized {
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }

    function activateClearing() external onlyUnpaused onlyRole(CLEARING_ROLE) returns (bool success_) {
        emit ClearingActivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(true);
    }

    function deactivateClearing() external onlyUnpaused onlyRole(CLEARING_ROLE) returns (bool success_) {
        emit ClearingDeactivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(false);
    }

    function isClearingActivated() external view returns (bool) {
        return ClearingStorageWrapper.isClearingActivated();
    }
}
