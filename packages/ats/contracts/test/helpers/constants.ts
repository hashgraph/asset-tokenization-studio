// SPDX-License-Identifier: Apache-2.0

import { join } from "path";
import { getTestCheckpointsDir, getTestDeploymentsDir } from "@scripts/infrastructure";

/**
 * Test-specific constants for all tests (unit, integration, contracts, scripts).
 *
 * These constants provide semantic meaning to values used in tests,
 * making test intent clearer and reducing magic strings/numbers.
 *
 * ## Organization
 *
 * Constants are grouped into logical categories:
 *
 * 1. **CORE BLOCKCHAIN IDENTIFIERS** - Addresses, networks, tx hashes, config IDs
 * 2. **DEPLOYMENT & WORKFLOW** - Workflows, checkpoints, timestamps, directories
 * 3. **CONTRACT & FACET NAMES** - Standard contracts, time travel variants, facet names
 * 4. **NUMERIC CONSTANTS** - Sizes, versions, time values, test values
 * 5. **VALIDATION DATA** - Invalid/valid inputs for validation tests
 * 6. **LOGGING & UTILITIES** - Logger prefixes, non-existent values
 *
 * Usage in tests:
 * ```typescript
 * import { TEST_ADDRESSES, TEST_NETWORKS } from "@test";
 *
 * const deployer = TEST_ADDRESSES.VALID_0;  // Assign local semantic meaning
 * const network = TEST_NETWORKS.TESTNET;
 * ```
 *
 * @module test/helpers/constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 1: CORE BLOCKCHAIN IDENTIFIERS                                   ║
// ║                                                                           ║
// ║  Addresses, networks, transaction hashes, configuration IDs               ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Addresses
// ============================================================================

/**
 * Generic test addresses for use across all tests.
 *
 * Use these with local semantic aliases in each test for clarity:
 * ```typescript
 * const deployer = TEST_ADDRESSES.VALID_0;
 * const admin = TEST_ADDRESSES.VALID_1;
 * ```
 */
export const TEST_ADDRESSES = {
  /** First valid test address */
  VALID_0: "0x1234567890123456789012345678901234567890",

  /** Second valid test address */
  VALID_1: "0xabcdef0123456789012345678901234567890123",

  /** Third valid test address */
  VALID_2: "0x1111111111111111111111111111111111111111",

  /** Fourth valid test address */
  VALID_3: "0x2222222222222222222222222222222222222222",

  /** Fifth valid test address */
  VALID_4: "0x3333333333333333333333333333333333333333",

  /** Sixth valid test address */
  VALID_5: "0x4444444444444444444444444444444444444444",

  /** Seventh valid test address */
  VALID_6: "0x5555555555555555555555555555555555555555",

  /** Zero/null address */
  ZERO: "0x0000000000000000000000000000000000000000",

  /** Invalid format address (for validation tests) */
  INVALID: "0xinvalid",

  /** Address without deployed code (for code existence tests) */
  NO_CODE: "0xfedcba9876543210987654321098765432109876",

  /** Alternative non-existent address (for ProxyAdmin tests) */
  NO_CODE_ALT: "0x2234567890123456789012345678901234567890",
} as const;

// ============================================================================
// Networks
// ============================================================================

/**
 * Network identifiers used in tests.
 *
 * Includes both full identifiers and short aliases.
 */
export const TEST_NETWORKS = {
  // Hedera networks (full identifiers)
  /** Hedera testnet network identifier */
  TESTNET: "hedera-testnet",

  /** Hedera mainnet network identifier */
  MAINNET: "hedera-mainnet",

  /** Hedera previewnet network identifier */
  PREVIEWNET: "hedera-previewnet",

  /** Hedera local network identifier */
  HEDERA_LOCAL: "hedera-local",

  // Local development networks
  /** Hardhat local network identifier */
  HARDHAT: "hardhat",

  /** Local network identifier */
  LOCAL: "local",

  /** Localhost network identifier */
  LOCALHOST: "localhost",

  // Short aliases (without hedera- prefix)
  /** Testnet short alias */
  TESTNET_SHORT: "testnet",

  /** Mainnet short alias */
  MAINNET_SHORT: "mainnet",

  /** Previewnet short alias */
  PREVIEWNET_SHORT: "previewnet",

  // Non-Hedera networks (for multi-chain tests)
  /** Ethereum mainnet */
  ETHEREUM_MAINNET: "ethereum-mainnet",

  /** Polygon network */
  POLYGON: "polygon",

  /** Arbitrum network */
  ARBITRUM: "arbitrum",
} as const;

