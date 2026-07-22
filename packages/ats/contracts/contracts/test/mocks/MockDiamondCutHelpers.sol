// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// TEST-ONLY: standalone facet carrying the `force*` test controls, appended via
// `TEST_ONLY_EXTRAS` in `scripts/domain/facetEnvironment.ts` ALONGSIDE the real
// production `DiamondFacet` — mirrors the `TimeTravelFacet` pattern. This lets
// `DiamondBase`/`DiamondFacet` be exercised for real in every test fixture,
// instead of being fully substituted by a mock that re-derives its own
// `initializeDiamondCut` from scratch.

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../../domain/core/KycStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../../domain/asset/ERC20VotesStorageWrapper.sol";
import { NominalValueStorageWrapper } from "../../domain/asset/NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { ScheduledTasksLib } from "../../facets/scheduledTasksLib/ScheduledTasksLib.sol";

// keccak256("security.token.standard.mockDiamondCutHelpers.resolverKey")
// solhint-disable-next-line max-line-length
bytes32 constant _MOCK_DIAMOND_CUT_HELPERS_RESOLVER_KEY = 0xa5b023f9f188f3ba68c8758aaaf5ab8080f7660f3e8e5c8c6aed79dfbfd307e7;

/* solhint-disable */

/**
 * @title Mock Diamond Cut Control Interface
 * @notice Defines test-only controls for forcing diamond and facet operational states.
 * @dev Exposes privileged mock hooks intended for test environments, not production use.
 *      Implemented by `MockDiamondCutHelpers`, a standalone facet appended to every test
 *      configuration via `TEST_ONLY_EXTRAS`.
 * @author Asset Tokenization Studio Team
 */
interface IMockDiamondCutHelpers {
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
     * @notice Forces the nominal value state reported by the mock.
     * @dev Mutates nominal-value metadata state directly, bypassing the real facet's
     *      registration guard and role checks entirely.
     * @param _nominalValue New nominal value to store.
     * @param _nominalValueDecimals New nominal value decimal precision to store.
     * @param _nominalValueCurrency New nominal value currency code to store.
     * @param _effectiveDatetime New effective datetime to store.
     * @param _isUnitNominalValue True to mark the nominal value as unit-based, false otherwise.
     */
    function forceSetNominalValue(
        uint256 _nominalValue,
        uint256 _nominalValueDecimals,
        bytes3 _nominalValueCurrency,
        uint256 _effectiveDatetime,
        bool _isUnitNominalValue
    ) external;

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

    /**
     * @notice Adds a cross-ordered scheduled task directly to storage.
     * @dev Bypasses normal task creation flows; intended for coverage of scheduled-task branches.
     * @param timestamp Scheduled execution timestamp for the task.
     * @param taskType The sub-task type encoded into the cross-ordered task data.
     */
    function forceAddCrossOrderedTask(uint256 timestamp, bytes32 taskType) external;

    /**
     * @notice Pops the most recent balance-adjustment sub-task from its queue.
     * @dev Removes the tail entry from the balance-adjustment storage queue.
     */
    function forcePopBalanceAdjustmentSubTask() external;

    /**
     * @notice Adds a raw balance-adjustment sub-task with an arbitrary timestamp.
     * @dev Writes directly to balance-adjustment storage; data encodes `bytes32(0)`.
     * @param timestamp Scheduled execution timestamp for the sub-task.
     */
    function forceAddRawBalanceAdjustmentSubTask(uint256 timestamp) external;

    /**
     * @notice Marks the `MockDiamondCutHelpers` facet as ready.
     * @dev Mirrors `ITimeTravel.initializeTimeTravel()`: called by `MockFactory._deploySecurity`
     *      on factory-deployed test securities so `setOperationalStatus` finds this facet ready,
     *      the same way it does for `TimeTravelFacet`. A no-op wherever facets are instead
     *      force-readied in bulk via `forceFacetsReady` (e.g. `deployAssetMock`).
     */
    function initializeMockDiamondCutHelpers() external;
}

/**
 * @title Mock Diamond Cut Helpers Facet
 * @notice TEST-ONLY facet exposing the `force*` state-forcing controls consumed by the test
 *         suite through `IAssetMock`/`IMockDiamondCutHelpers`.
 * @dev Registered under its own resolver key via `TEST_ONLY_EXTRAS`, appended to every test
 *      configuration alongside the real, unmodified `DiamondFacet` — never substituting it.
 *      Carries `initializeMockDiamondCutHelpers`, called explicitly by `MockFactory._deploySecurity`
 *      for factory-deployed test securities (mirroring `TimeTravelFacet.initializeTimeTravel`);
 *      elsewhere (e.g. `deployAssetMock`) facet readiness is forced in bulk via `forceFacetsReady`.
 * @author Asset Tokenization Studio Team
 */
