// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "contracts/layer_0/Internals.sol";

abstract contract ModifiersKpiInterestRate is Internals {
    modifier isValidDate(uint256 _date, address _project) virtual;
}
