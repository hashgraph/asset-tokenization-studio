// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC3643ReadFixedRateFacet } from "../../../../facets/features/ERC3643/fixedRate/ERC3643ReadFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC3643ReadFixedRateFacetTimeTravel is ERC3643ReadFixedRateFacet, TimeTravelStorageWrapper {}
