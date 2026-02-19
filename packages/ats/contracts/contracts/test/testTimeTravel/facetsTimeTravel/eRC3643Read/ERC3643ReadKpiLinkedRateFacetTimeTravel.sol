// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    ERC3643ReadKpiLinkedRateFacet
} from "../../../../facets/features/ERC3643/kpiLinkedRate/ERC3643ReadKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC3643ReadKpiLinkedRateFacetTimeTravel is ERC3643ReadKpiLinkedRateFacet, TimeTravelStorageWrapper {}
