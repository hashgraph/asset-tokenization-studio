// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    TransferAndLockKpiLinkedRateFacet
} from "../../../../facets/layer_3/transferAndLock/kpiLinkedRate/TransferAndLockKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract TransferAndLockKpiLinkedRateFacetTimeTravel is TransferAndLockKpiLinkedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
