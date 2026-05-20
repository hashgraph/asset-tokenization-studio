// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";

abstract contract BondUSA is IBondUSA, Modifiers {
    function initializeBondUSA(
        IBondTypes.BondDetailsData calldata _bondDetailsData
    ) external override onlyNotBondInitialized {
        BondStorageWrapper.initialize_bond(_bondDetailsData);
    }
}
