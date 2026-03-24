// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ProceedRecipientsKpiLinkedRateFacet
} from "../../../../facets/layer_2/proceedRecipient/ProceedRecipientsKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ProceedRecipientsKpiLinkedRateFacetTimeTravel is ProceedRecipientsKpiLinkedRateFacet, TimeTravelProvider {}
