// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalKycListManagementFacetBase } from "../ExternalKycListManagementFacetBase.sol";
import { _EXTERNAL_KYC_LIST_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract ExternalKycListManagementFacet is ExternalKycListManagementFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_KYC_LIST_RESOLVER_KEY;
    }
}
