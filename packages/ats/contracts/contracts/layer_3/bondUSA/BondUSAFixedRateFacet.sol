// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "../interfaces/IBondUSA.sol";
import {
    _BOND_FIXED_RATE_RESOLVER_KEY
} from "../../layer_2/constants/resolverKeys.sol";
import { IBond } from "../../layer_2/interfaces/bond/IBond.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { BondUSAFacetBase } from "./BondUSAFacet.sol";
import { CommonFixedInterestRate } from "../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract BondUSAFixedRateFacet is BondUSAFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_RATE_RESOLVER_KEY;
    }
}
