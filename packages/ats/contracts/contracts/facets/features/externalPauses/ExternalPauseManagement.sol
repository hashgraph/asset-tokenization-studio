// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement } from "../interfaces/IExternalPauseManagement.sol";
import { LibExternalLists } from "../../../lib/core/LibExternalLists.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _PAUSE_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { LibArrayValidation } from "../../../infrastructure/lib/LibArrayValidation.sol";

abstract contract ExternalPauseManagement is IExternalPauseManagement {
    error AlreadyInitialized();
    error InconsistentArrayLengths();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalPauses(address[] calldata _pauses) external override {
        if (LibExternalLists.getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION) > 0) {
            revert AlreadyInitialized();
        }
        uint256 length = _pauses.length;
        for (uint256 index; index < length; ) {
            LibExternalLists.requireValidAddress(_pauses[index]);
            LibExternalLists.addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pauses[index]);
            unchecked {
                ++index;
            }
        }
        LibExternalLists.setExternalListInitialized(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    ) external override returns (bool success_) {
        LibAccess.checkRole(_PAUSE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        if (_pauses.length != _actives.length) {
            revert InconsistentArrayLengths();
        }
        LibArrayValidation.checkUniqueValues(_pauses, _actives);
        success_ = LibExternalLists.updateExternalLists(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pauses, _actives);
        if (!success_) {
            revert ExternalPausesNotUpdated(_pauses, _actives);
        }
        emit ExternalPausesUpdated(msg.sender, _pauses, _actives);
    }

    function addExternalPause(address _pause) external override returns (bool success_) {
        LibAccess.checkRole(_PAUSE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibExternalLists.requireValidAddress(_pause);
        success_ = LibExternalLists.addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert ListedPause(_pause);
        }
        emit AddedToExternalPauses(msg.sender, _pause);
    }

    function removeExternalPause(address _pause) external override returns (bool success_) {
        LibAccess.checkRole(_PAUSE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibExternalLists.removeExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert UnlistedPause(_pause);
        }
        emit RemovedFromExternalPauses(msg.sender, _pause);
    }

    function isExternalPause(address _pause) external view override returns (bool) {
        return LibExternalLists.isExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
    }

    function getExternalPausesCount() external view override returns (uint256 externalPausesCount_) {
        return LibExternalLists.getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return LibExternalLists.getExternalListsMembers(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pageIndex, _pageLength);
    }
}
