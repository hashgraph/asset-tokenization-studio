// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "./Factory.sol";
import { IFactory } from "./IFactory.sol";
import { IStaticFunctionSelectors } from "../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _FACTORY_RESOLVER_KEY } from "../constants/resolverKeys.sol";

/**
 * @title FactoryFacet
 * @notice Diamond facet that exposes all Factory selectors under a single
 *         `_FACTORY_RESOLVER_KEY` for use as a ResolverProxy facet.
 * @dev Inherits all logic from `Factory` unchanged. Adds only the
 *      `IStaticFunctionSelectors` triplet required by the Diamond proxy for
 *      selector registration in the BusinessLogicResolver.
 *
 *      Factory is stateless (no storage). Delegatecall from ResolverProxy is safe: all
 *      CREATE operations (deployProxy, deployEquity, etc.) execute in the proxy's context,
 *      so created contracts are correctly owned and funded by the proxy, not a separate
 *      factory contract. This is the intended behaviour for a factory-as-proxy pattern.
 */
contract FactoryFacet is Factory, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FACTORY_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 7;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.deployProxy.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deployEquity.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deployBond.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deployBondFixedRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deployBondKpiLinkedRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deployBondSustainabilityPerformanceTargetRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAppliedRegulationData.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IFactory).interfaceId;
        }
    }
}
