// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IIdentity } from "./IIdentity.sol";
import { Identity } from "./Identity.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _IDENTITY_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title IdentityFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing identity-registry and onchainID configuration via
 *         `IIdentity`, registered under `_IDENTITY_RESOLVER_KEY`.
 * @dev Consolidates `setIdentityRegistry` and `setOnchainID` previously hosted in
 *      `ERC3643ManagementFacet`, and `identityRegistry` and `onchainID` previously hosted
 *      in `ERC3643ReadFacet`. Exposes 4 selectors.
 */
contract IdentityFacet is Identity, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _IDENTITY_RESOLVER_KEY;
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
