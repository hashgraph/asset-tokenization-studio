// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCrossOrderedTasks
} from "../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _SCHEDULED_TASKS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @dev Test facet for scheduled task failure-recovery testing.
 * Replaces the production ScheduledCrossOrderedTasksFacet in the diamond and injects
 * a controlled revert inside executeScheduledTaskCallback when the configured
 * callbackType matches, allowing integration tests to exercise the try/catch
 * recovery path in ScheduledTasksStorageWrapper.triggerScheduledTasks.
 * This facet is for testing purposes only and must not be deployed to production.
 */
contract MockedFailingScheduledTaskCallback is IScheduledCrossOrderedTasks, Modifiers, IStaticFunctionSelectors {
    // Unique test-only storage slot — avoids collisions with all production storage positions
    bytes32 private constant _FAIL_TYPE_SLOT = 0xdead000000000000000000000000000000000000000000000000000000001337;

    error MockTaskExecutionFailed();

    // ========================================
    // Test-only configuration setter
    // ========================================

    function setFailForCallbackType(bytes32 callbackType) external {
        bytes32 slot = _FAIL_TYPE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, callbackType)
        }
    }

    // ========================================
    // IScheduledCrossOrderedTasks Implementation
    // ========================================

    function triggerPendingScheduledCrossOrderedTasks() external override onlyUnpaused returns (uint256) {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override onlyUnpaused returns (uint256) {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(_max);
    }

    function executeScheduledTaskCallback(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask calldata task
    ) external override onlySelf {
        bytes32 failType;
        bytes32 slot = _FAIL_TYPE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            failType := sload(slot)
        }

        if (failType != bytes32(0) && callbackType == failType) revert MockTaskExecutionFailed();

        ScheduledTasksStorageWrapper.dispatchScheduledTask(callbackType, pos, scheduledTasksLength, task);
    }

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        scheduledCrossOrderedTask_ = ScheduledTasksStorageWrapper.getScheduledCrossOrderedTasks(
            _pageIndex,
            _pageLength
        );
    }

    // ========================================
    // IStaticFunctionSelectors Implementation
    // ========================================

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_TASKS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.triggerPendingScheduledCrossOrderedTasks.selector,
                this.triggerScheduledCrossOrderedTasks.selector,
                this.scheduledCrossOrderedTaskCount.selector,
                this.getScheduledCrossOrderedTasks.selector,
                this.executeScheduledTaskCallback.selector,
                this.setFailForCallbackType.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IScheduledCrossOrderedTasks).interfaceId);
    }
}
