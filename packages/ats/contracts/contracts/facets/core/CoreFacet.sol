// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore } from "./ICore.sol";
import { Core } from "./Core.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CORE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CoreFacet
 * @notice Diamond facet for the Core domain. Registers the 8 selectors that define the base
 *         identity of the token (ERC20 metadata readers, ERC3643 name/symbol setters and version).
 */
contract CoreFacet is Core, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initializeCore.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.name.selector;
        staticFunctionSelectors_[selectorIndex++] = this.symbol.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getERC20Metadata.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setName.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setSymbol.selector;
        staticFunctionSelectors_[selectorIndex++] = this.version.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ICore).interfaceId;
    }
}
