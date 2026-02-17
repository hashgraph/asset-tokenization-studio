// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycInternals } from "../kyc/KycInternals.sol";

abstract contract ControlListInternals is KycInternals {
    function _addToControlList(address _account) internal virtual returns (bool success_);
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ControlList(bool _isWhiteList) internal virtual;
    function _removeFromControlList(address _account) internal virtual returns (bool success_);
    function _checkControlList(address _account) internal view virtual;
    function _getControlListCount() internal view virtual returns (uint256 controlListCount_);
    function _getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getControlListType() internal view virtual returns (bool);
    function _isAbleToAccess(address _account) internal view virtual returns (bool);
    function _isControlListInitialized() internal view virtual returns (bool);
    function _isInControlList(address _account) internal view virtual returns (bool);
}
