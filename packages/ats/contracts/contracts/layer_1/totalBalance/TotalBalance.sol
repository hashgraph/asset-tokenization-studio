// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../layer_0/Internals.sol";
import { ITotalBalance } from "../interfaces/totalBalance/ITotalBalance.sol";

abstract contract TotalBalance is ITotalBalance, Internals {
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return _getTotalBalanceForAdjustedAt(_account, _blockTimestamp());
    }
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return _getTotalBalanceForByPartitionAdjustedAt(_partition, _account, _blockTimestamp());
    }
}
