// SPDX-License-Identifier: Apache-2.0

/**
 * Provider implementations for contract deployment.
 *
 * This module provides two deployment provider implementations:
 * - HardhatProvider: Requires Hardhat runtime (framework-dependent)
 * - StandaloneProvider: Framework-independent using plain ethers.js
 *
 * @module core/providers
 */

// Framework-agnostic provider (always available)
export {
    StandaloneProvider,
    createStandaloneProviderFromEnv,
} from './standaloneProvider'

// Hardhat-dependent provider (conditionally export to avoid hard dependency)
export { HardhatProvider } from './hardhatProvider'
