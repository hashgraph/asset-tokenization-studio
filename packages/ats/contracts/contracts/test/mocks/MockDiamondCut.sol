// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// TEST-ONLY: mock variant of `DiamondFacet` used by the InitializeMock domain.
// Inherits the same `DiamondCut` + `DiamondLoupe` bases that production
// `DiamondFacet` does — provides a mock-style `initializeDiamondCut()` that
// overrides the production one. It carries the `onlyFacetNotRegistered`
// modifier and simply marks itself ready by calling `setFacetToReady`.
// It carries its own resolver key, `_MOCK_DIAMOND_CUT_RESOLVER_KEY =
// bytes32("MockDiamondCut")`, which is distinct from the production
// `_DIAMOND_RESOLVER_KEY`. This matches the `mockDiamondCutId` constant
// in the initializer test so facet-version-status assertions resolve to
// the correct storage slot.

import { IDiamondFacet } from "../../infrastructure/diamond/IDiamondFacet.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { DiamondCut } from "../../infrastructure/diamond/DiamondCut.sol";
import { DiamondLoupe } from "../../infrastructure/diamond/DiamondLoupe.sol";
import { IDiamond } from "../../infrastructure/proxy/IDiamond.sol";
import { IDiamondCut } from "../../infrastructure/proxy/IDiamondCut.sol";
import { IDiamondLoupe } from "../../infrastructure/proxy/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { _DIAMOND_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/* solhint-disable */

interface IMockDiamondCut {
    function forceNonOperational() external;
    function forceFacetNotRegistered(bytes32 facetKey_) external;
}

// `IStaticFunctionSelectors` is intentionally not listed: it is already pulled
// in transitively by `IDiamondCut` and `IDiamondLoupe`, and re-declaring it
// here would break C3 linearization. Mirrors `DiamondFacet`'s parent layout
// with one test-only addition: `IMockDiamondCut` (for the mock controls).
contract MockDiamondCut is IDiamond, IDiamondFacet, DiamondCut, DiamondLoupe, InitializerModifiers, IMockDiamondCut {
    function initializeDiamondCut()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_DIAMOND_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_DIAMOND_RESOLVER_KEY);
        emit DiamondCutInitialized();
    }

    /// @notice Forces the asset to non-operational state for testing onlyOperational guards.
    /// @dev Uses InitializerStorageWrapper.setConfigVersion to write 0 to the status slot.
    function forceNonOperational() external override {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();
        InitializerStorageWrapper.setConfigVersion(configId, versionId, 0);
    }

    /// @notice Forces a facet's version status to 0 (not started) for testing.
    /// @param facetKey_ The resolver key of the facet to reset.
    function forceFacetNotRegistered(bytes32 facetKey_) external override {
        uint256 v = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                facetKey_
            );
        InitializerStorageWrapper.setFacetStatusForVersion(facetKey_, v, 0);
        InitializerStorageWrapper.setFacetLastVersionTo(facetKey_, 0);
    }

    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        // Must return the production `_DIAMOND_RESOLVER_KEY` so the BLR
        // registration matches the `atsRegistry.data.ts` entry. The internal
        // initializer uses `_MOCK_DIAMOND_CUT_RESOLVER_KEY` which is what
        // `mockDiamondCutId` in the initializer test checks.
        staticResolverKey_ = _DIAMOND_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](21);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initializeDiamondCut.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceNonOperational.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceFacetNotRegistered.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfigVersion.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfig.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateResolver.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getConfigInfo.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacets.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectors.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIds.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddresses.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddressesByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdBySelector.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacet.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddress.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.supportsInterface.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IMockDiamondCut).interfaceId);
    }
}
/* solhint-enable */
