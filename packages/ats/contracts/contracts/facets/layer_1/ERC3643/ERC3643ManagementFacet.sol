// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management, RESOLVER_KEY_ERC3643_MANAGEMENT } from "./IERC3643Management.sol";
import { ERC3643Management } from "./ERC3643Management.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
contract ERC3643ManagementFacet is ERC3643Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_ERC3643_MANAGEMENT;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeERC3643.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IERC3643Management).interfaceId);
    }
}
