// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { IERC3643Operations } from "./IERC3643Operations.sol";
import { IERC3643Read } from "./IERC3643Read.sol";

/**
 * @title IERC3643
 * @notice Off-chain/SDK/test umbrella interface aggregating every ERC3643 facet.
 * @dev DO NOT inherit from any facet contract. Per-facet contracts must `is` only
 *      their corresponding IERC3643<Facet> interface. Inheriting the umbrella from
 *      a concrete facet forces that facet to implement functions it does not own.
 */
// solhint-disable no-empty-blocks
interface IERC3643 is IERC3643Types, IERC3643Management, IERC3643Operations, IERC3643Read {}