// ============================================================================
// Transaction Hashes
// ============================================================================

/**
 * Sample transaction hashes for tests.
 * All values are valid tx hash format (0x + 64 hex characters).
 */
export const TEST_TX_HASHES = {
  /** First sample tx hash */
  SAMPLE_0: "0xabc1230000000000000000000000000000000000000000000000000000000000",

  /** Second sample tx hash */
  SAMPLE_1: "0xdef4560000000000000000000000000000000000000000000000000000000000",

  /** Third sample tx hash */
  SAMPLE_2: "0x1234567890000000000000000000000000000000000000000000000000000000",

  /** Fourth sample tx hash */
  SAMPLE_3: "0xabcdef0120000000000000000000000000000000000000000000000000000000",

  /** Fifth sample tx hash */
  SAMPLE_4: "0x3456789000000000000000000000000000000000000000000000000000000000",

  /** Sixth sample tx hash */
  SAMPLE_5: "0x6789012300000000000000000000000000000000000000000000000000000000",

  /** Seventh sample tx hash */
  SAMPLE_6: "0xabc7890000000000000000000000000000000000000000000000000000000000",

  /** Eighth sample tx hash */
  SAMPLE_7: "0xdef1230000000000000000000000000000000000000000000000000000000000",

  /** Ninth sample tx hash */
  SAMPLE_8: "0x9012345600000000000000000000000000000000000000000000000000000000",
} as const;

// ============================================================================
// Configuration IDs (bytes32)
// ============================================================================

/**
 * Configuration ID constants (bytes32 format).
 *
 * Used by BusinessLogicResolver to identify facet configurations.
 */
export const TEST_CONFIG_IDS = {
  // Standard configuration IDs
  /** Equity configuration ID */
  EQUITY: "0x0000000000000000000000000000000000000000000000000000000000000001",

  /** Bond configuration ID */
  BOND: "0x0000000000000000000000000000000000000000000000000000000000000002",

  /** Bond Fixed Rate configuration ID */
  BOND_FIXED_RATE: "0x0000000000000000000000000000000000000000000000000000000000000003",

  /** Bond KPI Linked Rate configuration ID */
  BOND_KPI_LINKED: "0x0000000000000000000000000000000000000000000000000000000000000004",

  /** Bond Sustainability Performance Target Rate configuration ID */
  BOND_SPT: "0x0000000000000000000000000000000000000000000000000000000000000005",

  // Alternative IDs for testing config updates
  /** Alternative configuration ID (for testing config updates) */
  ALTERNATIVE: "0x00000000000000000000000000000000000000000000000000000000000000bb",

  /** Alternative config ID 2 (for resolver update tests) */
  ALTERNATIVE_2: "0x00000000000000000000000000000000000000000000000000000000000000cc",
} as const;

// ============================================================================
// Hedera Contract IDs
// ============================================================================

/**
 * Sample Hedera contract IDs for tests.
 *
 * Format: shard.realm.num (e.g., "0.0.1234")
 */
export const TEST_CONTRACT_IDS = {
  /** First sample contract ID */
  SAMPLE_0: "0.0.1111",

  /** Second sample contract ID */
  SAMPLE_1: "0.0.2221",

  /** Third sample contract ID */
  SAMPLE_2: "0.0.2222",

  /** Fourth sample contract ID */
  SAMPLE_3: "0.0.3333",

  /** Fifth sample contract ID */
  SAMPLE_4: "0.0.4444",

  /** Sixth sample contract ID */
  SAMPLE_5: "0.0.5554",

  /** Seventh sample contract ID */
  SAMPLE_6: "0.0.5555",
} as const;

// ============================================================================
// Bytes32 Values
// ============================================================================

