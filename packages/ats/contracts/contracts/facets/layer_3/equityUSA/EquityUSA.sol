// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquityUSA } from "./IEquityUSA.sol";
import { Equity } from "../../layer_2/equity/Equity.sol";

abstract contract EquityUSA is IEquityUSA, Equity {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData
    ) external override onlyNotEquityInitialized {
        _initializeEquity(_equityDetailsData);
    }
}
