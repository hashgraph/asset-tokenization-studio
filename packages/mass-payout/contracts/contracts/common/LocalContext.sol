// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import { Context } from "@openzeppelin/contracts/utils/Context.sol";

abstract contract LocalContext is Context {
    function _blockTimestamp() internal view virtual returns (uint256 blockTimestamp_) {
        blockTimestamp_ = block.timestamp;
    }
}
