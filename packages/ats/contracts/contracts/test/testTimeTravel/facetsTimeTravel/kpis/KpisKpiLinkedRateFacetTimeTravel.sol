// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    KpisKpiLinkedRateFacet
} from "../../../../facets/assetCapabilities/kpis/kpiLatest/kpiLinkedRate/KpisKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract KpisKpiLinkedRateFacetTimeTravel is KpisKpiLinkedRateFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
