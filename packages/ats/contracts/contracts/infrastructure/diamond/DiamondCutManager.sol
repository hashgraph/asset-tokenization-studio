// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Pause } from "../../facets/pause/Pause.sol";
import { AccessControl } from "../../facets/accessControl/AccessControl.sol";
import { DiamondCutManagerWrapper } from "./DiamondCutManagerWrapper.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";

abstract contract DiamondCutManager is AccessControl, Pause, DiamondCutManagerWrapper {
    modifier validateConfigurationId(bytes32 _configurationId) {
        _checkConfigurationId(_configurationId);
        _;
    }

    modifier checkOwnership(bytes32 _configurationId) {
        if (_getOwner(_configurationId) != address(0)) _checkOwnership(_configurationId);
        _;
    }

    function createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) external override validateConfigurationId(_configurationId) onlyUnpaused checkOwnership(_configurationId) {
        emit DiamondConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _createConfiguration(_configurationId, _facetConfigurations)
        );
    }

    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) external override validateConfigurationId(_configurationId) onlyUnpaused checkOwnership(_configurationId) {
        emit DiamondBatchConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _isLastBatch,
            _createBatchConfiguration(_configurationId, _facetConfigurations, _isLastBatch)
        );
    }

    function cancelBatchConfiguration(
        bytes32 _configurationId
    ) external override validateConfigurationId(_configurationId) onlyUnpaused checkOwnership(_configurationId) {
        uint256 version = _cancelBatchConfiguration(_configurationId);
        emit DiamondBatchConfigurationCanceled(_configurationId, version);
    }

    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCall(_diamondCutManagerStorage(), _configurationId, _version, _selector);
    }

    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view override validateConfigurationVersion(_configurationId, _version) returns (bool exists_) {
        exists_ = _resolveSupportsInterface(_diamondCutManagerStorage(), _configurationId, _version, _interfaceId);
    }

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

    function checkResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override validateConfigurationVersion(_configurationId, _version) {
        _checkResolverProxyConfigurationRegistered(_diamondCutManagerStorage(), _configurationId, _version);
    }

    function getConfigurationsLength() external view override returns (uint256 configurationsLength_) {
        configurationsLength_ = _diamondCutManagerStorage().configurations.length;
    }

    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _getConfigurations(_diamondCutManagerStorage(), _pageIndex, _pageLength);
    }

    function getLatestVersionByConfiguration(
        bytes32 _configurationId
    ) external view override returns (uint256 latestVersion_) {
        latestVersion_ = _diamondCutManagerStorage().latestVersion[_configurationId];
    }

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

    /**
     * @notice Returns a paginated range of facet configurations for a configuration version.
     * @dev Reads diamond cut manager storage without mutating state. The caller must provide a
     *      valid configuration identifier, version, and pagination bounds accepted by the internal
     *      configuration lookup. Reverts according to the storage helper's validation rules.
     * @param _configurationId Identifier of the diamond configuration to query.
     * @param _version Version of the configuration to query.
     * @param _start Inclusive start index of the facet configuration range.
     * @param _end Exclusive end index of the facet configuration range.
     * @return facetConfigurations_ Facet configurations stored for the requested range.
     */
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
     * @notice Returns the facet version assigned to a facet within a configuration version.
     * @dev Reads diamond cut manager storage and performs no state mutation. The lookup is scoped
     *      by configuration identifier, configuration version, and facet identifier.
     * @param _configurationId Identifier of the diamond configuration to query.
     * @param _version Version of the configuration to inspect.
     * @param _facetId Identifier of the facet whose version is requested.
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

    function _checkConfigurationId(bytes32 _configurationId) private pure {
        if (uint256(_configurationId) == 0) {
            revert DefaultValueForConfigurationIdNotPermitted();
        }
    }
}
