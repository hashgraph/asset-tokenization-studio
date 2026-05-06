// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInitializer } from "./IInitializer.sol";
import { Initializer } from "./Initializer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _INITIALIZER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title InitializerFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes initialisation readiness and function-selector registration.
 * @dev Inherits Initializer implementation and adds IStaticFunctionSelectors support so the
 *   Business Logic Resolver can enumerate this facet's selectors and interface ID.
 */
contract InitializerFacet is Initializer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _INITIALIZER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 8;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.setOperationalStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getOperationalStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getFacetVersionStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getFacetLastVersion.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getLastOperationalVersion.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isOperational.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getConfigInitializedCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getConfigTargetCount.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IInitializer).interfaceId;
    }
}
