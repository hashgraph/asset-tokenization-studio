// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "../interfaces/IExternalControlListManagement.sol";
import { LibExternalLists } from "../../../lib/core/LibExternalLists.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _CONTROL_LIST_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { LibArrayValidation } from "../../../infrastructure/lib/LibArrayValidation.sol";

abstract contract ExternalControlListManagement is IExternalControlListManagement {
    error AlreadyInitialized();
    error InconsistentArrayLengths();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(address[] calldata _controlLists) external override {
        if (LibExternalLists.getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION) > 0) {
            revert AlreadyInitialized();
        }
        uint256 length = _controlLists.length;
        for (uint256 index; index < length; ) {
            LibExternalLists.requireValidAddress(_controlLists[index]);
            LibExternalLists.addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlLists[index]);
            unchecked {
                ++index;
            }
        }
        LibExternalLists.setExternalListInitialized(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_MANAGER_ROLE);
        LibPause.requireNotPaused();
        if (_controlLists.length != _actives.length) {
            revert InconsistentArrayLengths();
        }
        LibArrayValidation.checkUniqueValues(_controlLists, _actives);
        success_ = LibExternalLists.updateExternalLists(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
            _controlLists,
            _actives
        );
        if (!success_) {
            revert ExternalControlListsNotUpdated(_controlLists, _actives);
        }
        emit ExternalControlListsUpdated(msg.sender, _controlLists, _actives);
    }

    function addExternalControlList(address _controlList) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibExternalLists.requireValidAddress(_controlList);
        success_ = LibExternalLists.addExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
        if (!success_) {
            revert ListedControlList(_controlList);
        }
        emit AddedToExternalControlLists(msg.sender, _controlList);
    }

    function removeExternalControlList(address _controlList) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibExternalLists.removeExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
        if (!success_) {
            revert UnlistedControlList(_controlList);
        }
        emit RemovedFromExternalControlLists(msg.sender, _controlList);
    }

    function isExternalControlList(address _controlList) external view override returns (bool) {
        return LibExternalLists.isExternalList(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION, _controlList);
    }

    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return LibExternalLists.getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            LibExternalLists.getExternalListsMembers(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
