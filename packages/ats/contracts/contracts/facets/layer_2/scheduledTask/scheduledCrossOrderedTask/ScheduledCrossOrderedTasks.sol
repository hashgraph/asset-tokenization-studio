// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledCrossOrderedTasks } from "./IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { _SCHEDULED_TASKS_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

/**
 * @title Scheduled Cross-Ordered Tasks Facet
 * @notice Manages initialisation, execution, and inspection of cross-ordered scheduled tasks.
 * @dev Stores readiness through the initializer storage wrapper and delegates task execution
 *      and pagination to scheduled task storage. Execution requires an operational, activated,
 *      and unpaused asset.
 * @author Asset Tokenization Studio Team
 */
abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks, Modifiers {
    /// @inheritdoc IScheduledCrossOrderedTasks
    function initializeScheduledCrossOrderedTasks()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_getResolverKey())
    {
        InitializerStorageWrapper.setFacetToReady(_getResolverKey());
        emit ScheduledCrossOrderedTasksInitialized();
    }

    /// @inheritdoc IScheduledCrossOrderedTasks
    function triggerPendingScheduledCrossOrderedTasks()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        returns (uint256)
    {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
    }

    /// @inheritdoc IScheduledCrossOrderedTasks
    function triggerScheduledCrossOrderedTasks(
        uint256 _max
    ) external override onlyOperational onlyActivated onlyUnpaused returns (uint256) {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(_max);
    }

    /// @inheritdoc IScheduledCrossOrderedTasks
    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskCount();
    }

    /// @inheritdoc IScheduledCrossOrderedTasks
    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        scheduledCrossOrderedTask_ = ScheduledTasksStorageWrapper.getScheduledCrossOrderedTasks(
            _pageIndex,
            _pageLength
        );
    }

    /**
     * @notice Internal function to get the resolver key for the facet.
     * @dev Must be implemented by inheriting facets to provide their specific resolver key.
     * @return resolverKey_ The resolver key for the facet.
     */
    function _getResolverKey() internal pure virtual returns (bytes32 resolverKey_);
}
