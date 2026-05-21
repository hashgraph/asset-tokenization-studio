// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "./IERC1410Management.sol";
import { ERC1410Management } from "./ERC1410Management.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { _ERC1410_MANAGEMENT_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC1410ManagementFacet is ERC1410Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeERC1410.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IERC1410Management).interfaceId);
    }
}
