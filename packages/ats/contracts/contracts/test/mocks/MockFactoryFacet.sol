// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { MockFactory } from "./MockFactory.sol";
import { IFactory, RESOLVER_KEY_FACTORY } from "../../factory/IFactory.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title Mock Factory Facet
 * @notice Test facet exposing factory static metadata for resolver-based diamond registration.
 * @dev Provides the resolver key, function selectors, and interface identifiers required by
 *      the static resolver infrastructure. The facet is intended for mock deployments and
 *      inherits factory behaviour from the mock factory base used in tests.
 * @author Asset Tokenization Studio Team
 */
contract MockFactoryFacet is MockFactory, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_FACTORY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.getAppliedRegulationData.selector,
                this.deployBondKpiLinkedRate.selector,
                this.deployBondFixedRate.selector,
                this.deployBond.selector,
                this.deployEquity.selector,
                this.deployDepositToken.selector,
                this.deployProxy.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFactory).interfaceId);
    }
}
