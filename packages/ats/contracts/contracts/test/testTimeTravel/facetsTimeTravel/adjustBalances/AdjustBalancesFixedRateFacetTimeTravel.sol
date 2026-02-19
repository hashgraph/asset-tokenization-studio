// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import {
    AdjustBalancesFixedRateFacet
} from "../../../../facets/assetCapabilities/adjustBalances/fixedRate/AdjustBalancesFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract AdjustBalancesFixedRateFacetTimeTravel is AdjustBalancesFixedRateFacet, TimeTravelStorageWrapper {}
