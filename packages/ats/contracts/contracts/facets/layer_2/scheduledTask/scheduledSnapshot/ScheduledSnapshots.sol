// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../../domain/Internals.sol";
import { IScheduledSnapshots } from "./IScheduledSnapshots.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract ScheduledSnapshots is IScheduledSnapshots, Internals {
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
