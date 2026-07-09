// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pause } from "../../facets/pause/Pause.sol";
import { AccessControl } from "../../facets/accessControl/AccessControl.sol";
import { DiamondCutManagerWrapper } from "./DiamondCutManagerWrapper.sol";
import { IDiamondCutManager } from "./IDiamondCutManager.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

/**
 * @title Diamond Cut Manager
 * @notice Manages versioned diamond configurations used by resolver proxies.
 * @dev Coordinates configuration creation, batched creation, cancellation, and lookup.
 *      Mutating operations require a non-zero configuration identifier, an unpaused state,
 *      and caller ownership according to inherited validation rules. Read operations that
 *      target a version validate the requested configuration/version pair before resolving
 *      facet, selector, interface, or pagination data from manager storage.
 * @author Asset Tokenization Studio Team
 */
abstract contract DiamondCutManager is AccessControl, Pause, DiamondCutManagerWrapper {
    /**
     * @notice Requires the configuration identifier to be non-zero.
     * @dev Reverts when `_configurationId` is the default bytes32 value, preventing
     *      ambiguous reads or writes against configuration storage.
     * @param _configurationId Identifier of the diamond configuration to validate.
     */
    modifier onlyValidConfigurationId(bytes32 _configurationId) {
        _checkConfigurationId(_configurationId);
        _;
    }

    /**
     * @notice Restricts execution to the authorised owner of a configuration.
     * @dev Delegates ownership validation to inherited storage checks and reverts if the
     *      caller is not permitted to manage `_configurationId`.
     * @param _configurationId Identifier of the diamond configuration being managed.
     */
    modifier onlyOwner(bytes32 _configurationId) {
        _checkAlreadyOwned(_configurationId);
        _;
    }

    // TODO: Format validations in all transactions.

    /// @inheritdoc IDiamondCutManager
    function createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bytes calldata _data
    ) external override onlyValidConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
        emit DiamondConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _createConfiguration(_configurationId, _facetConfigurations),
            _data
        );
    }

    /// @inheritdoc IDiamondCutManager
    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch,
        bytes calldata _data
    ) external override onlyValidConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
        emit DiamondBatchConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _isLastBatch,
            _createBatchConfiguration(_configurationId, _facetConfigurations, _isLastBatch),
            _data
        );
    }

    /// @inheritdoc IDiamondCutManager
    function cancelBatchConfiguration(
        bytes32 _configurationId
    ) external override onlyValidConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
        uint256 version = _cancelBatchConfiguration(_configurationId);
        emit DiamondBatchConfigurationCancelled(_configurationId, version);
    }

    /// @inheritdoc IDiamondCutManager
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCallV2(_configurationId, _version, false, _selector);
    }

    /// @inheritdoc IDiamondCutManager
    function resolveResolverProxyCall(
        bytes calldata _resolverProxyConfiguration,
        bytes4 _selector
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCall(_resolverProxyConfiguration, _selector);
    }

    /// @inheritdoc IDiamondCutManager
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) returns (bool exists_) {
        exists_ = _resolveSupportsInterface(_configurationId, _version, _interfaceId);
    }

    /// @inheritdoc IDiamondCutManager
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override returns (bool isRegistered_) {
        isRegistered_ = _isResolverProxyConfigurationRegistered(_configurationId, _version);
    }

    /// @inheritdoc IDiamondCutManager
    function checkResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) {
        _checkResolverProxyConfigurationRegistered(_configurationId, _version);
    }

    /// @inheritdoc IDiamondCutManager
    function getConfigurationsLength() external view override returns (uint256 configurationsLength_) {
        configurationsLength_ = _getConfigurationsLength();
    }

    /// @inheritdoc IDiamondCutManager
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _getConfigurations(_pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondCutManager
    function getLatestVersionByConfiguration(
        bytes32 _configurationId
    ) external view override returns (uint256 latestVersion_) {
        latestVersion_ = _getLatestVersionByConfiguration(_configurationId);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLengthByConfigurationIdAndVersion(_configurationId, _version);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (IDiamondLoupe.Facet[] memory facets_)
    {
        facets_ = _getFacetsByConfigurationIdAndVersion(_configurationId, _version, _pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (uint256 facetSelectorsLength_)
    {
        facetSelectorsLength_ = _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
            _configurationId,
            _version,
            _facetId
        );
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (bytes4[] memory facetSelectors_)
    {
        facetSelectors_ = _getFacetSelectorsByConfigurationIdVersionAndFacetId(
            _configurationId,
            _version,
            _facetId,
            _pageIndex,
            _pageLength
        );
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (bytes32[] memory facetIds_)
    {
        facetIds_ = _getFacetIdsByConfigurationIdAndVersion(_configurationId, _version, _pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _start,
        uint256 _end
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (FacetConfiguration[] memory facetConfigurations_)
    {
        facetConfigurations_ = _getFacetConfigurationsByConfigurationIdAndVersion(
            _configurationId,
            _version,
            _start,
            _end
        );
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (address[] memory facetAddresses_)
    {
        facetAddresses_ = _getFacetAddressesByConfigurationIdAndVersion(
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) returns (bytes32 facetId_) {
        facetId_ = _getFacetIdByConfigurationIdVersionAndSelector(_configurationId, _version, _selector);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    )
        external
        view
        override
        onlyValidConfigurationVersion(_configurationId, _version)
        returns (IDiamondLoupe.Facet memory facet_)
    {
        facet_ = _getFacetByConfigurationIdVersionAndFacetId(_configurationId, _version, _facetId);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view override onlyValidConfigurationVersion(_configurationId, _version) returns (address facetAddress_) {
        facetAddress_ = _getFacetAddressByConfigurationIdVersionAndFacetId(_configurationId, _version, _facetId);
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view onlyValidConfigurationVersion(_configurationId, _version) returns (uint256 facetVersion_) {
        facetVersion_ = _getFacetVersionByConfigurationIdVersionAndFacetId(_configurationId, _version, _facetId);
    }

    /**
     * @notice Validates that a configuration identifier is not the default value.
     * @dev Reverts with `DefaultValueForConfigurationIdNotPermitted` when
     *      `_configurationId` is zero.
     * @param _configurationId Identifier to validate.
     */
    function _checkConfigurationId(bytes32 _configurationId) private pure {
        if (uint256(_configurationId) == 0) {
            revert DefaultValueForConfigurationIdNotPermitted();
        }
    }
}
