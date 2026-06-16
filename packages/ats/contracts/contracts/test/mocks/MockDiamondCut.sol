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
import { IDiamond, RESOLVER_KEY_DIAMOND } from "../../infrastructure/proxy/IDiamond.sol";
import { IDiamondCut } from "../../infrastructure/proxy/IDiamondCut.sol";
import { IDiamondLoupe } from "../../infrastructure/proxy/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../../domain/core/KycStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";

/* solhint-disable */

interface IMockDiamondCut {
    function forceNonOperational() external;
    function forceFacetNotRegistered(bytes32 facetKey_) external;
    function forceFacetReady(bytes32 facetKey_) external;
    function forceFacetsReady(bytes32[] calldata facetKeys_) external;
    function forceSetOperational() external;
    function setMultiPartition(bool _multiPartition) external;
    function forceDeactivate() external;
    function forceSecurityFlags(bool n) external;
}

// `IStaticFunctionSelectors` is intentionally not listed: it is already pulled
// in transitively by `IDiamondCut` and `IDiamondLoupe`, and re-declaring it
// here would break C3 linearization. Mirrors `DiamondFacet`'s parent layout
// with one test-only addition: `IMockDiamondCut` (for the mock controls).
contract MockDiamondCut is IDiamond, IDiamondFacet, DiamondCut, DiamondLoupe, InitializerModifiers, IMockDiamondCut {
    function initializeDiamondCut() external onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_DIAMOND) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_DIAMOND);
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

    /// @notice Forces a single facet to READY status (status=1) without running its initialiser.
    /// @dev Uses `InitializerStorageWrapper.setFacetToReady` which reads the current version from
    ///      the BLR and marks status=1 for that `(facetId, version)` pair.
    /// @param facetKey_ The resolver key of the facet to mark ready.
    function forceFacetReady(bytes32 facetKey_) external override {
        InitializerStorageWrapper.setFacetToReady(facetKey_);
    }

    /// @notice Forces a batch of facets to READY status in one call.
    /// @dev Iterates over the supplied array and calls `setFacetToReady` for each entry.
    ///      Intended for the `deployAssetMock` workflow where all facets of a configuration
    ///      must be marked ready before `setOperationalStatus` can succeed.
    /// @param facetKeys_ Array of resolver keys to mark ready.
    function forceFacetsReady(bytes32[] calldata facetKeys_) external override {
        uint256 len = facetKeys_.length;
        for (uint256 i; i < len; ) {
            InitializerStorageWrapper.setFacetToReady(facetKeys_[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Marks the proxy's active configuration as operational without walking the
    ///         facet list. All facets MUST already be in READY status before calling this.
    /// @dev Bypasses the `InitializerStorageWrapper.setOperationalStatus` batch-walk logic
    ///      (which requires `maxInitializerFacetIndex` to have been seeded on the proxy).
    ///      Since `deployAssetMock` force-readies every facet before this call, direct
    ///      status-setting is equivalent and avoids the index-seeding requirement.
    function forceSetOperational() external override {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();
        InitializerStorageWrapper.setConfigVersion(configId, versionId, 1);
    }

    /// @notice Sets the multi-partition mode flag for testing.
    /// @dev Writes directly to `ERC1410BasicStorage.multiPartition` via the storage wrapper,
    ///      the same path used by the production `PartitionsFacet.initializePartitions(bool)`.
    ///      Call this in a migrated suite's `beforeEach` to enable partition-based behaviour
    ///      without re-deploying the asset.
    /// @param _multiPartition `true` to enable multi-partition mode, `false` for single-partition.
    function setMultiPartition(bool _multiPartition) external override {
        ERC1410StorageWrapper.initializeERC1410(_multiPartition);
    }

    /// @notice Forces the asset into deactivated state for testing `Deactivated` guards.
    /// @dev Uses `DeactivateStorageWrapper.deactivate()` — the same storage path as the
    ///      production `Deactivate.deactivate()` facet, without requiring role grants.
    function forceDeactivate() external override {
        DeactivateStorageWrapper.deactivate();
    }

    /// @notice Sets all four security flags (multi-partition, whitelist, internal KYC, protected
    ///         partitions) to a single value in one call.
    /// @dev Each initialiser writes to the same storage slot that the production facet initialiser
    ///      would. On a freshly-snapshot-restored asset (all flags at EVM-default false), calling
    ///      `forceSecurityFlags(true)` is equivalent to having deployed with all four features
    ///      enabled, and `forceSecurityFlags(false)` restores the EVM-default state.
    /// @param n `true` to enable all four security features, `false` to disable them.
    function forceSecurityFlags(bool n) external override {
        ERC1410StorageWrapper.initializeERC1410(n);
        ControlListStorageWrapper.initializeControlList(n);
        KycStorageWrapper.initializeInternalKyc(n);
        ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(n);
    }

    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        // Must return the production `RESOLVER_KEY_DIAMOND` so the BLR
        // registration matches the `atsRegistry.data.ts` entry. The internal
        // initializer uses `_MOCK_DIAMOND_CUT_RESOLVER_KEY` which is what
        // `mockDiamondCutId` in the initializer test checks.
        staticResolverKey_ = RESOLVER_KEY_DIAMOND;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](27);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initializeDiamondCut.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceNonOperational.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceFacetNotRegistered.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceFacetReady.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceFacetsReady.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceSetOperational.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setMultiPartition.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceDeactivate.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forceSecurityFlags.selector;
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
        return Bytes4Builder.build(type(IERC165).interfaceId, type(IMockDiamondCut).interfaceId);
    }
}
/* solhint-enable */
