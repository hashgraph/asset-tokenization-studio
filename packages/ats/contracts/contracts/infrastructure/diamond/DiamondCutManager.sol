// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Pause } from "../../facets/pause/Pause.sol";
import { AccessControl } from "../../facets/accessControl/AccessControl.sol";
import { DiamondCutManagerWrapper } from "./DiamondCutManagerWrapper.sol";
import { IDiamondCutManager } from "./IDiamondCutManager.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

/**
 * @title Diamond Cut Manager
 * @notice Manages versioned diamond configurations used to resolve facets and selectors.
 * @dev Provides creation, batched creation, cancellation, and read access for resolver proxy
 *      configurations. Mutating operations are restricted to valid, unpaused configurations
 *      owned by the caller according to inherited storage and validation rules.
 * @author Asset Tokenization Studio Team
 */
abstract contract DiamondCutManager is AccessControl, Pause, DiamondCutManagerWrapper {
    /**
     * @notice Ensures a configuration identifier is non-zero before execution.
     * @dev Reverts with `DefaultValueForConfigurationIdNotPermitted` for the zero bytes32 value.
     * @param _configurationId Identifier of the diamond configuration being validated.
     */
    modifier validateConfigurationId(bytes32 _configurationId) {
        _checkConfigurationId(_configurationId);
        _;
    }

    /**
     * @notice Restricts execution to callers permitted to manage the configuration.
     * @dev Delegates ownership validation to inherited storage checks and reverts on failure.
     * @param _configurationId Identifier of the diamond configuration being checked.
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
    ) external override validateConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
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
    ) external override validateConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
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
    ) external override validateConfigurationId(_configurationId) onlyUnpaused onlyOwner(_configurationId) {
        uint256 version = _cancelBatchConfiguration(_configurationId);
        emit DiamondBatchConfigurationCanceled(_configurationId, version);
    }

    /// @inheritdoc IDiamondCutManager
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCallV2(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            false,
            _selector
        );
    }

    function resolveResolverProxyCall(
        bytes calldata _resolverProxyConfiguration,
        bytes4 _selector
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCall(_diamondCutManagerStorage(), _resolverProxyConfiguration, _selector);
    }

    /// @inheritdoc IDiamondCutManager
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (bool exists_) {
        exists_ = _resolveSupportsInterface(_diamondCutManagerStorage(), _configurationId, _version, _interfaceId);
    }

    /// @inheritdoc IDiamondCutManager
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override returns (bool isRegistered_) {
        isRegistered_ = _isResolverProxyConfigurationRegistered(
            _diamondCutManagerStorage(),
            _configurationId,
            _version
        );
    }

    /// @inheritdoc IDiamondCutManager
    function checkResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override validateConfigurationVersion(_configurationId, _version) {
        _checkResolverProxyConfigurationRegistered(_diamondCutManagerStorage(), _configurationId, _version);
    }

    /// @inheritdoc IDiamondCutManager
    function getConfigurationsLength() external view override returns (uint256 configurationsLength_) {
        configurationsLength_ = _diamondCutManagerStorage().configurations.length;
    }

    /// @inheritdoc IDiamondCutManager
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _getConfigurations(_diamondCutManagerStorage(), _pageIndex, _pageLength);
    }

    /// @inheritdoc IDiamondCutManager
    function getLatestVersionByConfiguration(
        bytes32 _configurationId
    ) external view override returns (uint256 latestVersion_) {
        latestVersion_ = _diamondCutManagerStorage().latestVersion[_configurationId];
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLengthByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version
        );
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
        validateConfigurationVersion(_configurationId, _version)
        returns (IDiamondLoupe.Facet[] memory facets_)
    {
        facets_ = _getFacetsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
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
        validateConfigurationVersion(_configurationId, _version)
        returns (uint256 facetSelectorsLength_)
    {
        facetSelectorsLength_ = _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
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
        validateConfigurationVersion(_configurationId, _version)
        returns (bytes4[] memory facetSelectors_)
    {
        facetSelectors_ = _getFacetSelectorsByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
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
        validateConfigurationVersion(_configurationId, _version)
        returns (bytes32[] memory facetIds_)
    {
        facetIds_ = _getFacetIdsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
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
        validateConfigurationVersion(_configurationId, _version)
        returns (FacetConfiguration[] memory facetConfigurations_)
    {
        facetConfigurations_ = _getFacetConfigurationsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
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
        validateConfigurationVersion(_configurationId, _version)
        returns (address[] memory facetAddresses_)
    {
        facetAddresses_ = _getFacetAddressesByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
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
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (bytes32 facetId_) {
        facetId_ = _getFacetIdByConfigurationIdVersionAndSelector(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _selector
        );
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
        validateConfigurationVersion(_configurationId, _version)
        returns (IDiamondLoupe.Facet memory facet_)
    {
        facet_ = _getFacetByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    /// @inheritdoc IDiamondCutManager
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (address facetAddress_) {
        facetAddress_ = _getFacetAddressByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    /**
     * @notice Returns the facet version assigned within a configuration version.
     * @dev Reads diamond cut manager storage without mutating state. The configuration version
     *      must exist according to inherited version validation.
     * @param _configurationId Identifier of the diamond configuration to query.
     * @param _version Version of the configuration to inspect.
     * @param _facetId Identifier of the facet whose registered version is requested.
     * @return facetVersion_ Facet version registered for the requested configuration version.
     */
    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view validateConfigurationVersion(_configurationId, _version) returns (uint256 facetVersion_) {
        facetVersion_ = _getFacetVersionByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    /**
     * @notice Validates that a configuration identifier is not the default value.
     * @dev Reverts with `DefaultValueForConfigurationIdNotPermitted` when `_configurationId`
     *      is zero, preventing ambiguous configuration storage access.
     * @param _configurationId Identifier to validate.
     */
    function _checkConfigurationId(bytes32 _configurationId) private pure {
        if (uint256(_configurationId) == 0) {
            revert DefaultValueForConfigurationIdNotPermitted();
        }
    }
}
