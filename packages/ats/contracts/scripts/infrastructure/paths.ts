// SPDX-License-Identifier: Apache-2.0

import { join } from "path";

// ============================================================================
// Base Directory
// ============================================================================

/**
 * Get contracts package root directory.
 * Evaluated lazily to support test isolation and dynamic CWD changes.
 */
function getProjectRoot(): string {
  return process.cwd();
}

// ============================================================================
// Path Segments (building blocks)
// ============================================================================

/** Top-level deployments directory name. */
const DEPLOYMENTS = "deployments";

/** Checkpoints subdirectory name. */
const CHECKPOINTS = ".checkpoints";

/** Test isolation subdirectory name. */
const TEST_SUBDIR = "test";

// ============================================================================
// Absolute Path Builders
// ============================================================================

/** Root deployments directory: `{root}/deployments/` */
export function getDeploymentsDir(): string {
  return join(getProjectRoot(), DEPLOYMENTS);
}

/**
 * Network-specific deployment directory: `{root}/deployments/{network}/`
 *
 * @param network - Network name (e.g., 'hedera-testnet', 'hardhat')
 */
export function getNetworkDeploymentDir(network: string): string {
  return join(getDeploymentsDir(), network);
}

/**
 * Checkpoint directory for a network: `{root}/deployments/{network}/.checkpoints/`
 *
 * @param network - Network name
 */
export function getCheckpointsDir(network: string): string {
  return join(getDeploymentsDir(), network, CHECKPOINTS);
}

/**
 * Test-isolated checkpoint directory: `{root}/deployments/test/{network}/.checkpoints/`
 *
 * Used by hardhat network and test suites to avoid polluting production deployments.
 *
 * @param network - Network name (default: "hardhat")
 */
export function getTestCheckpointsDir(network: string = "hardhat"): string {
  return join(getDeploymentsDir(), TEST_SUBDIR, network, CHECKPOINTS);
}

/** Test deployments root: `{root}/deployments/test/` */
export function getTestDeploymentsDir(): string {
  return join(getDeploymentsDir(), TEST_SUBDIR);
}
