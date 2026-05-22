// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "./IControlList.sol";
import { ROLE_CONTROL_LIST } from "../../constants/roles.sol";
import { ControlListStorageWrapper } from "../../domain/core/ControlListStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ControlList
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing control list management logic for a security token.
 *         Supports both whitelist and blacklist modes, set once at initialisation, to gate
 *         transfer access by address membership.
 * @dev Implements `IControlList`. State is stored at `STORAGE_LOCATION_CONTROL_LIST` via
 *      `ControlListStorageWrapper`. All mutating functions after initialisation require
 *      `ROLE_CONTROL_LIST` and the token to be unpaused. Intended to be inherited exclusively
 *      by `ControlListFacet`.
 */
abstract contract ControlList is IControlList, Modifiers {
    /// @inheritdoc IControlList
    // solhint-disable-next-line func-name-mixedcase
    function initializeControlList(bool _isWhiteList) external override onlyNotControlListInitialized {
        ControlListStorageWrapper.initializeControlList(_isWhiteList);
    }

    /// @inheritdoc IControlList
    function addToControlList(
        address _account
    ) external override onlyActivated onlyUnpaused onlyRole(ROLE_CONTROL_LIST) returns (bool success_) {
        success_ = ControlListStorageWrapper.addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(EvmAccessors.getMsgSender(), _account);
    }

    /// @inheritdoc IControlList
    function removeFromControlList(
        address _account
    ) external override onlyActivated onlyUnpaused onlyRole(ROLE_CONTROL_LIST) returns (bool success_) {
        success_ = ControlListStorageWrapper.removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(EvmAccessors.getMsgSender(), _account);
    }

    /// @inheritdoc IControlList
    function getControlListType() external view override returns (bool) {
        return ControlListStorageWrapper.getControlListType();
    }

    /// @inheritdoc IControlList
    function isInControlList(address _account) external view override returns (bool) {
        return ControlListStorageWrapper.isInControlList(_account);
    }

    /// @inheritdoc IControlList
    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = ControlListStorageWrapper.getControlListCount();
    }

    /// @inheritdoc IControlList
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = ControlListStorageWrapper.getControlListMembers(_pageIndex, _pageLength);
    }
}
