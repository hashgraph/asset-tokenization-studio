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
import { ROLES } from "@scripts/domain";

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
