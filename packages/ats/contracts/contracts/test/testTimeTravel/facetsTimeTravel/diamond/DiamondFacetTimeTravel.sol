// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { DiamondFacet } from "../../../../infrastructure/diamond/DiamondFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract DiamondFacetTimeTravel is DiamondFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override(TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
