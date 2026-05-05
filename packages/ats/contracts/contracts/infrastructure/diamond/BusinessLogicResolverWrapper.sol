// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSetBytes4 } from "../../infrastructure/utils/EnumerableSetBytes4.sol";
import { _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

abstract contract BusinessLogicResolverWrapper is IBusinessLogicResolver {
    struct BusinessLogicResolverDataStorage {
        mapping(bytes32 facetId => uint256 lastVersion) latestVersionByFacetId;
        // list of facetIds
        bytes32[] activeBusinessLogics;
        // facetId -> bool
        mapping(bytes32 => bool) businessLogicActive;
        // facetId -> pos (one per vesion) -> version + status + address
        mapping(bytes32 => IBusinessLogicResolver.BusinessLogicVersion[]) businessLogics;
        // version to status
        mapping(bytes32 facetIdAndVersion => IBusinessLogicResolver.VersionStatus status) statusByFacetIdAndVersion;
        bool initialized;
        mapping(bytes32 => EnumerableSetBytes4.Bytes4Set) selectorBlacklist;
    }

    modifier validVersion(bytes32 _businessLogicKey, uint256 _version) {
        _checkValidVersion(_businessLogicKey, _version);
        _;
    }

    modifier onlyValidKeys(IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas) {
        _checkValidKeys(_businessLogicsRegistryDatas);
        _;
    }

    function _registerBusinessLogics(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) internal returns (uint256[] memory latestVersion_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        IBusinessLogicResolver.BusinessLogicRegistryData memory _businessLogicsRegistryData;

        latestVersion_ = new uint256[](_businessLogicsRegistryDatas.length);

        for (uint256 index; index < _businessLogicsRegistryDatas.length; index++) {
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

            businessLogicResolverDataStorage.latestVersionByFacetId[_businessLogicsRegistryData.businessLogicKey]++;
            latestVersion_[index] = businessLogicResolverDataStorage.latestVersionByFacetId[
                _businessLogicsRegistryData.businessLogicKey
            ];

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
                        version: latestVersion_[index],
                        status: IBusinessLogicResolver.VersionStatus.ACTIVATED
                    }),
                    businessLogicAddress: _businessLogicsRegistryData.businessLogicAddress
                })
            );

            bytes32 facetIdAndVersion = keccak256(
                abi.encodePacked(_businessLogicsRegistryData.businessLogicKey, latestVersion_[index])
            );

            businessLogicResolverDataStorage.statusByFacetIdAndVersion[facetIdAndVersion] = IBusinessLogicResolver
                .VersionStatus
                .ACTIVATED;
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

    function _getVersionStatus(
        bytes32 _key,
        uint256 _version
    ) internal view returns (IBusinessLogicResolver.VersionStatus status_) {
        bytes32 facetIdAndVersion = keccak256(abi.encodePacked(_key, _version));
        status_ = _businessLogicResolverStorage().statusByFacetIdAndVersion[facetIdAndVersion];
    }

    function _getLatestVersion(bytes32 _key) internal view returns (uint256 latestVersion_) {
        latestVersion_ = _businessLogicResolverStorage().latestVersionByFacetId[_key];
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

    function _businessLogicResolverStorage()
        internal
        pure
        returns (BusinessLogicResolverDataStorage storage businessLogicResolverData_)
    {
        bytes32 position = _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            businessLogicResolverData_.slot := position
        }
    }

    function _checkValidVersion(bytes32 _businessLogicKey, uint256 _version) private view {
        if (_version == 0 || _version > _businessLogicResolverStorage().latestVersionByFacetId[_businessLogicKey])
            revert BusinessLogicVersionDoesNotExist(_version);
    }

    function _checkValidKeys(
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
