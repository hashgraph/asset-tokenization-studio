// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalPauseManagementFacetBase } from "../ExternalPauseManagementFacetBase.sol";
import { _EXTERNAL_PAUSE_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ExternalPauseManagementFixedRateFacet is ExternalPauseManagementFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_PAUSE_FIXED_RATE_RESOLVER_KEY;
    }
}
