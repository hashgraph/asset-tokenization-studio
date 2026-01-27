// SPDX-License-Identifier: Apache-2.0

import { join } from "path";

/**
 * Test-specific constants for all tests (unit, integration, contracts, scripts).
 *
 * These constants provide semantic meaning to values used in tests,
 * making test intent clearer and reducing magic strings/numbers.
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
} as const;

// ============================================================================
// Networks
// ============================================================================

/**
 * Network identifiers used in tests.
 */
export const TEST_NETWORKS = {
  /** Hedera testnet network identifier */
  TESTNET: "hedera-testnet",

  /** Hedera mainnet network identifier */
  MAINNET: "hedera-mainnet",

  /** Hedera previewnet network identifier */
  PREVIEWNET: "hedera-previewnet",

  /** Hedera local network identifier */
  HEDERA_LOCAL: "hedera-local",

  /** Hardhat local network identifier */
  HARDHAT: "hardhat",

  /** Local network identifier */
  LOCAL: "local",

  /** Localhost network identifier */
  LOCALHOST: "localhost",

  /** Testnet short alias (without hedera- prefix) */
  TESTNET_SHORT: "testnet",

  /** Mainnet short alias (without hedera- prefix) */
  MAINNET_SHORT: "mainnet",

  /** Previewnet short alias (without hedera- prefix) */
  PREVIEWNET_SHORT: "previewnet",

  /** Ethereum mainnet (for non-Hedera network tests) */
  ETHEREUM_MAINNET: "ethereum-mainnet",

  /** Polygon network (for non-Hedera network tests) */
  POLYGON: "polygon",

  /** Arbitrum network (for non-Hedera network tests) */
  ARBITRUM: "arbitrum",
} as const;

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
 */
export const TEST_TIMESTAMPS = {
  /** ISO format sample timestamp */
  ISO_SAMPLE: "2025-11-08T10:00:00.000Z",

  /** Filename-safe format sample timestamp */
  FILENAME_SAMPLE: "2025-11-08T10-00-00",

  /** Alternative ISO sample (5 min later - for lastUpdate) */
  ISO_SAMPLE_5MIN_LATER: "2025-11-08T10:05:00.000Z",

  /** Alternative ISO sample (15 min later) */
  ISO_SAMPLE_LATER: "2025-11-08T10:15:00.000Z",

  /** ISO timestamp with subseconds for formatTimestamp tests */
  ISO_WITH_MILLIS: "2025-11-08T10:30:45.123Z",

  /** ISO timestamp for year start */
  YEAR_START: "2025-01-01T00:00:00.000Z",

  /** ISO timestamp for year end */
  YEAR_END: "2025-12-31T23:59:59.999Z",
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
// Configuration IDs
// ============================================================================

/**
 * Configuration ID constants (bytes32 format).
 */
export const TEST_CONFIG_IDS = {
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
} as const;

// ============================================================================
// Hedera Contract IDs
// ============================================================================

/**
 * Sample Hedera contract IDs for tests.
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
// Test Directories
// ============================================================================

/**
 * Test directory paths.
 *
 * Note: Paths are relative to build output directory structure.
 */
export const TEST_DIRS = {
  /** Unit test checkpoint directory */
  UNIT_CHECKPOINTS: join(__dirname, "../../../deployments/test/unit/.checkpoints"),

  /** Integration test checkpoint directory */
  INTEGRATION_CHECKPOINTS: join(__dirname, "../../../deployments/test/hardhat/.checkpoints"),

  /** Test deployments base directory */
  DEPLOYMENTS: join(__dirname, "../../../deployments/test"),
} as const;

// ============================================================================
// Numeric Constants
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
  FACTORY: 8,
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
  FACTORY: 7,
} as const;

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
// Validation Test Constants
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

/**
 * Valid bytes32 values for validation tests.
 */
export const TEST_BYTES32 = {
  /** All zeros bytes32 */
  ALL_ZEROS: "0x" + "0".repeat(64),

  /** All f's bytes32 */
  ALL_FS: "0x" + "f".repeat(64),

  /** Too short bytes32 */
  TOO_SHORT: "0x1234",

  /** Too long bytes32 */
  TOO_LONG: "0x" + "0".repeat(65),

  /** Without 0x prefix */
  NO_PREFIX: "0".repeat(64),

  /** Non-hex characters */
  NON_HEX: "0x" + "g".repeat(64),
} as const;

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

/**
 * Valid test values for validation (non-duplicate values only).
 * Note: For network names, use TEST_NETWORKS constant.
 */
export const TEST_VALID_VALUES = {
  /** Simple facet name */
  FACET_NAME: "AccessControlFacet",

  /** Short facet name */
  FACET_NAME_SHORT: "Facet",

  /** Contract ID with non-zero shard/realm */
  CONTRACT_ID_FULL: "1.2.12345",

  /** Large contract number */
  CONTRACT_ID_LARGE: "0.0.999999999",

  /** Mainnet contract ID */
  CONTRACT_ID_MAINNET: "0.0.1",
} as const;

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

/**
 * Expected formatted timestamp outputs.
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

/**
 * Numeric values for number validation tests.
 */
export const TEST_NUMBERS = {
  /** Zero */
  ZERO: 0,

  /** Positive integer */
  POSITIVE_INT: 1,

  /** Large positive integer */
  LARGE_POSITIVE_INT: 100,

  /** Negative integer */
  NEGATIVE_INT: -1,

  /** Positive decimal */
  POSITIVE_DECIMAL: 0.1,

  /** Larger positive decimal */
  POSITIVE_DECIMAL_LARGE: 1.5,

  /** Negative decimal */
  NEGATIVE_DECIMAL: -0.5,

  /** Max safe integer */
  MAX_SAFE_INT: Number.MAX_SAFE_INTEGER,

  /** Min value (smallest positive) */
  MIN_VALUE: Number.MIN_VALUE,
} as const;

// ============================================================================
// Mock/Stub Values for Unit Tests
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
