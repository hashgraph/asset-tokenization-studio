// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsStorageWrapper } from "../protectedPartitions/ProtectedPartitionsStorageWrapper.sol";
import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalControlList } from "../../../layer_1/interfaces/externalControlLists/IExternalControlList.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";

abstract contract ExternalControlListManagementStorageWrapper is ProtectedPartitionsStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    function _initialize_ExternalControlLists(address[] calldata _controlLists) internal override {
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

    function _isExternallyAuthorized(address _account) internal view override returns (bool) {
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

    function _isExternalControlListInitialized() internal view override returns (bool) {
        return _externalListStorage(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION).initialized;
    }
}
