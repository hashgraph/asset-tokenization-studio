pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ProtectedPartitions
} from '../../layer_1/protectedPartitions/ProtectedPartitions.sol';
import {
    TimeTravelControllerStorageWrapper
} from '../controller/TimeTravelControllerStorageWrapper.sol';
import {LocalContext} from '../../layer_1/context/LocalContext.sol';

contract ProtectedPartitionsTimeTravel is
    ProtectedPartitions,
    TimeTravelControllerStorageWrapper
{
    function _blockTimestamp()
        internal
        view
        override(LocalContext, TimeTravelControllerStorageWrapper)
        returns (uint256)
    {
        return TimeTravelControllerStorageWrapper._blockTimestamp();
    }
}
