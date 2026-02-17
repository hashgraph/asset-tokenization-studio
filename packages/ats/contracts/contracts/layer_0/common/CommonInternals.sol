// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesInternals } from "../adjustBalances/AdjustBalancesInternals.sol";

abstract contract CommonInternals is AdjustBalancesInternals {
    function _transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal virtual;
    function _updateTokenHolderSnapshot(address account) internal virtual;
    function _calculateRoleForPartition(bytes32 partition) internal pure virtual returns (bytes32 role);
    function _checkInputAmountsArrayLength(
        address[] memory _addresses,
        uint256[] memory _amounts
    ) internal pure virtual;
    function _checkInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure virtual;
    function _checkValidAddress(address account) internal pure virtual;
}
