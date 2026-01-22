// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20PermitFacetBase } from "../ERC20PermitFacetBase.sol";
import { _ERC20PERMIT_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract ERC20PermitFacet is ERC20PermitFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20PERMIT_RESOLVER_KEY;
    }
}
