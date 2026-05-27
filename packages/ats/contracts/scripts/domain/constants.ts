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
 * bytes32(uint256(4)) = 0x00...04
 * Used by BusinessLogicResolver to identify bond kpi linked rate facet configuration.
 */
export const BOND_KPI_LINKED_RATE_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000004";

/**
 * Loan configuration ID.
 *
 * bytes32(uint256(6)) = 0x00...06
 * Used by BusinessLogicResolver to identify loan facet configuration.
 */
export const LOAN_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000006";

/**
 * Loans Portfolio configuration ID.
 *
 * bytes32(uint256(7)) = 0x00...07
 * Used by BusinessLogicResolver to identify loans portfolio facet configuration.
 */
export const LOANS_PORTFOLIO_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000007";
export const LOANS_PORTFOLIO_RESOLVER_KEY = "0x364410ebf7978001f91cfe2189e143fa8d75bb7365901fbc3d071ece7f86bd46";

/**
 * Factory configuration ID.
 *
 * bytes32(uint256(8)) = 0x00...08
 * Used by BusinessLogicResolver to identify factory facet configuration.
 */
export const FACTORY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000008";
export const ACCESS_CONTROL_RESOLVER_KEY = "0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6";
export const AMORTIZATION_RESOLVER_KEY = "0xe45d89550ef8988da0d14267142ce98f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d";
export const KPI_LINKED_RATE_RESOLVER_KEY = "0x92999bd0329d03e46274ce7743ebe0060df95286df4fa7b354937b7d21757d22";
export const KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY =
  "0x9a05806c3d9c062dfa7983f282dccc0397cb5d4ebf19b80ad4b5586c1d8c6cc6";
export const DIAMOND_RESOLVER_KEY = "0x1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d78";
export const ALLOWANCE_RESOLVER_KEY = "0x9c4229f3034838823867ed0b4bf1bcab29d3ecebdbfe117d13932557c830f228";
export const BALANCE_ADJUSTMENTS_RESOLVER_KEY = "0x2bbe9fb018f1e7dd12b4442154e7fdfd75aec7b0a65d07debf49de4ece5fe8b8";
export const BALANCE_TRACKER_RESOLVER_KEY = "0xe5224fce279d87fd0876a56f9f00d1596cef92571a27c651c09f9b0462efb974";
export const BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY =
  "0x4aa82b9c4bc25297ffd0abda4fd7f5b1cb7a373353f5b0cc1985bc6ddbe2f64b";
export const BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY =
  "0x315cba9013a79ef28ff25fb15fef21d233a1161f13129c357af5417d2f9ed165";
export const BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY =
  "0x1d00004473b3453aa2cd7490fb523dbff7071733cf0c64334784429a6f227514";
export const BALANCE_TRACKER_BY_PARTITION_RESOLVER_KEY =
  "0x5e8d2cfc1836db4646bfee17c45aafdf6666f41b7ce69811bc816e803d5b2e1b";
