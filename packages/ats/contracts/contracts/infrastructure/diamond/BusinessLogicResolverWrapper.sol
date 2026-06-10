// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSetBytes4 } from "../../infrastructure/utils/EnumerableSetBytes4.sol";

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { DefaultValueValidation } from "../utils/DefaultValueValidation.sol";

/// @custom:hash storage BusinessLogicResolver
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_BUSINESS_LOGIC_RESOLVER = 0xde52d5af2ee0e84dfa9eb9bcc42ec14eed20a1d286bfef34d73589ea7ee18800;

/**
 * @notice Diamond storage backing the business-logic resolver registry.
 * @dev Records, per facet id, the active version set, status, and selector blacklist that
 *      determine which logic a resolver-proxy delegates to. Hoisted to file scope per the
 *      project's ERC-7201 storage convention; new fields must be appended below the
 *      APPEND-ONLY marker to preserve upgrade safety.
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
    // ─── APPEND-ONLY ZONE BELOW ───
    mapping(address => address) replacementAddressMap;
    mapping(address => bool) isReplacementAddress;
}

abstract contract BusinessLogicResolverWrapper is IBusinessLogicResolver {
    modifier validVersion(bytes32 _businessLogicKey, uint256 _version) {
        _checkValidVersion(_businessLogicKey, _version);
        _;
    }

    modifier onlyValidKeysAndAddresses(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) {
        _checkValidKeysAndAddresses(_businessLogicsRegistryDatas);
        _;
    }

    modifier validateReplacementAddress(address _replacementAddress) {
        _checkReplacementAddress(_replacementAddress);
        _;
    }

    modifier validateReplacedAddress(address _replacedAddress) {
        _checkReplacedAddress(_replacedAddress);
        _;
    }

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

            IBusinessLogicResolver.BusinessLogicVersion[] storage versions = businessLogicResolverDataStorage
                .businessLogics[_businessLogicsRegistryData.businessLogicKey];

            versions.push(
                IBusinessLogicResolver.BusinessLogicVersion({
                    versionData: IBusinessLogicResolver.VersionData({
                        version: newVersion,
                        status: IBusinessLogicResolver.VersionStatus.ACTIVATED
                    }),
                    businessLogicAddress: _businessLogicsRegistryData.businessLogicAddress
                })
            );

            bytes32 facetIdAndVersion = keccak256(
                abi.encodePacked(_businessLogicsRegistryData.businessLogicKey, newVersion)
            );

            businessLogicResolverDataStorage.statusByFacetIdAndVersion[facetIdAndVersion] = IBusinessLogicResolver
                .VersionStatus
                .ACTIVATED;

            unchecked {
                ++index;
            }
        }
    }

    function _addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            EnumerableSetBytes4.add(selectorBlacklist, selector);
            unchecked {
                ++index;
            }
        }
    }

    function _removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            EnumerableSetBytes4.remove(selectorBlacklist, selector);
            unchecked {
                ++index;
            }
        }
    }

    function _updateReplacementAddress(address _oldAddress, address _newAddress) internal {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();
        businessLogicResolverDataStorage.replacementAddressMap[_oldAddress] = _newAddress;
        if (_newAddress == address(0)) return;
        businessLogicResolverDataStorage.isReplacementAddress[_newAddress] = true;
    }

    function _getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (IBusinessLogicResolver.VersionStatus status_) {
        bytes32 facetIdAndVersion = keccak256(abi.encodePacked(_businessLogicKey, _version));
        status_ = _businessLogicResolverStorage().statusByFacetIdAndVersion[facetIdAndVersion];
    }

    function _getLatestVersion(bytes32 _businessLogicKey) internal view returns (uint256 latestVersion_) {
        latestVersion_ = _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey];
    }

    function _resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) internal view returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(
            _businessLogicKey,
            _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey]
        );
    }

    function _getBusinessLogicCount() internal view returns (uint256 businessLogicCount_) {
        businessLogicCount_ = _businessLogicResolverStorage().activeBusinessLogics.length;
    }

    function _getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory businessLogicKeys_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);

        uint256 size = Pagination.getSize(start, end, businessLogicResolverDataStorage.activeBusinessLogics.length);
        businessLogicKeys_ = new bytes32[](size);

        for (uint256 index; index < size; index++) {
            businessLogicKeys_[index] = businessLogicResolverDataStorage.activeBusinessLogics[index + start];
        }
    }

    /**
     * @notice Resolves the business logic address registered for `_businessLogicKey` at `_version`.
     * @dev Relies on the invariant maintained by `_registerBusinessLogics`:
     *      `businessLogics[key].length == latestVersionByFacetId[key]`,
     *      so version `v` lives at array index `v - 1`. The `validVersion` modifier on the
     *      external entry points gates `v` to `[1, latestVersionByFacetId[key]]`, keeping
     *      the array access in bounds.
     * @param _businessLogicKey key of the business logic to resolve.
     * @param _version version to resolve. Must satisfy `1 <= _version <= latest`.
     * @return businessLogic address registered for the given key/version, or `address(0)` if
     *         the key has been deactivated.
     */
    function _resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (address) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        if (!businessLogicResolverDataStorage.businessLogicActive[_businessLogicKey]) {
            return address(0);
        }

        IBusinessLogicResolver.BusinessLogicVersion memory businessLogicVersion = businessLogicResolverDataStorage
            .businessLogics[_businessLogicKey][_version - 1];
        return businessLogicVersion.businessLogicAddress;
    }

    function _getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory page_) {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        page_ = Pagination.getFromSet(selectorBlacklist, _pageIndex, _pageLength);
    }

    function _getReplacementAddress(address _address) internal view returns (address) {
        return _businessLogicResolverStorage().replacementAddressMap[_address];
    }

    function _isReplacementAddress(address _address) internal view returns (bool) {
        return _businessLogicResolverStorage().isReplacementAddress[_address];
    }

    /**
     * @notice Reverts when a replacement address is itself been replaced by another one.
     * @param _replacementAddress The replacement address been replaced.
     */
    function _checkReplacementAddress(address _replacementAddress) internal view {
        if (_getReplacementAddress(_replacementAddress) != address(0)) {
            revert InvalidReplacementAddress(_replacementAddress);
        }
    }

    /**
     * @notice Reverts when a replaced address is itself replacing other addresses.
     * @param _replacedAddress The replaced address been used as replacement.
     */
    function _checkReplacedAddress(address _replacedAddress) internal view {
        if (_replacedAddress == address(0)) {
            revert AddressZero();
        }

        if (_isReplacementAddress(_replacedAddress)) {
            revert InvalidReplacedAddress(_replacedAddress);
        }
    }

    function _businessLogicResolverStorage()
        internal
        pure
        returns (BusinessLogicResolverDataStorage storage businessLogicResolverData_)
    {
        bytes32 position = STORAGE_LOCATION_BUSINESS_LOGIC_RESOLVER;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            businessLogicResolverData_.slot := position
        }
    }

    function _checkValidVersion(bytes32 _businessLogicKey, uint256 _version) private view {
        if (_version == 0 || _version > _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey])
            revert BusinessLogicVersionDoesNotExist(_version);
    }

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
