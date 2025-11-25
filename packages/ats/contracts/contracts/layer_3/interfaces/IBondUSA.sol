// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBond } from "../../layer_2/interfaces/bond/IBond.sol";
import { IBondRead } from "../../layer_2/interfaces/bond/IBondRead.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";

interface IBondUSA is IBond {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;
}
