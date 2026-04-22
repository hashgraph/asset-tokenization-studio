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
import { DocumentationModifiers } from "./DocumentationModifiers.sol";
import { ExternalListModifiers } from "./ExternalListModifiers.sol";
import { KycModifiers } from "./KycModifiers.sol";
import { LoanModifiers } from "./LoanModifiers.sol";
import { PartitionModifiers } from "./PartitionModifiers.sol";
import { PartitionValidationModifiers } from "./PartitionValidationModifiers.sol";
import { PauseModifiers } from "./PauseModifiers.sol";

abstract contract CoreModifiers is
    AccessControlModifiers,
    AddressModifiers,
    CapModifiers,
    ControlListModifiers,
    DateValidationModifiers,
    DocumentationModifiers,
    ExternalListModifiers,
    KycModifiers,
    LoanModifiers,
    PartitionModifiers,
    PartitionValidationModifiers,
    PauseModifiers
{
    // This contract aggregates all core modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
