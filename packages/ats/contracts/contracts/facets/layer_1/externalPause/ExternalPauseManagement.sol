// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement } from "./IExternalPauseManagement.sol";
import { _PAUSE_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";

abstract contract ExternalPauseManagement is IExternalPauseManagement, PauseStorageWrapper {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalPauses(address[] calldata _pauses) external override {
        if (_isExternalPauseInitialized()) revert AlreadyInitialized();
        _initialize_ExternalPauses(_pauses);
    }

    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    ) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_PAUSE_MANAGER_ROLE, msg.sender);
        ArrayValidation.checkUniqueValues(_pauses, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _PAUSE_MANAGEMENT_STORAGE_POSITION,
            _pauses,
            _actives
        );
        if (!success_) {
            revert ExternalPausesNotUpdated(_pauses, _actives);
        }
        emit ExternalPausesUpdated(msg.sender, _pauses, _actives);
    }

    function addExternalPause(address _pause) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_PAUSE_MANAGER_ROLE, msg.sender);
        ExternalListManagementStorageWrapper.checkValidAddress(_pause);
        success_ = ExternalListManagementStorageWrapper.addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert ListedPause(_pause);
        }
        emit AddedToExternalPauses(msg.sender, _pause);
    }

    function removeExternalPause(address _pause) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_PAUSE_MANAGER_ROLE, msg.sender);
        success_ = ExternalListManagementStorageWrapper.removeExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
        if (!success_) {
            revert UnlistedPause(_pause);
        }
        emit RemovedFromExternalPauses(msg.sender, _pause);
    }

    function isExternalPause(address _pause) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pause);
    }

    function getExternalPausesCount() external view override returns (uint256 externalPausesCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _PAUSE_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
