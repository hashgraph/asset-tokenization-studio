// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Modifiers
 * @notice Aggregator contract that re-exports all asset domain modifiers
 * @dev This file provides a single import point for all asset modifier contracts.
 *      Facets can inherit from this to gain access to all asset modifiers, or
 *      import specific modifiers individually from their source files.
 *
 * Asset Modifiers:
 * - ClearingModifiers: Clearing state validation (onlyClearingDisabled, onlyClearingActivated)
 * - LockModifiers: Lock validation
 * - BondModifiers: Bond-specific validation
 * - CapModifiers: Cap validation
 *
 * @author Asset Tokenization Studio Team
 */

// Note: Most asset modifiers are currently in infrastructure/utils/
// They will be moved to domain/asset/ alongside their StorageWrappers
// and re-exported from here. Currently they can be imported directly from
// ../../infrastructure/utils/ClearingModifiers.sol etc.
