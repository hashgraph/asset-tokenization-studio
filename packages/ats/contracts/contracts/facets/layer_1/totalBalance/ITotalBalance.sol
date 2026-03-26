// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ITotalBalance {
    function getTotalBalanceFor(address _account) external view returns (uint256);
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256);
}
