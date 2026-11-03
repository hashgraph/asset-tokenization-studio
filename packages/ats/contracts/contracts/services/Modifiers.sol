// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AssetModifiers } from "./asset/AssetModifiers.sol";
import { CoreModifiers } from "./core/CoreModifiers.sol";

/**
 * @title Modifiers
 * @notice Aggregates reusable core and asset-level modifiers for inheriting contracts.
 * @dev Provides a single inheritance point for common access, pause, compliance, asset
 *      and validation restrictions. Inheriting contracts also receive modifiers declared
 *      by `CoreModifiers` and `AssetModifiers`.
 * @author Asset Tokenization Studio Team
 */
abstract contract Modifiers is CoreModifiers, AssetModifiers {}
