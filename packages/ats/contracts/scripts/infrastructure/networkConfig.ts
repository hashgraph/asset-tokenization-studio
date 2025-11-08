// SPDX-License-Identifier: Apache-2.0

/**
 * Network-specific configuration for ATS deployment system.
 *
 * Provides optimized settings for different networks:
 * - Local networks (hardhat, localhost): Fast, minimal retries
 * - Hedera networks (previewnet, testnet, mainnet): Balanced reliability and speed
 *
 * @module infrastructure/networkConfig
 */

import type { RetryOptions } from "./utils/transaction";

/**
 * Network-specific deployment configuration.
 * Different from NetworkConfig in types.ts which contains RPC endpoints.
 */
export interface DeploymentConfig {
  /** Number of block confirmations to wait for */
  confirmations: number;
  /** Transaction timeout in milliseconds */
  timeout: number;
  /** Retry configuration for failed transactions */
  retryOptions: Required<RetryOptions>;
  /** Whether to verify bytecode after deployment */
  verifyDeployment: boolean;
}

/**
 * Network configurations optimized for different deployment targets.
 *
 * Performance targets:
 * - Local networks: Instant (no retries needed)
 * - Hedera networks: Under 2 minutes worst-case, ~30s typical
 */
export const DEPLOYMENT_CONFIGS: Record<string, DeploymentConfig> = {
  /**
   * Hardhat Network (local testing)
   * - Instant transactions, no confirmations needed
   * - No retries or verification (deterministic environment)
   */
  hardhat: {
    confirmations: 0,
    timeout: 10_000, // 10 seconds (should never timeout)
    retryOptions: {
      maxRetries: 0,
      baseDelay: 0,
      maxDelay: 0,
      logRetries: false,
    },
    verifyDeployment: false,
  },

  /**
   * Localhost Network (local node)
   * - Minimal confirmations, light retry logic
   * - Verification enabled for closer to production behavior
   */
  localhost: {
    confirmations: 1,
    timeout: 30_000, // 30 seconds
    retryOptions: {
      maxRetries: 1, // 2 total attempts
      baseDelay: 1000, // 1 second
      maxDelay: 2000, // 2 seconds
      logRetries: true,
    },
    verifyDeployment: true,
  },

  /**
   * Hedera Previewnet
   * - Optimized for speed while maintaining reliability
   * - 2 confirmations, 2 retries (3 total attempts)
   * - Worst-case: 3 × 30s + 7s delays = 97 seconds
   * - Typical: 3 × 5-10s + 7s = 22-37 seconds
   */
  "hedera-previewnet": {
    confirmations: 2,
    timeout: 30_000, // 30 seconds per attempt
    retryOptions: {
      maxRetries: 2, // 3 total attempts
      baseDelay: 1000, // 1 second base
      maxDelay: 4000, // 4 seconds cap (1s → 2s → 4s delays)
      logRetries: true,
    },
    verifyDeployment: true,
  },

  /**
   * Hedera Testnet
   * - Same as previewnet (optimized for development speed)
   * - 2 confirmations, 2 retries (3 total attempts)
   * - Worst-case: 3 × 30s + 7s delays = 97 seconds
   * - Typical: 3 × 5-10s + 7s = 22-37 seconds
   */
  "hedera-testnet": {
    confirmations: 2,
    timeout: 30_000, // 30 seconds per attempt
    retryOptions: {
      maxRetries: 2, // 3 total attempts
      baseDelay: 1000, // 1 second base
      maxDelay: 4000, // 4 seconds cap (1s → 2s → 4s delays)
      logRetries: true,
    },
    verifyDeployment: true,
  },

  /**
   * Hedera Mainnet
   * - More conservative settings for production
   * - 3 confirmations, 3 retries (4 total attempts)
   * - Worst-case: 4 × 45s + 15s delays = 195 seconds (~3.25 min)
   * - Typical: 4 × 5-10s + 15s = 35-55 seconds
   */
  "hedera-mainnet": {
    confirmations: 3,
    timeout: 45_000, // 45 seconds per attempt
    retryOptions: {
      maxRetries: 3, // 4 total attempts
      baseDelay: 2000, // 2 seconds base
      maxDelay: 8000, // 8 seconds cap (2s → 4s → 8s → 8s delays)
      logRetries: true,
    },
    verifyDeployment: true,
  },
};

/**
 * Get deployment-specific configuration with fallback to testnet settings.
 *
 * @param network - Network name (e.g., "hardhat", "hedera-testnet")
 * @returns Deployment configuration object
 *
 * @example
 * ```typescript
 * const config = getDeploymentConfig("hedera-testnet")
 * console.log(config.confirmations) // 2
 * console.log(config.timeout) // 30000
 * ```
 */
export function getDeploymentConfig(network: string): DeploymentConfig {
  // Return exact match if available
  if (network in DEPLOYMENT_CONFIGS) {
    return DEPLOYMENT_CONFIGS[network];
  }

  // Fallback to testnet settings for unknown networks
  return DEPLOYMENT_CONFIGS["hedera-testnet"];
}

/**
 * Check if network is a local/test environment.
 * Local networks don't need retry or verification.
 *
 * @param network - Network name
 * @returns true if network is local (hardhat/localhost)
 *
 * @example
 * ```typescript
 * isLocalNetwork("hardhat") // true
 * isLocalNetwork("hedera-testnet") // false
 * ```
 */
export function isLocalNetwork(network: string): boolean {
  return network === "hardhat" || network === "localhost";
}
