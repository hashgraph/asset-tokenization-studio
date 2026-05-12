// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInitializer } from "./IInitializer.sol";
import { Initializer } from "./Initializer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _INITIALIZER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title InitializerFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the initialisation lifecycle via static function selectors
 *   for the five core IInitializer functions.
 * @dev Registers the resolver key and function selectors required by the diamond's
 *   static-selector routing.  `initializeFacet(bytes32)` was removed from this facet in
 *   Phase 1 — stateless facets are auto-approved by `setOperationalStatus` (D1-A).
 */
contract InitializerFacet is Initializer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _INITIALIZER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 5;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initializeInitializer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setOperationalStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getOperationalStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getFacetVersionStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getFacetLastVersion.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IInitializer).interfaceId;
    }
}
