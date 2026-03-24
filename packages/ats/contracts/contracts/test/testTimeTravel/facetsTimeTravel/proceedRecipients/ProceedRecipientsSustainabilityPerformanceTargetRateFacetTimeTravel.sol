// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/proceedRecipient/ProceedRecipientsSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{}
