// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore } from "./ICore.sol";
import { Core } from "./Core.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICore).interfaceId);
    }
}
