// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    ERC20PermitKpiLinkedRateFacet
} from "../../../../facets/features/ERC1400/ERC20Permit/kpiLinkedRate/ERC20PermitKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC20PermitKpiLinkedRateFacetTimeTravel is ERC20PermitKpiLinkedRateFacet, TimeTravelStorageWrapper {}
