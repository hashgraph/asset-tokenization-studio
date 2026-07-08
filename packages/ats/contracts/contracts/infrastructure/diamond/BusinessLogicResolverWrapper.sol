// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSetBytes4 } from "../../infrastructure/utils/EnumerableSetBytes4.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { DefaultValueValidation } from "../utils/DefaultValueValidation.sol";

/**
 * @notice Storage slot used by the business-logic resolver wrapper.
 * @dev ERC-7201-style location; changing it corrupts resolver state across upgrades.
 */
/// @custom:hash storage BusinessLogicResolver
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_BUSINESS_LOGIC_RESOLVER = 0xde52d5af2ee0e84dfa9eb9bcc42ec14eed20a1d286bfef34d73589ea7ee18800;

/**
 * @notice Diamond storage backing the business-logic resolver registry.
 * @dev Records, per facet id, the active version set, status, and selector blacklist that
 *      determine which logic a resolver-proxy delegates to. Hoisted to file scope per the
 *      project's ERC-7201 storage convention; new fields must be appended below the
 *      APPEND-ONLY marker to preserve upgrade safety.
 * @param initialized Whether the resolver storage has been initialised.
 * @param latestVersionByFacetId Latest registered version for each business logic key.
 * @param activeBusinessLogics Ordered list of active business logic keys.
 * @param businessLogicActive Whether a business logic key is currently active.
 * @param businessLogics Version history and implementation address per business logic key.
 * @param statusByFacetIdAndVersion Status indexed by the hash of key and version.
 * @param selectorBlacklist Blacklisted selectors per resolver-proxy configuration id.
 * @custom:storage-location erc7201:security.token.standard.storage.BusinessLogicResolver
 */
struct BusinessLogicResolverDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 facetId => uint256 lastVersion) latestVersionByFacetId;
    // list of facetIds
    bytes32[] activeBusinessLogics;
    // facetId -> bool
    mapping(bytes32 => bool) businessLogicActive;
    // facetId -> pos (one per vesion) -> version + status + address
    mapping(bytes32 => IBusinessLogicResolver.BusinessLogicVersion[]) businessLogics;
    // version to status
    mapping(bytes32 facetIdAndVersion => IBusinessLogicResolver.VersionStatus status) statusByFacetIdAndVersion;
    mapping(bytes32 => EnumerableSetBytes4.Bytes4Set) selectorBlacklist;
    // ─── APPEND-ONLY ZONE BELOW ───
    mapping(address => address) replacementAddressMap;
    mapping(address => uint256) replacementAddressCount;
}

/**
 * @title Business Logic Resolver Wrapper
 * @notice Provides internal storage and registry operations for business logic resolution.
 * @dev Implements shared resolver mechanics for derived contracts, including version
 *      registration, selector blacklists, pagination helpers, and ERC-7201 storage access.
 * @author Asset Tokenization Studio Team
 */
