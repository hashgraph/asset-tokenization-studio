// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DepositTokenFactory } from "./DepositTokenFactory.sol";
import { IFactory, RESOLVER_KEY_DEPOSIT_TOKEN_FACTORY } from "./IFactory.sol";
import { IStaticFunctionSelectors } from "../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title DepositTokenFactoryFacet
 * @notice Diamond facet exposing the deposit-token deployment entry point under
 *         `RESOLVER_KEY_DEPOSIT_TOKEN_FACTORY` for use as a factory ResolverProxy facet.
 * @dev Inherits all logic from `DepositTokenFactory` unchanged. Split out of `FactoryFacet` so
 *      the deposit-token facet set — which is large — no longer pushes the equity/bond factory
 *      facet past the EIP-170 24 KB deployment limit. Registered alongside `FactoryFacet` in the
 *      same factory configuration; the two facets share no selectors.
 *
 *      DepositTokenFactory is stateless (no storage). Delegatecall from the factory ResolverProxy
 *      is safe: the CREATE performed by `deployDepositToken` executes in the proxy's context, so
 *      the deployed deposit token is owned and funded by the proxy, not a separate factory.
 * @author Asset Tokenization Studio Team
 */
contract DepositTokenFactoryFacet is DepositTokenFactory, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_DEPOSIT_TOKEN_FACTORY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.deployDepositToken.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFactory).interfaceId);
    }
}
