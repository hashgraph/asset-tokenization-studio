// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquity } from "../../layer_2/interfaces/equity/IEquity.sol";
import { ISecurity } from "../../layer_2/interfaces/security/ISecurity.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";

interface IEquityUSA is IEquity, ISecurity {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;
}
