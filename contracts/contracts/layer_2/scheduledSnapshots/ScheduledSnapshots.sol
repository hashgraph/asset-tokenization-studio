// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {_SCHEDULED_SNAPSHOTS_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {
    CorporateActionsStorageWrapperSecurity
} from '../corporateActions/CorporateActionsStorageWrapperSecurity.sol';
import {
    IScheduledSnapshots
} from '../interfaces/scheduledSnapshots/IScheduledSnapshots.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';

contract ScheduledSnapshots is
    IStaticFunctionSelectors,
    IScheduledSnapshots,
    CorporateActionsStorageWrapperSecurity
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function triggerPendingScheduledSnapshots()
        external
        virtual
        override
        onlyUnpaused
        returns (uint256)
    {
        return _triggerScheduledSnapshots(0);
    }

    function triggerScheduledSnapshots(
        uint256 max
    ) external virtual override onlyUnpaused returns (uint256) {
        return _triggerScheduledSnapshots(max);
    }

    function scheduledSnapshotCount()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return _getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        virtual
        override
        returns (ScheduledSnapshot[] memory scheduledSnapshot_)
    {
        scheduledSnapshot_ = _getScheduledSnapshots(_pageIndex, _pageLength);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _SCHEDULED_SNAPSHOTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this
            .triggerPendingScheduledSnapshots
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .triggerScheduledSnapshots
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .scheduledSnapshotCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getScheduledSnapshots
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledSnapshots)
            .interfaceId;
    }
}
