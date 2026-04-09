// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondManagement } from "../../layer_2/bond/IBondManagement.sol";
import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

interface IBondUSA is IBondManagement {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondTypes.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;
}
