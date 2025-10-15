// SPDX-License-Identifier: Apache-2.0

/**
 * Infrastructure layer exports for smart contract deployment.
 *
 * This module provides generic, domain-agnostic deployment infrastructure
 * that can be used for any smart contract project. It contains no knowledge
 * of ATS-specific concepts (equities, bonds, Factory, etc.).
 *
 * @module infrastructure
 *
 * @example
 * ```typescript
 * // Import from infrastructure layer
 * import {
 *   HardhatProvider,
 *   StandaloneProvider,
 *   deployContract,
 *   deployProxy,
 *   deployFacets,
 *   FACET_REGISTRY,
 *   info,
 *   validateAddress
 * } from '@scripts/infrastructure'
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
    DeploymentProvider,
    FacetDefinition,
    ContractDefinition,
    NetworkConfig,
    DeploymentResult,
    DeployProxyOptions,
    DeployProxyResult,
    UpgradeProxyOptions,
    UpgradeProxyResult,
    CreateConfigOptions,
    CreateConfigResult,
    OperationResult,
} from './types'

export { ok, err } from './types'

// ============================================================================
// Constants
// ============================================================================

export {
    NETWORKS,
    CHAIN_IDS,
    DEFAULT_ENDPOINTS,
    ARTIFACTS_PATHS,
    DEFAULT_GAS_MULTIPLIER,
    DEFAULT_DEPLOYMENT_TIMEOUT,
    DEFAULT_TRANSACTION_TIMEOUT,
    DEFAULT_CONFIRMATIONS,
    MAX_RETRIES,
    RETRY_DELAY,
    GAS_LIMIT,
    DEFAULT_PARTITION,
    INFRASTRUCTURE_CONTRACTS,
    PROXY_CONTRACTS,
    ENV_VAR_PATTERNS,
    DEPLOYMENT_OUTPUT_DIR,
    DEPLOYMENT_OUTPUT_PATTERN,
} from './constants'

export type { Network } from './constants'

// ============================================================================
// Registry
// ============================================================================

export {
    FACET_REGISTRY,
    CONTRACT_REGISTRY,
    ROLES,
    getFacetDefinition,
    getContractDefinition,
    getAllFacets,
    getAllContracts,
    hasFacet,
    hasContract,
} from './registry'

// ============================================================================
// Configuration
// ============================================================================

export { getNetworkConfig, getAllNetworks } from './config'

// ============================================================================
// Providers
// ============================================================================

export {
    HardhatProvider,
    StandaloneProvider,
    createStandaloneProviderFromEnv,
} from './providers'

// ============================================================================
// Operations
// ============================================================================

export {
    deployContract,
    verifyDeployedContract,
} from './operations/deployContract'
export type { DeployContractOptions } from './operations/deployContract'

export {
    deployProxy,
    getProxyImplementation,
    getProxyAdmin,
} from './operations/deployProxy'

export { upgradeProxy } from './operations/upgradeProxy'

export {
    registerFacets,
    isFacetRegistered,
    getRegisteredFacetAddress,
    type RegisterFacetsOptions,
    type RegisterFacetsResult,
} from './operations/registerFacets'

export {
    createBatchConfiguration,
    createBlrConfiguration,
    configurationExists,
    getConfigurationVersion,
    type FacetConfiguration,
    type CreateBlrConfigurationOptions,
    type CreateBlrConfigurationResult,
    type ConfigurationData,
    type ConfigurationError,
} from './operations/blrConfigurations'

export {
    verifyDeployment,
    type VerifyDeploymentOptions,
} from './operations/verifyDeployment'

export {
    deployBlr,
    type DeployBlrOptions,
    type DeployBlrResult,
} from './operations/blrDeployment'

export {
    deployProxyAdmin,
    type DeployProxyAdminOptions,
    type DeployProxyAdminResult,
} from './operations/proxyAdminDeployment'

export {
    deployFacets,
    type DeployFacetsOptions,
    type DeployFacetsResult,
} from './operations/facetDeployment'

export {
    deployResolverProxy,
    type DeployResolverProxyOptions,
    type DeployResolverProxyResult,
    type ResolverProxyRbac,
} from './operations/deployResolverProxy'

// ============================================================================
// Utilities
// ============================================================================

export { validateAddress, validateBytes32 } from './utils/validation'

export {
    waitForTransaction,
    extractRevertReason,
    getGasPrice,
    estimateGasLimit,
    formatGasUsage,
} from './utils/transaction'

export {
    info,
    success,
    error,
    warn,
    section,
    debug,
    table,
} from './utils/logging'

export { resolveContractName } from './utils/naming'
