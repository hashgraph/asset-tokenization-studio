pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ProtectedPartitionsFacet
} from '../../../layer_1/protectedPartitions/ProtectedPartitionsFacet.sol';
import {
    TimeTravelStorageWrapper
} from '../timeTravel/TimeTravelStorageWrapper.sol';
import {LocalContext} from '../../../layer_0/context/LocalContext.sol';

contract ProtectedPartitionsFacetTimeTravel is
    ProtectedPartitionsFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp()
        internal
        view
        override(LocalContext, TimeTravelStorageWrapper)
        returns (uint256)
    {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
