// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";
import { CommonFixedInterestRate } from "../../../../domain/asset/extension/bond/fixedInterestRate/Common.sol";

contract BondUSAFixedRateFacet is BondUSAFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_RATE_RESOLVER_KEY;
    }
}
