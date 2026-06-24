// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IIdentity, RESOLVER_KEY_IDENTITY } from "./IIdentity.sol";
import { Identity } from "./Identity.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title IdentityFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing identity-registry and onchainID configuration via
 *         `IIdentity`, registered under `RESOLVER_KEY_IDENTITY`.
 * @dev Hosts the one-shot `initializeIdentity` initialiser, the `setIdentityRegistry` and
 *      `setOnchainID` setters, and the `identityRegistry` and `onchainID` getters previously
 *      hosted in `ERC3643ReadFacet`. Exposes 5 selectors.
 */
contract IdentityFacet is Identity, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_IDENTITY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeIdentity.selector,
                this.setOnchainID.selector,
                this.setIdentityRegistry.selector,
                this.identityRegistry.selector,
                this.onchainID.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IIdentity).interfaceId);
    }
}
