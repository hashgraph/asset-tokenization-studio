// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITotalBalance } from "../totalBalance/ITotalBalance.sol";
import { HoldOps } from "../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract TotalBalance is ITotalBalance, TimestampProvider {
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return HoldOps.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
    }

    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return HoldOps.getTotalBalanceForByPartitionAdjustedAt(_partition, _account, _getBlockTimestamp());
    }
}
