// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlModifiers } from "./AccessControlModifiers.sol";
import { AddressModifiers } from "./AddressModifiers.sol";
import { CapModifiers } from "./CapModifiers.sol";
import { ControlListModifiers } from "./ControlListModifiers.sol";
import { DateValidationModifiers } from "./DateValidationModifiers.sol";
import { ExternalListModifiers } from "./ExternalListModifiers.sol";
import { KycModifiers } from "./KycModifiers.sol";
import { LoanModifiers } from "./LoanModifiers.sol";
import { PartitionModifiers } from "./PartitionModifiers.sol";
import { PartitionValidationModifiers } from "./PartitionValidationModifiers.sol";
import { PauseModifiers } from "./PauseModifiers.sol";

/// @title CoreModifiers
/// @notice Aggregator contract that re-exports all core domain modifiers
/// @author Asset Tokenization Studio Team
abstract contract CoreModifiers is
    AccessControlModifiers,
    AddressModifiers,
    CapModifiers,
    ControlListModifiers,
    DateValidationModifiers,
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
