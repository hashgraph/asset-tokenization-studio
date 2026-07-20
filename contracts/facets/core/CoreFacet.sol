// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore, RESOLVER_KEY_CORE } from "./ICore.sol";
import { Core } from "./Core.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title CoreFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet for the Core domain. Registers the 8 selectors that define the base
 *         identity of the token (ERC20 metadata readers, ERC3643 name/symbol setters and version).
 */
contract CoreFacet is Core, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CORE;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeCore.selector,
                this.decimals.selector,
                this.name.selector,
                this.symbol.selector,
                this.getERC20Metadata.selector,
                this.setName.selector,
                this.setSymbol.selector,
                this.version.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICore).interfaceId);
    }
}
