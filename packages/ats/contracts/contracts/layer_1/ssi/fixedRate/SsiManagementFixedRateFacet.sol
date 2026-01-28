// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacetBase } from "../SsiManagementFacetBase.sol";
import { _SSI_FIXED_RATE_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract SsiManagementFixedRateFacet is SsiManagementFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_FIXED_RATE_RESOLVER_KEY;
    }
}