/**
 * Valid and invalid bytes32 values for validation tests.
 */
export const TEST_BYTES32 = {
  // Valid values
  /** All zeros bytes32 */
  ALL_ZEROS: "0x" + "0".repeat(64),

  /** All f's bytes32 */
  ALL_FS: "0x" + "f".repeat(64),

  // Invalid values
  /** Too short bytes32 */
  TOO_SHORT: "0x1234",

  /** Too long bytes32 */
  TOO_LONG: "0x" + "0".repeat(65),

  /** Without 0x prefix */
  NO_PREFIX: "0".repeat(64),

  /** Non-hex characters */
  NON_HEX: "0x" + "g".repeat(64),
} as const;

// ============================================================================
// Resolver Keys
// ============================================================================

/**
 * Mock resolver key values for registry combination tests.
 * All values are valid bytes32 format (0x + 64 hex characters).
 */
export const TEST_RESOLVER_KEYS = {
  /** First mock resolver key */
  KEY_1: "0x0000000000000000000000000000000000000000000000000000000000000111",

  /** Second mock resolver key */
  KEY_2: "0x0000000000000000000000000000000000000000000000000000000000000222",

  /** Third mock resolver key */
  KEY_3: "0x0000000000000000000000000000000000000000000000000000000000000333",

  /** Fourth mock resolver key */
  KEY_4: "0x0000000000000000000000000000000000000000000000000000000000000444",

  /** Sample resolver key */
  SAMPLE: "0x0000000000000000000000000000000000000000000000000000000000000123",

  /** ABC resolver key */
  ABC: "0x0000000000000000000000000000000000000000000000000000000000000abc",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 2: DEPLOYMENT & WORKFLOW                                         ║
// ║                                                                           ║
// ║  Workflows, checkpoints, timestamps, steps, directories                   ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Workflows
// ============================================================================

/**
 * Workflow type identifiers used in checkpoint tests.
 */
export const TEST_WORKFLOWS = {
  /** Deploy new BLR and full infrastructure */
  NEW_BLR: "newBlr",

  /** Deploy with existing BLR */
  EXISTING_BLR: "existingBlr",

  /** Upgrade BLR configurations only */
  UPGRADE_CONFIGS: "upgradeConfigurations",

  /** Upgrade TUP (Transparent Upgradeable Proxy) contracts */
  UPGRADE_TUP: "upgradeTupProxies",
} as const;

// ============================================================================
// Checkpoint Status
// ============================================================================

/**
 * Checkpoint status values.
 */
export const TEST_CHECKPOINT_STATUS = {
  /** Deployment in progress */
  IN_PROGRESS: "in-progress",

  /** Deployment completed successfully */
  COMPLETED: "completed",

  /** Deployment failed */
  FAILED: "failed",
} as const;

// ============================================================================
// Timestamps
// ============================================================================

/**
 * Sample timestamps for tests.
 *
 * Includes both ISO format and filename-safe format.
 */
export const TEST_TIMESTAMPS = {
  // Standard samples
  /** ISO format sample timestamp */
  ISO_SAMPLE: "2025-11-08T10:00:00.000Z",

  /** Filename-safe format sample timestamp (with milliseconds) */
  FILENAME_SAMPLE: "2025-11-08T10-00-00-000",

  // Time progression samples
  /** Alternative ISO sample (5 min later - for lastUpdate) */
  ISO_SAMPLE_5MIN_LATER: "2025-11-08T10:05:00.000Z",

  /** Alternative ISO sample (15 min later) */
  ISO_SAMPLE_LATER: "2025-11-08T10:15:00.000Z",

  // Special format samples
  /** ISO timestamp with subseconds for formatTimestamp tests */
  ISO_WITH_MILLIS: "2025-11-08T10:30:45.123Z",

  // Boundary samples
  /** ISO timestamp for year start */
  YEAR_START: "2025-01-01T00:00:00.000Z",

  /** ISO timestamp for year end */
  YEAR_END: "2025-12-31T23:59:59.999Z",
} as const;

/**
 * Expected formatted timestamp outputs.
 *
 * Paired with TEST_TIMESTAMPS for formatting tests.
 */
export const TEST_FORMATTED_TIMESTAMPS = {
  /** Formatted output for ISO_SAMPLE */
  ISO_SAMPLE: "2025-11-08 10:00:00",

  /** Formatted output for ISO_WITH_MILLIS */
  WITH_MILLIS: "2025-11-08 10:30:45",

  /** Formatted output for YEAR_START */
  YEAR_START: "2025-01-01 00:00:00",

  /** Formatted output for YEAR_END */
  YEAR_END: "2025-12-31 23:59:59",
} as const;

// ============================================================================
// Checkpoint Steps
// ============================================================================

/**
 * Checkpoint step numbers for newBlr workflow.
 */
export const TEST_STEPS_NEW_BLR = {
  PROXY_ADMIN: 0,
  BLR: 1,
  FACETS: 2,
  REGISTER_FACETS: 3,
  EQUITY_CONFIG: 4,
  BOND_CONFIG: 5,
  BOND_FIXED_RATE_CONFIG: 6,
  BOND_KPI_LINKED_CONFIG: 7,
  BOND_SPT_CONFIG: 8,
  FACTORY: 9,
} as const;

/**
 * Checkpoint step numbers for existingBlr workflow.
 */
export const TEST_STEPS_EXISTING_BLR = {
  PROXY_ADMIN_OPTIONAL: 0,
  FACETS: 1,
  REGISTER_FACETS: 2,
  EQUITY_CONFIG: 3,
  BOND_CONFIG: 4,
  BOND_FIXED_RATE_CONFIG: 5,
  BOND_KPI_LINKED_CONFIG: 6,
  BOND_SPT_CONFIG: 7,
  FACTORY: 8,
} as const;

// ============================================================================
// Test Directories
// ============================================================================

/**
 * Test directory paths.
 *
 * Uses centralized path helpers from `@scripts/infrastructure` to avoid
 * fragile `__dirname` + relative traversal patterns.
 */
export const TEST_DIRS = {
  /** Unit test checkpoint directory */
  UNIT_CHECKPOINTS: join(getTestDeploymentsDir(), "unit/.checkpoints"),

  /** Integration test checkpoint directory */
  INTEGRATION_CHECKPOINTS: getTestCheckpointsDir("hardhat"),

  /** Test deployments base directory */
  DEPLOYMENTS: getTestDeploymentsDir(),
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 3: CONTRACT & FACET NAMES                                        ║
// ║                                                                           ║
// ║  Standard contracts, time travel variants, facet names                    ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Standard Contract Names
// ============================================================================

/**
 * Standard contract names for naming utility tests.
 * These are actual ATS contract names used to test naming functions.
 */
export const TEST_STANDARD_CONTRACTS = {
  // Facets
  /** Access control facet */
  ACCESS_CONTROL_FACET: "AccessControlFacet",

  /** Pause facet */
  PAUSE_FACET: "PauseFacet",

  /** KYC facet */
  KYC_FACET: "KycFacet",

  /** CapTable facet */
  CAP_TABLE_FACET: "CapTableFacet",

  /** TimeTravel facet (invariant - no TimeTravel variant) */
  TIME_TRAVEL_FACET: "TimeTravelFacet",

  /** Pausable facet (for CheckpointManager tests) */
  PAUSABLE_FACET: "PausableFacet",

  // Infrastructure contracts
  /** ProxyAdmin infrastructure contract */
  PROXY_ADMIN: "ProxyAdmin",

  /** TransparentUpgradeableProxy */
  TRANSPARENT_PROXY: "TransparentUpgradeableProxy",

  /** BusinessLogicResolver */
  BLR: "BusinessLogicResolver",

  // Edge cases for naming tests
  /** FacetRegistry (doesn't end with "Facet") */
  FACET_REGISTRY: "FacetRegistry",

  /** MyFacetContract (has Facet in middle, not at end) */
  MY_FACET_CONTRACT: "MyFacetContract",
} as const;

// ============================================================================
// Generic Facet Names (for mock tests)
// ============================================================================

/**
 * Generic facet names for mock registry tests.
 */
export const TEST_FACET_NAMES = {
  /** First test facet */
  FACET_A: "FacetA",

  /** Second test facet */
  FACET_B: "FacetB",

  /** Third test facet */
  FACET_C: "FacetC",

  /** Fourth test facet */
  FACET_D: "FacetD",

  /** Generic test facet */
  TEST: "TestFacet",

  /** Duplicate facet for conflict tests */
  DUPLICATE: "DuplicateFacet",

  /** Non-existent facet for negative tests */
  NON_EXISTENT: "NonExistent",
} as const;

// ============================================================================
// Contract Names (for deployment tests)
// ============================================================================

/**
 * Contract names for deployment tests.
 */
export const TEST_CONTRACT_NAMES = {
  /** Factory contract */
  FACTORY: "Factory",

  /** ProxyAdmin contract */
  PROXY_ADMIN: "ProxyAdmin",

  /** BusinessLogicResolver contract */
  BLR: "BusinessLogicResolver",

  /** Non-existent contract for negative tests */
  NON_EXISTENT: "NonExistentContract",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 4: NUMERIC CONSTANTS                                             ║
// ║                                                                           ║
// ║  Sizes, versions, time values, test values, numbers, durations            ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Array/Batch Sizes
// ============================================================================

/**
 * Common test array sizes for facet operations.
 *
 * These represent typical batch sizes used across integration tests
 * for deploying, registering, and configuring facets.
 */
export const TEST_SIZES = {
  /** Single facet operation */
  SINGLE: 1,

  /** Two facets (dual/pair) */
  DUAL: 2,

  /** Three facets (triple) */
  TRIPLE: 3,

  /** Small batch (5 facets) */
  SMALL_BATCH: 5,

  /** Medium batch (10 facets) */
  MEDIUM_BATCH: 10,

  /** Large batch (12 facets) */
  LARGE_BATCH: 12,
} as const;

// ============================================================================
// BLR Versions
// ============================================================================

/**
 * BLR (Business Logic Resolver) version constants.
 *
 * Used for testing version increments when registering facets.
 */
export const BLR_VERSIONS = {
  /** Initial version after deployment */
  INITIAL: 0,

  /** First version after registering facets */
  FIRST: 1,

  /** Second version after subsequent registration */
  SECOND: 2,
} as const;

// ============================================================================
// Time Constants
// ============================================================================

/**
 * Time-related test constants.
 */
export const TEST_TIME = {
  /** Days to use for old checkpoint cleanup tests */
  OLD_CHECKPOINT_DAYS: 40,

  /** Standard cleanup threshold in days */
  CLEANUP_THRESHOLD_DAYS: 30,

  /** Milliseconds in a day */
  MS_PER_DAY: 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// Test Values
// ============================================================================

/**
 * Test-specific values for initialization and state tests.
 */
export const TEST_VALUES = {
  /** Value used to test V2 contract initialization */
  INIT_VALUE: 42,
} as const;

// ============================================================================
// Numeric Values
// ============================================================================

/**
 * Numeric values for number validation tests.
 */
export const TEST_NUMBERS = {
  // Zero and positive integers
  /** Zero */
  ZERO: 0,

  /** Positive integer */
  POSITIVE_INT: 1,

  /** Large positive integer */
  LARGE_POSITIVE_INT: 100,

  // Negative integers
  /** Negative integer */
  NEGATIVE_INT: -1,

  // Decimals
  /** Positive decimal */
  POSITIVE_DECIMAL: 0.1,

  /** Larger positive decimal */
  POSITIVE_DECIMAL_LARGE: 1.5,

  /** Negative decimal */
  NEGATIVE_DECIMAL: -0.5,

  // Boundaries
  /** Max safe integer */
  MAX_SAFE_INT: Number.MAX_SAFE_INTEGER,

  /** Min value (smallest positive) */
  MIN_VALUE: Number.MIN_VALUE,
} as const;

// ============================================================================
// Durations
// ============================================================================

/**
 * Duration values in milliseconds for formatDuration tests.
 */
export const TEST_DURATIONS_MS = {
  /** Zero duration */
  ZERO: 0,

  /** 5 seconds */
  FIVE_SECONDS: 5000,

  /** 30 seconds */
  THIRTY_SECONDS: 30000,

  /** 1 minute exactly */
  ONE_MINUTE: 60000,

  /** 1 minute 5 seconds */
  ONE_MINUTE_FIVE_SECONDS: 65000,

  /** 2 minutes 5 seconds */
  TWO_MINUTES_FIVE_SECONDS: 125000,

  /** 1 hour 1 minute 1 second */
  ONE_HOUR_ONE_MIN_ONE_SEC: 3661000,

  /** 1 hour 2 minutes 5 seconds */
  ONE_HOUR_TWO_MIN_FIVE_SEC: 3725000,

  /** 2 hours exactly */
  TWO_HOURS: 7200000,
} as const;

/**
 * Expected formatted duration outputs.
 *
 * Paired with TEST_DURATIONS_MS for formatting tests.
 */
export const TEST_DURATION_OUTPUTS = {
  ZERO: "0s",
  FIVE_SECONDS: "5s",
  THIRTY_SECONDS: "30s",
  ONE_MINUTE: "1m 0s",
  ONE_MINUTE_FIVE_SECONDS: "1m 5s",
  TWO_MINUTES_FIVE_SECONDS: "2m 5s",
  ONE_HOUR_ONE_MIN_ONE_SEC: "1h 1m 1s",
  ONE_HOUR_TWO_MIN_FIVE_SEC: "1h 2m 5s",
  TWO_HOURS: "2h 0m 0s",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 5: VALIDATION DATA                                               ║
// ║                                                                           ║
// ║  Invalid inputs, valid values for validation tests                        ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Invalid Inputs
// ============================================================================

/**
 * Invalid input values for validation tests.
 */
export const TEST_INVALID_INPUTS = {
  /** Empty string */
  EMPTY: "",

  /** Whitespace only string */
  WHITESPACE: "   ",

  /** String with leading whitespace */
  LEADING_WHITESPACE: " value",

  /** String with trailing whitespace */
  TRAILING_WHITESPACE: "value ",

  /** Non-hex characters */
  NON_HEX_CHARS: "gggg",

  /** Invalid format string */
  INVALID_FORMAT: "invalid",
} as const;

// ============================================================================
// Invalid Contract IDs
// ============================================================================

/**
 * Contract ID values for validation tests.
 */
export const TEST_INVALID_CONTRACT_IDS = {
  /** Missing parts */
  MISSING_PARTS: "0.0",

  /** Single number */
  SINGLE_NUMBER: "12345",

  /** Too many parts */
  TOO_MANY_PARTS: "0.0.0.12345",

  /** Non-numeric parts */
  NON_NUMERIC: "0.0.abc",

  /** All non-numeric */
  ALL_NON_NUMERIC: "a.b.c",

  /** Negative number */
  NEGATIVE: "0.0.-1",

  /** Leading zeros in parts */
  LEADING_ZEROS: "0.0.01",
} as const;

// ============================================================================
// Valid Values
// ============================================================================

/**
 * Valid test values for validation (non-duplicate values only).
 * Note: For network names, use TEST_NETWORKS constant.
 */
export const TEST_VALID_VALUES = {
  // Facet names
  /** Simple facet name */
  FACET_NAME: "AccessControlFacet",

  /** Short facet name */
  FACET_NAME_SHORT: "Facet",

  // Contract IDs
  /** Contract ID with non-zero shard/realm */
  CONTRACT_ID_FULL: "1.2.12345",

  /** Large contract number */
  CONTRACT_ID_LARGE: "0.0.999999999",

  /** Mainnet contract ID */
  CONTRACT_ID_MAINNET: "0.0.1",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 6: LOGGING & UTILITIES                                           ║
// ║                                                                           ║
// ║  Logger prefixes, non-existent values for negative tests                  ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Logger Prefixes
// ============================================================================

/**
 * Logger prefix values for logging tests.
 */
export const TEST_LOGGER_PREFIXES = {
  /** Module prefix */
  MODULE: "TestModule",

  /** Deployment prefix */
  DEPLOYMENT: "Deployment",

  /** Generic prefix */
  SOME: "SomePrefix",

  /** Test prefix */
  TEST: "Test",
} as const;

// ============================================================================
// Non-Existent Values
// ============================================================================

/**
 * Non-existent/invalid values for negative tests.
 */
export const TEST_NON_EXISTENT = {
  /** Non-existent network */
  NETWORK: "non-existent-network",

  /** Non-existent network with unique ID */
  NETWORK_UNIQUE: "non-existent-network-12345",

  /** Non-existent contract */
  CONTRACT: "NonExistentContract",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 7: FACTORY DEPLOYMENT DATA                                       ║
// ║                                                                           ║
// ║  Token metadata, regulation data, factory events                          ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// Token Metadata
// ============================================================================

/**
 * Mock token metadata for factory tests.
 */
export const TEST_TOKEN_METADATA = {
  /** Sample token name */
  NAME: "Test Token",

  /** Sample token symbol */
  SYMBOL: "TEST",

  /** Sample ISIN */
  ISIN: "US0000000000",

  /** Standard decimals */
  DECIMALS: 18,

  /** Sample currency (bytes3 format for USD) */
  CURRENCY: "0x555344",

  /** Alternative token name */
  NAME_ALT: "Alternative Token",

  /** Alternative token symbol */
  SYMBOL_ALT: "ALT",
} as const;

// ============================================================================
// Nominal Values
// ============================================================================

/**
 * Mock nominal values for token tests.
 */
export const TEST_NOMINAL_VALUES = {
  /** Standard nominal value (1 with 18 decimals) */
  STANDARD: "1000000000000000000",

  /** Nominal value decimals */
  DECIMALS: 18,

  /** Max supply for tokens */
  MAX_SUPPLY: "1000000000000000000000000",
} as const;

// ============================================================================
// Regulation Data
// ============================================================================

/**
 * Mock regulation data for factory tests.
 */
export const TEST_REGULATION = {
  /** Regulation S type */
  TYPE_REG_S: 1,

  /** No sub-type */
  SUBTYPE_NONE: 0,

  /** Countries whitelist flag */
  COUNTRIES_WHITELIST: true,

  /** Sample countries string */
  COUNTRIES: "US,GB,DE",

  /** Sample info */
  INFO: "Test regulation info",

  /** Regulation D type */
  TYPE_REG_D: 2,

  /** Regulation D 506(b) sub-type */
  SUBTYPE_REG_D_506_B: 1,
} as const;

// ============================================================================
// Factory Events
// ============================================================================

/**
 * Factory event names for transaction receipts.
 */
export const TEST_FACTORY_EVENTS = {
  /** Equity deployed event */
  EQUITY_DEPLOYED: "EquityDeployed",

  /** Bond deployed event */
  BOND_DEPLOYED: "BondDeployed",

  /** Bond Fixed Rate deployed event */
  BOND_FIXED_RATE_DEPLOYED: "BondFixedRateDeployed",

  /** Bond KPI Linked Rate deployed event */
  BOND_KPI_LINKED_RATE_DEPLOYED: "BondKpiLinkedRateDeployed",

  /** Bond SPT deployed event */
  BOND_SPT_DEPLOYED: "BondSustainabilityPerformanceTargetRateDeployed",

  /** Unknown event (for negative tests) */
  UNKNOWN: "UnknownEvent",
} as const;

// ============================================================================
// Interest Rate Parameters
// ============================================================================

/**
 * Mock interest rate parameters for bond variant tests.
 */
export const TEST_INTEREST_RATES = {
  /** Fixed rate (5% with 2 decimals = 500) */
  FIXED_RATE: 500,

  /** Fixed rate decimals */
  FIXED_RATE_DECIMALS: 2,

  /** Base rate for KPI bonds */
  BASE_RATE: 300,

  /** Max rate for KPI bonds */
  MAX_RATE: 700,

  /** Min rate for KPI bonds */
  MIN_RATE: 100,

  /** Start period timestamp */
  START_PERIOD: 1700000000,

  /** Start rate */
  START_RATE: 400,

  /** Missed penalty rate */
  MISSED_PENALTY: 50,

  /** Report period (30 days in seconds) */
  REPORT_PERIOD: 2592000,

  /** Rate decimals */
  RATE_DECIMALS: 2,
} as const;

// ============================================================================
// Impact Data Parameters
// ============================================================================

/**
 * Mock impact data parameters for KPI/SPT bond tests.
 */
export const TEST_IMPACT_DATA = {
  /** Max deviation cap */
  MAX_DEVIATION_CAP: 1000,

  /** Baseline value */
  BASELINE: 500,

  /** Max deviation floor */
  MAX_DEVIATION_FLOOR: 200,

  /** Impact data decimals */
  DECIMALS: 2,

  /** Adjustment precision */
  ADJUSTMENT_PRECISION: 100,

  /** Baseline mode */
  BASELINE_MODE: 0,

  /** Delta rate */
  DELTA_RATE: 50,

  /** Impact data mode */
  IMPACT_DATA_MODE: 1,
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                           ║
// ║  SECTION 8: PROXY UPGRADE CONSTANTS                                       ║
// ║                                                                           ║
// ║  EIP-1967 slots, gas limits, initialization values for proxy tests        ║
// ║                                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// EIP-1967 Storage Slots
// ============================================================================

/**
 * EIP-1967 standard storage slots for proxy contracts.
 *
 * These slots are used by TransparentUpgradeableProxy and similar proxies
 * to store admin and implementation addresses.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1967
 */
export const EIP1967_SLOTS = {
  /** Admin slot: keccak256("eip1967.proxy.admin") - 1 */
  ADMIN: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",

  /** Implementation slot: keccak256("eip1967.proxy.implementation") - 1 */
  IMPLEMENTATION: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
} as const;

// ============================================================================
// Gas Limits for Proxy Upgrade Tests
// ============================================================================

/**
 * Gas limit constants for proxy upgrade operations.
 *
 * Used to verify gas usage stays within reasonable bounds.
 */
export const TEST_GAS_LIMITS = {
  /** Gas limit for basic upgrade() call */
  UPGRADE: 200_000,

  /** Gas limit for upgradeAndCall() (includes initialization) */
  UPGRADE_AND_CALL: 300_000,

  /** Gas limit for facet deployment */
  FACET_DEPLOY: 5_000_000,
} as const;

// ============================================================================
// Test Initialization Values
// ============================================================================

/**
 * Initialization values for proxy upgrade tests.
 *
 * Used in upgradeAndCall scenarios to verify initialization data is executed.
 */
export const TEST_INIT_VALUES = {
  /** Basic test value (same as TEST_VALUES.INIT_VALUE) */
  BASIC: 42,

  /** Value for upgrade with init tests */
  UPGRADE: 123,

  /** Value for state verification tests */
  STATE_VERIFY: 999,
} as const;

// ============================================================================
// Test Timing Constants
// ============================================================================

/**
 * Timing delay constants for async test operations.
 *
 * Used with `sleep()` or `setTimeout()` in tests that require short waits
 * for filesystem I/O, timestamp differentiation, or async operation completion.
 */
export const TEST_DELAYS = {
  /** Short delay for async operations (5ms) - e.g., ensuring unique timestamps */
  SHORT: 5,

  /** Medium delay for filesystem operations (10ms) - e.g., file write completion */
  MEDIUM: 10,
} as const;

// ============================================================================
// Test Options
// ============================================================================

/**
 * Common test configuration options.
 *
 * Provides named constants for frequently-used test configuration values
 * with documentation explaining their purpose and when to use them.
 */
export const TEST_OPTIONS = {
  /**
   * Confirmations for instant-mining networks (0 = no wait).
   *
   * Transactions on Hardhat, Anvil, and other local test networks are mined
   * immediately, so no confirmation wait is needed. Using 0 prevents tests
   * from hanging while waiting for confirmations.
   *
   * @example
   * await upgradeProxy(proxyAdmin, {
   *   proxyAddress,
   *   newImplementationAddress,
   *   confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
   * });
   */
  CONFIRMATIONS_INSTANT: 0,
} as const;
