// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410ManagementFacetBase } from "../ERC1410ManagementFacetBase.sol";
import { _ERC1410_MANAGEMENT_FIXED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC1410ManagementFixedRateFacet is ERC1410ManagementFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_FIXED_RATE_RESOLVER_KEY;
    }
}
