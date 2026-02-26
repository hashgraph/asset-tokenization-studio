// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldManagementFacetBase } from "../HoldManagementFacetBase.sol";
import { _HOLD_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract HoldManagementFixedRateFacet is HoldManagementFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_FIXED_RATE_RESOLVER_KEY;
    }
}
