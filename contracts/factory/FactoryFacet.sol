// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "./Factory.sol";
import { IFactory, RESOLVER_KEY_FACTORY } from "./IFactory.sol";
import { IStaticFunctionSelectors } from "../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title FactoryFacet
 * @notice Diamond facet that exposes all Factory selectors under a single
 *         `RESOLVER_KEY_FACTORY` for use as a ResolverProxy facet.
 * @dev Inherits all logic from `Factory` unchanged. Adds only the
 *      `IStaticFunctionSelectors` triplet required by the Diamond proxy for
 *      selector registration in the BusinessLogicResolver.
 *
 *      Factory is stateless (no storage). Delegatecall from ResolverProxy is safe: all
 *      CREATE operations (deployProxy, deployEquity, etc.) execute in the proxy's context,
 *      so created contracts are correctly owned and funded by the proxy, not a separate
 *      factory contract. This is the intended behaviour for a factory-as-proxy pattern.
 * @author Asset Tokenization Studio Team
 */
contract FactoryFacet is Factory, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_FACTORY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.getAppliedRegulationData.selector,
                this.deployBond.selector,
                this.deployEquity.selector,
                this.deployProxy.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFactory).interfaceId);
    }
}
