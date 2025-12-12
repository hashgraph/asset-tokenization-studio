// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFixedReadFacet } from "../../../layer_3/bondUSA/fixedRate/BondUSAFixedReadFacet.sol";
import { TimeTravelStorageWrapper } from "../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../layer_0/context/LocalContext.sol";

contract BondUSAFixedReadFacetTimeTravel is BondUSAFixedReadFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
