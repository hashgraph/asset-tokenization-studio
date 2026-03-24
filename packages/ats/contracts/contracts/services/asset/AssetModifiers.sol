// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title AssetModifiers
 * @notice Aggregator contract that re-exports all asset domain modifiers
 * @dev This file provides a single import point for all asset modifier contracts.
 *      Facets can inherit from this to gain access to all asset modifiers, or
 *      import specific modifiers individually from their source files.
 *
 * Asset Modifiers:
 * - ActionValidationModifiers: Action validation
 * - BondModifiers: Bond-specific validation
 * - ClearingModifiers: Clearing state validation
 * - ComplianceModifiers: Compliance validation
 * - EquityModifiers: Equity-specific validation
 * - ERC20Modifiers: ERC20 initialization validation
 * - ERC3643Modifiers: ERC3643 initialization validation
 * - ExpirationModifiers: Expiration validation
 * - InterestRateModifiers: Interest rate initialization validation
 * - LockModifiers: Lock validation
 * - MaturityModifiers: Maturity validation
 * - ProceedRecipientModifiers: Proceed recipients validation
 * - StateModifiers: State validation
 *
 * @author Asset Tokenization Studio Team
 */

import { ActionValidationModifiers } from "./ActionValidationModifiers.sol";
import { BondModifiers } from "./BondModifiers.sol";
import { ClearingModifiers } from "./ClearingModifiers.sol";
import { ComplianceModifiers } from "./ComplianceModifiers.sol";
import { EquityModifiers } from "./EquityModifiers.sol";
import { ERC20Modifiers } from "./ERC20Modifiers.sol";
import { ERC3643Modifiers } from "./ERC3643Modifiers.sol";
import { ExpirationModifiers } from "./ExpirationModifiers.sol";
import { InterestRateModifiers } from "./InterestRateModifiers.sol";
import { LockModifiers } from "./LockModifiers.sol";
import { MaturityModifiers } from "./MaturityModifiers.sol";
import { ProceedRecipientModifiers } from "./ProceedRecipientModifiers.sol";
import { StateModifiers } from "./StateModifiers.sol";

abstract contract AssetModifiers is
    ActionValidationModifiers,
    BondModifiers,
    ClearingModifiers,
    ComplianceModifiers,
    EquityModifiers,
    ERC20Modifiers,
    ERC3643Modifiers,
    ExpirationModifiers,
    InterestRateModifiers,
    LockModifiers,
    MaturityModifiers,
    ProceedRecipientModifiers,
    StateModifiers
{
    // This contract aggregates all asset modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
