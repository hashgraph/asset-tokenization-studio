// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsFacet } from "../../../../facets/corporateActions/CorporateActionsFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract CorporateActionsFacetTimeTravel is CorporateActionsFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
