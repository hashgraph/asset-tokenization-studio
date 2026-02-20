// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410Issuer } from "./ERC1410Issuer.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1410Issuer } from "../../interfaces/ERC1400/IERC1410Issuer.sol";
import { _ERC1410_ISSUER_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ERC1410IssuerFacet is ERC1410Issuer, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_ISSUER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this.issueByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Issuer).interfaceId;
    }
}
