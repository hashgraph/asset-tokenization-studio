// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { BatchControllerFacet } from "../../../../facets/batchController/BatchControllerFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract BatchControllerFacetTimeTravel is BatchControllerFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
