// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "./IControlList.sol";
import { _CONTROL_LIST_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";

abstract contract ControlList is IControlList {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(bool _isWhiteList) external override {
        if (ControlListStorageWrapper._isControlListInitialized()) revert AlreadyInitialized();
        ControlListStorageWrapper._initialize_ControlList(_isWhiteList);
    }

    function addToControlList(address _account) external override returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_CONTROL_LIST_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        success_ = ControlListStorageWrapper._addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(msg.sender, _account);
    }

    function removeFromControlList(address _account) external override returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_CONTROL_LIST_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        success_ = ControlListStorageWrapper._removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(msg.sender, _account);
    }

    function getControlListType() external view override returns (bool) {
        return ControlListStorageWrapper._getControlListType();
    }

    function isInControlList(address _account) external view override returns (bool) {
        return ControlListStorageWrapper._isInControlList(_account);
    }

    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = ControlListStorageWrapper._getControlListCount();
    }

    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = ControlListStorageWrapper._getControlListMembers(_pageIndex, _pageLength);
    }
}
