// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../layer_0/common/Common.sol";
import { IScheduledSnapshots } from "../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract ScheduledSnapshots is IScheduledSnapshots, Common {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function scheduledSnapshotCount() external view override returns (uint256) {
        return _getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = _getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
