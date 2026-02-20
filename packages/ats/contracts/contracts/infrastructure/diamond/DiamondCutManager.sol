// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DiamondCutManagerWrapper } from "./DiamondCutManagerWrapper.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IAccessControl } from "../../facets/features/interfaces/IAccessControl.sol";
import { IPause } from "../../facets/features/interfaces/IPause.sol";
import { _PAUSER_ROLE } from "../../constants/roles.sol";
import { LibAccess } from "../../lib/core/LibAccess.sol";
import { LibPause } from "../../lib/core/LibPause.sol";
import { LibArrayValidation } from "../lib/LibArrayValidation.sol";

bytes32 constant _DEFAULT_ADMIN_ROLE = bytes32(0);

abstract contract DiamondCutManager is IAccessControl, IPause, DiamondCutManagerWrapper {
    error AlreadyInitialized();

    modifier validateConfigurationId(bytes32 _configurationId) {
        _checkConfigurationId(_configurationId);
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IAccessControl implementation
    // ═══════════════════════════════════════════════════════════════════════════════

    function grantRole(bytes32 _role, address _account) external override returns (bool success_) {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_role));
        LibPause.requireNotPaused();

        if (!LibAccess.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(msg.sender, _account, _role);
        return true;
    }

    function revokeRole(bytes32 _role, address _account) external override returns (bool success_) {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_role));
        LibPause.requireNotPaused();

        success_ = LibAccess.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(msg.sender, _account, _role);
    }

    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkSameRolesAndActivesLength(_roles.length, _actives.length);
        LibArrayValidation.checkUniqueValues(_roles, _actives);

        success_ = LibAccess.applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    function renounceRole(bytes32 _role) external override returns (bool success_) {
        LibPause.requireNotPaused();

        address account = msg.sender;
        success_ = LibAccess.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IPause implementation
    // ═══════════════════════════════════════════════════════════════════════════════

    function pause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requireNotPaused();
        LibPause.pause();
        success_ = true;
    }

    function unpause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requirePaused();
        LibPause.unpause();
        success_ = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DiamondCut implementation (state-changing external functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    function createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) external override validateConfigurationId(_configurationId) {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        LibPause.requireNotPaused();
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
    ) external override validateConfigurationId(_configurationId) {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        LibPause.requireNotPaused();
        emit DiamondBatchConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _isLastBatch,
            _createBatchConfiguration(_configurationId, _facetConfigurations, _isLastBatch)
        );
    }

    function cancelBatchConfiguration(
        bytes32 _configurationId
    ) external override validateConfigurationId(_configurationId) {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        LibPause.requireNotPaused();
        _cancelBatchConfiguration(_configurationId);
        emit DiamondBatchConfigurationCanceled(_configurationId);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IAccessControl view functions
    // ═══════════════════════════════════════════════════════════════════════════════

    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return LibAccess.hasRole(_role, _account);
    }

    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = LibAccess.getRoleCountFor(_account);
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = LibAccess.getRolesFor(_account, _pageIndex, _pageLength);
    }

    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = LibAccess.getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = LibAccess.getRoleMembers(_role, _pageIndex, _pageLength);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IPause view functions
    // ═══════════════════════════════════════════════════════════════════════════════

    function isPaused() external view override returns (bool) {
        return LibPause.isPaused();
    }

    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCall(_diamondCutManagerStorage(), _configurationId, _version, _selector);
    }

    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view override returns (bool exists_) {
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
    ) external view override {
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
    ) external view override returns (uint256 facetsLength_) {
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
    ) external view override returns (IDiamondLoupe.Facet[] memory facets_) {
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
    ) external view override returns (uint256 facetSelectorsLength_) {
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
    ) external view override returns (bytes4[] memory facetSelectors_) {
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
    ) external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIdsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory facetAddresses_) {
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
    ) external view override returns (bytes32 facetId_) {
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
    ) external view override returns (IDiamondLoupe.Facet memory facet_) {
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
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddressByConfigurationIdVersionAndFacetId(
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
