// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    TransferAndLockSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/regulation/transferAndLock/sustainabilityPerformanceTargetRate/TransferAndLockSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract TransferAndLockSustainabilityPerformanceTargetRateFacetTimeTravel is
    TransferAndLockSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }
}
