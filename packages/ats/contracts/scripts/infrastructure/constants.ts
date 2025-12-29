// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";

/**
 * Constants for ATS deployment system.
 *
 * This module provides centralized constants for network configuration,
 * deployment defaults, and other system-wide values.
 *
 * @module core/constants
 */

// ============================================================================
// Network Constants
// ============================================================================

/**
 * Supported network identifiers.
 *
 * Network naming convention:
 * - `hardhat`: Hardhat's in-memory test network
 * - `local`: Generic local Ethereum-compatible node (port 8545)
 * - `hedera-*`: Hedera networks with prefix for clear identification
 */
export const NETWORKS = [
  "hardhat",
  "local",
  "hedera-local",
  "hedera-previewnet",
  "hedera-testnet",
  "hedera-mainnet",
] as const;

export type Network = (typeof NETWORKS)[number];

/**
 * Backward compatibility aliases for network names.
 *
 * Maps old network names to new standardized names.
 * These aliases are deprecated and will be removed in future releases.
 *
 * @deprecated Use new network names instead
 */
export const NETWORK_ALIASES: Record<string, Network> = {
  localhost: "local",
  previewnet: "hedera-previewnet",
  testnet: "hedera-testnet",
  mainnet: "hedera-mainnet",
};

/**
 * Chain IDs for supported networks.
 *
 * @see https://docs.hedera.com/hedera/core-concepts/smart-contracts/deploying-smart-contracts/json-rpc-relay#chain-ids
 */
export const CHAIN_IDS: Record<string, number> = {
  "hedera-mainnet": 295,
  "hedera-testnet": 296,
  "hedera-previewnet": 297,
  "hedera-local": 1337,
  local: 1337,
  hardhat: 31337,
};

/**
 * Default network endpoints.
 */
export const DEFAULT_ENDPOINTS = {
  hardhat: {
    jsonRpc: "",
    mirror: "",
  },
  local: {
    jsonRpc: "http://127.0.0.1:8545",
    mirror: "",
  },
  "hedera-local": {
    jsonRpc: "http://127.0.0.1:7546",
    mirror: "http://127.0.0.1:5600",
  },
  "hedera-previewnet": {
    jsonRpc: "https://previewnet.hashio.io/api",
    mirror: "https://previewnet.mirrornode.hedera.com",
  },
  "hedera-testnet": {
    jsonRpc: "https://testnet.hashio.io/api",
    mirror: "https://testnet.mirrornode.hedera.com",
  },
  "hedera-mainnet": {
    jsonRpc: "https://mainnet.hashio.io/api",
    mirror: "https://mainnet.mirrornode.hedera.com",
  },
} as const;

// ============================================================================
// Deployment Constants
// ============================================================================

/**
 * Default gas multiplier for transaction overrides.
 */
export const DEFAULT_GAS_MULTIPLIER = 1.2;

/**
 * Default timeout for contract transactions (milliseconds).
 */
export const DEFAULT_TRANSACTION_TIMEOUT = 60_000;

/**
 * Default timeout for deployment operations (milliseconds).
 */
export const DEFAULT_DEPLOYMENT_TIMEOUT = DEFAULT_TRANSACTION_TIMEOUT;

/**
 * Block confirmations to wait for deployment verification.
 */
export const DEFAULT_CONFIRMATIONS = {
  hardhat: 0,
  local: 1,
  "hedera-local": 1,
  "hedera-previewnet": 2,
  "hedera-testnet": 2,
  "hedera-mainnet": 5,
} as const;

/**
 * Maximum retries for failed transactions.
 */
export const MAX_RETRIES = 3;

/**
 * Delay between retries (milliseconds).
 */
export const RETRY_DELAY = 2000;

/**
 * Default number of facets to process per batch during BLR configuration.
 *
 * Smaller batches reduce gas per transaction, preventing transactions from
 * exceeding block gas limits and improving reliability on congested networks.
 *
 * This default can be overridden:
 * - Via `BATCH_SIZE` environment variable
 * - Via function parameters in createEquityConfiguration/createBondConfiguration
 *
 * @example
 * ```typescript
 * // Use default (15 facets per batch)
 * await createEquityConfiguration(blr, facetAddresses);
 *
 * // Override with custom batch size
 * await createEquityConfiguration(blr, facetAddresses, false, false, 20);
 * ```
 */
export const DEFAULT_BATCH_SIZE = 15;

/**
 * Gas limits for various contract operations.
 *
 * These values provide explicit gas limits for operations that may fail
 * gas estimation, especially when deploying to real networks (testnet, mainnet).
 *
 * Usage: Pass as overrides to contract method calls:
 * @example
 * ```typescript
 * await contract.method({ gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration })
 * ```
 */
