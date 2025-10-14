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
    DEFAULT_ADMIN:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    PAUSER: '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb',
    PAUSE_MANAGER:
        '0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84',
    CONTROL_LIST:
        '0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3',
    CORPORATE_ACTION:
        '0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6',
    ISSUER: '0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842',
    DOCUMENTER:
        '0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41',
    CONTROLLER:
        '0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f',
    CAP: '0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571',
    SNAPSHOT:
        '0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da',
    LOCKER: '0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88',
    ADJUSTMENT_BALANCE:
        '0x6d0d63b623e69df3a6ea8aebd01f360a0250a880cbc44f7f10c49726a80a78a9',
    BOND_MANAGER:
        '0x8e99f55d84328dd46dd7790df91f368b44ea448d246199c88b97896b3f83f65d',
    PROTECTED_PARTITIONS:
        '0x8e359333991af626d1f6087d9bc57221ef1207a053860aaa78b7609c2c8f96b6',
    PROTECTED_PARTITIONS_PARTICIPANT:
        '0xdaba153046c65d49da6a7597abc24374aa681e3eee7004426ca6185b3927a3f5',
    WILD_CARD:
        '0x96658f163b67573bbf1e3f9e9330b199b3ac2f6ec0139ea95f622e20a5df2f46',
    SSI_MANAGER:
        '0x0995a089e16ba792fdf9ec5a4235cba5445a9fb250d6e96224c586678b81ebd0',
    KYC: '0x6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d',
    CLEARING:
        '0x2292383e7bb988fb281e5195ab88da11e62fec74cf43e8685cff613d6b906450',
    CLEARING_VALIDATOR:
        '0x7b688898673e16c47810f5da9ce1262a3d7d022dfe27c8ff9305371cd435c619',
    CONTROL_LIST_MANAGER:
        '0x0e625647b832ec7d4146c12550c31c065b71e0a698095568fd8320dd2aa72e75',
    FREEZE_MANAGER:
        '0xd0e5294c1fc630933e135c5b668c5d577576754d33964d700bbbcdbfd7e1361b',
    BALANCE_ADJUSTMENT_TASK_TYPE:
        '0x9ce9cffaccaf68fc544ce4df9e5e2774249df2f0b3c9cf940a53a6827465db9d',
    SNAPSHOT_TASK_TYPE:
        '0x322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c',
    KYC_MANAGER:
        '0x8ebae577938c1afa7fb3dc7b06459c79c86ffd2ac9805b6da92ee4cbbf080449',
    INTERNAL_KYC_MANAGER:
        '0x3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e',
    AGENT: '0xc4aed0454da9bde6defa5baf93bb49d4690626fc243d138104e12d1def783ea6',
    MATURITY_REDEEMER:
        '0xa0d696902e9ed231892dc96649f0c62b808a1cb9dd1269e78e0adc1cc4b8358c',
    TREX_OWNER:
        '0x03ce2fdc316501dd97f5219e6ad908a3238f1e90f910aa17b627f801a6aafab7',
    PROCEED_RECIPIENT_MANAGER:
        '0xebc53fe99fea28c7aa9476a714959af5b931f34a8a8734365ec63113198d512f',
} as const

export type AtsRoleName = keyof typeof ATS_ROLES
export type AtsRoleHash = (typeof ATS_ROLES)[AtsRoleName]
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
