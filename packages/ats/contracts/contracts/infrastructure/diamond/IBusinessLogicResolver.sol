// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IDiamondCutManager } from "./IDiamondCutManager.sol";

/**
 * @title IBusinessLogicResolver
 * @author Asset Tokenization Studio Team
 * @notice Registry for resolving Business Logic (facet) addresses by a bytes32 key and version.
 * @dev Each business logic key has its own independent version counter — `registerBusinessLogics()`
 *      increments `latestVersionByFacetId` only for the keys included in a given call. Omitting a
 *      previously-registered key from a call leaves that key's counter untouched; it does not
 *      advance alongside the keys that were included. Callers intending a full re-registration of
 *      every active key must supply all of them in the same call (or across the batches of the
 *      same registration operation) — the registry does not enforce this on their behalf, so a
 *      partial call is a valid, if incomplete, update rather than a rejected one.
 *
 *      `VersionStatus.DEACTIVATED` (see `setVersionStatus`) is unrelated to registration: it does
 *      not affect `registerBusinessLogics()` in any way and does not retire a key. It only blocks
 *      that one specific `(key, version)` pair from being selected into a new resolver-proxy
 *      configuration going forward; other versions of the same key remain selectable, and
 *      configurations that already reference the deactivated version are unaffected.
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

    /// @notice Event emitted when an old address is replaced with a new one
    /// @param replacedAddress old address been replaced.
    /// @param replacementAddress new address replacing the old one.
    event ReplacementAddressUpdated(address indexed replacedAddress, address indexed replacementAddress);

    /// @notice Event emitted when a replacement address is removed
    /// @param replacedAddress address for which the replacement is being removed.
    /// @param replacementAddressRemoved removed replacement address.
    event ReplacementAddressRemoved(address indexed replacedAddress, address indexed replacementAddressRemoved);

    /// @notice Event emitted when a business logic version's status is updated.
    /// @param businessLogicKey Business logic key whose version status changed.
    /// @param version Version number whose status changed.
    /// @param status New status assigned to the version.
    event VersionStatusUpdated(bytes32 indexed businessLogicKey, uint256 version, VersionStatus status);

    /// @notice Thrown when the requested version has never been registered for any business logic key.
    /// @param version The version number that does not exist in the registry.
    error BusinessLogicVersionDoesNotExist(uint256 version);

    /// @notice Thrown when `setVersionStatus` is called with `VersionStatus.NONE`, which represents
    ///         an unregistered version rather than a settable lifecycle state.
    error InvalidVersionStatus();

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
     * @notice Thrown when a replacement address is already been replaced.
     * @param replacementAddress Replacement address that is already been replaced and thus cannot replaced another one.
     */
    error InvalidReplacementAddress(address replacementAddress);

    /**
     * @notice Thrown when a replaced address is already been used as replacement of other addresses.
     * @param replacedAddress Replaced address.
     */
    error InvalidReplacedAddress(address replacedAddress);

    /**
     * @notice Initialises the Business Logic Resolver storage. Must be called once before any
     *         registration operations; subsequent calls revert.
     * @return success_ True when initialisation succeeds without reverting.
     */
    function initializeBusinessLogicResolver() external returns (bool success_);

    /**
     * @notice Update existing business logics addresses or add new business logics to the register.
     *         the BusinessLogicsRegistered event must be emitted.
     *         Each business logic key included in `_businessLogics` has its own independent
     *         version counter, increased by 1 for that key only. Keys omitted from the call keep
     *         their existing latest version untouched — see the per-key versioning note above.
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
     * @notice Sets the status of a registered business logic version.
     * @dev Restricted to `DEFAULT_ADMIN_ROLE`. Reverts with `InvalidVersionStatus` when `_status`
     *      is `VersionStatus.NONE`, and with `BusinessLogicVersionDoesNotExist` when `_version` is
     *      zero or has never been registered for `_businessLogicKey`. Marking a version
     *      `DEACTIVATED` prevents it from being selected into any new resolver-proxy
     *      configuration, but does not affect configurations that already reference it.
     * @param _businessLogicKey The bytes32 key identifying the business logic to update.
     * @param _version The version number to update.
     * @param _status The new status (`ACTIVATED` or `DEACTIVATED`) to assign to the version.
     */
    function setVersionStatus(bytes32 _businessLogicKey, uint256 _version, VersionStatus _status) external;

    /**
     * @notice Returns the replacement address for a given address, or address(0) if none exists
     * @param _oldAddress the address whose replacement is queried
     * @return replacementAddress_ the replacement address, or address(0) if none exists
     */
    function getReplacementAddress(address _oldAddress) external view returns (address replacementAddress_);

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

    /**
     * @notice Identity marker used to confirm a candidate address is a genuine
     *         `IBusinessLogicResolver`, checked via low-level `call()` rather than a direct
     *         interface call (see `DiamondCut::onlyValidBusinessLogicResolver`).
     * @return isBusinessLogicResolver_ Always `true` for a real `BusinessLogicResolver`.
     */
    function isBusinessLogicResolver() external pure returns (bool isBusinessLogicResolver_);
}
