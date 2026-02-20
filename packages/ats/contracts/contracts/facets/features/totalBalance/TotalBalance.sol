// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITotalBalance } from "../interfaces/ITotalBalance.sol";
import { LibTotalBalance } from "../../../lib/orchestrator/LibTotalBalance.sol";

abstract contract TotalBalance is ITotalBalance {
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return LibTotalBalance.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
    }

    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return LibTotalBalance.getTotalBalanceForByPartitionAdjustedAt(_partition, _account, _getBlockTimestamp());
    }

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
