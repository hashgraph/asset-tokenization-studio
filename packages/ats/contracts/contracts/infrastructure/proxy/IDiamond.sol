// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IDiamondCut } from "./IDiamondCut.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";

/// @custom:hash resolverKey Diamond
bytes32 constant RESOLVER_KEY_DIAMOND = 0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4;

// solhint-disable-next-line no-empty-blocks
interface IDiamond is IDiamondCut, IDiamondLoupe {}
