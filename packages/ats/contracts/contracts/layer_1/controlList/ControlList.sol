// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "../interfaces/controlList/IControlList.sol";
import { Internals } from "contracts/layer_0/Internals.sol";
import { _CONTROL_LIST_ROLE } from "../constants/roles.sol";

abstract contract ControlList is IControlList, Internals {
    // TODO: UNPAUSED
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(
        bool _isWhiteList
    ) external override onlyUninitialized(_isControlListInitialized()) {
        _initialize_ControlList(_isWhiteList);
    }

    function addToControlList(
        address _account
    ) external override onlyRole(_CONTROL_LIST_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(_msgSender(), _account);
    }

    function removeFromControlList(
        address _account
    ) external override onlyRole(_CONTROL_LIST_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(_msgSender(), _account);
    }

    function getControlListType() external view override returns (bool) {
        return _getControlListType();
    }

    function isInControlList(address _account) external view override returns (bool) {
        return _isInControlList(_account);
    }

    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = _getControlListCount();
    }

    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = _getControlListMembers(_pageIndex, _pageLength);
    }
}
