// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Initializer } from "../../facets/initializer/Initializer.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _INITIALIZER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";

/**
 * @title MockInitializableFacet
 * @author Asset Tokenization Studio Team
 * @notice Transition mock that replaces InitializerFacet in test BLR configs.
 * @dev Inherits Initializer (which includes AccessControlModifiers and InitializerModifiers),
 *   using _INITIALIZER_RESOLVER_KEY so it occupies the same slot as InitializerFacet.
 *   Exposes 6 selectors: 5 from Initializer (including the new initializeInitializer) +
 *   initializeMockFacet for batch-marking pending resolver keys during the T1.1 transition.
 *   When T1.1 is complete, InitializerFacet replaces this contract transparently.
 */
contract MockInitializableFacet is Initializer, IStaticFunctionSelectors {
    /// @notice Marks multiple facet IDs as ready in a single call (batch helper for tests).
    /// @param facetIds Array of facet IDs to mark as ready.
    /// @dev Only DEFAULT_ADMIN_ROLE can mark facets as ready.
    function initializeMockFacet(bytes32[] calldata facetIds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 len = facetIds.length;
        for (uint256 i; i < len; ) {
            InitializerStorageWrapper.setFacetToReady(facetIds[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Manually triggers setOperationalStatus (helper for tests).
     * @param pageSize Number of facets to process in a single call.
     */
    function setOperationalStatusMocked(uint256 pageSize) external {
        _setOperationalStatus(pageSize);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _INITIALIZER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 7;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initializeMockFacet.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initializeInitializer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setOperationalStatus.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setOperationalStatusMocked.selector;
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
