// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DiamondCutManager } from "./DiamondCutManager.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Business Logic Resolver
 * @notice Maintains versioned business logic registrations and resolver-proxy configurations.
 * @dev Combines business-logic version resolution with diamond-cut configuration management.
 *      Initialisation grants the default admin role to the caller and must occur once.
 * @author Asset Tokenization Studio Team
 */
contract BusinessLogicResolver is IBusinessLogicResolver, DiamondCutManager {
    /**
     * @notice Indicates that a requested operation is not implemented by this resolver.
     * @dev Reserved for interface compatibility or future extension points.
     */
    error Unimplemented();

    /// @inheritdoc IBusinessLogicResolver
    /// @dev Grants `DEFAULT_ADMIN_ROLE` to the current EVM sender and marks the resolver as
    ///      initialised before emitting `BusinessLogicResolverInitialized`.
    function initializeBusinessLogicResolver()
        external
        override
        onlyUninitialized(_isInitialized())
        returns (bool success_)
    {
        AccessControlStorageWrapper.grantRole(DEFAULT_ADMIN_ROLE, EvmAccessors.getMsgSender());
        _setInitialized(true);
        emit BusinessLogicResolverInitialized();
        success_ = true;
    }

    /// @inheritdoc IBusinessLogicResolver
    /// @dev Restricted to default admins while unpaused. Validates non-zero unique keys and
    ///      non-zero addresses, then emits the assigned versions for each registered logic.
    function registerBusinessLogics(
        BusinessLogicRegistryData[] calldata _businessLogics
    ) external override onlyValidKeysAndAddresses(_businessLogics) onlyRole(DEFAULT_ADMIN_ROLE) onlyUnpaused {
        uint256[] memory latestVersion = _registerBusinessLogics(_businessLogics);
        emit BusinessLogicsRegistered(_businessLogics, latestVersion);
    }

    /// @inheritdoc IBusinessLogicResolver
    /// @dev Restricted to default admins while unpaused. Blacklisted selectors are rejected
    ///      when future configurations register facet selectors for the same configuration.
    function addSelectorsToBlacklist(
        bytes32 _configurationId,
        bytes4[] calldata _selectors
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyUnpaused {
        _addSelectorsToBlacklist(_configurationId, _selectors);
    }

    /// @inheritdoc IBusinessLogicResolver
    /// @dev Restricted to default admins while unpaused. Removing a selector only affects
    ///      subsequent validation and does not mutate already activated configurations.
    function removeSelectorsFromBlacklist(
        bytes32 _configurationId,
        bytes4[] calldata _selectors
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyUnpaused {
        _removeSelectorsFromBlacklist(_configurationId, _selectors);
    }

    /// @inheritdoc IBusinessLogicResolver
    function updateReplacementAddress(
        address _replacedAddress,
        address _replacementAddress
    )
        external
        override
        validateAddressNotZero(_replacedAddress)
        validateAddressNotZero(_replacementAddress)
        onlyNotReplacement(_replacedAddress)
        onlyNotReplaced(_replacementAddress)
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyUnpaused
    {
        _updateReplacementAddress(_replacedAddress, _replacementAddress);
        emit ReplacementAddressUpdated(_replacedAddress, _replacementAddress);
    }

    /// @inheritdoc IBusinessLogicResolver
    function removeReplacementAddress(
        address _replacedAddress
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyUnpaused {
        address replacementAddressRemoved = _removeReplacementAddress(_replacedAddress);
        emit ReplacementAddressRemoved(_replacedAddress, replacementAddressRemoved);
    }

    /// @inheritdoc IBusinessLogicResolver
    function getReplacementAddress(address _replacedAddress) external view returns (address replacementAddress_) {
        replacementAddress_ = _getReplacementAddress(_replacedAddress);
    }

    /// @inheritdoc IBusinessLogicResolver
    function getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view override validVersion(_businessLogicKey, _version) returns (VersionStatus status_) {
        status_ = _getVersionStatus(_businessLogicKey, _version);
    }

    /// @inheritdoc IBusinessLogicResolver
    function getLatestVersion(bytes32 _businessLogicKey) external view override returns (uint256 latestVersion_) {
        latestVersion_ = _getLatestVersion(_businessLogicKey);
    }

    /// @inheritdoc IBusinessLogicResolver
    /// @dev Iterates over all supplied keys and returns zero for keys with no registered version.
    function getLatestVersions(
        bytes32[] calldata _businessLogicKeys
    ) external view override returns (uint256[] memory latestVersions_) {
        uint256 length = _businessLogicKeys.length;
        latestVersions_ = new uint256[](length);
        for (uint256 i; i < length; ) {
            latestVersions_[i] = _getLatestVersion(_businessLogicKeys[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IBusinessLogicResolver
    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view override returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveLatestBusinessLogic(_businessLogicKey);
    }

    /// @inheritdoc IBusinessLogicResolver
    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view override validVersion(_businessLogicKey, _version) returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(_businessLogicKey, _version);
    }

    /// @inheritdoc IBusinessLogicResolver
    function getBusinessLogicCount() external view override returns (uint256 businessLogicCount_) {
        businessLogicCount_ = _getBusinessLogicCount();
    }

    /// @inheritdoc IBusinessLogicResolver
    function getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory businessLogicKeys_) {
        businessLogicKeys_ = _getBusinessLogicKeys(_pageIndex, _pageLength);
    }

    /// @inheritdoc IBusinessLogicResolver
    function getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory selectors_) {
        return _getSelectorsBlacklist(_configurationId, _pageIndex, _pageLength);
    }
}
