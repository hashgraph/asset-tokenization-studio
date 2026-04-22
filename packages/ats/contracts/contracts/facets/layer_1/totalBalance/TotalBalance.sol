// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITotalBalance } from "./ITotalBalance.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract TotalBalance is ITotalBalance {
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return
            ERC3643StorageWrapper.getTotalBalanceForByPartitionAdjustedAt(
                _partition,
                _account,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
