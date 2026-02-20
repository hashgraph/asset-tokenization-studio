// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { AdjustBalancesFacet } from "../../../../facets/assetCapabilities/adjustBalances/AdjustBalancesFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract AdjustBalancesFacetTimeTravel is AdjustBalancesFacet, TimeTravelStorageWrapper {}
