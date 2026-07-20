// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../infrastructure/errors/ICommonErrors.sol";

function _checkNotInitialized(bool initialized) pure {
    if (initialized) revert ICommonErrors.AlreadyInitialized();
}
