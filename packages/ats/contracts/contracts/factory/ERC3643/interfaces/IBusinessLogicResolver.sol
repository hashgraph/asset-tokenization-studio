// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/infrastructure/diamond/IBusinessLogicResolver.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;
import { TRexIDiamondCutManager as IDiamondCutManager } from "./IDiamondCutManager.sol";

/**
 * @title Contracts Repository
 * @notice This contract is used to register and resolve Business Logics (aka contracts) addresses using
 *          a bytes32 as key.
 *
 *			All registered Business Logics must have the same number of versions, so that they have a common "latest"
 *			version and any previous version can be resolved for any existing Business Logic no matter when it was
 *			added to the register.
 *         The idea is that consumers should use Business Logics belonging to the same version since those are
 * 		considered fully compatible.
 *			Registering a business logic (register = update its latest version or add it to the registry) will increase the
 *			latest version for all Business Logics by 1.
 */
interface TRexIBusinessLogicResolver is IDiamondCutManager {
    enum VersionStatus {
        NONE,
        ACTIVATED,
        DEACTIVATED
    }

    /// @notice structure defining the input data type when registering or updating business logics
    struct BusinessLogicRegistryData {
        bytes32 businessLogicKey;
        address businessLogicAddress;
    }

    /// @notice structure defining the a given Version status
    struct VersionData {
        uint256 version;
        VersionStatus status;
    }

    struct BusinessLogicVersion {
        VersionData versionData;
        address businessLogicAddress;
    }

    /// @notice Emitted once when the BLR itself is initialised.
    /// @dev Fires exclusively from `initializeBusinessLogicResolver` after the storage write succeeds.
    event BusinessLogicResolverInitialized();

    /// @notice Event emitted when Business Logic(s) are registered (updated or added).
    /// @param businessLogics list of registered Business Logics.
    /// @param newLatestVersions new latest version per registered key, in the same order as `businessLogics`.
    event BusinessLogicsRegistered(BusinessLogicRegistryData[] businessLogics, uint256[] newLatestVersions);

    /// @notice Event emitted when an old address is replaced with a new one
    /// @param oldAddress old address been replaced.
    /// @param newAddress new address replacing the old one.
    event ReplacementAddressUpdated(address indexed oldAddress, address indexed newAddress);

    /// @notice Event emitted when a replacement address is removed
    /// @param oldAddress address for which the replacement is being removed.
    /// @param newAddressRemoved removed replacement address.
    event ReplacementAddressRemoved(address indexed oldAddress, address indexed newAddressRemoved);

    error BusinessLogicVersionDoesNotExist(uint256 version);
    error BusinessLogicKeyDuplicated(bytes32 businessLogicKey);
    error BusinessLogicKeyMismatch(address implementation, bytes32 actualKey, bytes32 expectedKey);
    error ZeroKeyNotValidForBusinessLogic();

    /**
     * @notice Thrown when a replacement address is already been replaced.
     * @param replacementAddress Replacement address that is already been replaced and thus cannot replaced another one.
     */
    error InvalidReplacementAddress(address replacementAddress);

    /**
     * @notice Thrown when a replaced address is already been used as replacement of other addresses.
     * @param replacedAddress Replaced address.
     */
    error InvalidReplacedAddress(address replacedAddress);
    error AddressZero();

    function initializeBusinessLogicResolver() external returns (bool success_);

    /**
     * @notice Update existing business logics addresses or add new business logics to the register.
     *         the BusinessLogicsRegistered event must be emitted.
     *         The latest "version" for all business logics is increased by 1.
     * @param _businessLogics list of business logics to be registered.
     */
    function registerBusinessLogics(BusinessLogicRegistryData[] calldata _businessLogics) external;

    /**
     * @notice Adds a list of selectors to the blacklist
     * @param _configurationId the configuration key to be checked.
     * @param _selectors list of selectors to be added to the blacklist
     */
    function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;

    /**
     * @notice Removes a list of selectors from the blacklist
     * @param _configurationId the configuration key to be checked.
     * @param _selectors list of selectors to be removed from the blacklist
     */
    function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;

    /**
     * @notice Updates the replacement address for a given address
     * @param _oldAddress the address to be replaced
     * @param _newAddress the new address to replace it with
     */
    function updateReplacementAddress(address _oldAddress, address _newAddress) external;

    /**
     * @notice Removes the replacement address for a given address
     * @param _oldAddress the address for which to remove the replacement
     */
    function removeReplacementAddress(address _oldAddress) external;

    /**
     * @notice Returns the replacement address for a given address, or address(0) if none exists
     */
    function getReplacementAddress(address _oldAddress) external view returns (address replacementAddress_);

    /**
     * @notice Returns the current status of a given version
     */
    function getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (VersionStatus status_);

    /**
     * @notice Returns the current latest version for all business logics
     */
    function getLatestVersion(bytes32 _businessLogicKey) external view returns (uint256 latestVersion_);

    /**
     * @notice Batched variant of `getLatestVersion` that resolves many keys in a single call.
     * @dev Issued so off-chain consumers can avoid one `eth_call` per key — JSON-RPC relays
     *      such as Hedera's enforce per-IP rate limits on `eth_call` and reject bursts.
     *      Returns 0 for keys that have never been registered (same semantics as the scalar
     *      variant).
     * @param _businessLogicKeys keys of the business logics to query.
     * @return latestVersions_ latest version per key, in the same order as `_businessLogicKeys`.
     */
    function getLatestVersions(
        bytes32[] calldata _businessLogicKeys
    ) external view returns (uint256[] memory latestVersions_);

    /**
     * @notice Returns the business logic address for the latest version
     * @param _businessLogicKey key of the business logic. Business Logic must be active.
     */
    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view returns (address businessLogicAddress_);

    /**
     * @notice Returns a specific business logic version address
     * @param _businessLogicKey key of the business logic. Business Logic must be active.
     * @param _version the version
     */
    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (address businessLogicAddress_);

    /**
     * @notice Returns the count of currently active business logics
     */
    function getBusinessLogicCount() external view returns (uint256 businessLogicCount_);

    /**
     * @notice Returns a list of business logic keys
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return businessLogicKeys_ list of business logic keys
     */
    function getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory businessLogicKeys_);

    /**
     * @notice Returns the list of selectors in the blacklist
     * @param _configurationId the configuration key to be checked.
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return selectors_ List of the selectors in the blacklist
     */
    function getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory selectors_);
}
