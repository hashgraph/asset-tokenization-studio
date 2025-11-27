// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { SsiManagementStorageWrapper } from "../ssi/SsiManagementStorageWrapper.sol";

abstract contract ExternalListManagementStorageWrapper is SsiManagementStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct ExternalListDataStorage {
        bool initialized;
        EnumerableSet.AddressSet list;
    }

    function _updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal returns (bool success_) {
        uint256 length = _lists.length;
        for (uint256 index; index < length; ) {
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

    function _externalListStorage(
        bytes32 _position
    ) internal pure returns (ExternalListDataStorage storage externalList_) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            externalList_.slot := _position
        }
    }
}
