// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY
} from "contracts/layer_2/constants/resolverKeys.sol";
import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
// solhint-disable-next-line max-line-length    
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract BondUSAReadSustainabilityPerformanceTargetRateFacet is
    BondUSAReadFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY;
    }
}
