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
export const LOANS_PORTFOLIO = "0x3f6ea14bbeaea82befb49409b874caf151715c6619ac1d26ba858039b7ece33e";

/**
 * Factory configuration ID.
 *
 * bytes32(uint256(8)) = 0x00...08
 * Used by BusinessLogicResolver to identify factory facet configuration.
 */
export const FACTORY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000008";
export const RESOLVER_KEY_ACCESS_CONTROL = "0xccc2e755f9225e65f6c822a258c866fc0d57a124ad12c8928adf3ff875ffcd70";
export const RESOLVER_KEY_AMORTIZATION = "0xc0d83d8b9295f78954b1c7c9648bec9775edf597a57f9f4110883e9ca2134739";
export const RESOLVER_KEY_KPI_LINKED_RATE = "0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593";
export const RESOLVER_KEY_KPIS = "0xc0b75e6f4facfa630926f9653b857eeb3547c604941b210701f53f3b17521743";
export const RESOLVER_KEY_DIAMOND = "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4";
export const RESOLVER_KEY_ALLOWANCE = "0x329473cfbe06c7719b3c986b04b90a16a859b86307aad33eea0c3dfe87160ab7";
export const RESOLVER_KEY_BALANCE_ADJUSTMENTS = "0x0d52158578e1e30e77e2dd3caffc1aa31af5397866b92131f66858f01b2e8f01";
export const RESOLVER_KEY_BALANCE_TRACKER = "0xefbff5dcb4e5bf43bf472fd0646991b8b4731876498b2a4248f9aa9aee1a127b";
export const RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED =
  "0xde8fb5b2c9dd63c753422ecea8bad989281451fa65dff90dd686eff691b03805";
export const RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT =
  "0x2c9af26b5891593b8184a58e38f6c52e42af55578543d14ab176abd1213e3013";
export const RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION =
  "0x58443162e33b704d1fc5afb40e87bf81357231beefee616de557cc06fef3aba8";
export const RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION =
  "0x05d2477d09e6a1df45e3e51bd398af7a071f6f282255486cec19b8b5a403bbaf";
export const RESOLVER_KEY_BATCH_BURN = "0x60fbdebafe46599d2a6d6cbec0e554cfdf693e5eb001a783852bbbc82e5c9984";
export const RESOLVER_KEY_BATCH_CONTROLLER = "0x535258ade68566dbac2304c09e172709e8b0ab3f78d2be54014d021ddb03ab58";
export const RESOLVER_KEY_BATCH_FREEZE = "0x6ddbb1869dce32d8e2c9bb2d23fad216723298560b6cceba67890d5a3efe0e5e";
export const RESOLVER_KEY_BATCH_MINT = "0x7575e07f738065de9a6ba5370d7d18b79f7a0b885824780bf5c75784978e9530";
export const RESOLVER_KEY_BATCH_TRANSFER = "0x01e13672eac45bef2d8d3f1c56eaca6857103f3b72ec9ded3d1f30aa15747d05";
export const RESOLVER_KEY_BURN = "0xa9ec330b49ea310aaeba8dae3ba4f2a0b94fd35fafb9d8d8afbb804b73d50ce2";
export const RESOLVER_KEY_BURN_BY_PARTITION = "0x8d135078123ea705bd40f02ac0cd59ac08da08600b3510ba6150fe0e4a588684";
export const RESOLVER_KEY_MINT = "0x394ec838636f78e91b7dbb3e4ea567e07bbb3886ab70a66652c40be856ab9b7a";
export const RESOLVER_KEY_CAP_BY_PARTITION = "0x0a9c473b0456240ebc327730dba40a495c5a639839b0c0b30a01db12373f7529";
export const RESOLVER_KEY_CAP = "0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5";
export const RESOLVER_KEY_CLEARING_HOLDBYPARTITION =
  "0x027ca02a0a3de6d790cd3b5ff9c792b4bfc1649964d7737f5c4554992ca9b111";
export const RESOLVER_KEY_CLEARING = "0xb101eca2006801ca94d6bc86288da88fc7f2ddf39849d3dd96fae75967a3d344";
export const RESOLVER_KEY_CORE = "0xb54e0c9a42346a2760a44e59035a2b84a61d07bed66a2f24cffe3ca4bae1996f";
export const RESOLVER_KEY_COMPLIANCE = "0x0e30d654f46079d52767224a07d1fe1adc91d7edba6504f2f0adca0fca972180";
export const RESOLVER_KEY_COMPLIANCE_BY_PARTITION =
  "0xafad2096960379c99c5eae984f0f4ceddafa69c3e08352bcaf84e804ec4135b6";
