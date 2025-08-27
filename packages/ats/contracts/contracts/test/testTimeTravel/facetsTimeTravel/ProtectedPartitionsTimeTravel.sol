pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ProtectedPartitions
} from '../../../layer_1/protectedPartitions/ProtectedPartitions.sol';
import {
    TimeTravelStorageWrapper
} from '../timeTravel/TimeTravelStorageWrapper.sol';
import {LocalContext} from '../../../layer_0/context/LocalContext.sol';

contract ProtectedPartitionsTimeTravel is
    ProtectedPartitions,
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
