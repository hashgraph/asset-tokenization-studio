// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacet } from "../../../../facets/features/ssi/standard/SsiManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract SsiManagementFacetTimeTravel is SsiManagementFacet, TimeTravelStorageWrapper {}
