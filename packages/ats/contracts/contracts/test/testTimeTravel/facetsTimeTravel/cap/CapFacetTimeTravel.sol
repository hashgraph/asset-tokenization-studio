// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapFacet } from "../../../../facets/features/cap/CapFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract CapFacetTimeTravel is CapFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
