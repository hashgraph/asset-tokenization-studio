// SPDX-License-Identifier: Apache-2.0

/**
 * Main entry point for ATS contracts deployment scripts.
 *
 * This module provides a comprehensive, framework-agnostic deployment system
 * for the Asset Tokenization Studio smart contracts.
 *
 * @module scripts
 *
 * @example
 * ```typescript
 * // Import everything
 * import * as ats from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * // Import specific modules
 * import {
 *   deployCompleteSystem,
 *   deployFacets,
 *   createEquityConfiguration
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * // Import types
 * import type {
 *   DeploymentOutput,
 *   DeploymentProvider
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 * ```
 */

// ========================================
// Infrastructure (Generic, Reusable)
// ========================================

// Infrastructure types and core
export * from './infrastructure/types'
export * from './infrastructure/registry'
export * from './infrastructure/config'
export * from './infrastructure/providers'
export * from './infrastructure/constants'

// Infrastructure operations
export * from './infrastructure/operations/deployContract'
export * from './infrastructure/operations/deployProxy'
export * from './infrastructure/operations/upgradeProxy'
export * from './infrastructure/operations/registerFacets'
export * from './infrastructure/operations/blrConfigurations'
export * from './infrastructure/operations/verifyDeployment'
export * from './infrastructure/operations/blrDeployment'
export * from './infrastructure/operations/proxyAdminDeployment'
export * from './infrastructure/operations/facetDeployment'

// Infrastructure utilities
export * from './infrastructure/utils/validation'
export * from './infrastructure/utils/transaction'
export * from './infrastructure/utils/logging'
export * from './infrastructure/utils/naming'

// ========================================
// Domain (ATS-Specific)
// ========================================

// Domain constants
export * from './domain/constants'

// Equity configuration
export * from './domain/equity/createConfiguration'

// Bond configuration
export * from './domain/bond/createConfiguration'

// Factory deployment
export * from './domain/factory/deploy'

// Token deployment from factory
export * from './domain/factory/deployToken'

// ========================================
// Workflows
// ========================================

// Complete deployment workflows
export * from './workflows/deployCompleteSystem'
export * from './workflows/deployWithExistingBlr'
