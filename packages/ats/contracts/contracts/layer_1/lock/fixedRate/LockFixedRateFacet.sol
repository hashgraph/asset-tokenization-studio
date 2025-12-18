// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockFacetBase } from "../LockFacetBase.sol";
import { _LOCK_FIXED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract LockFixedRateFacet is LockFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_FIXED_RATE_RESOLVER_KEY;
    }
}
