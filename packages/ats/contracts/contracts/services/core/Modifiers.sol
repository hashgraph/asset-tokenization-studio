// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Modifiers
 * @notice Aggregator contract that re-exports all core domain modifiers
 * @dev This file provides a single import point for all core modifier contracts.
 *      Facets can inherit from this to gain access to all core modifiers, or
 *      import specific modifiers individually from their source files.
 *
 * Core Modifiers:
 * - PauseModifiers: Pause state validation (onlyUnpaused, onlyPaused)
 * - ControlListModifiers: Control list validation (onlyListedAllowed)
 * - KycModifiers: KYC status validation (onlyValidKycStatus)
 *
 * @author Asset Tokenization Studio Team
 */

// Core domain modifiers - located alongside their StorageWrappers
import { PauseModifiers } from "../../domain/core/PauseModifiers.sol";
// Note: ControlListModifiers and KycModifiers will be moved to domain/core/ alongside their StorageWrappers
// and re-exported from here. Currently they can be imported directly from their locations.
