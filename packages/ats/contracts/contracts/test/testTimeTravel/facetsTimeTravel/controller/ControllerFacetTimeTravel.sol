// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControllerFacet } from "../../../../facets/controller/ControllerFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

/**
 * @title ControllerFacetTimeTravel
 * @notice Test-only variant of ControllerFacet with time-travel support.
 * @dev Extends ControllerFacet with TimeTravelProvider so that test suites can manipulate block
 *      timestamps when exercising time-sensitive controller logic. Not intended for production use.
 */
contract ControllerFacetTimeTravel is ControllerFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
