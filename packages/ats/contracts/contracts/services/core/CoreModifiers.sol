// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title CoreModifiers
 * @notice Aggregator contract that re-exports all core domain modifiers
 * @dev This file provides a single import point for all core modifier contracts.
 *      Facets can inherit from this to gain access to all core modifiers, or
 *      import specific modifiers individually from their source files.
 *
 * Core Modifiers:
 * - AccessControlModifiers: Role-based access control validation
 * - CapModifiers: Cap initialization validation
 * - ControlListModifiers: Control list validation (onlyListedAllowed)
 * - DateValidationModifiers: Date validation
 * - ExternalListModifiers: External list initialization validation
 * - PartitionModifiers: Partition protection validation
 * - PauseModifiers: Pause state validation (onlyUnpaused, onlyPaused)
 *
 * @author Asset Tokenization Studio Team
 */

import { AccessControlModifiers } from "./AccessControlModifiers.sol";
import { AddressModifiers } from "./AddressModifiers.sol";
import { CapModifiers } from "./CapModifiers.sol";
import { ControlListModifiers } from "./ControlListModifiers.sol";
import { DateValidationModifiers } from "./DateValidationModifiers.sol";
import { ExternalListModifiers } from "./ExternalListModifiers.sol";
import { PartitionModifiers } from "./PartitionModifiers.sol";
import { PauseModifiers } from "./PauseModifiers.sol";

abstract contract CoreModifiers is
    AccessControlModifiers,
    AddressModifiers,
    CapModifiers,
    ControlListModifiers,
    DateValidationModifiers,
    ExternalListModifiers,
    PartitionModifiers,
    PauseModifiers
{
    // This contract aggregates all core modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
