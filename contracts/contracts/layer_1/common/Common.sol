pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    AccessControlStorageWrapper
} from '../accessControl/AccessControlStorageWrapper.sol';
import {PauseStorageWrapper} from '../pause/PauseStorageWrapper.sol';
import {
    ControlListStorageWrapper
} from '../controlList/ControlListStorageWrapper.sol';

// solhint-disable no-empty-blocks
abstract contract Common is
    AccessControlStorageWrapper,
    PauseStorageWrapper,
    ControlListStorageWrapper
{
    error AlreadyInitialized();

    modifier onlyUninitialized(bool initialized) {
        if (initialized) {
            revert AlreadyInitialized();
        }
        _;
    }
}
