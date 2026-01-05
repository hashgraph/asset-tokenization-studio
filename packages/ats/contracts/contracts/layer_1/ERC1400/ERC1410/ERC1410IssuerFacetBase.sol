// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IERC1410Issuer } from "../../interfaces/ERC1400/IERC1410Issuer.sol";
import { ERC1410Issuer } from "./ERC1410Issuer.sol";

abstract contract ERC1410IssuerFacetBase is IStaticFunctionSelectors, ERC1410Issuer {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        uint256 selectorIndex = 0;
        // Issue function
        staticFunctionSelectors_[selectorIndex++] = this.issueByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Issuer).interfaceId;
    }
}
