// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement } from "../interfaces/externalPauses/IExternalPauseManagement.sol";
import { Internals } from "../../layer_0/Internals.sol";
import { _PAUSE_MANAGER_ROLE } from "../constants/roles.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../layer_0/constants/storagePositions.sol";

abstract contract ExternalPauseManagement is IExternalPauseManagement, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalPauses(
        address[] calldata _pauses
    ) external override onlyUninitialized(_isExternalPauseInitialized()) {
        _initialize_ExternalPauses(_pauses);
    }

    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    )
        external
        override
        onlyRole(_PAUSE_MANAGER_ROLE)
        onlyUnpaused
        onlyConsistentActivations(_pauses, _actives)
        returns (bool success_)
    {
        success_ = _updateExternalLists(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pauses, _actives);
        if (!success_) {
            revert ExternalPausesNotUpdated(_pauses, _actives);
        }
        emit ExternalPausesUpdated(_msgSender(), _pauses, _actives);
    }

    function addExternalPause(
        address _pause
    ) external override onlyRole(_PAUSE_MANAGER_ROLE) onlyUnpaused validateAddress(_pause) returns (bool success_) {
        success_ = _addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert ListedPause(_pause);
        }
        emit AddedToExternalPauses(_msgSender(), _pause);
    }

    function removeExternalPause(
        address _pause
    ) external override onlyRole(_PAUSE_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _removeExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert UnlistedPause(_pause);
        }
        emit RemovedFromExternalPauses(_msgSender(), _pause);
    }

    function isExternalPause(address _pause) external view override returns (bool) {
        return _isExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
    }

    function getExternalPausesCount() external view override returns (uint256 externalPausesCount_) {
        return _getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return _getExternalListsMembers(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pageIndex, _pageLength);
    }
}
