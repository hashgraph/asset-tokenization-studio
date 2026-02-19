// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ERC1643KpiLinkedRateFacet
} from "../../../../facets/features/ERC1400/ERC1643/kpiLinkedRate/ERC1643KpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1643KpiLinkedRateFacetTimeTravel is ERC1643KpiLinkedRateFacet, TimeTravelStorageWrapper {}
