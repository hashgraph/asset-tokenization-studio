// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable max-line-length */
import {
    TransferAndLockSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_3/transferAndLock/sustainabilityPerformanceTargetRate/TransferAndLockSustainabilityPerformanceTargetRateFacet.sol";
/* solhint-enable max-line-length */
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../../infrastructure/utils/LocalContext.sol";

contract TransferAndLockSustainabilityPerformanceTargetRateFacetTimeTravel is
    TransferAndLockSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
