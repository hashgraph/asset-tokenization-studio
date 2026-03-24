// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TransferAndLockFacet } from "../../../../facets/layer_3/transferAndLock/standard/TransferAndLockFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract TransferAndLockFacetTimeTravel is TransferAndLockFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
