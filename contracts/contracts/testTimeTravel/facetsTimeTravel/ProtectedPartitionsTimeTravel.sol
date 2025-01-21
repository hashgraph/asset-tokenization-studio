pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    ProtectedPartitions
} from '../../layer_1/protectedPartitions/ProtectedPartitions.sol';
import {TimeTravel} from '../controller/TimeTravel.sol';
import {LocalContext} from '../../layer_1/context/LocalContext.sol';

contract ProtectedPartitionsTimeTravel is ProtectedPartitions, TimeTravel {
    function _blockTimestamp()
        internal
        view
        override(LocalContext, TimeTravel)
        returns (uint256)
    {
        return TimeTravel._blockTimestamp();
    }
}
