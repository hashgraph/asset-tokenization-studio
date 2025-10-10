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
export const EQUITY_CONFIG_ID =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

/**
 * Bond configuration ID.
 *
 * bytes32(uint256(2)) = 0x00...02
 * Used by BusinessLogicResolver to identify bond facet configuration.
 */
export const BOND_CONFIG_ID =
    '0x0000000000000000000000000000000000000000000000000000000000000002'

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
    FACTORY: 'Factory',
} as const

// ============================================================================
// Access Control Roles (ATS Security Tokens)
// ============================================================================

/**
 * Role identifiers (keccak256 hashes) for ATS security token access control.
 *
 * These roles are specific to ATS security tokens and their compliance requirements.
 * Used for granting permissions to accounts in security tokens.
 */
export const ATS_ROLES = {
    PAUSER: '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb',
    PAUSE_MANAGER:
        '0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84',
    CONTROL_LIST:
        '0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3',
} as const

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
    USD: '0x555344', // US Dollar
    EUR: '0x455552', // Euro
    GBP: '0x474250', // British Pound
    CHF: '0x434846', // Swiss Franc
    JPY: '0x4a5059', // Japanese Yen
} as const
