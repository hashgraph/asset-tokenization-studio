// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/// @dev Test-only bytecode replacement for ScheduledTasksDispatchOps.
///      Swapped in at the real library address via hardhat_setCode.
///      Reads _FAIL_TYPE_SLOT from the current storage context (Diamond's storage via DELEGATECALL)
///      and reverts when callbackType matches the configured fail type.
contract MockScheduledTasksDispatchOps {
    bytes32 private constant _FAIL_TYPE_SLOT = 0xdead000000000000000000000000000000000000000000000000000000001337;

    error MockTaskExecutionFailed();

    function execute(bytes32 callbackType, uint256, uint256, ScheduledTask calldata) external view {
        bytes32 failType;
        bytes32 slot = _FAIL_TYPE_SLOT;
        assembly {
            failType := sload(slot)
        }
        if (failType != bytes32(0) && callbackType == failType) revert MockTaskExecutionFailed();
    }
}
