// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TransferFacet } from "../../../../facets/transfer/TransferFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

/**
 * @title TransferFacetTimeTravel
 * @notice Test-only variant of TransferFacet with time-travel support.
 * @dev Extends TransferFacet with TimeTravelProvider so that test suites can manipulate block
 *      timestamps when exercising time-sensitive transfer logic. Not intended for production use.
 */
contract TransferFacetTimeTravel is TransferFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
