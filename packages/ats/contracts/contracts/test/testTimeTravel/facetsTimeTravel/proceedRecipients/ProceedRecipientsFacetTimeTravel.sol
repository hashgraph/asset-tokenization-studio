// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    ProceedRecipientsFacet
} from "../../../../facets/assetCapabilities/proceedRecipients/standard/ProceedRecipientsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ProceedRecipientsFacetTimeTravel is ProceedRecipientsFacet, TimeTravelStorageWrapper {}
