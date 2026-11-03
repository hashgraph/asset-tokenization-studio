// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement, RESOLVER_KEY_EXTERNAL_PAUSE } from "./IExternalPauseManagement.sol";
import { ROLE_PAUSE_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EXTERNAL_PAUSE_LIST_UPDATE } from "../../constants/values.sol";
import { PauseStorageWrapper, STORAGE_LOCATION_PAUSE_MANAGEMENT } from "../../domain/core/PauseStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @title ExternalPauseManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing external onlyOperational pause management logic for a security token.
 *         Maintains a list of trusted third-party pause contracts whose combined pause state
 *         contributes to the token's global pause evaluation.
 * @dev Implements `IExternalPauseManagement`. The external onlyOperational pause list is stored in diamond storage
 *      at `STORAGE_LOCATION_PAUSE_MANAGEMENT` via `ExternalListManagementStorageWrapper`.
 *      All mutating functions after initialisation are gated by `ROLE_PAUSE_MANAGER` and the
 *      `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively
 *      by `ExternalPauseManagementFacet`.
 */
abstract contract ExternalPauseManagement is IExternalPauseManagement, Modifiers {
    /// @inheritdoc IExternalPauseManagement
    function initializeExternalPauses(
        address[] calldata _pauses
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_EXTERNAL_PAUSE) {
        PauseStorageWrapper.initializeExternalPauses(_pauses);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_EXTERNAL_PAUSE);
        emit IExternalPauseManagement.ExternalPauseInitialized(_pauses);
    }

    /// @inheritdoc IExternalPauseManagement
    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PAUSE_MANAGER)
        returns (bool success_)
    {
        ArrayValidation.checkUniqueValues(_pauses, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            STORAGE_LOCATION_PAUSE_MANAGEMENT,
            _pauses,
            _actives
        );
        _checkUnexpectedError(!success_, EXTERNAL_PAUSE_LIST_UPDATE);
        emit ExternalPausesUpdated(EvmAccessors.getMsgSender(), _pauses, _actives);
    }

    /// @inheritdoc IExternalPauseManagement
    function addExternalPause(
        address _pause
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PAUSE_MANAGER)
        validateAddressNotZero(_pause)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_PAUSE_MANAGEMENT, _pause);
        if (!success_) {
            revert ListedPause(_pause);
        }
        emit AddedToExternalPauses(EvmAccessors.getMsgSender(), _pause);
    }

    /// @inheritdoc IExternalPauseManagement
    function removeExternalPause(
        address _pause
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyNotInternallyPaused
        onlyRole(ROLE_PAUSE_MANAGER)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(STORAGE_LOCATION_PAUSE_MANAGEMENT, _pause);
        if (!success_) {
            revert UnlistedPause(_pause);
        }
        emit RemovedFromExternalPauses(EvmAccessors.getMsgSender(), _pause);
    }

    /// @inheritdoc IExternalPauseManagement
    function isExternalPause(address _pause) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(STORAGE_LOCATION_PAUSE_MANAGEMENT, _pause);
    }

    /// @inheritdoc IExternalPauseManagement
    function getExternalPausesCount() external view override returns (uint256 externalPausesCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_PAUSE_MANAGEMENT);
    }

    /// @inheritdoc IExternalPauseManagement
    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                STORAGE_LOCATION_PAUSE_MANAGEMENT,
                _pageIndex,
                _pageLength
            );
    }
}
