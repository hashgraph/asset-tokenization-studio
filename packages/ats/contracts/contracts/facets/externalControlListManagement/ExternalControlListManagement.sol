// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "./IExternalControlListManagement.sol";
import { CONTROL_LIST_MANAGER_ROLE } from "../../constants/roles.sol";
import { _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ExternalControlListManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing external control list management logic for a security
 *         token. Maintains a list of trusted third-party control list contracts whose
 *         authorisation results are consulted during transfer compliance checks.
 * @dev Implements `IExternalControlListManagement`. The external control list is stored in diamond
 *      storage at `_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION` via
 *      `ExternalListManagementStorageWrapper`. All mutating functions after initialisation are
 *      gated by `CONTROL_LIST_MANAGER_ROLE` and the `onlyUnpaused` modifier inherited from
 *      `Modifiers`. Intended to be inherited exclusively by
 *      `ExternalControlListManagementFacet`.
 */
abstract contract ExternalControlListManagement is IExternalControlListManagement, Modifiers {
    /// @inheritdoc IExternalControlListManagement
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(
        address[] calldata _controlLists
    ) external override onlyNotExternalControlListInitialized {
        ExternalListManagementStorageWrapper.initialize_ExternalControlLists(_controlLists);
    }

    /// @inheritdoc IExternalControlListManagement
    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external override onlyUnpaused onlyRole(CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_controlLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
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
        onlyUnpaused
        onlyRole(CONTROL_LIST_MANAGER_ROLE)
        onlyValidAddress(_controlList)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.addExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
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
    ) external override onlyUnpaused onlyRole(CONTROL_LIST_MANAGER_ROLE) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(
            _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
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
            ExternalListManagementStorageWrapper.isExternalList(
                _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION,
                _controlList
            );
    }

    /// @inheritdoc IExternalControlListManagement
    function getExternalControlListsCount() external view override returns (uint256 externalControlListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_CONTROL_LIST_MANAGEMENT_STORAGE_POSITION);
    }

    /// @inheritdoc IExternalControlListManagement
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
