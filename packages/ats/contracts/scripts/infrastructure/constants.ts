// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'ethers'

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
 * - `localhost`: Generic local Ethereum-compatible node (port 8545)
 * - `hedera-*`: Hedera networks with prefix for clear identification
 */
export const NETWORKS = [
    'hardhat',
    'localhost',
    'hedera-local',
    'hedera-previewnet',
    'hedera-testnet',
    'hedera-mainnet',
] as const

export type Network = (typeof NETWORKS)[number]

/**
 * Backward compatibility aliases for network names.
 *
 * Maps old network names to new standardized names.
 * These aliases are deprecated and will be removed in future releases.
 *
 * @deprecated Use new network names instead
 */
export const NETWORK_ALIASES: Record<string, Network> = {
    local: 'localhost',
    previewnet: 'hedera-previewnet',
    testnet: 'hedera-testnet',
    mainnet: 'hedera-mainnet',
}

/**
 * Chain IDs for supported networks.
 *
 * @see https://docs.hedera.com/hedera/core-concepts/smart-contracts/deploying-smart-contracts/json-rpc-relay#chain-ids
 */
export const CHAIN_IDS: Record<string, number> = {
    'hedera-mainnet': 295,
    'hedera-testnet': 296,
    'hedera-previewnet': 297,
    'hedera-local': 1337,
    localhost: 1337,
    hardhat: 31337,
}

/**
 * Default network endpoints.
 */
export const DEFAULT_ENDPOINTS = {
    hardhat: {
        jsonRpc: '',
        mirror: '',
    },
    localhost: {
        jsonRpc: 'http://127.0.0.1:8545',
        mirror: '',
    },
    'hedera-local': {
        jsonRpc: 'http://127.0.0.1:7546',
        mirror: 'http://127.0.0.1:5600',
    },
    'hedera-previewnet': {
        jsonRpc: 'https://previewnet.hashio.io/api',
        mirror: 'https://previewnet.mirrornode.hedera.com',
    },
    'hedera-testnet': {
        jsonRpc: 'https://testnet.hashio.io/api',
        mirror: 'https://testnet.mirrornode.hedera.com',
    },
    'hedera-mainnet': {
        jsonRpc: 'https://mainnet.hashio.io/api',
        mirror: 'https://mainnet.mirrornode.hedera.com',
    },
} as const

// ============================================================================
// Deployment Constants
// ============================================================================

/**
 * Default artifacts directory paths for different build tools.
 */
export const ARTIFACTS_PATHS = {
    hardhat: './artifacts',
    foundry: './out',
} as const

/**
 * Default gas multiplier for transaction overrides.
 */
export const DEFAULT_GAS_MULTIPLIER = 1.2

/**
 * Default timeout for deployment operations (milliseconds).
 */
export const DEFAULT_DEPLOYMENT_TIMEOUT = 60_000

/**
 * Default timeout for contract transactions (milliseconds).
 */
export const DEFAULT_TRANSACTION_TIMEOUT = 120_000

/**
 * Block confirmations to wait for deployment verification.
 */
export const DEFAULT_CONFIRMATIONS = {
    hardhat: 0,
    localhost: 1,
    'hedera-local': 1,
    'hedera-previewnet': 2,
    'hedera-testnet': 2,
    'hedera-mainnet': 5,
} as const

/**
 * Maximum retries for failed transactions.
 */
export const MAX_RETRIES = 3

/**
 * Delay between retries (milliseconds).
 */
export const RETRY_DELAY = 2000

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
    max: 30_000_000,
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
        createConfiguration: 26_000_000,
    },
} as const

/**
 * Default partition for ERC1410 operations.
 *
 * bytes32(uint256(1)) = 0x00...01
 */
export const DEFAULT_PARTITION =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

// ============================================================================
// Contract Names
// ============================================================================

/**
 * Core infrastructure contract names.
 *
 * These are generic contracts that are part of the infrastructure layer.
 * Domain-specific contracts (like Factory) are defined in domain/constants.ts.
 */
export const INFRASTRUCTURE_CONTRACTS = {
    PROXY_ADMIN: 'ProxyAdmin',
    BUSINESS_LOGIC_RESOLVER: 'BusinessLogicResolver',
} as const

/**
 * Proxy contract names.
 */
export const PROXY_CONTRACTS = {
    TRANSPARENT: 'TransparentUpgradeableProxy',
} as const

// ============================================================================
// Environment Variable Prefixes
// ============================================================================

/**
 * Environment variable naming patterns.
 */
export const ENV_VAR_PATTERNS = {
    JSON_RPC_ENDPOINT: '_JSON_RPC_ENDPOINT',
    MIRROR_NODE_ENDPOINT: '_MIRROR_NODE_ENDPOINT',
    PRIVATE_KEY: '_PRIVATE_KEY_',
    CONTRACT_ADDRESS: '_',
} as const

// ============================================================================
// Deployment Output
// ============================================================================

/**
 * Default deployment output directory.
 */
export const DEPLOYMENT_OUTPUT_DIR = './deployments'

/**
 * Deployment output file naming pattern.
 */
export const DEPLOYMENT_OUTPUT_PATTERN = '{network}_{timestamp}.json'

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
}

export const TIME_PERIODS_MS = {
    SECOND: TIME_PERIODS_S.SECOND * 1000,
    MINUTE: TIME_PERIODS_S.MINUTE * 1000,
    HOUR: TIME_PERIODS_S.HOUR * 1000,
    DAY: TIME_PERIODS_S.DAY * 1000,
    WEEK: TIME_PERIODS_S.WEEK * 1000,
    MONTH: TIME_PERIODS_S.MONTH * 1000,
    QUARTER: TIME_PERIODS_S.QUARTER * 1000,
    YEAR: TIME_PERIODS_S.YEAR * 1000,
}

export const ZERO = ethers.constants.Zero
export const ADDRESS_ZERO = ethers.constants.AddressZero
export const EMPTY_HEX_BYTES = '0x'
export const EMPTY_STRING = ''
