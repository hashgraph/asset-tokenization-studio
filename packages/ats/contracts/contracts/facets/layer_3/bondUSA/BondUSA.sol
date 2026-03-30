// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { Bond } from "../../layer_2/bond/Bond.sol";
import { IBondRead } from "../../layer_2/bond/IBondRead.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";

abstract contract BondUSA is IBondUSA, Bond {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyNotBondInitialized {
        BondStorageWrapper.initialize_bond(_bondDetailsData);
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
    }
}
