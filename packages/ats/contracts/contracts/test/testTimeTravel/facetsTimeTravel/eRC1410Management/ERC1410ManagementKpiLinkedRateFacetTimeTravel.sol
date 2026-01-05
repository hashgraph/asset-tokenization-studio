// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import {
    ERC1410ManagementKpiLinkedRateFacet
} from "../../../../layer_1/ERC1400/ERC1410/kpiLinkedRate/ERC1410ManagementKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../../layer_0/context/LocalContext.sol";

contract ERC1410ManagementKpiLinkedRateFacetTimeTravel is
    ERC1410ManagementKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
