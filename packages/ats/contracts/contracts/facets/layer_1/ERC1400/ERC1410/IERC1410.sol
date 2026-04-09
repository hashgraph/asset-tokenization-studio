// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";
import { IERC1410Issuer } from "./IERC1410Issuer.sol";
import { IERC1410Management } from "./IERC1410Management.sol";
import { IERC1410Read } from "./IERC1410Read.sol";
import { IERC1410TokenHolder } from "./IERC1410TokenHolder.sol";

/**
 * @title IERC1410
 * @notice Off-chain/SDK/test umbrella interface aggregating every ERC1410 facet.
 * @dev DO NOT inherit from any facet contract. Per-facet contracts must `is` only
 *      their corresponding IERC1410<Facet> interface. Inheriting the umbrella from a
 *      concrete facet forces that facet to implement functions it does not own.
 */
// solhint-disable no-empty-blocks
interface IERC1410 is IERC1410Types, IERC1410Issuer, IERC1410Management, IERC1410Read, IERC1410TokenHolder {}
