// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Modifiers
 * @notice Root aggregator contract that provides access to all modifiers
 * @dev Facets can inherit from this single contract to gain access to all
 *      core and asset modifiers. Alternatively, import specific modifier
 *      contracts from their locations in services/core/ or services/asset/.
 *
 * Inheritance:
 * - CoreModifiers: Pause, AccessControl, ControlList, Kyc, Partition, State
 * - AssetModifiers: Clearing, Lock, ERC3643, Compliance, etc.
 *
 * @author Asset Tokenization Studio Team
 */
import { CoreModifiers } from "./core/Modifiers.sol";
import { AssetModifiers } from "./asset/Modifiers.sol";

abstract contract Modifiers is CoreModifiers, AssetModifiers {
    // This contract aggregates all modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
