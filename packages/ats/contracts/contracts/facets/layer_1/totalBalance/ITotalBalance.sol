// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ITotalBalance {
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256);
}
