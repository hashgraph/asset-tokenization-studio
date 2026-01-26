// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

// solhint-disable no-empty-blocks
import { PauseStorageWrapper } from "../core/PauseStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../core/AccessControlStorageWrapper.sol";

abstract contract Common is PauseStorageWrapper, AccessControlStorageWrapper {}
