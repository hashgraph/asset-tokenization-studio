// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC20PermitSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC20Permit/sustainabilityPerformanceTargetRate/ERC20PermitSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC20PermitSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC20PermitSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