export const BATCH_BURN_RESOLVER_KEY = "0x43fc8244bf524f6f323a3774e3e8b4da44f7ddc31b86d4c1019aebeda7450850";
export const BATCH_CONTROLLER_RESOLVER_KEY = "0xffe1275def1a3a46bc6ba76bcbfd30f67a8fe0acbb897a549fc767cd63b810b5";
export const BATCH_FREEZE_RESOLVER_KEY = "0x2f58eaa3e08a94a58af659b6fd0a0c4e30bd5e789982c50863ce4e499535711c";
export const BATCH_MINT_RESOLVER_KEY = "0x374297c978f655a089db25efe1b31a49abab9c474f8f1a4a54224df3f09e2b39";
export const BATCH_TRANSFER_RESOLVER_KEY = "0x2c2bcad4399109e963ba5d1f9b9731b938099d1d3352ee7455c5e5076de49c82";
export const BOND_FIXED_RATE_RESOLVER_KEY = "0xd55d8787d23b78e70dada1ade45b8758f5c027e2cddf3556606c07d388ce159a";
export const BURN_RESOLVER_KEY = "0x16c38166ed323ed9296016a0c71ccf46c67708d8c7dac2fca906f1a51c144f83";
export const BURN_BY_PARTITION_RESOLVER_KEY = "0x359839235451adf632322273659c503520ed6c6f69927c2486abb38396512e0d";
export const MINT_RESOLVER_KEY = "0x936fea8488bdd2feb75c9f50636e7ca7a0d630c49209e3af07c00abb000da03f";
export const CAP_BY_PARTITION_RESOLVER_KEY = "0x1141b1e6f40d5d3b69ddf3d6da31a79b8a64309e999c931ac0ed437c789b737f";
export const CAP_RESOLVER_KEY = "0xfb3f8aac36661b5540c571d821c80dc9db7ede5ca2a4204ee562b3356f0c026b";
export const CLEARING_HOLDBYPARTITION_RESOLVER_KEY =
  "0x3e96db9c134bb9c633652055190877ed7467692bf17ca4b9a1aa49773fa01303";
export const CLEARING_RESOLVER_KEY = "0x43432f8c1c15888e9f2825356efbd94b604920165ac59da52595f66b1adbbc9f";
export const CORE_RESOLVER_KEY = "0x6b7d10d5f354a1dd56d2152e6a9c56b614c4c2c9d08f5289a72824dfc13132eb";
export const COMPLIANCE_RESOLVER_KEY = "0x26dd018c79db76fffcf69d611558031ed11d7660991c2466b284afe6cfdfe5b5";
export const COMPLIANCE_BY_PARTITION_RESOLVER_KEY =
  "0x2ff58a09acbd5a34785ae81220d04d7cbcbb3ad9943a40de722fff33b92b2074";
export const CONTROLLER_BY_PARTITION_RESOLVER_KEY =
  "0x66d6ddfefca163b54f2a365e7965e1c3f42e2d87254191bcfb5a6e7fb03174a2";
export const CONTROLLER_HOLD_BY_PARTITION_RESOLVER_KEY =
  "0x9e49506d2dfd484ed2aa6f2fd6f90a9efd8ae79466f93fa70571a95ddda4659c";
export const CORE_AT_SNAPSHOT_RESOLVER_KEY = "0x72b3df174c5ac7f128d0d1ae81ec15e1d5abd21d1a0f58f64d78de0108be41de";
export const CLEARING_BY_PARTITION_RESOLVER_KEY = "0xf85991852d77f3c0148a5664d929193035ee310d0ab31bb92a23ee973184f9a4";
export const DEACTIVATE_RESOLVER_KEY = "0x28edc8979475f616e9ee33c89ffa66022cb1bd6d3c555cbb4c4acaefa3974f96";
export const ERC20VOTES_RESOLVER_KEY = "0x5cbfbaa435e19a43530a00ac685c9b5252862a94af2053667ded44642a0d9f4c";
export const EIP712_RESOLVER_KEY = "0xe19e9ba358b25b281ecf7a998a7040a7cea72e6fb09fa5ceab8598a59927bee4";
export const ERC1410_MANAGEMENT_RESOLVER_KEY = "0x232f8686795d3f197681faf0d8db05655e759f62d709d56b97e5d9cfff29dbf5";
export const ERC3643_MANAGEMENT_RESOLVER_KEY = "0xae7b7d0da6ac02e802a8d85aa821dd5cb84e8448836471680f744f64b678a073";
export const FIXED_RATE_RESOLVER_KEY = "0x2871e1c37f7423765d88b16528db7e80ad8e2bae5ab5d55e26659840c1d6b504";
export const FREEZE_RESOLVER_KEY = "0x49f765e7155d979a148049c2a0ebed5e028b11799061897a255f99314f0bd3f1";
export const HOLD_RESOLVER_KEY = "0x6c7216c5c52bc8f5019fc2fb333eb5e518e647fd82c807ed7c2a1fe4a03a3860";
export const HOLD_AT_SNAPSHOT_RESOLVER_KEY = "0x799547b5a870e2f0d0e9664f133d288ad8cd2a1b267be8ae0085030adb2d858d";
export const HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY =
  "0xa843a6a38df62d52595e1b2e9b439339fe835afcb70c7dac1a7cf5db53ba7c2d";