export const GAS_LIMIT = {
  max: 15_000_000,
  default: 3_000_000,
  low: 1_000_000,
  high: 10_000_000,
  initialize: {
    businessLogicResolver: 8_000_000,
    factory: 300_000,
  },
  proxyAdmin: {
    upgrade: 150_000,
  },
  businessLogicResolver: {
    getStaticResolverKey: 60_000,
    registerBusinessLogics: 7_800_000,
    createConfiguration: 15_000_000,
  },
} as const;

/**
 * Sentinel value for auto-updating ResolverProxy deployments.
 *
 * When used as the `version` parameter, the proxy automatically resolves
 * to the latest registered configuration version at runtime.
 *
 * Value: `0` (interpreted as "use latest" by `_resolveVersion()`)
 */
export const LATEST_VERSION = 0;

/**
 * Default partition for ERC1410 operations.
 *
 * bytes32(uint256(1)) = 0x00...01
 */
export const DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";

// ============================================================================
// Contract Names
// ============================================================================

/**
 * Core infrastructure contract names.
 *
 * These are generic contracts that are part of the infrastructure layer.
 * Domain-specific contracts (like Factory) are defined in domain/constants.ts.
 */
export const INFRASTRUCTURE_CONTRACT_NAMES = {
  PROXY_ADMIN: "ProxyAdmin",
  BUSINESS_LOGIC_RESOLVER: "BusinessLogicResolver",
} as const;

/**
 * Proxy contract names.
 */
export const PROXY_CONTRACTS = {
  TRANSPARENT: "TransparentUpgradeableProxy",
} as const;

// ============================================================================
// Environment Variable Prefixes
// ============================================================================

/**
 * Environment variable naming patterns.
 */
export const ENV_VAR_PATTERNS = {
  JSON_RPC_ENDPOINT: "_JSON_RPC_ENDPOINT",
  MIRROR_NODE_ENDPOINT: "_MIRROR_NODE_ENDPOINT",
  PRIVATE_KEY: "_PRIVATE_KEY_",
  CONTRACT_ADDRESS: "_",
} as const;

// ============================================================================
// Deployment Output
// ============================================================================

/**
 * Default deployment output directory.
 */
export const DEPLOYMENT_OUTPUT_DIR = "./deployments";

/**
 * Deployment output file naming pattern.
 */
export const DEPLOYMENT_OUTPUT_PATTERN = "{network}_{timestamp}.json";

// * Time periods (in seconds and milliseconds)
export const TIME_PERIODS_S = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  QUARTER: 90 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
};

export const TIME_PERIODS_MS = {
  SECOND: TIME_PERIODS_S.SECOND * 1000,
  MINUTE: TIME_PERIODS_S.MINUTE * 1000,
  HOUR: TIME_PERIODS_S.HOUR * 1000,
  DAY: TIME_PERIODS_S.DAY * 1000,
  WEEK: TIME_PERIODS_S.WEEK * 1000,
  MONTH: TIME_PERIODS_S.MONTH * 1000,
  QUARTER: TIME_PERIODS_S.QUARTER * 1000,
  YEAR: TIME_PERIODS_S.YEAR * 1000,
};

export const ZERO = ethers.constants.Zero;
export const ADDRESS_ZERO = ethers.constants.AddressZero;
export const EMPTY_HEX_BYTES = "0x";
export const EMPTY_STRING = "";

