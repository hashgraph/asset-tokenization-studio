// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet
} from "../../../facets/assetCapabilities/proceedRecipients/sustainabilityPerformanceTargetRate/ProceedRecipientsSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
