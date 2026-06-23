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
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
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

/**
 * @title Mock Diamond Cut Control Interface
 * @notice Defines test-only controls for forcing diamond and facet operational states.
 * @dev Exposes privileged mock hooks intended for test environments, not production use.
 * @author Asset Tokenization Studio Team
 */
interface IMockDiamondCut {
    /**
     * @notice Forces the diamond into a non-operational state.
     * @dev Mutates operational status and may cause operational guards to reject calls.
     */
    function forceNonOperational() external;

    /**
     * @notice Forces a facet to be treated as not registered.
     * @dev Mutates mock facet registration state for the supplied facet key.
     * @param _facetKey Unique identifier of the facet whose registration is forced.
     */
    function forceFacetNotRegistered(bytes32 _facetKey) external;

    /**
     * @notice Forces a facet to be treated as ready.
     * @dev Mutates mock facet readiness state for the supplied facet key.
     * @param _facetKey Unique identifier of the facet whose readiness is forced.
     */
    function forceFacetReady(bytes32 _facetKey) external;

    /**
     * @notice Forces multiple facets to be treated as ready.
     * @dev Mutates mock facet readiness state for each supplied facet key.
     * @param _facetKeys Unique identifiers of the facets whose readiness is forced.
     */
    function forceFacetsReady(bytes32[] calldata _facetKeys) external;

    /**
     * @notice Forces the diamond into an operational state.
     * @dev Mutates operational status and may allow calls protected by operational guards.
     */
    function forceSetOperational() external;

    /**
     * @notice Sets whether multi-partition behaviour is enabled in the mock state.
     * @dev Mutates the mock partition configuration used by dependent test flows.
     * @param _nreMultiPartition True to enable multi-partition behaviour, false otherwise.
     */
    function setMultiPartition(bool _nreMultiPartition) external;

    /**
     * @notice Forces the diamond or token mock into a deactivated state.
     * @dev Mutates activation state and may cause active-state guards to reject calls.
     */
    function forceDeactivate() external;

    /**
     * @notice Forces the security flag state used by the mock.
     * @dev Mutates security-related state consumed by tests exercising guarded paths.
     * @param _newSecurityFlags New security flag value to apply.
     */
    function forceSecurityFlags(bool _newSecurityFlags) external;

    /**
     * @notice Forces whether the mock is controllable.
     * @dev Mutates controllability state used by control-related validations.
     * @param _newIsControlable True to mark the mock as controllable, false otherwise.
     */
    function forceControllable(bool _newIsControlable) external;

    /**
     * @notice Forces the decimal precision reported by the mock.
     * @dev Mutates token metadata state and affects consumers relying on decimals.
     * @param _newDecimals New decimal precision to expose.
     */
    function forceDecimals(uint8 _newDecimals) external;

    /**
     * @notice Forces whether ERC20Votes-related behaviour is activated.
     * @dev Mutates mock governance capability state for vote-related test scenarios.
     * @param _newActivated True to activate ERC20Votes behaviour, false otherwise.
     */
    function forceErc20VotesActivated(bool _newActivated) external;

    /**
     * @notice Forces whether whitelist enforcement is enabled.
     * @dev Mutates whitelist configuration used by tests covering restricted transfers.
     * @param _newWhitelist True to enable whitelist behaviour, false otherwise.
     */
    function forceWhitelist(bool _newWhitelist) external;
}

/**
 * @title Mock Diamond Cut Facet
 * @notice Provides diamond configuration operations and test-only state forcing helpers.
 * @dev Extends the production diamond cut and loupe behaviour with mock controls that write
 *      directly to facet, configuration, security, deactivation, and token feature storage.
 *      These helpers are intended for tests and bypass normal initialisation and role flows.
 * @author Hashgraph
 */