export const HOLD_BY_PARTITION_RESOLVER_KEY = "0xbd20b56dcb5b88314c7ec1365b91d4173f9c9fb0cb891bc11e758dbbddad1437";
export const INTEREST_RATE_RESOLVER_KEY = "0x564574da835bfa15298fb9a545a3eb73fff192a56a6fadc086f705087433a9bf";
export const CORE_ADJUSTED_RESOLVER_KEY = "0xb4135b83cc3bbd6b3d1da5b0abcc33c9cb857bf5a314bab3cdff8241e72306d0";
export const CORPORATE_ACTIONS_RESOLVER_KEY = "0x3cc74200ccfb5d585a6d170f8824979dbf1b592e0a41eef41cf6d86cf4882077";
export const COUPON_RESOLVER_KEY = "0xa404f705370f56f56364ac9aa1092c1002b2bfcd7020c1bb5ca7489f8061efa7";
export const DIVIDEND_RESOLVER_KEY = "0x63752e3f4bd54d9fec1ad1667ef4de4f80e9a6484fb94f93ea4312aef9c19bea";
export const DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY =
  "0xc6f22894c7b5a791b1ec8ba97fced37ce7b17c9e0ffea29bf1c1064a0edd85ad";
export const DOCUMENTATION_RESOLVER_KEY = "0x57129a8daf2f0c8049f790465a8c176b7e9fdd5f8cbe1f7f9c6c3a70351ea521";
export const FREEZE_AT_SNAPSHOT_RESOLVER_KEY = "0x554064f549ff9eaa803cb2be55ec6fca6974b28c5784cb9378aaf194d0804af3";
export const FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY =
  "0x80cbb1bc5d072c294e5b54560d3a253a0592491a06044b579cd0d36f31102b42";
export const LOCK_RESOLVER_KEY = "0xf1364345b3db5ebe5808f2d2d2aaecb9cdb4fddacad1534033060ebc886fc1e9";
export const SCHEDULED_BALANCE_ADJUSTMENT_RESOLVER_KEY =
  "0xb1373c030944c4dcf728b6cc8106d93cbd0b7b2b8f59d82d57c56a369cb06487";
export const SCHEDULED_TASKS_RESOLVER_KEY = "0xa4934195ab83f1497ce5fc99b68d0f41694716bcfba5f232aa6c8e0d4d504f08";
export const TRANSFER_AND_LOCK_RESOLVER_KEY = "0xd9b300e6bf7a143b8fd8cf1d4ab050e691c862bf0f57a7d49cc08c60efe68d08";
export const LOCK_AT_SNAPSHOT_RESOLVER_KEY = "0xd0a412f3e7cd9c9475b5482a548616fc5e2ea67832b8fcd66d2e6a7086c503e9";
export const LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY =
  "0x7c9ad673591726c4a734d6b33467423b11157bdb4c25a5be0e340ecec86857ca";
