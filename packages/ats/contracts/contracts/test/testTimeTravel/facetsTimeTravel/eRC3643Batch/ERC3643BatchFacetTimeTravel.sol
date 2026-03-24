// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC3643BatchFacet } from "../../../../facets/layer_1/ERC3643/ERC3643BatchFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

contract ERC3643BatchFacetTimeTravel is ERC3643BatchFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
