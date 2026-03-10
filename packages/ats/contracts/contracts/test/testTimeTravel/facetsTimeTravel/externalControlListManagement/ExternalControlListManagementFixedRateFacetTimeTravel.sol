// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalControlListManagementFixedRateFacet
} from "../../../../facets/layer_1/externalControlList/fixedRate/ExternalControlListManagementFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../../infrastructure/utils/LocalContext.sol";

contract ExternalControlListManagementFixedRateFacetTimeTravel is
    ExternalControlListManagementFixedRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
