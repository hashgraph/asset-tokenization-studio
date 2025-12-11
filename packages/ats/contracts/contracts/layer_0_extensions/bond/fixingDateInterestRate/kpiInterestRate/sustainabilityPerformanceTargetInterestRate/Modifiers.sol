// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondStorageWrapperFixingDateInterestRate } from "../../BondStorageWrapperFixingDateInterestRate.sol";

abstract contract ModifiersSustainabilityPerformanceTargetInterestRate is BondStorageWrapperFixingDateInterestRate {
    modifier isValidDate(uint256 _date, address _project) virtual;
}
