// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalControlList } from "../../facets/layer_1/externalControlList/IExternalControlList.sol";
import {
    IExternalControlListManagement
} from "../../facets/layer_1/externalControlList/IExternalControlListManagement.sol";
import { IExternalKycList } from "../../facets/layer_1/externalKycList/IExternalKycList.sol";
import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import {
    _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
    _KYC_MANAGEMENT_STORAGE_POSITION
} from "../../constants/storagePositions.sol";

struct ExternalListDataStorage {
    bool initialized;
    EnumerableSet.AddressSet list;
}

library ExternalListManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Storage accessor ---

    function externalListStorage(
        bytes32 _position
    ) internal pure returns (ExternalListDataStorage storage externalList_) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            externalList_.slot := _position
        }
    }

    // --- Validation ---

    function checkValidAddress(address _addr) internal pure {
        if (_addr == address(0)) revert IExternalControlListManagement.ZeroAddressNotAllowed();
    }

    // --- Generic external list operations ---

    function updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal returns (bool success_) {
        uint256 length = _lists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_lists[index]);
            if (_actives[index]) {
                if (!isExternalList(_position, _lists[index])) {
                    addExternalList(_position, _lists[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (isExternalList(_position, _lists[index])) {
                removeExternalList(_position, _lists[index]);
            }
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    function addExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.add(_list);
    }

    function removeExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = externalListStorage(_position).list.remove(_list);
    }

    function setExternalListInitialized(bytes32 _position) internal {
        externalListStorage(_position).initialized = true;
    }

    function isExternalList(bytes32 _position, address _list) internal view returns (bool) {
        return externalListStorage(_position).list.contains(_list);
    }

    function getExternalListsCount(bytes32 _position) internal view returns (uint256 count_) {
        count_ = externalListStorage(_position).list.length();
    }

    function getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = externalListStorage(_position).list.getFromSet(_pageIndex, _pageLength);
    }

    // --- External Control List Management ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(address[] calldata _controlLists) internal {
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_controlLists[index]);
            addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
        setExternalListInitialized(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function isExternallyAuthorized(address _account) internal view returns (bool) {
        ExternalListDataStorage storage externalControlListStorage = externalListStorage(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (!IExternalControlList(externalControlListStorage.list.at(index)).isAuthorized(_account)) return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function isExternalControlListInitialized() internal view returns (bool) {
        return externalListStorage(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    // --- External KYC List Management ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) internal {
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            checkValidAddress(_kycLists[index]);
            addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
        setExternalListInitialized(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = externalListStorage(
            _KYC_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (IExternalKycList(externalKycListStorage.list.at(index)).getKycStatus(_account) != _kycStatus)
                return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function isKycExternalInitialized() internal view returns (bool) {
        return externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION).initialized;
    }
}
