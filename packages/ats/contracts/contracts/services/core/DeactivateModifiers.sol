// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";

/**
 * @title DeactivateModifiers
 */
abstract contract DeactivateModifiers {
    modifier onlyActivated() {
        DeactivateStorageWrapper.requireActivated();
        _;
    }
}