export const RESOLVER_KEY_CONTROLLER_BY_PARTITION =
  "0xa75865ef65a8410651c7bfebbfa9b89bd06e0bdf0dba55817ba1a6b49fdb1517";
export const RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION =
  "0xc415f5239b26cab850bcaca08096196a95d9ea5bab0eed1a6e29ce81490efd33";
export const RESOLVER_KEY_CORE_AT_SNAPSHOT = "0x9f1ab2bcf2a5668b07a2b26155b1c04f30721db434dff2f1e69a3a9b1dc0a039";
export const RESOLVER_KEY_CLEARING_BY_PARTITION = "0xb63156d6db31ae3207bca0dd4a8a45f227171367d85a3833a0d7a1622212c5ec";
export const RESOLVER_KEY_DEACTIVATE = "0x13d8bdda80bdc4e1d1af80d2096fdf84affb60341d7b8f44392412162d3c3434";
export const RESOLVER_KEY_ERC20VOTES = "0x9619bb38c76aac49afb1df75430aefc1314778fe926136a688bf3ae3b5f8c3b7";
export const RESOLVER_KEY_EIP712 = "0xaa031e71d3d43f715d16d62c62d7573406d29acdf4c080143dab629e08a8402f";
export const RESOLVER_KEY_ERC1410_MANAGEMENT = "0xb4096d676324d7f4d32415a0a0810544a5dc12d6559dee91fb3c4b77cdde3392";
export const RESOLVER_KEY_ERC3643_MANAGEMENT = "0x21a44f0c9eb38617ca4a06ead94c1424e63be7f8eefdb2773ca08796fbda508b";
export const RESOLVER_KEY_FIXED_RATE = "0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521";
export const RESOLVER_KEY_FREEZE = "0xad51c3d79dbb37543854270a7bd1c7237cfa425b16cdf4dee9015c20917ced5a";
export const RESOLVER_KEY_HOLD = "0x7c2ef14067e573a8580a580634bd7547099c4b82cd9f36610da317d77eacf1f1";
export const RESOLVER_KEY_HOLD_AT_SNAPSHOT = "0xe4ec7231213c656d430571c2b40cf204f87a626b5ccf0db85527f72470e54a9e";
export const RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION =
  "0xe6aa6abeda5257bb9fda94cbd6583ff73bfc92f42edd2ace846ee45b3cf49f0f";
export const RESOLVER_KEY_HOLD_BY_PARTITION = "0x3bd50b70b7e42003cb9761c133e88d776c27b53729b463a2d5bf6b36a2fce367";
export const RESOLVER_KEY_INTEREST_RATE = "0xc09a5111a37fc8806e149b4a20c17a33a9487c6da8ee95f8a2b8ac31ea8dd2f3";
export const RESOLVER_KEY_CORE_ADJUSTED = "0xe190b52312c215f8e240bb53f0aa3e51e31b3005b7fcfb49c730ae523e675cfd";
export const RESOLVER_KEY_CORPORATE_ACTIONS = "0x4f091e1f288c10131ffc090469e611b913f1f54343e59e44405312d597897db2";
export const RESOLVER_KEY_COUPON = "0xe292dde7a8154c59d06fe2333acc2b54d003262aadc39ee2c7b474e6e64add6b";
export const RESOLVER_KEY_DIVIDEND = "0xfcc58d1d55d14a1359461bb9cef220b267b9846b01d61bd27d97f7c10c28b445";
export const RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS =
  "0x1478127ed7121d4c1f51d4844183242705cd85c8948b44acb7756ecf98830402";
export const RESOLVER_KEY_DOCUMENTATION = "0x3ab155fb7c96aefcaa7d730782cb640e5acf33c329d90a706843ae88a03cf1fb";
export const RESOLVER_KEY_FREEZE_AT_SNAPSHOT = "0x8ca462bf28ae4e7c5b77b86245cfff3caf7f6bdb6308a608cd9315feb2c28631";
export const RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION =
  "0xac8fcbc19e12e099f6c6cff54357e28a589b49673267c81a18a965da1c7f4744";
export const RESOLVER_KEY_LOCK = "0xc2e37f639e1d61db1015540583b9d71f8a33da6410aed2826c6caef1304ebd3a";
export const RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT =
  "0x90c7d769d18188f75b1092289e2465103d06f9c1195bf0ee4b2cf0844a5d6c96";
