// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ComplianceFacet } from "../../../../facets/compliance/ComplianceFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ComplianceFacetTimeTravel is ComplianceFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
