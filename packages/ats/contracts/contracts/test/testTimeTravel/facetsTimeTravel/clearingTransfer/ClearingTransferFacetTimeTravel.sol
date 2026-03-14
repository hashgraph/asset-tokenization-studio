// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingTransferFacet } from "../../../../facets/layer_1/clearing/ClearingTransferFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingTransferFacetTimeTravel is ClearingTransferFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