abstract contract BusinessLogicResolverWrapper is IBusinessLogicResolver {
    /**
     * @notice Restricts execution to an existing version for the given business logic key.
     * @dev Reverts when the version is zero or exceeds the latest registered version.
     * @param _businessLogicKey Business logic key whose version is validated.
     * @param _version Version number to validate.
     */
    modifier validVersion(bytes32 _businessLogicKey, uint256 _version) {
        _checkValidVersion(_businessLogicKey, _version);
        _;
    }

    /**
     * @notice Restricts execution to non-zero, unique keys and non-zero implementation addresses.
     * @dev Validates all entries before the guarded function executes; duplicate detection is
     *      quadratic in the number of registry entries.
     * @param _businessLogicsRegistryDatas Registry entries to validate.
     */
    modifier onlyValidKeysAndAddresses(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) {
        _checkValidKeysAndAddresses(_businessLogicsRegistryDatas);
        _;
    }

    /**
     * @notice Restricts execution to addresses that have not themselves been replaced.
     * @dev Reverts via `_checkNotReplaced` when `_address` already maps to a replacement.
     * @param _address Address whose non-replaced status is validated.
     */
    modifier onlyNotReplaced(address _address) {
        _checkNotReplaced(_address);
        _;
    }

    /**
     * @notice Restricts execution to addresses that are not registered as a replacement.
     * @dev Reverts via `_checkNotReplacement` when `_address` is in use as a replacement.
     * @param _address Address whose non-replacement status is validated.
     */
    modifier onlyNotReplacement(address _address) {
        _checkNotReplacement(_address);
        _;
    }

    /**
     * @notice Registers new business logic versions and activates unseen business logic keys.
     * @dev Increments the latest version per key, validates the implementation static resolver
     *      key, stores each implementation as activated, and returns versions in input order.
     *      Reverts if an implementation reports a different key.
     * @param _businessLogicsRegistryDatas Business logic registry entries to add.
     * @return latestVersion_ New latest version per entry, aligned with input order.
     */
    function _registerBusinessLogics(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) internal returns (uint256[] memory latestVersion_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        IBusinessLogicResolver.BusinessLogicRegistryData memory _businessLogicsRegistryData;
        uint256 length = _businessLogicsRegistryDatas.length;
        latestVersion_ = new uint256[](length);
        for (uint256 index; index < length; ) {
            _businessLogicsRegistryData = _businessLogicsRegistryDatas[index];
            bytes32 actualBLKey = IStaticFunctionSelectors(_businessLogicsRegistryData.businessLogicAddress)
                .getStaticResolverKey();
            if (actualBLKey != _businessLogicsRegistryData.businessLogicKey) {
                revert BusinessLogicKeyMismatch(
                    _businessLogicsRegistryData.businessLogicAddress,
                    actualBLKey,
                    _businessLogicsRegistryData.businessLogicKey
                );
            }
            uint256 newVersion = ++businessLogicResolverDataStorage.latestVersionByFacetId[
                _businessLogicsRegistryData.businessLogicKey
            ];
            latestVersion_[index] = newVersion;
            if (!businessLogicResolverDataStorage.businessLogicActive[_businessLogicsRegistryData.businessLogicKey]) {
                businessLogicResolverDataStorage.businessLogicActive[
                    _businessLogicsRegistryData.businessLogicKey
                ] = true;
                businessLogicResolverDataStorage.activeBusinessLogics.push(
                    _businessLogicsRegistryData.businessLogicKey
                );
            }
            businessLogicResolverDataStorage.businessLogics[_businessLogicsRegistryData.businessLogicKey].push(
                IBusinessLogicResolver.BusinessLogicVersion({
                    versionData: IBusinessLogicResolver.VersionData({
                        version: newVersion,
                        status: IBusinessLogicResolver.VersionStatus.ACTIVATED
                    }),
                    businessLogicAddress: _businessLogicsRegistryData.businessLogicAddress
                })
            );
            businessLogicResolverDataStorage.statusByFacetIdAndVersion[
                keccak256(abi.encodePacked(_businessLogicsRegistryData.businessLogicKey, newVersion))
            ] = IBusinessLogicResolver.VersionStatus.ACTIVATED;
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Sets the resolver initialisation flag.
     * @dev Mutates only the lifecycle flag; callers must enforce initialisation policy.
     * @param _initialized New initialisation state.
     */
    function _setInitialized(bool _initialized) internal {
        _businessLogicResolverStorage().initialized = _initialized;
    }

    /**
     * @notice Adds selectors to the blacklist for a resolver-proxy configuration.
     * @dev Duplicate selectors are ignored by the underlying enumerable set. Mutates only the
     *      blacklist associated with `_configurationId`.
     * @param _configurationId Resolver-proxy configuration identifier.
     * @param _selectors Selectors to blacklist.
     */
    function _addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            EnumerableSetBytes4.add(selectorBlacklist, _selectors[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Removes selectors from the blacklist for a resolver-proxy configuration.
     * @dev Missing selectors are ignored by the underlying enumerable set. Mutates only the
     *      blacklist associated with `_configurationId`.
     * @param _configurationId Resolver-proxy configuration identifier.
     * @param _selectors Selectors to remove from the blacklist.
     */
    function _removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            EnumerableSetBytes4.remove(selectorBlacklist, _selectors[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Registers `_newAddress` as the replacement for `_oldAddress`.
     * @dev Maps `_oldAddress` to `_newAddress` and increments the replacement reference count for
     *      `_newAddress`.
     * @param _oldAddress Address being replaced.
     * @param _newAddress Address that supersedes `_oldAddress`.
     */
    function _updateReplacementAddress(address _oldAddress, address _newAddress) internal {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        businessLogicResolverDataStorage.replacementAddressMap[_oldAddress] = _newAddress;
        ++businessLogicResolverDataStorage.replacementAddressCount[_newAddress];
    }

    /**
     * @notice Clears the replacement registered for `_oldAddress`.
     * @dev Resets the mapping to the zero address and decrements the replacement reference count for
     *      the removed address. No-ops and returns the zero address when no replacement exists.
     * @param _oldAddress Address whose replacement is removed.
     * @return newAddressRemoved_ The replacement address that was cleared, or the zero address if none.
     */
    function _removeReplacementAddress(address _oldAddress) internal returns (address newAddressRemoved_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        newAddressRemoved_ = businessLogicResolverDataStorage.replacementAddressMap[_oldAddress];
        if (newAddressRemoved_ == address(0)) return newAddressRemoved_;
        businessLogicResolverDataStorage.replacementAddressMap[_oldAddress] = address(0);
        --businessLogicResolverDataStorage.replacementAddressCount[newAddressRemoved_];
    }

    /**
     * @notice Returns the status stored for a business logic version.
     * @dev Returns `NONE` for keys or versions without an explicit status entry.
     * @param _businessLogicKey Business logic key to query.
     * @param _version Version number to query.
     * @return status_ Current status of the requested version.
     */
    function _getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (IBusinessLogicResolver.VersionStatus status_) {
        status_ = _businessLogicResolverStorage().statusByFacetIdAndVersion[
            keccak256(abi.encodePacked(_businessLogicKey, _version))
        ];
    }

    /**
     * @notice Returns the latest registered version for a business logic key.
     * @dev Returns zero when the key has never been registered.
     * @param _businessLogicKey Business logic key to query.
     * @return latestVersion_ Latest version recorded for the key.
     */
    function _getLatestVersion(bytes32 _businessLogicKey) internal view returns (uint256 latestVersion_) {
        latestVersion_ = _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey];
    }

    /**
     * @notice Resolves the latest implementation address for a business logic key.
     * @dev Delegates to version-based resolution using the key's latest recorded version.
     *      Returns `address(0)` when the key is inactive.
     * @param _businessLogicKey Business logic key to resolve.
     * @return businessLogicAddress_ Implementation address for the latest version.
     */
    function _resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) internal view returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(
            _businessLogicKey,
            _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey]
        );
    }

    /**
     * @notice Returns the number of active business logic keys.
     * @dev Reflects the length of the active key list and excludes inactive keys.
     * @return businessLogicCount_ Number of active business logic keys.
     */
    function _getBusinessLogicCount() internal view returns (uint256 businessLogicCount_) {
        businessLogicCount_ = _businessLogicResolverStorage().activeBusinessLogics.length;
    }

    /**
     * @notice Returns a paginated list of active business logic keys.
     * @dev Uses the shared pagination helper; ordering follows first activation order.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of keys to return.
     * @return businessLogicKeys_ Page of active business logic keys.
     */
    function _getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory businessLogicKeys_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, businessLogicResolverDataStorage.activeBusinessLogics.length);
        businessLogicKeys_ = new bytes32[](size);
        for (uint256 index; index < size; ) {
            unchecked {
                businessLogicKeys_[index] = businessLogicResolverDataStorage.activeBusinessLogics[index + start];
                ++index;
            }
        }
    }

    /**
     * @notice Resolves the implementation address for an active business logic version.
     * @dev Returns the zero address when the business logic key is inactive. Versions are
     *      one-based and map to zero-based storage indexes, so callers must pass a non-zero
     *      version already known to exist.
     * @param _businessLogicKey Identifier of the business logic family to resolve.
     * @param _version One-based version of the requested business logic implementation.
     * @return The implementation address registered for the requested key and version.
     */
    function _resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (address) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        if (!businessLogicResolverDataStorage.businessLogicActive[_businessLogicKey]) {
            return address(0);
        }
        return businessLogicResolverDataStorage.businessLogics[_businessLogicKey][_version - 1].businessLogicAddress;
    }

    /**
     * @notice Returns a paginated selector blacklist for a configuration.
     * @dev Reads from the enumerable set associated with `_configurationId`.
     * @param _configurationId Resolver-proxy configuration identifier.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of selectors to return.
     * @return page_ Page of blacklisted selectors.
     */
    function _getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory page_) {
        page_ = Pagination.getFromSet(
            _businessLogicResolverStorage().selectorBlacklist[_configurationId],
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Checks whether a selector is blacklisted for a configuration.
     * @dev Performs an enumerable-set membership lookup.
     * @param _configurationId Resolver-proxy configuration identifier.
     * @param _selector Function selector to check.
     * @return True when the selector is blacklisted for the configuration.
     */
    function _isSelectorBlacklisted(bytes32 _configurationId, bytes4 _selector) internal view returns (bool) {
        return
            EnumerableSetBytes4.contains(
                _businessLogicResolverStorage().selectorBlacklist[_configurationId],
                _selector
            );
    }

    /**
     * @notice Reverts if any selector is blacklisted for a configuration.
     * @dev Reads the blacklist from business-logic resolver storage.
     * @param _configurationId Identifier of the configuration whose blacklist applies.
     * @param _selectors Selectors to validate.
     */
    function _checkSelectorsBlacklist(bytes32 _configurationId, bytes4[] memory _selectors) internal view {
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            if (_isSelectorBlacklisted(_configurationId, selector)) {
                revert SelectorBlacklisted(selector);
            }
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Returns whether resolver storage has been initialised.
     * @dev Reads the lifecycle flag used by derived initialisation flows.
     * @return True when the resolver has been marked as initialised.
     */
    function _isInitialized() internal view returns (bool) {
        return _businessLogicResolverStorage().initialized;
    }

    /**
     * @notice Returns the replacement registered for an address.
     * @dev Returns the zero address when `_address` has not been replaced.
     * @param _address Address to query.
     * @return The replacement address mapped to `_address`, or the zero address if none.
     */
    function _getReplacementAddress(address _address) internal view returns (address) {
        return _businessLogicResolverStorage().replacementAddressMap[_address];
    }

    /**
     * @notice Returns how many times an address is registered as a replacement.
     * @dev A non-zero count means `_address` is currently in use as a replacement for one or more
     *      addresses.
     * @param _address Address to query.
     * @return The replacement reference count for `_address`.
     */
    function _getReplacementAddressCount(address _address) internal view returns (uint256) {
        return _businessLogicResolverStorage().replacementAddressCount[_address];
    }

    /**
     * @notice Reverts when a replacement address is itself been replaced by another one.
     * @param _address The replacement address been replaced.
     */
    function _checkNotReplaced(address _address) internal view {
        if (_getReplacementAddress(_address) != address(0)) {
            revert InvalidReplacementAddress(_address);
        }
    }

    /**
     * @notice Reverts when a replaced address is itself replacing other addresses.
     * @param _address The replaced address been used as replacement.
     */
    function _checkNotReplacement(address _address) internal view {
        if (_getReplacementAddressCount(_address) > 0) {
            revert InvalidReplacedAddress(_address);
        }
    }

    /**
     * @notice Validates that a business logic version exists.
     * @dev Reverts when `_version` is zero or greater than the key's latest registered version.
     * @param _businessLogicKey Business logic key whose latest version bounds the check.
     * @param _version Version number to validate.
     */
    function _checkValidVersion(bytes32 _businessLogicKey, uint256 _version) private view {
        if (_version == 0 || _version > _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey])
            revert BusinessLogicVersionDoesNotExist(_version);
    }

    /**
     * @notice Returns the resolver wrapper storage pointer.
     * @dev Uses a fixed ERC-7201-style storage slot shared by all derived implementations.
     * @return businessLogicResolverData_ Storage pointer for resolver state.
     */
    function _businessLogicResolverStorage()
        private
        pure
        returns (BusinessLogicResolverDataStorage storage businessLogicResolverData_)
    {
        bytes32 position = STORAGE_LOCATION_BUSINESS_LOGIC_RESOLVER;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            businessLogicResolverData_.slot := position
        }
    }

    /**
     * @notice Validates registry keys and implementation addresses.
     * @dev Reverts on zero keys, zero implementation addresses, or duplicate keys within the
     *      submitted batch. Duplicate detection is O(n²).
     * @param _businessLogicsRegistryDatas Registry entries to validate.
     */
    function _checkValidKeysAndAddresses(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) private pure {
        // Check all previously activated keys are in the array.this
        // Check non duplicated keys.
        bytes32 currentKey;
        uint256 length = _businessLogicsRegistryDatas.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            currentKey = _businessLogicsRegistryDatas[index].businessLogicKey;
            if (uint256(currentKey) == 0) revert ZeroKeyNotValidForBusinessLogic();
            DefaultValueValidation.checkZeroAddress(_businessLogicsRegistryDatas[index].businessLogicAddress);
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (currentKey == _businessLogicsRegistryDatas[innerIndex].businessLogicKey)
                    revert BusinessLogicKeyDuplicated(currentKey);
                unchecked {
                    ++innerIndex;
                }
            }
            unchecked {
                ++index;
            }
        }
    }
}
