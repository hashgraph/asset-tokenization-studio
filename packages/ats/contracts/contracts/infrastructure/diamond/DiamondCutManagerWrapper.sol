// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSetBytes4 } from "../../infrastructure/utils/EnumerableSetBytes4.sol";
import { IDiamondCutManager } from "./IDiamondCutManager.sol";
import { IStaticFunctionSelectors } from "../proxy/IStaticFunctionSelectors.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";
import { BusinessLogicResolverWrapper } from "./BusinessLogicResolverWrapper.sol";
import { _DIAMOND_CUT_MANAGER_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/**
 * @title DiamondCutManagerWrapper
 * @author Asset Tokenization Studio Team
 * @notice Storage and implementation layer for IDiamondCutManager.
 * @dev Houses all internal/private logic for managing diamond facet configurations,
 *   batch creation, facet registration, selector and interface ID management.
 *   Uses diamond storage at a fixed slot to avoid layout collisions.
 *   External access control and event emission is handled by DiamondCutManager.
 */
abstract contract DiamondCutManagerWrapper is IDiamondCutManager, BusinessLogicResolverWrapper {
    /// @notice Core storage layout for configuration, facet, selector and interface data.
    /// @dev All mappings use composite keccak256 hashes as keys for collision-free lookups.
    struct DiamondCutManagerStorage {
        /// @notice Ordered list of registered configuration identifiers.
        bytes32[] configurations;
        /// @notice Whether a configuration ID has been activated.
        mapping(bytes32 => bool) activeConfigurations;
        /// @notice Latest version number per configuration.
        mapping(bytes32 => uint256) latestVersion;
        /// @notice In-progress batch version per configuration.
        mapping(bytes32 => uint256) batchVersion;
        /// @notice List of facet IDs per configuration+version (keyed by keccak256(configId, version)).
        mapping(bytes32 => bytes32[]) facetIds;
        /// @notice Corresponding facet versions per configuration+version.
        mapping(bytes32 => uint256[]) facetVersions;
        /// @notice Position of a facet within the facetIds array (keyed by keccak256(configId, version, facetId)).
        mapping(bytes32 => uint256) facetIdPosition;
        /// @notice Facet address for a selector (keyed by keccak256(configId, version, selector)).
        mapping(bytes32 => address) facetAddress;
        /// @notice Facet implementation address per facet (keyed by keccak256(configId, version, facetId)).
        mapping(bytes32 => address) addr;
        /// @notice Stored selectors per facet (keyed by keccak256(configId, version, facetId)).
        mapping(bytes32 => bytes4[]) selectors;
        /// @notice Maps a selector to its owning facet ID (keyed by keccak256(configId, version, selector)).
        mapping(bytes32 => bytes32) selectorToFacetId;
        /// @notice Stored interface IDs per facet (keyed by keccak256(configId, version, facetId)).
        mapping(bytes32 => bytes4[]) interfaceIds;
        /// @notice Whether an interface ID is supported (keyed by keccak256(configId, version, interfaceId)).
        mapping(bytes32 => bool) supportsInterface;
    }

    /**
     * @notice Creates a new configuration with the given facets and immediately activates it.
     * @dev Convenience that combines batch start, facet registration, and activation.
     * @param _configurationId Unique configuration identifier.
     * @param _facetConfigurations List of facet IDs and their target versions.
     * @return latestVersion_ The version assigned to the new configuration.
     */
    function _createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) internal returns (uint256 latestVersion_) {
        latestVersion_ = _isOngoingConfiguration(_configurationId)
            ? _getBatchConfigurationVersion(_configurationId)
            : _startBatchConfiguration(_configurationId);
        _addFacetsToBatchConfiguration(_configurationId, _facetConfigurations, latestVersion_);
        _activateConfiguration(_configurationId, true);
    }

    /**
     * @notice Appends facets to an in-progress batch configuration.
     * @dev Multiple calls with the same _configurationId accumulate facets until
     *   _isLastBatch is true.  No-op on the data layer when not finalised.
     * @param _configurationId Unique configuration identifier.
     * @param _facetConfigurations Partial list of facets for this batch.
     * @param _isLastBatch True to finalise and activate after this batch.
     * @return latestVersion_ The version assigned (final once activated).
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
     * @notice Activates a configuration by pushing it to the active list and setting its
     *   latest version.
     * @dev No-op when _isLastBatch is false (configuration remains in batch state).
     *   Once activated the batch version slot is deleted.
     * @param _configurationId Configuration identifier.
     * @param _isLastBatch When true, finalises the configuration.
     */
    function _activateConfiguration(bytes32 _configurationId, bool _isLastBatch) internal {
        if (!_isLastBatch) return;
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        if (!_dcms.activeConfigurations[_configurationId]) {
            _dcms.configurations.push(_configurationId);
            _dcms.activeConfigurations[_configurationId] = true;
        }
        _dcms.latestVersion[_configurationId] = _dcms.batchVersion[_configurationId];
        delete _dcms.batchVersion[_configurationId];
    }

    /**
     * @notice Initialises a new batch version for a configuration.
     * @dev Increments the latest version by one and stores it as the batch version.
     * @param _configurationId Configuration identifier.
     * @return batchVersion_ The newly allocated batch version number.
     */
    function _startBatchConfiguration(bytes32 _configurationId) internal returns (uint256 batchVersion_) {
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();

        unchecked {
            _dcms.batchVersion[_configurationId] = _dcms.latestVersion[_configurationId] + 1;
        }
        batchVersion_ = _getBatchConfigurationVersion(_configurationId);
    }

    /**
     * @notice Registers a list of facets into an in-progress batch configuration.
     * @dev Resolves each facet's implementation address, checks for duplicates, and
     *   registers selectors and interface IDs.  Reverts on unregistered facet IDs
     *   or duplicate facet entries.
     * @param _configurationId Configuration identifier.
     * @param _facetConfigurations Facets to register (ID + version pairs).
     * @param _version Target batch version.
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
     * @notice Cancels an in-progress batch configuration, cleaning all stored facet data.
     * @dev Iterates over registered facets, deletes addresses, selectors and interface
     *   IDs, then removes the batch version.
     * @param _configurationId Configuration identifier to cancel.
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
     * @notice Returns true when a configuration has an in-progress batch version.
     * @param _configurationId Configuration identifier.
     * @return True when batchVersion is non-zero.
     */
    function _isOngoingConfiguration(bytes32 _configurationId) internal view returns (bool) {
        return _getBatchConfigurationVersion(_configurationId) != 0;
    }

    /**
     * @notice Returns the in-progress batch version for a configuration.
     * @param _configurationId Configuration identifier.
     * @return batchVersion_ Current batch version; 0 if none is in progress.
     */
    function _getBatchConfigurationVersion(bytes32 _configurationId) internal view returns (uint256 batchVersion_) {
        batchVersion_ = _diamondCutManagerStorage().batchVersion[_configurationId];
    }

    /**
     * @notice Resolves the facet address for a selector within a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _selector Function selector to look up.
     * @return facetAddress_ Address of the owning facet, or address(0).
     */
    function _resolveResolverProxyCall(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _dcms.facetAddress[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _selector)
        ];
    }

    /**
     * @notice Resolves whether an interface ID is supported in a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _interfaceId Interface ID to test.
     * @return exists_ True when the interface is registered.
     */
    function _resolveSupportsInterface(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) internal view returns (bool exists_) {
        exists_ = _dcms.supportsInterface[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _interfaceId)
        ];
    }

    /**
     * @notice Returns true when a config+version pair is registered.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to check.
     * @return isRegistered_ True when the configuration is active and version <= latest.
     */
    function _isResolverProxyConfigurationRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_isResolverProxyConfigurationNotRegistered(_dcms, _configurationId, _version);
    }

    /**
     * @notice Returns true when a config+version pair is NOT registered.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to check.
     * @return isRegistered_ True when the config is inactive or version exceeds latest.
     */
    function _isResolverProxyConfigurationNotRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_dcms.activeConfigurations[_configurationId] || _version > _dcms.latestVersion[_configurationId];
    }

    /**
     * @notice Reverts when a config+version pair is not registered.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to check.
     */
    function _checkResolverProxyConfigurationRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view {
        if (!_dcms.activeConfigurations[_configurationId] || _version > _dcms.latestVersion[_configurationId]) {
            revert ResolverProxyConfigurationNoRegistered(_configurationId, _version);
        }
    }

    /**
     * @notice Returns a paginated slice of configuration identifiers.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return configurationIds_ Paginated array.
     */
    function _getConfigurations(
        DiamondCutManagerStorage storage _dcms,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _buildPaginated(_dcms.configurations, _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of facets in a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @return facetsLength_ Total facet count.
     */
    function _getFacetsLengthByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (uint256 facetsLength_) {
        facetsLength_ = _dcms
            .facetIds[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))]
            .length;
    }

    /**
     * @notice Returns a paginated list of facet metadata for a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return facets_ Array of Facet metadata.
     */
    function _getFacetsByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        bytes32[] memory facetIds = _dcms.facetIds[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))
        ];
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, facetIds.length);
        facets_ = new IDiamondLoupe.Facet[](size);
        uint256 version = _resolveVersion(_dcms, _configurationId, _version);
        for (uint256 index; index < size; ) {
            facets_[index] = _getFacetByConfigurationIdVersionAndFacetId(
                _dcms,
                _configurationId,
                version,
                facetIds[start]
            );
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    /**
     * @notice Returns the number of selectors a facet contributes in a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _facetId Facet identifier.
     * @return facetSelectorsLength_ Selector count.
     */
    function _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _dcms
            .selectors[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)]
            .length;
    }

    /**
     * @notice Returns the selectors a facet contributes in a config+version (paginated).
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _facetId Facet identifier.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return facetSelectors_ Array of function selectors.
     */
    function _getFacetSelectorsByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _buildPaginated(
            _dcms.selectors[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)],
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns a paginated list of facet identifiers for a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return facetIds_ Array of facet identifiers.
     */
    function _getFacetIdsByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = _buildPaginated(
            _dcms.facetIds[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))],
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Returns a slice of FacetConfiguration (ID + version) for a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _start Start index (inclusive).
     * @param _end End index (exclusive).
     * @return facetConfigurations_ Array of facet ID + version pairs.
     */
    function _getFacetConfigurationsByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    ) internal view returns (FacetConfiguration[] memory facetConfigurations_) {
        bytes32 configVersionHash = _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version));

        uint256 size = Pagination.getSize(_start, _end, _dcms.facetIds[configVersionHash].length);

        facetConfigurations_ = new FacetConfiguration[](size);

        for (uint256 index; index < size; ) {
            uint256 realIndex;
            unchecked {
                realIndex = _start + index;
            }
            facetConfigurations_[index] = FacetConfiguration({
                id: _dcms.facetIds[configVersionHash][realIndex],
                version: _dcms.facetVersions[configVersionHash][realIndex]
            });
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Returns the facet implementation addresses for a config+version (paginated).
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return facetAddresses_ Array of facet contract addresses.
     */
    function _getFacetAddressesByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        bytes32[] memory facetIds = _dcms.facetIds[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))
        ];
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, facetIds.length);
        facetAddresses_ = new address[](size);
        for (uint256 index; index < size; ) {
            facetAddresses_[index] = _dcms.addr[
                _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), facetIds[start])
            ];
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    /**
     * @notice Resolves the facet identifier that owns a selector in a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _selector Function selector to look up.
     * @return facetId_ Identifier of the owning facet.
     */
    function _getFacetIdByConfigurationIdVersionAndSelector(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (bytes32 facetId_) {
        facetId_ = _dcms.selectorToFacetId[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _selector)
        ];
    }

    /**
     * @notice Returns full facet metadata for a specific facet in a config+version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _facetId Facet identifier.
     * @return facet_ Facet metadata including address, selectors, and interface IDs.
     */
    function _getFacetByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        bytes32 facetIdHash = _buildHash(
            _configurationId,
            _resolveVersion(_dcms, _configurationId, _version),
            _facetId
        );
        facet_ = IDiamondLoupe.Facet({
            id: _facetId,
            addr: _dcms.addr[facetIdHash],
            selectors: _dcms.selectors[facetIdHash],
            interfaceIds: _dcms.interfaceIds[facetIdHash]
        });
    }

    /**
     * @notice Returns the facet implementation address for a config+version+facet.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query; 0 resolves to latest.
     * @param _facetId Facet identifier.
     * @return facetAddress_ Facet contract address.
     */
    function _getFacetAddressByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _dcms.addr[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)
        ];
    }

    /**
     * @notice Returns the implementation version of a facet in a config+version.
     * @dev Reads from the facetVersions array using the position stored during registration.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Version to query.
     * @param _facetId Facet identifier.
     * @return facetVersion_ Facet implementation version number.
     */
    function _getFacetVersionByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (uint256 facetVersion_) {
        uint256 pos = _dcms.facetIdPosition[_buildHash(_configurationId, _version, _facetId)];

        if (pos == 0) {
            revert FacetIdNotRegistered(_configurationId, _facetId);
        }
        unchecked {
            facetVersion_ = _dcms.facetVersions[_buildHash(_configurationId, _version)][pos - 1];
        }
    }

    /**
     * @notice Diamond storage accessor for DiamondCutManagerStorage.
     * @dev Pins the struct to a fixed slot to avoid layout collisions across contracts.
     * @return ds Storage pointer to DiamondCutManagerStorage.
     */
    function _diamondCutManagerStorage() internal pure returns (DiamondCutManagerStorage storage ds) {
        bytes32 position = _DIAMOND_CUT_MANAGER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    /**
     * @notice Cleans all selector data for a facet in a cancelled batch.
     * @dev Iterates over stored selectors, deleting facetAddress and selectorToFacetId
     *   entries, then removes the selectors array.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _batchVersion Batch version being cancelled.
     * @param _configVersionFacetHash Composite hash for the facet context.
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
     * @notice Cleans all interface ID data for a facet in a cancelled batch.
     * @dev Iterates over stored interface IDs, deleting supportsInterface entries,
     *   then removes the interfaceIds array.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _batchVersion Batch version being cancelled.
     * @param _configVersionFacetHash Composite hash for the facet context.
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
     * @notice Registers selectors for a facet into a configuration version.
     * @dev Validates selectors against the blacklist and checks for duplicate
     *   registrations.  Stores the facet address and selector-to-facet mapping.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Target version.
     * @param _facetId Facet identifier.
     * @param _static IStaticFunctionSelectors interface for the facet.
     * @param _configVersionFacetHash Composite hash for the facet context.
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
     * @notice Registers interface IDs for a facet into a configuration version.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Target version.
     * @param _static IStaticFunctionSelectors interface for the facet.
     * @param _configVersionFacetHash Composite hash for the facet context.
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
     * @notice Resolves a version value, defaulting to the latest when 0 is passed.
     * @param _dcms Storage pointer for DiamondCutManagerStorage.
     * @param _configurationId Configuration identifier.
     * @param _version Requested version; 0 means latest.
     * @return version_ Resolved version number.
     */
    function _resolveVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) private view returns (uint256 version_) {
        version_ = _version > 0 ? _version : _dcms.latestVersion[_configurationId];
    }

    /**
     * @notice Reverts if any of the given selectors is blacklisted for the configuration.
     * @param _configurationId Configuration identifier.
     * @param _selectors Array of selectors to validate.
     */
    function _checkSelectorsBlacklist(bytes32 _configurationId, bytes4[] memory _selectors) private view {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];

        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            if (EnumerableSetBytes4.contains(selectorBlacklist, selector)) {
                revert SelectorBlacklisted(selector);
            }
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Builds a composite hash for a configuration+version pair.
     * @param _configurationId Configuration identifier.
     * @param _version Version number.
     * @return hash_ keccak256(abi.encodePacked(configId, version)).
     */
    function _buildHash(bytes32 _configurationId, uint256 _version) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version));
    }

    /**
     * @notice Builds a composite hash for a configuration+version+facet triplet.
     * @param _configurationId Configuration identifier.
     * @param _version Version number.
     * @param _facetId Facet identifier.
     * @return hash_ keccak256(abi.encodePacked(configId, version, facetId)).
     */
    function _buildHash(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _facetId));
    }

    /**
     * @notice Builds a composite hash for a configuration+version+selector triplet.
     * @param _configurationId Configuration identifier.
     * @param _version Version number.
     * @param _selector Function selector (bytes4).
     * @return hash_ keccak256(abi.encodePacked(configId, version, selector)).
     */
    function _buildHashSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _selector));
    }

    /**
     * @notice Builds a paginated slice from a bytes32[] source.
     * @param _source Full source array.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return page_ Paginated sub-array.
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
     * @notice Builds a paginated slice from a bytes4[] source.
     * @param _source Full source array.
     * @param _pageIndex Page index (0-based).
     * @param _pageLength Entries per page.
     * @return page_ Paginated sub-array.
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
