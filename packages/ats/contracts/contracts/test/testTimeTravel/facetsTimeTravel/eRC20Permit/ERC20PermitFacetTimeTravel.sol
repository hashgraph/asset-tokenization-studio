// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20PermitFacet } from "../../../../facets/features/ERC1400/ERC20Permit/standard/ERC20PermitFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC20PermitFacetTimeTravel is ERC20PermitFacet, TimeTravelStorageWrapper {}
