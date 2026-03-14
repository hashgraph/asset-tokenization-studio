// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsFacet } from "../../../../facets/layer_1/corporateAction/CorporateActionsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract CorporateActionsFacetTimeTravel is CorporateActionsFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