export const LOCK_BY_PARTITION_RESOLVER_KEY = "0x9c79f8b10d67860ea033eb8936f04428327ffd8f704f9bb74446bff26c3ddb2a";
export const MATURITY_RESOLVER_KEY = "0xcd009b906f79b9bf6dbfaf895e8658a4857b952a76b3f6c36089a5c011768289";
export const MATURITY_BY_PARTITION_RESOLVER_KEY = "0x2b81c0fae3cdccac1d4a19f22a96fdf66979e7714b26548cd486b8428befb253";
export const METADATA_RESOLVER_KEY = "0x4c3bd2753f7bc002cfee0180298759848c0f294a3bdb6c27eb76ea165a47b29d";
export const MINT_BY_PARTITION_RESOLVER_KEY = "0x3ea08f77d09ff7af30dc84e68a8009e7ba785b772982e71c6914fd2e960bf58f";
export const NONCES_RESOLVER_KEY = "0xb235fd4aa74228c048d55d58514cd3393ef934423864ef7ddca6d302041c2bd1";
export const OPERATOR_RESOLVER_KEY = "0x51edd1c99284e90fe906b4688cd46c5a665145ae32ebfd2df614ca0cd610e325";
export const OPERATOR_BY_PARTITION_RESOLVER_KEY = "0x2809aea79e9555a03702a2bc4909c1ec379fa84126c71610671545c2d5e96957";
export const OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY =
  "0x985830ee03940f1c26f2142776f45b16bdbeba9ae580393ab4e7fea7ade58a32";
export const OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY =
  "0xcfd3ab401449af4b9d7599f2956585b2f8801375c91c16af5991e87030884f8a";
export const OPERATOR_CLEARING_HOLDBYPARTITION_RESOLVER_KEY =
  "0xd57eac3a4394fdead2591bfb2fb7f7557f204b6c5b3787821394cb3f57a8ef90";
export const PAUSE_RESOLVER_KEY = "0x9429fd9ef38f89f41bd9ec33fd5c94b287ed1c27a98938da43835ac761b2f92c";
export const PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY =
  "0x12c5881cfa073bf7497f90103e5b2a7f9a93f11147137ec2a1389b60904d0157";
export const RECOVERY_RESOLVER_KEY = "0xd571c40fba8b07f32c6bf9e27abe2a3e57a71d41f2ebbd1e52f07b5a1ed4aaa4";
export const SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY =
  "0x3dc4b3a968b10d149d468d66b43cc0dd0de16009510fe5b6838369087c6d4d4c";
export const SNAPSHOTS_BY_PARTITION_RESOLVER_KEY = "0x3b5d7af028f11f553faeb3b68c55dbc6ec4e20b0ae08ffc53f2de483983128a9";
export const TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY =
  "0x651cc28fb504945850c0fe8948386581fccc7ac2967e4e6eb36e172956a942a8";
export const PROCEED_RECIPIENTS_RESOLVER_KEY = "0x87f4b676bf89cd24a01a78fd8e7fb2102c2f6d034be73d16402f7297e0ae625b";
export const PROTECTED_PARTITIONS_RESOLVER_KEY = "0x6d65d2938c05a4d952aff0845c1baa5bea04d4544db74f8b3b26004d1d58d58f";
export const COUPON_LISTING_RESOLVER_KEY = "0x09830f922c6bb4e736cc4cc426ceec0888c8b95b2cc21b67f16dab889ad4c47e";
export const COUPON_SECURITY_HOLDERS_RESOLVER_KEY =
  "0x2dbf6db0e4dddb14cd72f1a882c1520fdbd592db82b5f3d2562ace6c9eb5cc23";
export const TRANSFER_RESOLVER_KEY = "0x9818f50e5682a829cabb91bab6ca3ae07cb96402fa6bd2b3f861c80ae89588e6";
export const TRANSFER_BY_PARTITION_RESOLVER_KEY = "0x28988fc13ea6c379b266ce67c0562fddda8c749455e215597605079e6436290a";
export const VOTING_RESOLVER_KEY = "0x97e0ffc69e5d5dd7c4635bfce0a5cf15b1c313433d49edbd55813da224b03768";

// TEST-ONLY: configuration ID for the InitializeMock domain used by initializer-versioning tests.
/**
 * Initialize Mock configuration ID (TEST-ONLY).
 *
 * bytes32(uint256(9)) = 0x00...09
 * Used by BusinessLogicResolver to identify the mock initializer-test facet configuration.
 * Only registered when `useTimeTravel` is enabled in `deploySystemWithNewBlr`.
 */
export const INITIALIZE_MOCK_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000009";

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
