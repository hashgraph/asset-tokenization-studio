// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { IDiamondCutManager } from "./IDiamondCutManager.sol";
import { BusinessLogicResolverWrapper } from "./BusinessLogicResolverWrapper.sol";
import { IStaticFunctionSelectors } from "../proxy/IStaticFunctionSelectors.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";
import { Ownership } from "./Ownership.sol";
import { EvmAccessors } from "../utils/EvmAccessors.sol";
import { IResolverProxy } from "../../infrastructure/proxy/IResolverProxy.sol";
import { RESOLVER_PROXY_VERSION_V2, RESOLVER_PROXY_CONFIGURATION_MINIMUM_LENGTH } from "../../constants/values.sol";

/**
 * @dev Must remain stable across upgrades to preserve the diamond storage layout.
 */
/// @custom:hash storage DiamondCutManager
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_DIAMOND_CUT_MANAGER = 0xc9161810d6144bfe5b28041c8a23ceedf202e65acda5c323c5b387259e601000;

/**
 * @notice Diamond storage backing the diamond-cut manager configuration registry.
 * @dev Indexes configurations, their versions, and the per-version facet, selector and
 *      interface resolution maps used when cutting a resolver proxy. Hoisted to file scope
 *      per the project's ERC-7201 storage convention; new fields must be appended below
 *      the append-only marker to preserve upgrade safety.
 * @param configurations Active configuration identifiers in insertion order.
 * @param activeConfigurations Whether a configuration identifier is active.
 * @param latestVersion Latest activated version for each configuration.
 * @param batchVersion Draft version currently being assembled for each configuration.
 * @param facetIds Facet identifiers registered for each configuration version hash.
 * @param facetVersions Facet versions aligned by index with `facetIds`.
 * @param facetIdPosition One-based facet position within a configuration version.
 * @param facetAddress Facet implementation address resolved by selector hash.
 * @param addr Facet implementation address resolved by facet identifier hash.
 * @param selectors Function selectors exposed by each facet in a configuration version.
 * @param selectorToFacetId Facet identifier resolved by selector hash.
 * @param interfaceIds Interface identifiers exposed by each facet.
 * @param supportsInterface Whether an interface identifier is supported by a version.
 * @custom:storage-location erc7201:security.token.standard.storage.DiamondCutManager
 */
struct DiamondCutManagerStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    bytes32[] configurations;
    mapping(bytes32 => bool) activeConfigurations;
    mapping(bytes32 => uint256) latestVersion;
    mapping(bytes32 => uint256) batchVersion;
    // keccak256(configurationId, version)
    mapping(bytes32 => bytes32[]) facetIds;
    // keccak256(configurationId, version)
    mapping(bytes32 => uint256[]) facetVersions;
    //keccak256(configurationId, version, facetId)
    mapping(bytes32 => uint256) facetIdPosition;
    // keccak256(configurationId, version, selector)
    mapping(bytes32 => address) facetAddress;
    // keccak256(configurationId, version, facetId)
    mapping(bytes32 => address) addr;
    // keccak256(configurationId, version, facetId)
    mapping(bytes32 => bytes4[]) selectors;
    // keccak256(configurationId, version, selector)
    mapping(bytes32 => bytes32) selectorToFacetId;
    // keccak256(configurationId, version, facetId)
    mapping(bytes32 => bytes4[]) interfaceIds;
    // keccak256(configurationId, version, interfaceId)
    mapping(bytes32 => bool) supportsInterface;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title Diamond Cut Manager Wrapper
 * @notice Provides internal helpers for registering and querying diamond configurations.
 * @dev Manages versioned facet configurations used by resolver proxies. The wrapper
 *      resolves facet implementations through the business-logic resolver and records
 *      selector and interface lookup tables for efficient runtime dispatch.
 * @author Asset Tokenization Studio Team
 */
