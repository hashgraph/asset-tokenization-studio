// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";
import { ModifiersFixedInterestRate } from "./Modifiers.sol";

abstract contract InternalsFixedInterestRate is ModifiersFixedInterestRate {}
