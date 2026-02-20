// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycFacet } from "../../../../facets/features/kyc/KycFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract KycFacetTimeTravel is KycFacet, TimeTravelStorageWrapper {}
