// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingRedeemFacetBase } from "../ClearingRedeemFacetBase.sol";
import { _CLEARING_REDEEM_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract ClearingRedeemFacet is ClearingRedeemFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_REDEEM_RESOLVER_KEY;
    }
}
