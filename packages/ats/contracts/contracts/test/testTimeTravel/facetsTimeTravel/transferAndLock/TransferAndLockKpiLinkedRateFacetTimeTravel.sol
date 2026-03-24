// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    TransferAndLockKpiLinkedRateFacet
} from "../../../../facets/layer_3/transferAndLock/kpiLinkedRate/TransferAndLockKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract TransferAndLockKpiLinkedRateFacetTimeTravel is TransferAndLockKpiLinkedRateFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
