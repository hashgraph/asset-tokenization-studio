// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";

interface IBondUSA is IBondTypes {
    function initializeBondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
}
