// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    ERC1410ReadKpiLinkedRateFacet
} from "../../../../facets/features/ERC1400/ERC1410/kpiLinkedRate/ERC1410ReadKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC1410ReadKpiLinkedRateFacetTimeTravel is ERC1410ReadKpiLinkedRateFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
