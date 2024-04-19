pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';
import {LibCommon} from '../layer_1/common/LibCommon.sol';
import {
    IBusinessLogicResolverWrapper
} from '../interfaces/resolver/IBusinessLogicResolverWrapper.sol';
import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';
import {
    _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {
    _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION
} from '../constants/storagePositions.sol';

contract BusinessLogicResolverWrapper is IBusinessLogicResolverWrapper {
    struct BusinessLogicResolverDataStorage {
        uint256 latestVersion;
        bytes32[] activeBusinessLogics;
        mapping(bytes32 => bool) businessLogicActive;
        mapping(bytes32 => IBusinessLogicResolver.BusinessLogicVersion[]) businessLogics;
        mapping(bytes32 => uint256) businessLogicVersionIndex;
        mapping(uint256 => IBusinessLogicResolver.VersionStatus) versionStatuses;
        bool initialized;
    }

    modifier validVersion(uint256 _version) {
        _checkValidVersion(_version);
        _;
    }

    modifier onlyValidKeys(
        IBusinessLogicResolver.BusinessLogicRegistryData[]
            calldata _businessLogicsRegistryDatas
    ) {
        _checkValidKeys(_businessLogicsRegistryDatas);
        _;
    }

    function _registerBusinessLogics(
        IBusinessLogicResolver.BusinessLogicRegistryData[]
            calldata _businessLogicsRegistryDatas
    ) internal virtual returns (uint256 latestVersion_) {
        BusinessLogicResolverDataStorage
            storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        businessLogicResolverDataStorage.latestVersion++;
        IBusinessLogicResolver.BusinessLogicRegistryData
            memory _businessLogicsRegistryData;
        for (
            uint256 index;
            index < _businessLogicsRegistryDatas.length;
            index++
        ) {
            _businessLogicsRegistryData = _businessLogicsRegistryDatas[index];

            if (
                !businessLogicResolverDataStorage.businessLogicActive[
                    _businessLogicsRegistryData.businessLogicKey
                ]
            ) {
                businessLogicResolverDataStorage.businessLogicActive[
                    _businessLogicsRegistryData.businessLogicKey
                ] = true;
                businessLogicResolverDataStorage.activeBusinessLogics.push(
                    _businessLogicsRegistryData.businessLogicKey
                );
            }

            IBusinessLogicResolver.BusinessLogicVersion[]
                storage versions = businessLogicResolverDataStorage
                    .businessLogics[
                        _businessLogicsRegistryData.businessLogicKey
                    ];

            versions.push(
                IBusinessLogicResolver.BusinessLogicVersion({
                    versionData: IBusinessLogicResolver.VersionData({
                        version: businessLogicResolverDataStorage.latestVersion,
                        status: IBusinessLogicResolver.VersionStatus.ACTIVATED
                    }),
                    businessLogicAddress: _businessLogicsRegistryData
                        .businessLogicAddress
                })
            );
            businessLogicResolverDataStorage.businessLogicVersionIndex[
                keccak256(
                    abi.encodePacked(
                        _businessLogicsRegistryData.businessLogicKey,
                        businessLogicResolverDataStorage.latestVersion
                    )
                )
            ] = versions.length - 1;
        }

        businessLogicResolverDataStorage.versionStatuses[
            businessLogicResolverDataStorage.latestVersion
        ] = IBusinessLogicResolver.VersionStatus.ACTIVATED;

        return businessLogicResolverDataStorage.latestVersion;
    }

    function _getVersionStatus(
        uint256 _version
    )
        internal
        view
        virtual
        returns (IBusinessLogicResolver.VersionStatus status_)
    {
        status_ = _businessLogicResolverStorage().versionStatuses[_version];
    }

    function _getLatestVersion()
        internal
        view
        virtual
        returns (uint256 latestVersion_)
    {
        latestVersion_ = _businessLogicResolverStorage().latestVersion;
    }

    function _resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) internal view virtual returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(
            _businessLogicKey,
            _businessLogicResolverStorage().latestVersion
        );
    }

    function _getBusinessLogicCount()
        internal
        view
        virtual
        returns (uint256 businessLogicCount_)
    {
        businessLogicCount_ = _businessLogicResolverStorage()
            .activeBusinessLogics
            .length;
    }

    function _getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory businessLogicKeys_) {
        BusinessLogicResolverDataStorage
            storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(
            _pageIndex,
            _pageLength
        );

        uint256 size = LibCommon.getSize(
            start,
            end,
            businessLogicResolverDataStorage.activeBusinessLogics.length
        );
        businessLogicKeys_ = new bytes32[](size);

        for (uint256 index; index < size; index++) {
            businessLogicKeys_[index] = businessLogicResolverDataStorage
                .activeBusinessLogics[index + start];
        }
    }

    function _resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (address) {
        BusinessLogicResolverDataStorage
            storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        if (
            !businessLogicResolverDataStorage.businessLogicActive[
                _businessLogicKey
            ]
        ) {
            return address(0);
        }
        uint256 position = businessLogicResolverDataStorage
            .businessLogicVersionIndex[
                keccak256(abi.encodePacked(_businessLogicKey, _version))
            ];
        IBusinessLogicResolver.BusinessLogicVersion
            memory businessLogicVersion = businessLogicResolverDataStorage
                .businessLogics[_businessLogicKey][position];
        return businessLogicVersion.businessLogicAddress;
    }

    function _checkValidVersion(uint256 _version) private view {
        if (
            _version == 0 ||
            _version > _businessLogicResolverStorage().latestVersion
        ) {
            revert BusinessLogicVersionDoesNotExist(_version);
        }
    }

    function _checkValidKeys(
        IBusinessLogicResolver.BusinessLogicRegistryData[]
            calldata _businessLogicsRegistryDatas
    ) private view {
        BusinessLogicResolverDataStorage
            storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        // Check all previously activated keys are in the array.this
        // Check non duplicated keys.
        uint256 activesBusinessLogicsKeys;
        bytes32 currentKey;

        for (
            uint256 index;
            index < _businessLogicsRegistryDatas.length;
            index++
        ) {
            currentKey = _businessLogicsRegistryDatas[index].businessLogicKey;
            if (uint256(currentKey) == 0) {
                revert ZeroKeyNotValidForBusinessLogic();
            }
            if (
                businessLogicResolverDataStorage.businessLogicActive[currentKey]
            ) {
                activesBusinessLogicsKeys++;
            }
            for (
                uint256 innerIndex = index + 1;
                innerIndex < _businessLogicsRegistryDatas.length;
                innerIndex++
            ) {
                if (
                    currentKey ==
                    _businessLogicsRegistryDatas[innerIndex].businessLogicKey
                ) {
                    revert BusinessLogicKeyDuplicated(currentKey);
                }
            }
        }
        if (
            activesBusinessLogicsKeys !=
            businessLogicResolverDataStorage.activeBusinessLogics.length
        ) {
            revert AllBusinessLogicKeysMustBeenInformed();
        }
    }

    function _businessLogicResolverStorage()
        internal
        pure
        virtual
        returns (
            BusinessLogicResolverDataStorage storage businessLogicResolverData_
        )
    {
        bytes32 position = _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            businessLogicResolverData_.slot := position
        }
    }
}
