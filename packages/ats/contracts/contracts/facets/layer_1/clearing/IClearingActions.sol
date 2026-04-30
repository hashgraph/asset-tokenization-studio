// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "./IClearingTypes.sol";

interface IClearingActions is IClearingTypes {
    function initializeClearing(bool _activateClearing) external;
}
