// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {
    _SCHEDULED_SNAPSHOTS_RESOLVER_KEY
} from '../../constants/resolverKeys.sol';
import {
    IScheduledSnapshots
} from '../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol';
import {ScheduledSnapshots} from './ScheduledSnapshots.sol';

contract ScheduledSnapshotsFacet is
    ScheduledSnapshots,
    IStaticFunctionSelectors
{
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _SCHEDULED_SNAPSHOTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this
            .scheduledSnapshotCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getScheduledSnapshots
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .onScheduledSnapshotTriggered
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
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledSnapshots)
            .interfaceId;
    }
}
