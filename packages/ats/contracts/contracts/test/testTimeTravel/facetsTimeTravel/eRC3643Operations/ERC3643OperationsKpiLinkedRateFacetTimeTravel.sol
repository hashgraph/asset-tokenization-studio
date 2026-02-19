// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import {
    ERC3643OperationsKpiLinkedRateFacet
} from "../../../../facets/features/ERC3643/kpiLinkedRate/ERC3643OperationsKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643OperationsKpiLinkedRateFacetTimeTravel is
    ERC3643OperationsKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
