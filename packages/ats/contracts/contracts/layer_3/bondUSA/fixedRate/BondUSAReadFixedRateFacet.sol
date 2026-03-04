// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import { _BOND_FIXED_READ_RESOLVER_KEY } from "../../../layer_2/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract BondUSAReadFixedRateFacet is BondUSAReadFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_READ_RESOLVER_KEY;
    }
}
