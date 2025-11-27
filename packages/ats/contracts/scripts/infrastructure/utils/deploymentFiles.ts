// SPDX-License-Identifier: Apache-2.0

/**
 * Deployment file utilities for loading and managing saved deployments.
 *
 * Provides functions for loading, listing, and finding deployment output files
 * from the deployments/ directory. These utilities serve as the foundation for
 * the checkpoint system (Phase 2) and deployment registry (Phase 3).
 *
 * @module infrastructure/utils/deploymentFiles
 */

import { promises as fs } from "fs";
import { join } from "path";

// Import DeploymentOutput type from workflows
// Note: This creates a dependency from infrastructure->workflows, but it's acceptable
// for utility functions that work with deployment outputs. The alternative would be
// to define DeploymentOutput in infrastructure/types, but it's semantically a workflow output.
import type { DeploymentOutput } from "../../workflows/deploySystemWithNewBlr";

/**
 * Get the deployments directory path.
 * @returns Absolute path to deployments directory
 */
function getDeploymentsDir(): string {
  // Navigate from this file to deployments directory
  // scripts/infrastructure/utils/deploymentFiles.ts -> ../../deployments
  return join(__dirname, "../../../deployments");
}

/**
 * Load a specific deployment by network and timestamp.
 *
 * @param network - Network name (e.g., 'hedera-testnet', 'hedera-mainnet')
 * @param timestamp - Deployment timestamp in format YYYY-MM-DD_HH-mm-ss
 * @returns Deployment output data
 * @throws Error if deployment file not found or invalid JSON
 *
 * @example
 * ```typescript
 * import { loadDeployment } from '@scripts/infrastructure'
 *
 * // Load specific deployment
 * const deployment = await loadDeployment('hedera-testnet', '2025-11-07_18-30-45')
 *
 * console.log(`BLR Proxy: ${deployment.infrastructure.blr.proxy}`)
 * console.log(`Factory: ${deployment.infrastructure.factory.proxy}`)
 * console.log(`Facets: ${deployment.facets.length}`)
 * ```
 */
export async function loadDeployment(network: string, timestamp: string): Promise<DeploymentOutput> {
  const deploymentsDir = getDeploymentsDir();
  const filename = `${network}_${timestamp}.json`;
  const filepath = join(deploymentsDir, filename);

  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as DeploymentOutput;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Deployment file not found: ${filename}`);
    }
    throw new Error(`Failed to load deployment ${filename}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find and load the latest deployment for a network.
 *
 * Searches for deployment files matching the network name and returns
 * the most recent one based on timestamp.
 *
 * @param network - Network name (e.g., 'hedera-testnet', 'hedera-mainnet')
 * @returns Latest deployment output, or null if no deployments found
 *
 * @example
 * ```typescript
 * import { findLatestDeployment } from '@scripts/infrastructure'
 *
 * // Get latest testnet deployment
 * const latest = await findLatestDeployment('hedera-testnet')
 *
 * if (latest) {
 *   console.log(`Latest deployment: ${latest.timestamp}`)
 *   console.log(`Deployer: ${latest.deployer}`)
 * } else {
 *   console.log('No deployments found')
 * }
 * ```
 */
export async function findLatestDeployment(network: string): Promise<DeploymentOutput | null> {
  const files = await listDeploymentFiles(network);

  if (files.length === 0) {
    return null;
  }

  // Files are already sorted newest first
  const latestFile = files[0];

  // Extract timestamp from filename: network_timestamp.json
  const timestamp = latestFile.replace(`${network}_`, "").replace(".json", "");

  return loadDeployment(network, timestamp);
}

/**
 * List all deployment files for a network.
 *
 * Returns filenames sorted by timestamp (newest first).
 *
 * @param network - Network name (e.g., 'hedera-testnet', 'hedera-mainnet')
 * @returns Array of deployment filenames, sorted newest first
 *
 * @example
 * ```typescript
 * import { listDeploymentFiles } from '@scripts/infrastructure'
 *
 * // List all testnet deployments
 * const files = await listDeploymentFiles('hedera-testnet')
 *
 * console.log(`Found ${files.length} deployments:`)
 * files.forEach(file => console.log(`  - ${file}`))
 * ```
 */
export async function listDeploymentFiles(network: string): Promise<string[]> {
  const deploymentsDir = getDeploymentsDir();

  try {
    const allFiles = await fs.readdir(deploymentsDir);

    // Filter files matching network pattern: network_timestamp.json
    const networkFiles = allFiles.filter(
      (file) => file.startsWith(`${network}_`) && file.endsWith(".json") && !file.includes("/."),
    );

    // Sort by filename (timestamp) in descending order (newest first)
    // Filename format: network_YYYY-MM-DD_HH-mm-ss.json sorts correctly alphabetically
    return networkFiles.sort().reverse();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      // Deployments directory doesn't exist yet
      return [];
    }
    throw new Error(`Failed to list deployment files: ${error instanceof Error ? error.message : String(error)}`);
  }
}
