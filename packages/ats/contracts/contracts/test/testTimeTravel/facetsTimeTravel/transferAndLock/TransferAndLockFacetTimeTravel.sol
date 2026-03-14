// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TransferAndLockFacet } from "../../../../facets/layer_3/transferAndLock/standard/TransferAndLockFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract TransferAndLockFacetTimeTravel is TransferAndLockFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
