// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "./IExternalControlListManagement.sol";
import { _CONTROL_LIST_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";

abstract contract ExternalControlListManagement is IExternalControlListManagement, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(
        address[] calldata _controlLists
    ) external override onlyNotExternalControlListInitialized {
        ExternalListManagementStorageWrapper.initialize_ExternalControlLists(_controlLists);
    }

    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_controlLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlLists,
            _actives
        );
        if (!success_) {
            revert ExternalControlListsNotUpdated(_controlLists, _actives);
        }
        emit ExternalControlListsUpdated(msg.sender, _controlLists, _actives);
    }

    function addExternalControlList(
        address _controlList
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        ExternalListManagementStorageWrapper.checkValidAddress(_controlList);
        success_ = ExternalListManagementStorageWrapper.addExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlList
        );
        if (!success_) {
            revert ListedControlList(_controlList);
        }
        emit AddedToExternalControlLists(msg.sender, _controlList);
    }

    function removeExternalControlList(
        address _controlList
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlList
        );
        if (!success_) {
            revert UnlistedControlList(_controlList);
        }
        emit RemovedFromExternalControlLists(msg.sender, _controlList);
    }

    function isExternalControlList(address _controlList) external view override returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _controlList
            );
    }

    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