abstract contract DiamondCutManagerWrapper is IDiamondCutManager, Ownership, BusinessLogicResolverWrapper {
    /**
     * @notice Requires an explicit non-zero configuration version.
     * @dev Reverts with `VersionZero` when `_version` is zero.
     * @param _configurationId Identifier of the configuration being validated.
     * @param _version Configuration version that must be non-zero.
     */
    modifier onlyValidConfigurationVersion(bytes32 _configurationId, uint256 _version) {
        _checkExplicitVersion(_configurationId, _version);
        _;
    }

    /**
     * @notice Creates and activates a complete configuration in a single batch.
     * @dev Reverts if the configuration already has an ongoing batch. Resolves facet
     *      implementations, registers selectors and interfaces, and activates the version.
     * @param _configurationId Identifier of the configuration to create.
     * @param _facetConfigurations Facet identifiers and versions to register.
     * @return latestVersion_ Version activated for the created configuration.
     */
    function _createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) internal returns (uint256 latestVersion_) {
        if (_isOngoingConfiguration(_configurationId)) revert OngoingBatchConfigurationNotPermitted(_configurationId);
        latestVersion_ = _startBatchConfiguration(_configurationId);
        _addFacetsToBatchConfiguration(_configurationId, _facetConfigurations, latestVersion_);
        _activateConfiguration(_configurationId, true);
    }

    /**
     * @notice Creates or extends a batched configuration and optionally activates it.
     * @dev Reuses an existing draft version when present, otherwise starts the next version.
     *      Activation only occurs when `_isLastBatch` is true.
     * @param _configurationId Identifier of the configuration being assembled.
     * @param _facetConfigurations Facet identifiers and versions to append to the batch.
     * @param _isLastBatch Whether this call finalises and activates the batch.
     * @return latestVersion_ Draft or activated version being populated.
     */
    function _createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) internal returns (uint256 latestVersion_) {
        latestVersion_ = _isOngoingConfiguration(_configurationId)
            ? _getBatchConfigurationVersion(_configurationId)
            : _startBatchConfiguration(_configurationId);
        _addFacetsToBatchConfiguration(_configurationId, _facetConfigurations, latestVersion_);
        _activateConfiguration(_configurationId, _isLastBatch);
    }

    /**
     * @notice Activates the current batch when the final batch flag is set.
     * @dev Requires at least one facet in the batch. Adds new configuration identifiers to
     *      the active registry, promotes the batch version to latest and clears the draft.
     * @param _configurationId Identifier of the configuration to activate.
     * @param _isLastBatch Whether activation should be performed.
     */
    function _activateConfiguration(bytes32 _configurationId, bool _isLastBatch) internal {
        if (!_isLastBatch) return;
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        _checkEmptyFacetConfiguration(_dcms, _configurationId);
        if (!_dcms.activeConfigurations[_configurationId]) {
            _dcms.configurations.push(_configurationId);
            _dcms.activeConfigurations[_configurationId] = true;
        }
        _dcms.latestVersion[_configurationId] = _dcms.batchVersion[_configurationId];
        delete _dcms.batchVersion[_configurationId];
    }

    /**
     * @notice Starts the next draft version for a configuration.
     * @dev Sets the configuration owner to the current EVM sender. Version increment is
     *      unchecked because realistic version growth cannot overflow.
     * @param _configurationId Identifier of the configuration to begin.
     * @return batchVersion_ Draft version assigned to the configuration.
     */
    function _startBatchConfiguration(bytes32 _configurationId) internal returns (uint256 batchVersion_) {
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        unchecked {
            _dcms.batchVersion[_configurationId] = _dcms.latestVersion[_configurationId] + 1;
        }
        batchVersion_ = _getBatchConfigurationVersion(_configurationId);
        _setOwner(_configurationId, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Adds facet definitions to an in-progress configuration version.
     * @dev Resolves each facet address by identifier and version, rejects duplicates,
     *      registers selectors, and records supported interface identifiers.
     * @param _configurationId Identifier of the configuration being populated.
     * @param _facetConfigurations Facet identifiers and versions to add.
     * @param _version Draft configuration version receiving the facets.
     */
    function _addFacetsToBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        uint256 _version
    ) internal {
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        bytes32 configVersionHash = _buildHash(_configurationId, _version);
        uint256 facetsLength = _facetConfigurations.length;
        for (uint256 index; index < facetsLength; ) {
            bytes32 facetId = _facetConfigurations[index].id;
            uint256 facetVersion = _facetConfigurations[index].version;
            _dcms.facetIds[configVersionHash].push(facetId);
            _dcms.facetVersions[configVersionHash].push(facetVersion);
            _dcms.facetIdPosition[_buildHash(_configurationId, _version, facetId)] = _dcms
                .facetIds[configVersionHash]
                .length;
            bytes32 configVersionFacetHash = _buildHash(_configurationId, _version, facetId);
            address addr = _resolveBusinessLogicByVersion(facetId, facetVersion);
            if (addr == address(0)) {
                revert FacetIdNotRegistered(_configurationId, facetId);
            }
            if (_dcms.addr[configVersionFacetHash] != address(0)) {
                revert DuplicatedFacetInConfiguration(facetId);
            }
            _dcms.addr[configVersionFacetHash] = addr;
            IStaticFunctionSelectors staticFunctionSelectors = IStaticFunctionSelectors(addr);
            _registerSelectors(
                _dcms,
                _configurationId,
                _version,
                facetId,
                staticFunctionSelectors,
                configVersionFacetHash
            );
            _registerInterfaceIds(_dcms, _configurationId, _version, staticFunctionSelectors, configVersionFacetHash);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Cancels an in-progress batch configuration.
     * @dev Deletes draft facet addresses, selector mappings, interface mappings, aligned
     *      arrays and the batch version. Existing active versions remain unchanged.
     * @param _configurationId Identifier of the draft configuration to cancel.
     * @return batchVersion_ Draft version that was cancelled.
     */
    function _cancelBatchConfiguration(bytes32 _configurationId) internal returns (uint256 batchVersion_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        batchVersion_ = _getBatchConfigurationVersion(_configurationId);
        bytes32 configVersionHash = _buildHash(_configurationId, batchVersion_);
        bytes32[] storage facetIds = dcms.facetIds[configVersionHash];
        uint256 facetIdsLength = facetIds.length;
        for (uint256 index; index < facetIdsLength; ) {
            bytes32 configVersionFacetHash = _buildHash(_configurationId, batchVersion_, facetIds[index]);
            delete dcms.addr[configVersionFacetHash];
            _cleanSelectors(dcms, _configurationId, batchVersion_, configVersionFacetHash);
            _cleanInterfacesIds(dcms, _configurationId, batchVersion_, configVersionFacetHash);
            unchecked {
                ++index;
            }
        }
        delete dcms.facetVersions[configVersionHash];
        delete dcms.facetIds[configVersionHash];
        delete dcms.batchVersion[_configurationId];
    }

    /**
     * @notice Returns whether a configuration has an unfinished draft version.
     * @param _configurationId Identifier of the configuration to inspect.
     * @return True when a batch version is currently stored.
     */
    function _isOngoingConfiguration(bytes32 _configurationId) internal view returns (bool) {
        return _getBatchConfigurationVersion(_configurationId) != 0;
    }

    /**
     * @notice Returns the current draft version for a configuration.
     * @param _configurationId Identifier of the configuration to inspect.
     * @return batchVersion_ Draft version, or zero when no batch is ongoing.
     */
    function _getBatchConfigurationVersion(bytes32 _configurationId) internal view returns (uint256 batchVersion_) {
        batchVersion_ = _diamondCutManagerStorage().batchVersion[_configurationId];
    }

    /**
     * @notice Resolves the facet address that handles a selector for a configuration version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _replacementEnabled Flag indicating whether selector replacement is enabled for the resolver proxy.
     * @param _selector Function selector to resolve.
     * @return facetAddress_ Facet address registered for the selector, or zero if absent.
     */
    function _resolveResolverProxyCallV2(
        bytes32 _configurationId,
        uint256 _version,
        bool _replacementEnabled,
        bytes4 _selector
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _diamondCutManagerStorage().facetAddress[
            _buildHashSelector(_configurationId, _version, _selector)
        ];
        if (_replacementEnabled) {
            address replacementAddress = _getReplacementAddress(facetAddress_);
            if (replacementAddress != address(0)) {
                facetAddress_ = replacementAddress;
            }
        }
    }

    /**
     * @notice Generic method that resolves the facet address that handles a selector for a configuration version.
     * @param _resolverProxyConfiguration encoded proxy configuration.
     * @param _selector Function selector to resolve.
     * @return facetAddress_ Facet address registered for the selector, or zero if absent.
     */
    function _resolveResolverProxyCall(
        bytes calldata _resolverProxyConfiguration,
        bytes4 _selector
    ) internal view returns (address facetAddress_) {
        if (
            _resolverProxyConfiguration.length < RESOLVER_PROXY_CONFIGURATION_MINIMUM_LENGTH ||
            _resolverProxyConfiguration.length % 32 != 0
        ) revert InvalidResolverProxyConfiguration(_resolverProxyConfiguration);

        IResolverProxy.ResolverProxyConfigurationGeneric memory configuration = abi.decode(
            _resolverProxyConfiguration,
            (IResolverProxy.ResolverProxyConfigurationGeneric)
        );

        if (configuration.resolverProxyVersion == RESOLVER_PROXY_VERSION_V2) {
            IResolverProxy.ResolverProxyConfigurationV2 memory configurationV2 = abi.decode(
                configuration.content,
                (IResolverProxy.ResolverProxyConfigurationV2)
            );

            _checkExplicitVersion(configurationV2.configurationId, configurationV2.configurationVersion);

            facetAddress_ = _resolveResolverProxyCallV2(
                configurationV2.configurationId,
                configurationV2.configurationVersion,
                configurationV2.replacementEnabled,
                _selector
            );
            return facetAddress_;
        }
        revert UnrecognizedResolverProxyVersion(configuration.resolverProxyVersion);
    }

    /**
     * @notice Returns whether a configuration version supports an interface identifier.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _interfaceId Interface identifier to check.
     * @return exists_ True when the interface is registered as supported.
     */
    function _resolveSupportsInterface(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) internal view returns (bool exists_) {
        exists_ = _dcms.supportsInterface[_buildHashSelector(_configurationId, _version, _interfaceId)];
    }

    /**
     * @notice Returns whether a resolver proxy configuration version is registered.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration to inspect.
     * @param _version Version to inspect.
     * @return isRegistered_ True when the active configuration contains the version.
     */
    function _isResolverProxyConfigurationRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_isResolverProxyConfigurationNotRegistered(_dcms, _configurationId, _version);
    }

    /**
     * @notice Returns whether a resolver proxy configuration version is not registered.
     * @dev Version zero, inactive configurations and versions above latest are considered
     *      unregistered.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration to inspect.
     * @param _version Version to inspect.
     * @return isRegistered_ True when the version is not registered.
     */
    function _isResolverProxyConfigurationNotRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return
            _version == 0 ||
            !_dcms.activeConfigurations[_configurationId] ||
            _version > _dcms.latestVersion[_configurationId];
    }

    /**
     * @notice Returns active configuration identifiers using pagination.
     * @param _dcms Diamond cut manager storage reference.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of entries requested.
     * @return configurationIds_ Configuration identifiers in the requested page.
     */
    function _getConfigurations(
        DiamondCutManagerStorage storage _dcms,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _buildPaginated(_dcms.configurations, _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of facets registered for a configuration version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @return facetsLength_ Number of registered facets.
     */
    function _getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (uint256 facetsLength_) {
        facetsLength_ = _diamondCutManagerStorage().facetIds[_buildHash(_configurationId, _version)].length;
    }

    /**
     * @notice Returns paginated facet metadata for a configuration version.
     * @dev Pagination bounds are derived from `_pageIndex` and `_pageLength` and clipped to
     *      the registered facet count.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of facets requested.
     * @return facets_ Requested page of facet metadata.
     */
    function _getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        bytes32[] memory facetIds = _diamondCutManagerStorage().facetIds[_buildHash(_configurationId, _version)];
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, facetIds.length);
        facets_ = new IDiamondLoupe.Facet[](size);
        for (uint256 index; index < size; ) {
            facets_[index] = _getFacetByConfigurationIdVersionAndFacetId(_configurationId, _version, facetIds[start]);
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    /**
     * @notice Returns the number of selectors registered for a facet.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _facetId Identifier of the facet to inspect.
     * @return facetSelectorsLength_ Number of selectors registered for the facet.
     */
    function _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _diamondCutManagerStorage()
            .selectors[_buildHash(_configurationId, _version, _facetId)]
            .length;
    }

    /**
     * @notice Returns paginated selectors registered for a facet.
     * @dev Reads from the selector array stored for the facet within the configuration
     *      version and returns an empty page when the requested range is outside bounds.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _facetId Identifier of the facet whose selectors are requested.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of selectors requested.
     * @return facetSelectors_ Requested page of function selectors.
     */
    function _getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _buildPaginated(
            _diamondCutManagerStorage().selectors[_buildHash(_configurationId, _version, _facetId)],
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns paginated facet identifiers for a configuration version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of facet identifiers requested.
     * @return facetIds_ Requested page of facet identifiers.
     */
    function _getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = _buildPaginated(
            _diamondCutManagerStorage().facetIds[_buildHash(_configurationId, _version)],
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns facet configurations within an explicit index range.
     * @dev Preserves the alignment between stored facet identifiers and facet versions.
     *      The returned size is clipped to the number of registered facets.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _start Inclusive start index.
     * @param _end Exclusive end index.
     * @return facetConfigurations_ Facet identifiers and versions in the requested range.
     */
    function _getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    ) internal view returns (FacetConfiguration[] memory facetConfigurations_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        bytes32 configVersionHash = _buildHash(_configurationId, _version);
        uint256 size = Pagination.getSize(_start, _end, dcms.facetIds[configVersionHash].length);
        facetConfigurations_ = new FacetConfiguration[](size);
        uint256 realIndex = _start;
        for (uint256 index; index < size; ) {
            facetConfigurations_[index] = FacetConfiguration({
                id: dcms.facetIds[configVersionHash][realIndex],
                version: dcms.facetVersions[configVersionHash][realIndex]
            });
            unchecked {
                ++index;
                ++realIndex;
            }
        }
    }

    /**
     * @notice Returns paginated facet implementation addresses for a configuration version.
     * @dev The returned addresses follow the same order as the stored facet identifiers.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of addresses requested.
     * @return facetAddresses_ Requested page of facet implementation addresses.
     */
    function _getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        bytes32[] memory facetIds = dcms.facetIds[_buildHash(_configurationId, _version)];
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, facetIds.length);
        facetAddresses_ = new address[](size);
        for (uint256 index; index < size; ) {
            facetAddresses_[index] = dcms.addr[_buildHash(_configurationId, _version, facetIds[start])];
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    /**
     * @notice Returns the facet identifier that owns a selector in a configuration version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _selector Function selector to resolve.
     * @return facetId_ Facet identifier registered for the selector, or zero if absent.
     */
    function _getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (bytes32 facetId_) {
        facetId_ = _diamondCutManagerStorage().selectorToFacetId[
            _buildHashSelector(_configurationId, _version, _selector)
        ];
    }

    /**
     * @notice Returns facet metadata for a specific configuration version and facet.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _facetId Facet identifier to query.
     * @return facet_ Facet metadata including address, selectors and interface identifiers.
     */
    function _getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        bytes32 facetIdHash = _buildHash(_configurationId, _version, _facetId);
        facet_ = IDiamondLoupe.Facet({
            id: _facetId,
            addr: dcms.addr[facetIdHash],
            selectors: dcms.selectors[facetIdHash],
            interfaceIds: dcms.interfaceIds[facetIdHash]
        });
    }

    /**
     * @notice Returns the implementation address registered for a facet.
     * @dev Returns the zero address when the facet is not present in the configuration
     *      version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _facetId Identifier of the facet to resolve.
     * @return facetAddress_ Facet implementation address registered for the facet.
     */
    function _getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _diamondCutManagerStorage().addr[_buildHash(_configurationId, _version, _facetId)];
    }

    /**
     * @notice Returns the registered version of a facet within a configuration version.
     * @dev Reverts when the facet identifier is not registered for the requested version.
     * @param _configurationId Identifier of the configuration to query.
     * @param _version Configuration version to query.
     * @param _facetId Identifier of the facet whose version is requested.
     * @return facetVersion_ Facet version stored in the configuration.
     */
    function _getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (uint256 facetVersion_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        uint256 pos = dcms.facetIdPosition[_buildHash(_configurationId, _version, _facetId)];
        if (pos == 0) {
            revert FacetIdNotRegistered(_configurationId, _facetId);
        }
        unchecked {
            facetVersion_ = dcms.facetVersions[_buildHash(_configurationId, _version)][pos - 1];
        }
    }

    /**
     * @notice Resolves the facet address responsible for handling a proxy call selector.
     * @dev Returns the zero address when the selector is not registered for the requested
     *      configuration version.
     * @param _configurationId Identifier of the configuration used by the proxy.
     * @param _version Configuration version used by the proxy.
     * @param _selector Function selector to resolve.
     * @return facetAddress_ Facet implementation address registered for the selector.
     */
    function _resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _diamondCutManagerStorage().facetAddress[
            _buildHashSelector(_configurationId, _version, _selector)
        ];
    }

    /**
     * @notice Returns whether an interface is supported by a configuration version.
     * @param _configurationId Identifier of the configuration to inspect.
     * @param _version Configuration version to inspect.
     * @param _interfaceId Interface identifier to resolve.
     * @return exists_ True when the interface identifier is registered as supported.
     */
    function _resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) internal view returns (bool exists_) {
        exists_ = _diamondCutManagerStorage().supportsInterface[
            _buildHashSelector(_configurationId, _version, _interfaceId)
        ];
    }

    /**
     * @notice Resolves whether a resolver proxy configuration version is registered.
     * @param _configurationId Identifier of the configuration to inspect.
     * @param _version Version to inspect.
     * @return isRegistered_ True when the active configuration contains the version.
     */
    function _isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_isResolverProxyConfigurationNotRegistered(_configurationId, _version);
    }

    /**
     * @notice Resolves whether a resolver proxy configuration version is not registered.
     * @dev Version zero, inactive configurations and versions above latest are considered
     *      unregistered.
     * @param _configurationId Identifier of the configuration to inspect.
     * @param _version Version to inspect.
     * @return isRegistered_ True when the version is not registered.
     */
    function _isResolverProxyConfigurationNotRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        return
            _version == 0 ||
            !dcms.activeConfigurations[_configurationId] ||
            _version > dcms.latestVersion[_configurationId];
    }

    /**
     * @notice Reverts unless a resolver proxy configuration version is registered.
     * @dev Version zero is not explicitly rejected here unless the configuration is inactive;
     *      callers requiring explicit versions should use `validateConfigurationVersion`.
     * @param _configurationId Identifier of the configuration to validate.
     * @param _version Version to validate against the latest active version.
     */
    function _checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) internal view {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        if (!dcms.activeConfigurations[_configurationId] || _version > dcms.latestVersion[_configurationId]) {
            revert ResolverProxyConfigurationNoRegistered(_configurationId, _version);
        }
    }

    /**
     * @notice Returns paginated active configuration identifiers.
     * @dev Pagination bounds are derived from `_pageIndex` and `_pageLength` and clipped to
     *      the number of active configurations.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of configuration identifiers requested.
     * @return configurationIds_ Requested page of active configuration identifiers.
     */
    function _getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _buildPaginated(_diamondCutManagerStorage().configurations, _pageIndex, _pageLength);
    }

    /**
     * @notice Requires the caller to own a configuration when ownership already exists.
     * @dev Allows first-time configuration ownership assignment by skipping checks when the
     *      stored owner is the zero address.
     * @param _configurationId Identifier of the configuration ownership scope.
     */
    function _checkAlreadyOwned(bytes32 _configurationId) internal view {
        if (_getOwner(_configurationId) != address(0)) _checkOwnership(_configurationId);
    }

    /**
     * @notice Returns the number of configurations registered.
     * @return configurationsLength_ Total count of configuration identifiers.
     */
    function _getConfigurationsLength() internal view returns (uint256 configurationsLength_) {
        configurationsLength_ = _diamondCutManagerStorage().configurations.length;
    }

    /**
     * @notice Returns the latest version for a configuration.
     * @param _configurationId Identifier of the configuration to query.
     * @return latestVersion_ Latest activated version.
     */
    function _getLatestVersionByConfiguration(bytes32 _configurationId) internal view returns (uint256 latestVersion_) {
        latestVersion_ = _diamondCutManagerStorage().latestVersion[_configurationId];
    }

    /**
     * @notice Deletes selector lookup state for a cancelled facet batch entry.
     * @dev Removes selector-to-address and selector-to-facet mappings, then clears the
     *      selector array for the facet hash.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration being cleaned.
     * @param _batchVersion Draft version being cancelled.
     * @param _configVersionFacetHash Hash identifying the facet within the draft version.
     */
    function _cleanSelectors(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _batchVersion,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] storage selectors = _dcms.selectors[_configVersionFacetHash];
        uint256 selectorsLength = selectors.length;
        for (uint256 index; index < selectorsLength; ) {
            bytes32 configVersionSelectorHash = _buildHashSelector(_configurationId, _batchVersion, selectors[index]);
            delete _dcms.facetAddress[configVersionSelectorHash];
            delete _dcms.selectorToFacetId[configVersionSelectorHash];
            unchecked {
                ++index;
            }
        }
        delete _dcms.selectors[_configVersionFacetHash];
    }

    /**
     * @notice Deletes interface support state for a cancelled facet batch entry.
     * @dev Removes supported-interface flags and clears the interface identifier array for
     *      the facet hash.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration being cleaned.
     * @param _batchVersion Draft version being cancelled.
     * @param _configVersionFacetHash Hash identifying the facet within the draft version.
     */
    function _cleanInterfacesIds(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _batchVersion,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] storage interfaceIds = _dcms.interfaceIds[_configVersionFacetHash];
        uint256 interfaceIdsLength = interfaceIds.length;
        for (uint256 index; index < interfaceIdsLength; ) {
            delete _dcms.supportsInterface[_buildHashSelector(_configurationId, _batchVersion, interfaceIds[index])];
            unchecked {
                ++index;
            }
        }
        delete _dcms.interfaceIds[_configVersionFacetHash];
    }

    /**
     * @notice Registers function selectors exposed by a facet implementation.
     * @dev Reads selectors from the facet contract, rejects blacklisted and duplicate
     *      selectors, and records selector dispatch and ownership mappings.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration being populated.
     * @param _version Configuration version being populated.
     * @param _facetId Identifier of the facet providing the selectors.
     * @param _static Static selector provider implemented by the facet.
     * @param _configVersionFacetHash Hash identifying the facet within the version.
     */
    function _registerSelectors(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        IStaticFunctionSelectors _static,
        bytes32 _configVersionFacetHash
    ) private {
        address selectorAddress = address(_static);
        bytes4[] memory selectors = _static.getStaticFunctionSelectors();
        _checkSelectorsBlacklist(_configurationId, selectors);
        _dcms.selectors[_configVersionFacetHash] = selectors;
        uint256 length = selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = selectors[index];
            bytes32 configVersionSelectorHash = _buildHashSelector(_configurationId, _version, selector);
            require(
                _dcms.facetAddress[configVersionSelectorHash] == address(0),
                SelectorAlreadyRegistered(_configurationId, _version, _facetId, selector)
            );
            _dcms.facetAddress[configVersionSelectorHash] = selectorAddress;
            _dcms.selectorToFacetId[configVersionSelectorHash] = _facetId;
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Registers interface identifiers exposed by a facet implementation.
     * @dev Reads interface IDs from the facet contract and marks them as supported for the
     *      target configuration version.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration being populated.
     * @param _version Configuration version being populated.
     * @param _static Static interface provider implemented by the facet.
     * @param _configVersionFacetHash Hash identifying the facet within the version.
     */
    function _registerInterfaceIds(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        IStaticFunctionSelectors _static,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] memory interfaceIds = _static.getStaticInterfaceIds();
        _dcms.interfaceIds[_configVersionFacetHash] = interfaceIds;
        uint256 length = interfaceIds.length;
        for (uint256 index; index < length; ) {
            bytes4 interfaceId = interfaceIds[index];
            _dcms.supportsInterface[_buildHashSelector(_configurationId, _version, interfaceId)] = true;
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Reverts if the current draft configuration contains no facets.
     * @param _dcms Diamond cut manager storage reference.
     * @param _configurationId Identifier of the configuration to validate.
     */
    function _checkEmptyFacetConfiguration(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId
    ) private view {
        if (_dcms.facetIds[_buildHash(_configurationId, _dcms.batchVersion[_configurationId])].length == 0) {
            revert EmptyFacetConfigurationNotPermitted(_configurationId);
        }
    }

    /**
     * @notice Returns the diamond-cut manager storage reference.
     * @dev Resolves the ERC-7201 storage namespace through inline assembly.
     * @return ds_ Storage pointer for the diamond-cut manager state.
     */
    function _diamondCutManagerStorage() private pure returns (DiamondCutManagerStorage storage ds_) {
        bytes32 position = STORAGE_LOCATION_DIAMOND_CUT_MANAGER;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds_.slot := position
        }
    }

    /**
     * @notice Reverts when a configuration version is zero.
     * @param _configurationId Identifier of the configuration being validated.
     * @param _version Version value that must be explicit.
     */
    function _checkExplicitVersion(bytes32 _configurationId, uint256 _version) private pure {
        if (_version == 0) revert VersionZero(_configurationId);
    }

    /**
     * @notice Builds the storage key for a configuration version.
     * @param _configurationId Identifier of the configuration.
     * @param _version Version of the configuration.
     * @return hash_ Deterministic hash for the configuration version.
     */
    function _buildHash(bytes32 _configurationId, uint256 _version) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version));
    }

    /**
     * @notice Builds the storage key for a facet within a configuration version.
     * @param _configurationId Identifier of the configuration.
     * @param _version Version of the configuration.
     * @param _facetId Identifier of the facet.
     * @return hash_ Deterministic hash for the configuration, version and facet.
     */
    function _buildHash(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _facetId));
    }

    /**
     * @notice Builds the storage key for a selector or interface identifier.
     * @param _configurationId Identifier of the configuration.
     * @param _version Version of the configuration.
     * @param _selector Function selector or interface identifier.
     * @return hash_ Deterministic hash for the configuration, version and selector.
     */
    function _buildHashSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _selector));
    }

    /**
     * @notice Builds a paginated `bytes32` memory slice.
     * @dev Pagination bounds are derived from page index and length, then clipped against
     *      source length through `Pagination.getSize`.
     * @param _source Source array to page.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of entries requested.
     * @return page_ Requested page of `bytes32` values.
     */
    function _buildPaginated(
        bytes32[] memory _source,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private pure returns (bytes32[] memory page_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, _source.length);
        page_ = new bytes32[](size);
        for (uint256 index; index < size; ) {
            page_[index] = _source[start];
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    /**
     * @notice Builds a paginated `bytes4` memory slice.
     * @dev Pagination bounds are derived from page index and length, then clipped against
     *      source length through `Pagination.getSize`.
     * @param _source Source array to page.
     * @param _pageIndex Page index used to derive the start offset.
     * @param _pageLength Maximum number of entries requested.
     * @return page_ Requested page of `bytes4` values.
     */
    function _buildPaginated(
        bytes4[] memory _source,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private pure returns (bytes4[] memory page_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, _source.length);
        page_ = new bytes4[](size);
        for (uint256 index; index < size; ) {
            page_[index] = _source[start];
            unchecked {
                ++index;
                ++start;
            }
        }
    }
}
