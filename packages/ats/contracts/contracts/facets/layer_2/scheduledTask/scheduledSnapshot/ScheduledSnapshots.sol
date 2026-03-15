// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledSnapshots } from "./IScheduledSnapshots.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract ScheduledSnapshots is IScheduledSnapshots {
    function scheduledSnapshotCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = ScheduledTasksStorageWrapper.getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
