// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycFacet } from "../../../../facets/layer_1/kyc/KycFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract KycFacetTimeTravel is KycFacet, TimeTravelProvider {}
