// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {_SCHEDULED_TASKS_RESOLVER_KEY} from '../../constants/resolverKeys.sol';
import {
    IScheduledTasks
} from '../../interfaces/scheduledTasks/scheduledTasks/IScheduledTasks.sol';
import {ScheduledTasks} from './ScheduledTasks.sol';

contract ScheduledTasksFacet is ScheduledTasks, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _SCHEDULED_TASKS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this
            .triggerPendingScheduledTasks
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .triggerScheduledTasks
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .scheduledTaskCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getScheduledTasks
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .onScheduledTaskTriggered
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledTasks)
            .interfaceId;
    }
}
