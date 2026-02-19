// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFixedRateFacet } from "../../../../facets/regulation/bondUSA/fixedRate/BondUSAFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAFixedRateFacetTimeTravel is BondUSAFixedRateFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }
}
