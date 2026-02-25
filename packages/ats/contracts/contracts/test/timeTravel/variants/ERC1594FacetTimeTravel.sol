// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594Facet } from "../../../facets/features/ERC1400/ERC1594/ERC1594Facet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract ERC1594FacetTimeTravel is ERC1594Facet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
