// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalControlListManagementFixedRateFacet
} from "../../../../facets/features/externalControlLists/fixedRate/ExternalControlListManagementFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ExternalControlListManagementFixedRateFacetTimeTravel is
    ExternalControlListManagementFixedRateFacet,
    TimeTravelStorageWrapper
{}