contract MockDiamondCut is IDiamond, IDiamondFacet, DiamondCut, DiamondLoupe, InitializerModifiers, IMockDiamondCut {
    /**
     * @notice Marks the diamond cut facet as initialised for the active resolver key.
     * @dev Requires the caller to hold the default admin role and the diamond facet not to
     *      be registered already. Mutates initialiser storage and emits
     *      `DiamondCutInitialized`.
     */
    function initializeDiamondCut() external onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_DIAMOND) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_DIAMOND);
        emit DiamondCutInitialized();
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes status `0` for the active resolver proxy configuration and version.
    function forceNonOperational() external override {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion();
        InitializerStorageWrapper.setConfigVersion(configId, versionId, 0);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Resolves the current facet version through the business logic resolver and resets
    ///      both its version status and last-version pointer.
    function forceFacetNotRegistered(bytes32 _facetKey) external override {
        uint256 versionId = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
                _facetKey
            );
        InitializerStorageWrapper.setFacetStatusForVersion(_facetKey, versionId, 0);
        InitializerStorageWrapper.setFacetLastVersionTo(_facetKey, 0);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Marks the facet ready for the version resolved from the business logic resolver.
    function forceFacetReady(bytes32 _facetKey) external override {
        InitializerStorageWrapper.setFacetToReady(_facetKey);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Iterates over all supplied facet keys and marks each current facet version ready.
    function forceFacetsReady(bytes32[] calldata _facetKeys) external override {
        uint256 length = _facetKeys.length;
        for (uint256 index; index < length; ) {
            InitializerStorageWrapper.setFacetToReady(_facetKeys[index]);
            unchecked {
                ++index;
            }
        }
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes status `1` for the active resolver proxy configuration and version without
    ///      walking the configured facet list. The caller is responsible for ensuring every
    ///      required facet has already been marked ready.
    function forceSetOperational() external override {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion();
        InitializerStorageWrapper.setConfigVersion(configId, versionId, 1);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes the ERC-1410 multi-partition flag through the same storage wrapper used by
    ///      the production partitions initialiser.
    function setMultiPartition(bool _multiPartition) external override {
        ERC1410StorageWrapper.initializeERC1410(_multiPartition);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Uses the production deactivation storage wrapper and bypasses role checks.
    function forceDeactivate() external override {
        DeactivateStorageWrapper.deactivate();
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Sets ERC-1410 multi-partition, control-list mode, internal KYC, and protected
    ///      partition flags to the same value through their production storage wrappers.
    function forceSecurityFlags(bool _newSecurityFlags) external override {
        ERC1410StorageWrapper.initializeERC1410(_newSecurityFlags);
        ControlListStorageWrapper.initializeControlList(_newSecurityFlags);
        KycStorageWrapper.initializeInternalKyc(_newSecurityFlags);
        ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(_newSecurityFlags);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes the ERC-1644 controller activation flag through the controller storage
    ///      wrapper without invoking the production facet initialiser.
    function forceControllable(bool _newControllable) external override {
        ERC1644StorageWrapper.initializeController(_newControllable);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Updates only the ERC-20 decimal count and does not mutate token name, symbol, or
    ///      scheduled-task state.
    function forceDecimals(uint8 _newDecimals) external override {
        ERC20StorageWrapper.setDecimals(_newDecimals);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes the ERC20Votes activation flag directly through the votes storage wrapper.
    function forceErc20VotesActivated(bool _newActivated) external override {
        ERC20VotesStorageWrapper.setActivate(_newActivated);
    }

    /// @inheritdoc IMockDiamondCut
    /// @dev Writes the control-list type flag directly; `true` represents whitelist mode and
    ///      `false` represents blacklist mode.
    function forceWhitelist(bool _newWhiteList) external override {
        ControlListStorageWrapper.initializeControlList(_newWhiteList);
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Returns the production diamond resolver key so registry lookups match the deployed
    ///      diamond cut facet entry.
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        // Must return the production `RESOLVER_KEY_DIAMOND` so the BLR
        // registration matches the `atsRegistry.data.ts` entry. The internal
        // initializer uses `_MOCK_DIAMOND_CUT_RESOLVER_KEY` which is what
        // `mockDiamondCutId` in the initializer test checks.
        staticResolverKey_ = RESOLVER_KEY_DIAMOND;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Includes the mock helper selectors together with inherited diamond cut, loupe, and
    ///      ERC-165 selectors expected to be registered for this test facet.
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
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

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Advertises ERC-165 and the mock diamond cut interface for static registration.
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IERC165).interfaceId, type(IMockDiamondCut).interfaceId);
    }
}
/* solhint-enable */
