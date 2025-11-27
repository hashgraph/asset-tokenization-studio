// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Security } from "../security/Security.sol";
import { IEquityUSA } from "../interfaces/IEquityUSA.sol";
import { Equity } from "../../layer_2/equity/Equity.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";

abstract contract EquityUSA is IEquityUSA, Equity, Security {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyUninitialized(_equityStorage().initialized) {
        _initializeEquity(_equityDetailsData);
        _initializeSecurity(_regulationData, _additionalSecurityData);
    }
}
