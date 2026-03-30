// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquityUSA } from "./IEquityUSA.sol";
import { Equity } from "../../layer_2/equity/Equity.sol";
import { Security } from "../../layer_2/security/Security.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";

abstract contract EquityUSA is IEquityUSA, Equity, Security {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyNotEquityInitialized {
        _initializeEquity(_equityDetailsData);
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
    }
}
