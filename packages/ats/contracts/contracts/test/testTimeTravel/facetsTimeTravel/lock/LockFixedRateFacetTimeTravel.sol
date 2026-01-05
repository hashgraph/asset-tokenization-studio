// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockFixedRateFacet } from "contracts/layer_1/lock/fixedRate/LockFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "contracts/layer_0/context/LocalContext.sol";

contract LockFixedRateFacetTimeTravel is LockFixedRateFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
