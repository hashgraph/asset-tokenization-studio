// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiInternals } from "../ssi/SsiInternals.sol";

abstract contract ExternalListInternals is SsiInternals {
    function _addExternalList(bytes32 _position, address _list) internal virtual returns (bool success_);
    function _removeExternalList(bytes32 _position, address _list) internal virtual returns (bool success_);
    function _setExternalListInitialized(bytes32 _position) internal virtual;
    function _updateExternalLists(
        bytes32 _position,
        address[] calldata _lists,
        bool[] calldata _actives
    ) internal virtual returns (bool success_);
    function _getExternalListsCount(bytes32 _position) internal view virtual returns (uint256 count_);
    function _getExternalListsMembers(
        bytes32 _position,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _isExternalList(bytes32 _position, address _list) internal view virtual returns (bool);
}
