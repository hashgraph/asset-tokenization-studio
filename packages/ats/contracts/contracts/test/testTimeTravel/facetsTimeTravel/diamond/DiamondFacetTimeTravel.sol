// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { DiamondFacet } from "../../../../infrastructure/proxy/facets/DiamondFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract DiamondFacetTimeTravel is DiamondFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
