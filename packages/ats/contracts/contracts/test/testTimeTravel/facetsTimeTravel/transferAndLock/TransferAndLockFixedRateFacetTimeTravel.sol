// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    TransferAndLockFixedRateFacet
} from "../../../../facets/layer_3/transferAndLock/fixedRate/TransferAndLockFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract TransferAndLockFixedRateFacetTimeTravel is TransferAndLockFixedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
