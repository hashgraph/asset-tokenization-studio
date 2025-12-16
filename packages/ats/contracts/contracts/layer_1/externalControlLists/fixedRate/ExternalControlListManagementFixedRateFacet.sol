// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalControlListManagementFacetBase } from "../ExternalControlListManagementFacetBase.sol";
import { _EXTERNAL_CONTROL_LIST_FIXED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ExternalControlListManagementFixedRateFacet is
    ExternalControlListManagementFacetBase,
    CommonFixedInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_CONTROL_LIST_FIXED_RATE_RESOLVER_KEY;
    }
}
