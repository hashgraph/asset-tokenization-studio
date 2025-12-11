// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacetBase } from "./BondUSAReadFacet.sol";
import { _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY } from "../../layer_2/constants/resolverKeys.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract BondUSASustainabilityPerformanceTargetReadFacet is
    BondUSAReadFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY;
    }
}
