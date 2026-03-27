// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "./IControlList.sol";
import { _CONTROL_LIST_ROLE } from "../../../constants/roles.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
abstract contract ControlList is IControlList, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initializeControlList(bool _isWhiteList) external override onlyNotControlListInitialized {
        ControlListStorageWrapper.initializeControlList(_isWhiteList);
    }

    function addToControlList(
        address _account
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_ROLE) returns (bool success_) {
        success_ = ControlListStorageWrapper.addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(msg.sender, _account);
    }

    function removeFromControlList(
        address _account
    ) external override onlyUnpaused onlyRole(_CONTROL_LIST_ROLE) returns (bool success_) {
        success_ = ControlListStorageWrapper.removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(msg.sender, _account);
    }

    function getControlListType() external view override returns (bool) {
        return ControlListStorageWrapper.getControlListType();
    }

    function isInControlList(address _account) external view override returns (bool) {
        return ControlListStorageWrapper.isInControlList(_account);
    }

    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = ControlListStorageWrapper.getControlListCount();
    }

    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = ControlListStorageWrapper.getControlListMembers(_pageIndex, _pageLength);
    }
}
