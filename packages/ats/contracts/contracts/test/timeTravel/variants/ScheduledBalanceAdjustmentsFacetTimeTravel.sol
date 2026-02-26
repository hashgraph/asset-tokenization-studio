// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledBalanceAdjustmentsFacet
} from "../../../facets/assetCapabilities/scheduledTasks/scheduledBalanceAdjustments/ScheduledBalanceAdjustmentsFacet.sol";
// solhint-enable max-line-length
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract ScheduledBalanceAdjustmentsFacetTimeTravel is ScheduledBalanceAdjustmentsFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
