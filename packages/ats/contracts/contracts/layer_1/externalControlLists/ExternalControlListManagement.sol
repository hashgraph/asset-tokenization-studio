// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "../interfaces/externalControlLists/IExternalControlListManagement.sol";
import { Common } from "../common/Common.sol";
import { _CONTROL_LIST_MANAGER_ROLE } from "../constants/roles.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../layer_0/constants/storagePositions.sol";

abstract contract ExternalControlListManagement is IExternalControlListManagement, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(
        address[] calldata _controlLists
    ) external override onlyUninitialized(_externalListStorage(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION).initialized) {
        ExternalListDataStorage storage externalControlListDataStorage = _externalListStorage(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            _addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
        externalControlListDataStorage.initialized = true;
    }

    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    )
        external
        override
        onlyRole(_CONTROL_LIST_MANAGER_ROLE)
        onlyUnpaused
        onlyConsistentActivations(_controlLists, _actives)
        returns (bool success_)
    {
        success_ = _updateExternalLists(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists, _actives);
        if (!success_) {
            revert ExternalControlListsNotUpdated(_controlLists, _actives);
        }
        emit ExternalControlListsUpdated(_msgSender(), _controlLists, _actives);
    }

    function addExternalControlList(
        address _controlList
    ) external override onlyRole(_CONTROL_LIST_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
        if (!success_) {
            revert ListedControlList(_controlList);
        }
        emit AddedToExternalControlLists(_msgSender(), _controlList);
    }

    function removeExternalControlList(
        address _controlList
    ) external override onlyRole(_CONTROL_LIST_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _removeExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
        if (!success_) {
            revert UnlistedControlList(_controlList);
        }
        emit RemovedFromExternalControlLists(_msgSender(), _controlList);
    }

    function isExternalControlList(address _controlList) external view override returns (bool) {
        return _isExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
    }

    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return _getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return _getExternalListsMembers(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _pageIndex, _pageLength);
    }
}
