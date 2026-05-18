// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";

interface IBondUSA is IBondTypes {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(IBondTypes.BondDetailsData calldata _bondDetailsData) external;
}
