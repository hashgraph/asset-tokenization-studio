// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643Facet } from "../../../facets/features/ERC1400/ERC1643/ERC1643Facet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract ERC1643FacetTimeTravel is ERC1643Facet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
