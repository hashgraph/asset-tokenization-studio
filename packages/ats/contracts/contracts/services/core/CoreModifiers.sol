// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlModifiers } from "./AccessControlModifiers.sol";
import { DefaultValuesModifiers } from "./DefaultValuesModifiers.sol";
import { CapModifiers } from "./CapModifiers.sol";
import { ControlListModifiers } from "./ControlListModifiers.sol";
import { DateValidationModifiers } from "./DateValidationModifiers.sol";
import { DocumentationModifiers } from "./DocumentationModifiers.sol";
import { KycModifiers } from "./KycModifiers.sol";
import { NominalValueModifiers } from "./NominalValueModifiers.sol";
import { PartitionModifiers } from "./PartitionModifiers.sol";
import { PartitionValidationModifiers } from "./PartitionValidationModifiers.sol";
import { PauseModifiers } from "./PauseModifiers.sol";
import { DeactivateModifiers } from "./DeactivateModifiers.sol";
import { InitializerModifiers } from "./InitializerModifiers.sol";

/**
 * @title CoreModifiers
 * @author Asset Tokenization Studio Team
 * @notice Aggregator that re-exports all core domain modifiers via inheritance.
 * @dev Provides a single import point for all core modifier contracts. Facets can
 *      inherit from this to access all core modifiers simultaneously, or import
 *      individual modifier contracts directly.
 */
abstract contract CoreModifiers is
    AccessControlModifiers,
    DefaultValuesModifiers,
    CapModifiers,
    ControlListModifiers,
    DateValidationModifiers,
    DocumentationModifiers,
    KycModifiers,
    NominalValueModifiers,
    PartitionModifiers,
    PartitionValidationModifiers,
    PauseModifiers,
    DeactivateModifiers,
    InitializerModifiers
{
    // This contract aggregates all core modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
