// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondModifiers } from "../bond/BondModifiers.sol";

abstract contract CorporateActionsModifiers is BondModifiers {
    // ===== CorporateActions Modifiers =====
    modifier validateDates(uint256 _firstDate, uint256 _secondDate) virtual;
    modifier onlyMatchingActionType(bytes32 _actionType, uint256 _index) virtual;
}
