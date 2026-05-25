// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management, RESOLVER_KEY_ERC1410_MANAGEMENT } from "./IERC1410Management.sol";
import { ERC1410Management } from "./ERC1410Management.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
contract ERC1410ManagementFacet is ERC1410Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_ERC1410_MANAGEMENT;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initialize_ERC1410.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IERC1410Management).interfaceId);
    }
}
