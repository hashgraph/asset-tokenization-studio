// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Asset Tokenization Studio.
 *
 * These constants are specific to ATS business logic (equities, bonds,
 * compliance, financial instruments) and should not be moved to infrastructure/.
 *
 * The infrastructure layer should remain domain-agnostic and reusable for
 * any smart contract project.
 *
 * @module domain/constants
 */

import { toBeHex } from "ethers";

// ============================================================================
// Configuration IDs
// ============================================================================

/**
 * BusinessLogicResolver configuration IDs, one per asset/factory configuration.
 *
 * Each value is `bytes32(uint256(N))` for a small `N`, derived here so the
 * numbering is self-evident. These are a deploy-time convention the resolver
 * accepts as an opaque `bytes32`; they are deployment-breaking, so the values
 * are pinned by `test/scripts/unit/domain/configIds.test.ts`. The test-only
 * InitializeMock id lives with its mock domain — see `INITIALIZE_MOCK_CONFIG_ID`
 * in `scripts/domain/initializeMock/mockFacetsRegistry.ts`.
 */
export const CONFIG_IDS = {
  equity: toBeHex(1, 32),
  bond: toBeHex(2, 32),
  depositToken: toBeHex(5, 32),
  factory: toBeHex(8, 32),
} as const;

/**
 * Registry name of the test-only EVM accessor facet.
 *
 * Appended to a token configuration's facet list only when `isTestMode()` is
 * true, so the resulting diamond can override `block.timestamp` / `block.number`
 * / `block.chainid` during tests. In prod compiles the facet is excluded from the
 * source graph and absent from the registry, so it must never be appended.
 */
export const EVM_ACCESSORS_FACET_NAME = "EvmAccessorsFacet";

// ============================================================================
// ATS-Specific Contract Names
// ============================================================================

/**
 * ATS domain-specific contract names.
 *
 * These are contracts specific to the Asset Tokenization Studio and not
 * part of generic infrastructure.
 */
export const ATS_CONTRACTS = {
  FACTORY: "FactoryFacet",
} as const;

// ============================================================================
// Access Control Role Types (Re-exported from Registry)
// ============================================================================

/**
 * Role types for ATS security tokens.
 *
 * These types provide type-safe access to roles from the auto-generated registry.
 */
/**
 * @remarks
 * BBND-1766: `ROLES` is imported from the dedicated `atsRoles.generated.ts`
 * (checked into git) rather than the heavier `atsRegistry.generated.ts`
 * (gitignored). This decouples the bootstrap-time import chain — including
 * everything reachable from `hardhat.config.ts` via the `@scripts` barrel —
 * from the auto-generated facet/contract registry, so a fresh clone can run
 * `hardhat compile` to regenerate the heavy file without a chicken-and-egg
 * failure.
 */
import { ROLES } from "./atsRoles.generated";

export type AtsRoleName = keyof typeof ROLES;
export type AtsRoleHash = (typeof ROLES)[AtsRoleName];

// Re-export ROLES for convenience
export const ATS_ROLES = ROLES;

// ============================================================================
// ATS Task Types (for scheduled tasks, balance adjustments, etc.)
// ============================================================================

import { HASHES } from "../codegen/hashGen";

export const ATS_TASK = {
  SNAPSHOT: HASHES.scheduledTask("Snapshot"),
  BALANCE_ADJUSTMENT: HASHES.scheduledTask("BalanceAdjustment"),
  COUPON_LISTING: HASHES.scheduledTask("CouponListing"),
} as const;

export const ATS_CORPORATE_ACTION = {
  DIVIDEND: HASHES.corporateAction("Dividend"),
  VOTING_RIGHTS: HASHES.corporateAction("VotingRights"),
  COUPON: HASHES.corporateAction("Coupon"),
  BALANCE_ADJUSTMENT: HASHES.corporateAction("BalanceAdjustment"),
  AMORTIZATION: HASHES.corporateAction("Amortization"),
  LOAN: HASHES.corporateAction("Loan"),
} as const;

export type AtsTaskType = keyof typeof ATS_TASK;
export type AtsTaskHash = (typeof ATS_TASK)[AtsTaskType];

// ============================================================================
// Regulation Enums (ATS Compliance)
// ============================================================================

/**
 * Regulation enums matching Solidity definitions.
 *
 * These enums match contracts/layer_3/constants/regulation.sol and provide
 * TypeScript-friendly enum types for ATS regulatory compliance configuration.
 */

/**
 * Regulation type for ATS security tokens.
 *
 * Maps to contracts/layer_3/constants/regulation.sol
 */
export enum RegulationType {
  NONE = 0,
  REG_S = 1,
  REG_D = 2,
}

/**
 * Regulation sub-type for ATS security tokens.
 *
 * Maps to contracts/layer_3/constants/regulation.sol
 */
export enum RegulationSubType {
  NONE = 0,
  REG_D_506_B = 1,
  REG_D_506_C = 2,
}

export enum AccreditedInvestors {
  NONE = 0,
  ACCREDITATION_REQUIRED = 1,
}

export enum ManualInvestorVerification {
  NOTHING_TO_VERIFY = 0,
  VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED = 1,
}

export enum InternationalInvestors {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
}

export enum ResaleHoldPeriod {
  NOT_APPLICABLE = 0,
  APPLICABLE_FROM_6_MOTHS_TO_1_YEAR = 1,
}