contract MockDiamondCutHelpers is IStaticFunctionSelectors, IMockDiamondCutHelpers {
    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Marks this facet ready under its own resolver key; called explicitly by
    ///      `MockFactory._deploySecurity` for factory-deployed test securities, mirroring
    ///      `TimeTravelFacet.initializeTimeTravel()`.
    function initializeMockDiamondCutHelpers() external override {
        InitializerStorageWrapper.setFacetToReady(_MOCK_DIAMOND_CUT_HELPERS_RESOLVER_KEY);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes status `0` for the active resolver proxy configuration and version.
    function forceNonOperational() external override {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        InitializerStorageWrapper.setConfigVersion(configId, versionId, 0);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Resolves the current facet version through the business logic resolver and resets
    ///      both its version status and last-version pointer.
    function forceFacetNotRegistered(bytes32 _facetKey) external override {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        uint256 facetVersionId = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(configId, versionId, _facetKey);
        InitializerStorageWrapper.setFacetStatusForVersion(_facetKey, facetVersionId, 0);
        InitializerStorageWrapper.setFacetLastVersionTo(_facetKey, 0);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Marks the facet ready for the version resolved from the business logic resolver.
    function forceFacetReady(bytes32 _facetKey) external override {
        InitializerStorageWrapper.setFacetToReady(_facetKey);
    }

    /// @inheritdoc IMockDiamondCutHelpers
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

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes status `1` for the active resolver proxy configuration and version without
    ///      walking the configured facet list. The caller is responsible for ensuring every
    ///      required facet has already been marked ready.
    function forceSetOperational() external override {
        (bytes32 configId, uint256 versionId) = ResolverProxyStorageWrapper.getResolverProxyConfigurationIdAndVersion();

        InitializerStorageWrapper.setConfigVersion(configId, versionId, 1);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes the ERC-1410 multi-partition flag through the same storage wrapper used by
    ///      the production partitions initialiser.
    function setMultiPartition(bool _multiPartition) external override {
        ERC1410StorageWrapper.initializeERC1410(_multiPartition);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Uses the production deactivation storage wrapper and bypasses role checks.
    function forceDeactivate() external override {
        DeactivateStorageWrapper.deactivate();
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Sets ERC-1410 multi-partition, control-list mode, internal KYC, and protected
    ///      partition flags to the same value through their production storage wrappers.
    function forceSecurityFlags(bool _newSecurityFlags) external override {
        ERC1410StorageWrapper.initializeERC1410(_newSecurityFlags);
        ControlListStorageWrapper.initializeControlList(_newSecurityFlags);
        KycStorageWrapper.initializeInternalKyc(_newSecurityFlags);
        ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(_newSecurityFlags);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes the ERC-1644 controller activation flag through the controller storage
    ///      wrapper without invoking the production facet initialiser.
    function forceControllable(bool _newControllable) external override {
        ERC1644StorageWrapper.initializeController(_newControllable);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Updates only the ERC-20 decimal count and does not mutate token name, symbol, or
    ///      scheduled-task state.
    function forceDecimals(uint8 _newDecimals) external override {
        ERC20StorageWrapper.setDecimals(_newDecimals);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes the nominal value fields directly through `NominalValueStorageWrapper`,
    ///      bypassing the real facet's registration guard and role checks entirely.
    function forceSetNominalValue(
        uint256 _nominalValue,
        uint256 _nominalValueDecimals,
        bytes3 _nominalValueCurrency,
        uint256 _effectiveDatetime,
        bool _isUnitNominalValue
    ) external override {
        NominalValueStorageWrapper.initializeNominalValue(
            _nominalValue,
            _nominalValueDecimals,
            _nominalValueCurrency,
            _effectiveDatetime,
            _isUnitNominalValue
        );
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes the ERC20Votes activation flag directly through the votes storage wrapper.
    function forceErc20VotesActivated(bool _newActivated) external override {
        ERC20VotesStorageWrapper.setActivate(_newActivated);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Writes the control-list type flag directly; `true` represents whitelist mode and
    ///      `false` represents blacklist mode.
    function forceWhitelist(bool _newWhiteList) external override {
        ControlListStorageWrapper.initializeControlList(_newWhiteList);
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Encodes the task type and inserts it into cross-ordered task storage via the lib.
    function forceAddCrossOrderedTask(uint256 timestamp, bytes32 taskType) external override {
        ScheduledTasksLib.addScheduledTask(
            ScheduledTasksStorageWrapper._scheduledCrossOrderedTaskStorage(),
            timestamp,
            abi.encode(taskType)
        );
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Removes the tail entry from balance-adjustment storage via the lib.
    function forcePopBalanceAdjustmentSubTask() external override {
        ScheduledTasksLib.popScheduledTask(ScheduledTasksStorageWrapper._scheduledBalanceAdjustmentStorage());
    }

    /// @inheritdoc IMockDiamondCutHelpers
    /// @dev Inserts a balance-adjustment sub-task with `bytes32(0)` data at the given timestamp.
    function forceAddRawBalanceAdjustmentSubTask(uint256 timestamp) external override {
        ScheduledTasksLib.addScheduledTask(
            ScheduledTasksStorageWrapper._scheduledBalanceAdjustmentStorage(),
            timestamp,
            abi.encode(bytes32(0))
        );
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Returns this facet's own resolver key, distinct from `RESOLVER_KEY_DIAMOND`.
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MOCK_DIAMOND_CUT_HELPERS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev `initializeMockDiamondCutHelpers` plus the 16 `force*`/`setMultiPartition` mock-control
    ///      selectors, with no diamond cut, loupe, or ERC-165 selectors — those belong to the real
    ///      `DiamondFacet` now.
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorsIndex = 17;
        staticFunctionSelectors_ = new bytes4[](selectorsIndex);
        unchecked {
            staticFunctionSelectors_[--selectorsIndex] = this.initializeMockDiamondCutHelpers.selector;
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
            staticFunctionSelectors_[--selectorsIndex] = this.forceSetNominalValue.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceErc20VotesActivated.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceWhitelist.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceAddCrossOrderedTask.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forcePopBalanceAdjustmentSubTask.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.forceAddRawBalanceAdjustmentSubTask.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Advertises only the mock diamond cut helpers interface; ERC-165/loupe support is
    ///      owned by the real `DiamondFacet` registered alongside this facet.
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IMockDiamondCutHelpers).interfaceId);
    }
}
/* solhint-enable */
