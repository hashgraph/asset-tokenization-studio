// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643FixedRateFacet } from "../../../../facets/features/ERC1400/ERC1643/fixedRate/ERC1643FixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1643FixedRateFacetTimeTravel is ERC1643FixedRateFacet, TimeTravelStorageWrapper {}