export interface RegulationData {
  /** Regulation type */
  regulationType: RegulationType;
  /** Regulation sub-type */
  regulationSubType: RegulationSubType;
  /** Deal size (0 for no limit) */
  dealSize: bigint;
  /** Accredited investors requirement */
  accreditedInvestors: AccreditedInvestors;
  /** Maximum non-accredited investors allowed */
  maxNonAccreditedInvestors: bigint;
  /** Manual investor verification requirement */
  manualInvestorVerification: ManualInvestorVerification;
  /** International investors allowed */
  internationalInvestors: InternationalInvestors;
  /** Resale hold period */
  resaleHoldPeriod: ResaleHoldPeriod;
}

// ============================================================================
// Regulation Data Builders
// ============================================================================

const _REGS_DEAL_SIZE = 0n;
const _REGS_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
const _REGS_MAX_NON_ACCREDITED_INVESTORS = 0n;
const _REGS_MANUAL_INVESTOR_VERIFICATION =
  ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
const _REGS_INTERNATIONAL_INVESTORS = InternationalInvestors.ALLOWED;
const _REGS_RESALE_HOLD_PERIOD = ResaleHoldPeriod.NOT_APPLICABLE;

const _REGD_506_B_DEAL_SIZE = 0n;
const _REGD_506_B_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
const _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS = 35n;
const _REGD_506_B_MANUAL_INVESTOR_VERIFICATION =
  ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
const _REGD_506_B_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
const _REGD_506_B_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

const _REGD_506_C_DEAL_SIZE = 0n;
const _REGD_506_C_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
const _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS = 0n;
const _REGD_506_C_MANUAL_INVESTOR_VERIFICATION =
  ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
const _REGD_506_C_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
const _REGD_506_C_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

export function buildDealSize(_regulationType: RegulationType, _regulationSubType: RegulationSubType): bigint {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_DEAL_SIZE;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_DEAL_SIZE;
  }
  return _REGD_506_C_DEAL_SIZE;
}

export function buildAccreditedInvestors(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): AccreditedInvestors {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_ACCREDITED_INVESTORS;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_ACCREDITED_INVESTORS;
  }
  return _REGD_506_C_ACCREDITED_INVESTORS;
}

export function buildMaxNonAccreditedInvestors(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): bigint {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_MAX_NON_ACCREDITED_INVESTORS;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS;
  }
  return _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS;
}

export function buildManualInvestorVerification(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): ManualInvestorVerification {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_MANUAL_INVESTOR_VERIFICATION;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_MANUAL_INVESTOR_VERIFICATION;
  }
  return _REGD_506_C_MANUAL_INVESTOR_VERIFICATION;
}

export function buildInternationalInvestors(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): InternationalInvestors {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_INTERNATIONAL_INVESTORS;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_INTERNATIONAL_INVESTORS;
  }
  return _REGD_506_C_INTERNATIONAL_INVESTORS;
}

export function buildResaleHoldPeriod(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): ResaleHoldPeriod {
  if (_regulationType === RegulationType.REG_S) {
    return _REGS_RESALE_HOLD_PERIOD;
  }
  if (_regulationSubType === RegulationSubType.REG_D_506_B) {
    return _REGD_506_B_RESALE_HOLD_PERIOD;
  }
  return _REGD_506_C_RESALE_HOLD_PERIOD;
}

export function buildRegulationData(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): RegulationData {
  return {
    regulationType: _regulationType,
    regulationSubType: _regulationSubType,
    dealSize: buildDealSize(_regulationType, _regulationSubType),
    accreditedInvestors: buildAccreditedInvestors(_regulationType, _regulationSubType),
    maxNonAccreditedInvestors: buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType),
    manualInvestorVerification: buildManualInvestorVerification(_regulationType, _regulationSubType),
    internationalInvestors: buildInternationalInvestors(_regulationType, _regulationSubType),
    resaleHoldPeriod: buildResaleHoldPeriod(_regulationType, _regulationSubType),
  };
}

export function isValidTypeAndSubType(_regulationType: RegulationType, _regulationSubType: RegulationSubType): boolean {
  return (
    isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType) ||
    isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType)
  );
}

export function isValidTypeAndSubTypeForRegS(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): boolean {
  return _regulationType === RegulationType.REG_S && _regulationSubType === RegulationSubType.NONE;
}

export function isValidTypeAndSubTypeForRegD(
  _regulationType: RegulationType,
  _regulationSubType: RegulationSubType,
): boolean {
  return _regulationType === RegulationType.REG_D && _regulationSubType !== RegulationSubType.NONE;
}

// ============================================================================
// Currency Constants (ATS Financial Instruments)
// ============================================================================

/**
 * Common currency codes encoded as bytes3 for use in ATS security token contracts.
 *
 * Format: ASCII encoding of ISO 4217 currency codes
 * Example: "USD" = 0x555344 (U=0x55, S=0x53, D=0x44)
 *
 * @example
 * ```typescript
 * currency: CURRENCIES.USD  // 0x555344
 * ```
 */
export const CURRENCIES = {
  USD: "0x555344", // US Dollar
  EUR: "0x455552", // Euro
  GBP: "0x474250", // British Pound
  CHF: "0x434846", // Swiss Franc
  JPY: "0x4a5059", // Japanese Yen
} as const;

export const FACET_REGISTRATION_BATCH_SIZE = 10;
