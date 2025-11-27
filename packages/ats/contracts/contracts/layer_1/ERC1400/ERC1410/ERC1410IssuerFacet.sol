// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1410_ISSUER_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IERC1410Issuer } from "../../interfaces/ERC1400/IERC1410Issuer.sol";
import { ERC1410Issuer } from "./ERC1410Issuer.sol";

contract ERC1410IssuerFacet is IStaticFunctionSelectors, ERC1410Issuer {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_ISSUER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        uint256 selectorIndex = 0;
        // Issue function
        staticFunctionSelectors_[selectorIndex++] = this.issueByPartition.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Issuer).interfaceId;
    }
}