export const RESOLVER_KEY_SCHEDULED_TASKS = "0x53ea769a267213f8e35c975a0dba3d7d8d73163d53f804c2ac6ea37d6c47c082";
export const RESOLVER_KEY_TRANSFER_AND_LOCK = "0xe92a301947f21b973cb1007aeba48f2eecd916d05107b6355fc499b783b8f7d9";
export const RESOLVER_KEY_LOCK_AT_SNAPSHOT = "0x91e5d78963175418e7eb62ff74343d1349d9522d316525e922e145c770cc4d18";
export const RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION =
  "0x7740456ff352a04830411a3fdc359bd086a5d78fd7119bbb62a53c62c1911691";
export const RESOLVER_KEY_LOCK_BY_PARTITION = "0x75c5c6d6dd253e4be43d8d1c25a4252f5f54ebdba6f6c99ed34cd03c0e4d5360";
export const RESOLVER_KEY_MATURITY = "0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82";
export const RESOLVER_KEY_MATURITY_BY_PARTITION = "0x561e299af2bd67a767eee76558f27470801a9cb97627131141cc55ceb734ccbb";
export const RESOLVER_KEY_METADATA = "0x524fd484241fdce7c81d7872ddc2c45a3d44e664fcf855587839e9c68e481c9f";
export const RESOLVER_KEY_MINT_BY_PARTITION = "0x25ec74149ce0eadddeb82e668365e2e174db7431a04a80bada246f8f7887dadf";
export const RESOLVER_KEY_NONCES = "0xd1166cb96f266d69db4d4e49d81acaf5441b16bb11681f2b1b53dcf7e1bd3bf4";
export const RESOLVER_KEY_OPERATOR = "0x5c2062c6ba02b76ae0c3884d5c0fdd3416b2012195a964efaa34e09b1fa31c95";
export const RESOLVER_KEY_OPERATOR_BY_PARTITION = "0xfd060cda1c9927203f3914aa0d5916e4c5971977dec4026418bc4fff6d25b277";
export const RESOLVER_KEY_OPERATOR_HOLD_BY_PARTITION =
  "0x2ac9004b9c057e04ee677ec0dda4bf57f4de5a2d382d97b9557aafb2600f257f";
export const RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION =
  "0xaad3c9e6cb80e4d01b9e5f316a82f495c3d11d36f8d738b0c2e4bce2d3f6c01c";
export const RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION =
  "0xab5e4afdccea84152256072fb9f39bf08d591a7666557783209dff003658d945";
export const RESOLVER_KEY_PAUSE = "0x472ad8280a7d90bcd8b7876cad2cd5a4a2d31c116563ace7a685aff94eae8928";
export const RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION =
  "0x5b77b995d3e53c3e46f114bbf37642ce3169369548c8135b8b11f5cebd3fb07b";
export const RESOLVER_KEY_RECOVERY = "0x087cb866f812745e77608e4eb4b359ae96b8a0ba2ef9fe8336488e479b72d92a";
export const RESOLVER_KEY_SECURITY_HOLDERS_AT_SNAPSHOT =
  "0xf7707140407ccf0d6deaf72844217e3c1383270609a7a75e36def71a3c453b9e";
export const RESOLVER_KEY_SNAPSHOTS_BY_PARTITION = "0x37c825560f21710d66419d4eefeb45ae2dadf078b1db5593749d24a7d38465ee";
export const RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION =
  "0xb5ec128e8657ab00db44aa63e5aeded6689b18978072102b9ccb7788faf87a6e";
export const RESOLVER_KEY_PROCEED_RECIPIENTS = "0x63388aa198df5944c611b8fcbfd32945c57864f7125a5f95069040087d2b0bb7";
export const RESOLVER_KEY_PROTECTED_PARTITIONS = "0x895834530eae98f8a742fe98f3d528d3cce6c6a51af63b495414bdf391180dd7";
export const RESOLVER_KEY_COUPON_LISTING = "0x91e4a085c95cddedc7143dae7647c320f59b0f0214ed0f49ab95d7cedb4db176";
export const RESOLVER_KEY_COUPON_SECURITY_HOLDERS =
  "0x8e5fc42839ddbceddb6022f61f5907a3849178cce5cfb82850a28e80140ac9a9";