export const EIP1066_CODES = {
  // 0x0* Generic
  FAILURE: "0x00",
  SUCCESS: "0x01",
  AWAITING_OTHERS: "0x02",
  ACCEPTED: "0x03",
  LOWER_LIMIT_OR_INSUFFICIENT: "0x04",
  RECEIVER_ACTION_REQUESTED: "0x05",
  UPPER_LIMIT: "0x06",
  DUPLICATE_UNNECESSARY_OR_INAPPLICABLE: "0x08",
  INFORMATIONAL_OR_METADATA: "0x0f",

  // 0x1* Permission & Control
  DISALLOWED_OR_STOP: "0x10",
  ALLOWED_OR_GO: "0x11",
  AWAITING_OTHERS_PERMISSION: "0x12",
  PERMISSION_REQUESTED: "0x13",
  TOO_OPEN_OR_INSECURE: "0x14",
  NEEDS_YOUR_PERMISSION_OR_CONTINUATION: "0x15",
  REVOKED_OR_BANNED: "0x16",
  NOT_APPLICABLE_TO_CURRENT_STATE: "0x18",
  PERMISSION_DETAILS_OR_CONTROL_CONDITIONS: "0x1f",

  // 0x2* Find, Inequalities & Range
  NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE: "0x20",
  FOUND_EQUAL_OR_IN_RANGE: "0x21",
  AWAITING_MATCH: "0x22",
  MATCH_REQUEST_SENT: "0x23",
  BELOW_RANGE_OR_UNDERFLOW: "0x24",
  REQUEST_FOR_MATCH: "0x25",
  ABOVE_RANGE_OR_OVERFLOW: "0x26",
  DUPLICATE_CONFLICT_OR_COLLISION: "0x28",
  MATCHING_META_OR_INFO: "0x2f",

  // 0x3* Negotiation & Governance
  SENDER_DISAGREES_OR_NAY: "0x30",
  SENDER_AGREES_OR_YEA: "0x31",
  AWAITING_RATIFICATION: "0x32",
  OFFER_SENT_OR_VOTED: "0x33",
  QUORUM_NOT_REACHED: "0x34",
  RECEIVER_RATIFICATION_REQUESTED: "0x35",
  OFFER_OR_VOTE_LIMIT_REACHED: "0x36",
  ALREADY_VOTED: "0x38",
  NEGOTIATION_RULES_OR_PARTICIPATION_INFO: "0x3f",

  // 0x4* Availability & Time
  UNAVAILABLE: "0x40",
  AVAILABLE: "0x41",
  PAUSED: "0x42",
  QUEUED: "0x43",
  NOT_AVAILABLE_YET: "0x44",
  AWAITING_YOUR_AVAILABILITY: "0x45",
  EXPIRED: "0x46",
  ALREADY_DONE: "0x48",
  AVAILABILITY_RULES_OR_INFO: "0x4f",

  // 0x5* Tokens, Funds & Finance
  TRANSFER_FAILED: "0x50",
  TRANSFER_SUCCESSFUL: "0x51",
  AWAITING_PAYMENT_FROM_OTHERS: "0x52",
  HOLD_OR_ESCROW: "0x53",
  INSUFFICIENT_FUNDS: "0x54",
  FUNDS_REQUESTED: "0x55",
  TRANSFER_VOLUME_EXCEEDED: "0x56",
  FUNDS_NOT_REQUIRED: "0x58",
  TOKEN_OR_FINANCIAL_INFORMATION: "0x5f",

  // 0xA* Application-Specific Codes
  APP_SPECIFIC_FAILURE: "0xa0",
  APP_SPECIFIC_SUCCESS: "0xa1",
  APP_SPECIFIC_AWAITING_OTHERS: "0xa2",
  APP_SPECIFIC_ACCEPTANCE: "0xa3",
  APP_SPECIFIC_BELOW_CONDITION: "0xa4",
  APP_SPECIFIC_RECEIVER_ACTION_REQUESTED: "0xa5",
  APP_SPECIFIC_EXPIRY_OR_LIMIT: "0xa6",
  APP_SPECIFIC_INAPPLICABLE_CONDITION: "0xa8",
  APP_SPECIFIC_META_OR_INFO: "0xaf",

  // 0xE* Encryption, Identity & Proofs
  DECRYPT_FAILURE: "0xe0",
  DECRYPT_SUCCESS: "0xe1",
  AWAITING_OTHER_SIGNATURES_OR_KEYS: "0xe2",
  SIGNED: "0xe3",
  UNSIGNED_OR_UNTRUSTED: "0xe4",
  SIGNATURE_REQUIRED: "0xe5",
  KNOWN_TO_BE_COMPROMISED: "0xe6",
  ALREADY_SIGNED_OR_NOT_ENCRYPTED: "0xe8",
  CRYPTOGRAPHY_ID_OR_PROOF_METADATA: "0xef",

  // 0xF* Off-Chain
  OFF_CHAIN_FAILURE: "0xf0",
  OFF_CHAIN_SUCCESS: "0xf1",
  AWAITING_OFF_CHAIN_PROCESS: "0xf2",
  OFF_CHAIN_PROCESS_STARTED: "0xf3",
  OFF_CHAIN_SERVICE_UNREACHABLE: "0xf4",
  OFF_CHAIN_ACTION_REQUIRED: "0xf5",
  OFF_CHAIN_EXPIRY_OR_LIMIT_REACHED: "0xf6",
  DUPLICATE_OFF_CHAIN_REQUEST: "0xf8",
  OFF_CHAIN_INFO_OR_META: "0xff",
} as const;

// ============================================================================

// ============================================================================
// Deployment Workflow Descriptors
// ============================================================================

import type { WorkflowType } from "./types/checkpoint";

/**
 * Human-readable names for deployment workflows.
 * Used for file naming and logging.
 */
export const WORKFLOW_DESCRIPTORS: Record<WorkflowType, string> = {
  newBlr: "newBlr",
  existingBlr: "existingBlr",
  upgradeConfigurations: "upgradeConfigurations",
  upgradeTupProxies: "upgradeTupProxies",
} as const;
