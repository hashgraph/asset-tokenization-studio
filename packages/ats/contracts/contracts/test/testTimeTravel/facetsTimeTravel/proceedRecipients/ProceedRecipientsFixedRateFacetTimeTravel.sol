// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ProceedRecipientsFixedRateFacet
} from "../../../../facets/assetCapabilities/proceedRecipients/fixedRate/ProceedRecipientsFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ProceedRecipientsFixedRateFacetTimeTravel is ProceedRecipientsFixedRateFacet, TimeTravelStorageWrapper {}
