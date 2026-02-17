// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsModifiers } from "../../corporateActions/CorporateActionsModifiers.sol";

abstract contract PauseModifiers is CorporateActionsModifiers {
    // ===== Pause Modifiers =====
    modifier onlyUnpaused() virtual;
    modifier onlyPaused() virtual;
}
