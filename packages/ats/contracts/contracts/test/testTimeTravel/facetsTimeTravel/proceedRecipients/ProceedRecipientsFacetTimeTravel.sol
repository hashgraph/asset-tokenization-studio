// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipientsFacet } from "../../../../facets/proceedRecipients/ProceedRecipientsFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ProceedRecipientsFacetTimeTravel is ProceedRecipientsFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
