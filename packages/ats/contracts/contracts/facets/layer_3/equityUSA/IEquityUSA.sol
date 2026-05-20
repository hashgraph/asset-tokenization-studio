// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquity } from "../../layer_2/equity/IEquity.sol";

interface IEquityUSA is IEquity {
    function initializeEquityUSA(EquityDetailsData calldata _equityDetailsData) external;
}
