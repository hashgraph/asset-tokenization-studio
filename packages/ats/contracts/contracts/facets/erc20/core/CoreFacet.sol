// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore } from "./ICore.sol";
import { Core } from "./Core.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CORE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title CoreFacet
 * @notice Facet shell exposing Core functionality via Diamond proxy pattern
 * @dev Registers 8 function selectors and Core interface ID with resolver
 * @author Asset Tokenization Studio Team
 */
contract CoreFacet is Core, IStaticFunctionSelectors {
    /**
     * @notice Returns array of function selectors exposed by Core facet
     * @return staticFunctionSelectors_ Array of 8 selectors (initializeCore, name, symbol, decimals,
     *         getERC20Metadata, version, setName, setSymbol)
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initializeCore.selector;
        staticFunctionSelectors_[selectorIndex++] = this.name.selector;
        staticFunctionSelectors_[selectorIndex++] = this.symbol.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getERC20Metadata.selector;
        staticFunctionSelectors_[selectorIndex++] = this.version.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setName.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setSymbol.selector;
    }

    /**
     * @notice Returns array of interface IDs supported by Core facet
     * @return staticInterfaceIds_ Array containing ICore interface ID
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ICore).interfaceId;
    }

    /**
     * @notice Returns the resolver key for Core facet
     * @return staticResolverKey_ The Core resolver key
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORE_RESOLVER_KEY;
    }
}
