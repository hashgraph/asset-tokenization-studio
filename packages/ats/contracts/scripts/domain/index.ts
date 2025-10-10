// SPDX-License-Identifier: Apache-2.0

/**
 * Domain layer exports for Asset Tokenization Studio.
 *
 * This module provides ATS-specific business logic. These are not generic
 * infrastructure and should not be considered reusable for other projects.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import from domain layer
 * import {
 *   EQUITY_CONFIG_ID,
 *   BOND_CONFIG_ID,
 *   deployFactory,
 *   createEquityConfiguration,
 *   createBondConfiguration
 * } from '@scripts/domain'
 * ```
 */

// Domain constants
export * from './constants'

// Equity configuration
export * from './equity/createConfiguration'

// Bond configuration
export * from './bond/createConfiguration'

// Factory deployment
export * from './factory/deploy'

// Token deployment from factory
export * from './factory/deployToken'
