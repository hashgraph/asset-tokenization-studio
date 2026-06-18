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
import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../../domain/core/KycStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../../domain/asset/ERC20VotesStorageWrapper.sol";

/* solhint-disable */

interface IMockDiamondCut {
    function forceNonOperational() external;
    function forceFacetNotRegistered(bytes32 _facetKey) external;
    function forceFacetReady(bytes32 _facetKey) external;
    function forceFacetsReady(bytes32[] calldata _facetKeys) external;
    function forceSetOperational() external;
    function setMultiPartition(bool _nreMultiPartition) external;
    function forceDeactivate() external;
    function forceSecurityFlags(bool _newSecurityFlags) external;
    function forceControllable(bool _newIsControlable) external;
    function forceDecimals(uint8 _newDecimals) external;
    function forceErc20VotesActivated(bool _newActivate) external;
    function forceWhitelist(bool _newWhitelist) external;
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
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion();
        InitializerStorageWrapper.setConfigVersion(configId, versionId, 0);
    }

    /// @notice Forces a facet's version status to 0 (not started) for testing.
    /// @param _facetKey The resolver key of the facet to reset.
    function forceFacetNotRegistered(bytes32 _facetKey) external override {
        uint256 v = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
                _facetKey
            );
        InitializerStorageWrapper.setFacetStatusForVersion(_facetKey, v, 0);
        InitializerStorageWrapper.setFacetLastVersionTo(_facetKey, 0);
    }

    /// @notice Forces a single facet to READY status (status=1) without running its initialiser.
    /// @dev Uses `InitializerStorageWrapper.setFacetToReady` which reads the current version from
    ///      the BLR and marks status=1 for that `(facetId, version)` pair.
    /// @param _facetKey The resolver key of the facet to mark ready.
    function forceFacetReady(bytes32 _facetKey) external override {
        InitializerStorageWrapper.setFacetToReady(_facetKey);
    }

    /// @notice Forces a batch of facets to READY status in one call.
    /// @dev Iterates over the supplied array and calls `setFacetToReady` for each entry.
    ///      Intended for the `deployAssetMock` workflow where all facets of a configuration
    ///      must be marked ready before `setOperationalStatus` can succeed.
    /// @param _facetKeys Array of resolver keys to mark ready.
    function forceFacetsReady(bytes32[] calldata _facetKeys) external override {
        uint256 len = _facetKeys.length;
        for (uint256 i; i < len; ) {
            InitializerStorageWrapper.setFacetToReady(_facetKeys[i]);
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
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion();
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
    /// @param _newSecurityFlags `true` to enable all four security features, `false` to disable them.
    function forceSecurityFlags(bool _newSecurityFlags) external override {
        ERC1410StorageWrapper.initializeERC1410(_newSecurityFlags);
        ControlListStorageWrapper.initializeControlList(_newSecurityFlags);
        KycStorageWrapper.initializeInternalKyc(_newSecurityFlags);
        ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(_newSecurityFlags);
    }

    /// @notice Forces the ERC-1644 controllable flag for testing without running the facet
    ///         initialiser.
    /// @dev Calls `ERC1644StorageWrapper.initializeController` — the same storage path used by
    ///      the production `Controller.initializeController` facet.
    /// @param _newControllable `true` to enable controllable transfers, `false` to disable them.
    function forceControllable(bool _newControllable) external override {
        ERC1644StorageWrapper.initializeController(_newControllable);
    }

    /// @notice Forces the ERC-20 decimal count for testing without running the facet
    ///         initialiser.
    /// @dev Delegates to `ERC20StorageWrapper.setDecimals` which writes through the
    ///      private `erc20Storage()` struct accessor — the same layout-independent path
    ///      the production `CoreFacet.initializeERC20` uses via `ERC20StorageWrapper`.
    ///      Unlike `initializeERC20`, this does NOT trigger `ScheduledTasksOps` or
    ///      overwrite name/symbol, making it safe alongside snapshot scheduled-tasks tests.
    /// @param _newDecimals The decimal count to set (e.g. 6 for the standard equity token value).
    function forceDecimals(uint8 _newDecimals) external override {
        ERC20StorageWrapper.setDecimals(_newDecimals);
    }

    /// @notice Forces the ERC20Votes activation flag for testing without running the facet initialiser.
    /// @dev Delegates to ERC20VotesStorageWrapper.setActivate, which writes the activation flag through the
    ///      ERC20Votes storage struct (layout-independent). The production flag is set only at
    ///      initializeERC20Votes time with no runtime toggle, so this mirrors the deploy-time state directly.
    /// @param _newActivated true to activate ERC20Votes, false to deactivate.
    function forceErc20VotesActivated(bool _newActivated) external override {
        ERC20VotesStorageWrapper.setActivate(_newActivated);
    }

    /// @notice Forces the control-list type (whitelist vs blacklist) for testing without running the facet
    ///         initialiser. true = whitelist mode, false = blacklist mode.
    /// @dev Delegates to ControlListStorageWrapper.initializeControlList, which sets only the control-list
    ///      type flag through the storage struct. The production flag is set once at initializeControlList
    ///      time with no runtime toggle, so this mirrors the deploy-time state.
    function forceWhitelist(bool _newWhiteList) external override {
        ControlListStorageWrapper.initializeControlList(_newWhiteList);
    }

    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        // Must return the production `RESOLVER_KEY_DIAMOND` so the BLR
        // registration matches the `atsRegistry.data.ts` entry. The internal
        // initializer uses `_MOCK_DIAMOND_CUT_RESOLVER_KEY` which is what
        // `mockDiamondCutId` in the initializer test checks.
        staticResolverKey_ = RESOLVER_KEY_DIAMOND;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorsIndex = 31;
        staticFunctionSelectors_ = new bytes4[](selectorsIndex);
        unchecked {
            staticFunctionSelectors_[--selectorsIndex] = this.initializeDiamondCut.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceNonOperational.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceFacetNotRegistered.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceFacetReady.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceFacetsReady.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceSetOperational.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.setMultiPartition.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceDeactivate.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceSecurityFlags.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceControllable.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceDecimals.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceErc20VotesActivated.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceWhitelist.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateConfigVersion.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateConfig.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateResolver.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getConfigInfo.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacets.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetsLength.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectors.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectorsLength.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectorsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIds.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIdsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddresses.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddressesByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIdBySelector.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacet.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddress.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.supportsInterface.selector;
        }
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IERC165).interfaceId, type(IMockDiamondCut).interfaceId);
    }
}
/* solhint-enable */
