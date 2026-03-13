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

    // --- Storage accessor (pure) ---

    function _externalListStorage(
        bytes32 _position
    ) internal pure returns (ExternalListDataStorage storage externalList_) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            externalList_.slot := _position
        }
    }

    // --- Validation ---

    // --- Generic external list operations ---

    // solhint-disable-next-line ordering
    function _updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal returns (bool success_) {
        uint256 length = _lists.length;
        for (uint256 index; index < length; ) {
            _checkValidAddress(_lists[index]);
            if (_actives[index]) {
                if (!_isExternalList(_position, _lists[index])) {
                    _addExternalList(_position, _lists[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (_isExternalList(_position, _lists[index])) {
                _removeExternalList(_position, _lists[index]);
            }
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    function _addExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = _externalListStorage(_position).list.add(_list);
    }

    function _removeExternalList(bytes32 _position, address _list) internal returns (bool success_) {
        success_ = _externalListStorage(_position).list.remove(_list);
    }

    function _setExternalListInitialized(bytes32 _position) internal {
        _externalListStorage(_position).initialized = true;
    }

    function _isExternalList(bytes32 _position, address _list) internal view returns (bool) {
        return _externalListStorage(_position).list.contains(_list);
    }

    function _getExternalListsCount(bytes32 _position) internal view returns (uint256 count_) {
        count_ = _externalListStorage(_position).list.length();
    }

    function _getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = _externalListStorage(_position).list.getFromSet(_pageIndex, _pageLength);
    }

    // --- External Control List Management ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalControlLists(address[] calldata _controlLists) internal {
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            _checkValidAddress(_controlLists[index]);
            _addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
        _setExternalListInitialized(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function _isExternallyAuthorized(address _account) internal view returns (bool) {
        ExternalListDataStorage storage externalControlListStorage = _externalListStorage(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = _getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (!IExternalControlList(externalControlListStorage.list.at(index)).isAuthorized(_account)) return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function _isExternalControlListInitialized() internal view returns (bool) {
        return _externalListStorage(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    // --- External KYC List Management ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalKycLists(address[] calldata _kycLists) internal {
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            _checkValidAddress(_kycLists[index]);
            _addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
        _setExternalListInitialized(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    function _isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = _externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION);
        uint256 length = _getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (IExternalKycList(externalKycListStorage.list.at(index)).getKycStatus(_account) != _kycStatus)
                return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function _isKycExternalInitialized() internal view returns (bool) {
        return _externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION).initialized;
    }

    function _checkValidAddress(address _addr) internal pure {
        if (_addr == address(0)) revert IExternalControlListManagement.ZeroAddressNotAllowed();
    }
}