export const RESOLVER_KEY_TRANSFER = "0xdb0637d5ac2d3a8a460b63275e82a566d4b5ac4b9d2d2938f70c6612970a4b64";
export const RESOLVER_KEY_TRANSFER_BY_PARTITION = "0xfb16c0ead8e476dfd6f2201a386b6a761b76e01aa6e21786c2d90f10036197d9";
export const RESOLVER_KEY_VOTING = "0x88b1621426a5ad16c2399cdc8a04b7da54bf8ddf04c60aeb2fe17ad903891b58";
export const RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION =
  "0xf55083b17a9ba346028d6a5c0772a7d913e0e90b4954f7a8b8e1912dcd383cbd";
export const RESOLVER_KEY_CLEARING_AT_SNAPSHOT = "0xb65566db9291ca49b508408fe1ba503b28ea434b3f9bca05c3a0c4da031f9e86";
export const RESOLVER_KEY_CONTROL_LIST = "0x7bbee58c68b6e19a08128d25f150956d20a69d1cc049afda563753771781ecc5";
export const RESOLVER_KEY_IDENTITY = "0xbb0d93867bfe08218b429804914b1d345b2c899740c5dd110cb9c6141a01d36e";
export const RESOLVER_KEY_INITIALIZER = "0xe7caa2e00c841ed2a64c4c95e3981f3bfc29108599fad6e89b04f9483df0bf09";
export const RESOLVER_KEY_KYC = "0xf7fc316b28304fa0b62b8849c3c91a901e72894380ecf746c2bc13e5656549cd";
export const RESOLVER_KEY_SNAPSHOTS = "0xbc4e3ace00cf7d347ee7bf90737d3091c02f7d6607c195bf0d4b81e33644f0e1";
export const RESOLVER_KEY_LOAN = "0x17c2126e932655e91a8e803b275de0a930c4b51a109b751567a95ee5d6bd6eba";
export const RESOLVER_KEY_NOMINAL_VALUE = "0xfa54bc09a6a76763f17be0504e29b9c28edd15cdc3432c07f92c2b6962f2fbbe";
export const RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE =
  "0x0e3f0300490c976e8984dcc9a9d086f30a32e8112eea1fd40457bd63404feb42";
export const RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE =
  "0x93bfe3f155b9757d312214a75d3bcd8c8c84967e4a8cbaafdbdc40ea1ce2fd4c";
export const RESOLVER_KEY_BOND_VARIABLE_RATE = "0xbc8b53a2f8803b138aac441fbeb6b767a51b66a5f4d735c3d15af67cc72b9daa";
export const RESOLVER_KEY_BOND_VARIABLE_READ = "0xd9c3cc17a49d3ab289e489c0db3567f929bc463acd01dd1e37f8117aa48a1d74";
export const RESOLVER_KEY_EQUITY = "0x32d1b4f5d593b1e786f1c491656e2db7e35a80754244b3c5e787a03db7fcef31";
export const RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT =
  "0xca313777aee568dc14b1700e7be675b73932bbbc4e4f974a9f1321e6d653af74";
export const RESOLVER_KEY_PARTITIONS = "0x9caef059931effa6169ed564cfd0d8dac03be612be61f4fc934e8554cfe1c53f";
export const RESOLVER_KEY_PRINCIPAL = "0xa3dc20804ebd6f2a06a7e8b8de31712f3d18a73b1963acfa1d25ed86907bd0e6";
export const RESOLVER_KEY_PROTECTED_BY_PARTITION = "0x2f9cd983bc92f917e9c55a3f61b8984646d96980224f4712084967ea1d24d62f";
export const RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION =
  "0x3cbb73b8ee5db791f9534af7a5c9fc09a4cf9adff327a05839f2673a3dc63aae";
export const RESOLVER_KEY_PROTECTED_CLEARING_HOLD_BY_PARTITION =
  "0xc28474cfcf6b32464e9000d064b91827c6c37fd3e06dae932c9447c204c35cc1";
export const RESOLVER_KEY_SECURITYHOLDERS = "0x744edd4f33c7d5e322286e40155d549553e22329ac9503643bf36fc149504bc9";
export const RESOLVER_KEY_SSI_MANAGEMENT = "0xba7dfd151d5ed77cbbf8b00c124c67331edf1e6959e7c0129dc73ee72a9c0016";
export const RESOLVER_KEY_VOTING_SECURITY_HOLDERS =
  "0xff4e971334f234a2d839b58b2fef84241254942cef8940a4457d1eecb63882b9";
export const RESOLVER_KEY_ERC20PERMIT = "0xb9b450cd33d22a14f4cc67bea5d1afefac1f0e7c5230fce1b942f751c37a9e6d";

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
