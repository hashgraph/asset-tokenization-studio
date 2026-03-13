// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/proceedRecipient/ProceedRecipientsSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ProceedRecipientsSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
