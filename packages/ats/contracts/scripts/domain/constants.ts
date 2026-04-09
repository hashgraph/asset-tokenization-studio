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

// ============================================================================
// Configuration IDs
// ============================================================================

/**
 * Equity configuration ID.
 *
 * bytes32(uint256(1)) = 0x00...01
 * Used by BusinessLogicResolver to identify equity facet configuration.
 */
export const EQUITY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000001";

/**
 * Bond Variable Rate configuration ID.
 *
 * bytes32(uint256(2)) = 0x00...02
 * Used by BusinessLogicResolver to identify bond variable rate facet configuration.
 */
export const BOND_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

/**
 * Bond Fixed Rate configuration ID.
 *
 * bytes32(uint256(3)) = 0x00...03
 * Used by BusinessLogicResolver to identify bond fixed rate facet configuration.
 */
export const BOND_FIXED_RATE_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000003";

/**
 * Bond Kpi Linked Rate configuration ID.
 *
 * bytes32(uint256(3)) = 0x00...04
 * Used by BusinessLogicResolver to identify bond kpi linked rate facet configuration.
 */
export const BOND_KPI_LINKED_RATE_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000004";

/**
 * Bond Kpi Sustainability Performance Target Rate configuration ID.
 *
 * bytes32(uint256(3)) = 0x00...05
 * Used by BusinessLogicResolver to identify bond sustainability performance target rate facet configuration.
 */
export const BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000005";

/**
 * Loan configuration ID.
 *
 * bytes32(uint256(6)) = 0x00...06
 * Used by BusinessLogicResolver to identify loan facet configuration.
 */
export const LOAN_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000006";

/**
 * Loan Portfolio configuration ID.
 *
 * bytes32(uint256(7)) = 0x00...07
 * Used by BusinessLogicResolver to identify loan portfolio facet configuration.
 */
export const LOAN_PORTFOLIO_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000007";

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
  FACTORY: "Factory",
} as const;

// ============================================================================
// Access Control Role Types (Re-exported from Registry)
// ============================================================================

/**
 * Role types for ATS security tokens.
 *
 * These types provide type-safe access to roles from the auto-generated registry.
 */
import { ROLES } from "./atsRegistry.data";

export type AtsRoleName = keyof typeof ROLES;
export type AtsRoleHash = (typeof ROLES)[AtsRoleName];

// Re-export ROLES for convenience
export const ATS_ROLES = ROLES;

// ============================================================================
// ATS Task Types (for scheduled tasks, balance adjustments, etc.)
// ============================================================================

export const ATS_TASK = {
  SNAPSHOT: "0x322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c",
  BALANCE_ADJUSTMENT: "0x9ce9cffaccaf68fc544ce4df9e5e2774249df2f0b3c9cf940a53a6827465db9d",
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

export const FACET_REGISTRATION_BATCH_SIZE = 20;
