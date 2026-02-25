// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410TokenHolderFacet } from "../../../facets/features/ERC1400/ERC1410/ERC1410TokenHolderFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract ERC1410TokenHolderFacetTimeTravel is ERC1410TokenHolderFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
