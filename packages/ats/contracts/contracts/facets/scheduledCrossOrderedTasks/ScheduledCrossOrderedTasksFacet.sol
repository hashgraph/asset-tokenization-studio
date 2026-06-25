// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledCrossOrderedTasks, RESOLVER_KEY_SCHEDULED_TASKS } from "./IScheduledCrossOrderedTasks.sol";
import { ScheduledCrossOrderedTasks } from "./ScheduledCrossOrderedTasks.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title ScheduledCrossOrderedTasksFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the scheduled cross-ordered task management interface,
 *         registered under `RESOLVER_KEY_SCHEDULED_TASKS`.
 */
contract ScheduledCrossOrderedTasksFacet is ScheduledCrossOrderedTasks, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_SCHEDULED_TASKS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeScheduledCrossOrderedTasks.selector,
                this.triggerPendingScheduledCrossOrderedTasks.selector,
                this.triggerScheduledCrossOrderedTasks.selector,
                this.scheduledCrossOrderedTaskCount.selector,
                this.getScheduledCrossOrderedTasks.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IScheduledCrossOrderedTasks).interfaceId);
    }
}
