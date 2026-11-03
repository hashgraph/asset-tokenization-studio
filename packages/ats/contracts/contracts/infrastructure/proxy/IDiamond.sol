// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IDiamondCut } from "./IDiamondCut.sol";
import { IDiamondLoupe } from "./IDiamondLoupe.sol";

/// @custom:hash resolverKey Diamond
bytes32 constant RESOLVER_KEY_DIAMOND = 0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4;

/**
 * @title IDiamond
 * @author Asset Tokenization Studio Team
 * @notice Umbrella interface combining the cut and loupe facets of the Diamond proxy.
 * @dev Inherits `IDiamondCut` (facet upgrade operations) and `IDiamondLoupe` (introspection
 *      queries). Consumers that need to address the Diamond as a whole use this interface.
 */
interface IDiamond is IDiamondCut, IDiamondLoupe {}
