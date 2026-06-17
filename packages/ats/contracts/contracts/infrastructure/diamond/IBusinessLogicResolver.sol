// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IDiamondCutManager } from "./IDiamondCutManager.sol";

/**
 * @title IBusinessLogicResolver
 * @author Asset Tokenization Studio Team
 * @notice Registry for resolving Business Logic (facet) addresses by a bytes32 key and version.
 *         All registered Business Logics share a common version counter so consumers can safely
 *         target a single version and know it is fully compatible across every registered key.
 *         Registering or updating any Business Logic increments the shared latest version by 1.
 */
interface IBusinessLogicResolver is IDiamondCutManager {
    /// @notice Lifecycle state of a registered business logic version.
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

    /// @notice Pairs a version's status metadata with the implementation address registered for it.
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

    /// @notice Thrown when the requested version has never been registered for any business logic key.
    /// @param version The version number that does not exist in the registry.
    error BusinessLogicVersionDoesNotExist(uint256 version);

    /// @notice Thrown when two entries in a registration batch share the same business logic key.
    /// @param businessLogicKey The duplicated key found in the batch.
    error BusinessLogicKeyDuplicated(bytes32 businessLogicKey);

    /// @notice Thrown when the key reported by the implementation contract differs from the expected key.
    /// @param implementation Address of the implementation whose key was checked.
    /// @param actualKey The resolver key returned by the implementation.
    /// @param expectedKey The resolver key that was expected at registration time.
    error BusinessLogicKeyMismatch(address implementation, bytes32 actualKey, bytes32 expectedKey);

    /// @notice Thrown when a registration attempt uses the zero bytes32 value as the business logic key.
    error ZeroKeyNotValidForBusinessLogic();

    /**
     * @notice Initialises the Business Logic Resolver storage. Must be called once before any
     *         registration operations; subsequent calls revert.
     * @return success_ True when initialisation succeeds without reverting.
     */
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
     * @notice Returns the current status of a given version for a business logic key.
     * @param _businessLogicKey The bytes32 key identifying the business logic to query.
     * @param _version The version number to inspect.
     * @return status_ The `VersionStatus` (NONE, ACTIVATED, or DEACTIVATED) for that version.
     */
    function getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (VersionStatus status_);

    /**
     * @notice Returns the latest registered version for the given business logic key.
     * @param _businessLogicKey The bytes32 key identifying the business logic to query.
     * @return latestVersion_ The latest registered version for that key; 0 if never registered.
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
     * @notice Returns the business logic address for the latest version.
     * @param _businessLogicKey Key of the business logic. Business Logic must be active.
     * @return businessLogicAddress_ The implementation address registered at the latest version.
     */
    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view returns (address businessLogicAddress_);

    /**
     * @notice Returns the implementation address for a specific version of a business logic.
     * @param _businessLogicKey Key of the business logic. Business Logic must be active.
     * @param _version The version number to resolve.
     * @return businessLogicAddress_ The implementation address registered at that version.
     */
    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (address businessLogicAddress_);

    /**
     * @notice Returns the total number of business logic keys currently registered in the resolver.
     * @return businessLogicCount_ The count of registered business logic keys.
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
