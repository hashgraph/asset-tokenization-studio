// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActionsFacetBase } from "../CorporateActionsFacetBase.sol";
import { _CORPORATE_ACTIONS_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract CorporateActionsFixedRateFacet is CorporateActionsFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORPORATE_ACTIONS_FIXED_RATE_RESOLVER_KEY;
    }
}
