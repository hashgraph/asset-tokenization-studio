// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IIdentity } from "./IIdentity.sol";
import { Identity } from "./Identity.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.onchainID.selector;
            staticFunctionSelectors_[--selectorIndex] = this.identityRegistry.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setIdentityRegistry.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setOnchainID.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IIdentity).interfaceId;
    }
}
