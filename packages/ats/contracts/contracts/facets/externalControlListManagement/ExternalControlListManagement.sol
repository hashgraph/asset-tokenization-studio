// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IExternalControlListManagement,
    RESOLVER_KEY_EXTERNAL_CONTROL_LIST
} from "./IExternalControlListManagement.sol";
import { ROLE_CONTROL_LIST_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ExternalControlListManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing external onlyOperational control list management logic for a security
 *         token. Maintains a list of trusted third-party control list contracts whose
 *         authorisation results are consulted during transfer compliance checks.
 * @dev Implements `IExternalControlListManagement`. The external onlyOperational control list is stored in diamond
 *      storage at `STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT` via
 *      `ExternalListManagementStorageWrapper`. All mutating functions after initialisation are
 *      gated by `ROLE_CONTROL_LIST_MANAGER` and the `onlyUnpaused` modifier inherited from
 *      `Modifiers`. Intended to be inherited exclusively by
 *      `ExternalControlListManagementFacet`.
 */
abstract contract ExternalControlListManagement is IExternalControlListManagement, Modifiers {
    /// @inheritdoc IExternalControlListManagement
    function initializeExternalControlLists(
        address[] calldata _controlLists
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_EXTERNAL_CONTROL_LIST) {
        ExternalListManagementStorageWrapper.initializeExternalControlLists(_controlLists);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_EXTERNAL_CONTROL_LIST);
        emit IExternalControlListManagement.ExternalControlListInitialized(_controlLists);
    }

    /// @inheritdoc IExternalControlListManagement
    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CONTROL_LIST_MANAGER)
        returns (bool success_)
    {
        ArrayValidation.checkUniqueValues(_controlLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT,
            _controlLists,
            _actives
        );
        if (!success_) {
            revert ExternalControlListsNotUpdated(_controlLists, _actives);
        }
        emit ExternalControlListsUpdated(EvmAccessors.getMsgSender(), _controlLists, _actives);
    }

    /// @inheritdoc IExternalControlListManagement
    function addExternalControlList(
        address _controlList
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CONTROL_LIST_MANAGER)
        onlyValidAddress(_controlList)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.addExternalList(
            STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT,
            _controlList
        );
        if (!success_) {
            revert ListedControlList(_controlList);
        }
        emit AddedToExternalControlLists(EvmAccessors.getMsgSender(), _controlList);
    }

    /// @inheritdoc IExternalControlListManagement
    function removeExternalControlList(
        address _controlList
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CONTROL_LIST_MANAGER)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(
            STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT,
            _controlList
        );
        if (!success_) {
            revert UnlistedControlList(_controlList);
        }
        emit RemovedFromExternalControlLists(EvmAccessors.getMsgSender(), _controlList);
    }

    /// @inheritdoc IExternalControlListManagement
    function isExternalControlList(address _controlList) external view override returns (bool) {
        return
            ExternalListManagementStorageWrapper.isExternalList(STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT, _controlList);
    }

    /// @inheritdoc IExternalControlListManagement
    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT);
    }

    /// @inheritdoc IExternalControlListManagement
    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT,
                _pageIndex,
                _pageLength
            );
    }
}
