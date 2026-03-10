// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalKycListManagementKpiLinkedRateFacet
} from "../../../../facets/layer_1/externalKycList/kpiLinkedRate/ExternalKycListManagementKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../../infrastructure/utils/LocalContext.sol";

contract ExternalKycListManagementKpiLinkedRateFacetTimeTravel is
    ExternalKycListManagementKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
