pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {Context} from '@openzeppelin/contracts/utils/Context.sol';

abstract contract LocalContext is Context {
    function _blockTimestamp() internal view returns (uint256 blockTimestamp_) {
        return block.timestamp;
    }
}
