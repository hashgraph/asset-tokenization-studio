// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDeactivate } from "./IDeactivate.sol";
import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEACTIVATE_ROLE } from "../../constants/roles.sol";

/**
 * @title Deactivate
 */
abstract contract Deactivate is IDeactivate, Modifiers {
    function deactivate() external onlyUnpaused onlyRole(DEACTIVATE_ROLE) {
        DeactivateStorageWrapper.deactivate();
    }

    function isDeactivated() external view returns (bool) {
        return DeactivateStorageWrapper.isDeactivated();
    }
}
