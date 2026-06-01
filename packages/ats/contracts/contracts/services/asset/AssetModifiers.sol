// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ActionValidationModifiers } from "./ActionValidationModifiers.sol";
import { AdjustBalancesModifiers } from "./AdjustBalancesModifiers.sol";
import { ClearingModifiers } from "./ClearingModifiers.sol";
import { CouponModifiers } from "./CouponModifiers.sol";
import { ComplianceModifiers } from "./ComplianceModifiers.sol";
import { ERC1410Modifiers } from "./ERC1410Modifiers.sol";
import { ERC3643Modifiers } from "./ERC3643Modifiers.sol";
import { ExpirationModifiers } from "./ExpirationModifiers.sol";
import { HoldModifiers } from "./HoldModifiers.sol";
import { InterestRateModifiers } from "./InterestRateModifiers.sol";
import { KpisModifiers } from "./KpisModifiers.sol";
import { LockModifiers } from "./LockModifiers.sol";
import { MaturityModifiers } from "./MaturityModifiers.sol";
import { ProceedRecipientModifiers } from "./ProceedRecipientModifiers.sol";
import { ProtectedPartitionRoleValidatorModifiers } from "./ProtectedPartitionRoleValidatorModifiers.sol";
import { StateModifiers } from "./StateModifiers.sol";
import { AmortizationModifiers } from "./AmortizationModifiers.sol";
import { LoansPortfolioModifiers } from "./LoansPortfolioModifiers.sol";

/**
 * @title AssetModifiers
 * @notice Aggregator contract that re-exports all asset domain modifiers
 * @dev This file provides a single import point for all asset modifier contracts.
 *      Facets can inherit from this to gain access to all asset modifiers, or
 *      import specific modifiers individually from their source files.
 *
 * Asset Modifiers:
 * - ActionValidationModifiers: Action validation
 * - AdjustBalancesModifiers: Adjust balances validation
 * - ClearingModifiers: Clearing state validation
 * - CouponModifiers: Coupon date validation
 * - ComplianceModifiers: Compliance validation
 * - ERC3643Modifiers: ERC3643 initialization validation
 * - ExpirationModifiers: Expiration validation
 * - HoldModifiers: Hold validation
 * - InterestRateModifiers: Interest rate initialization validation
 * - KpisModifiers: Kpis validation
 * - LockModifiers: Lock validation
 * - MaturityModifiers: Maturity validation
 * - ProceedRecipientModifiers: Proceed recipients validation
 * - ProtectedPartitionRoleValidator: Protected partitions roles validation
 * - StateModifiers: State validation
 *
 * @author Asset Tokenization Studio Team
 */
abstract contract AssetModifiers is
    ActionValidationModifiers,
    AdjustBalancesModifiers,
    AmortizationModifiers,
    ClearingModifiers,
    CouponModifiers,
    ComplianceModifiers,
    ERC1410Modifiers,
    ERC3643Modifiers,
    ExpirationModifiers,
    HoldModifiers,
    InterestRateModifiers,
    KpisModifiers,
    LockModifiers,
    LoansPortfolioModifiers,
    MaturityModifiers,
    ProceedRecipientModifiers,
    ProtectedPartitionRoleValidatorModifiers,
    StateModifiers
{
    // This contract aggregates all asset modifiers through inheritance
    // No additional logic needed - modifiers are provided by parent contracts
}
