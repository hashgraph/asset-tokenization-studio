// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410TokenHolder } from "./ERC1410TokenHolder.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1410TokenHolder } from "../../interfaces/ERC1400/IERC1410TokenHolder.sol";
import { _ERC1410_TOKEN_HOLDER_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ERC1410TokenHolderFacet is ERC1410TokenHolder, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_TOKEN_HOLDER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this.transferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.redeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.authorizeOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this.authorizeOperatorByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeOperatorByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.triggerAndSyncAll.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410TokenHolder).interfaceId;
    }
}
