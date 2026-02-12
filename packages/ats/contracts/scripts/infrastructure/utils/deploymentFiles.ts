// SPDX-License-Identifier: Apache-2.0

/**
 * Deployment file utilities for saving, loading, and managing deployment outputs.
 *
 * Provides comprehensive functions for managing deployment files with structured
 * directory organization by network and workflow type. Supports saving deployment
 * outputs, finding latest deployments, and listing available deployments.
 *
 * @module infrastructure/utils/deploymentFiles
 */

import { promises as fs } from "fs";
import { join, dirname, win32, posix } from "path";
import type { AnyDeploymentOutput, SaveDeploymentOptions, SaveResult, LoadDeploymentOptions } from "../types";
import type { WorkflowType } from "../types/checkpoint";
import { WORKFLOW_DESCRIPTORS } from "../constants";
import { generateTimestamp } from "./time";
import { getNetworkDeploymentDir as getNetworkDir } from "../paths";

/**
 * Get the network-specific deployment directory.
 *
 * @param network - Network name (e.g., 'hedera-testnet')
 * @param deploymentsDir - Optional custom deployments directory
 * @returns Absolute path to network directory
 */
export function getNetworkDeploymentDir(network: string, deploymentsDir?: string): string {
  if (deploymentsDir) return join(deploymentsDir, network);
  return getNetworkDir(network);
}

/**
 * Generate a deployment filename for the given workflow and timestamp.
 *
 * Uses registered workflow descriptor if available, otherwise uses workflow name directly.
 * This allows custom workflows to work without prior registration.
 *
 * @param workflow - Workflow type
 * @param timestamp - Optional timestamp (uses current time if not provided)
 * @returns Filename in format: {workflow}-{timestamp}.json
 *
 * @example Core ATS workflow
 * ```typescript
 * generateDeploymentFilename('newBlr')
 * // Returns: "newBlr-2025-12-30T10-30-45.json"
 * ```
 *
 * @example Custom workflow (unregistered)
 * ```typescript
 * generateDeploymentFilename('gbpInfrastructure')
 * // Returns: "gbpInfrastructure-2025-12-30T10-30-45.json"
 * ```
 *
 * @example Custom workflow (registered with short name)
 * ```typescript
 * import { registerWorkflowDescriptor } from '@scripts/infrastructure'
 *
 * registerWorkflowDescriptor('gbpInfrastructure', 'gbpInfra')
 * generateDeploymentFilename('gbpInfrastructure')
 * // Returns: "gbpInfra-2025-12-30T10-30-45.json"
 * ```
 */
export function generateDeploymentFilename(workflow: WorkflowType, timestamp?: string): string {
  const ts = timestamp || generateTimestamp();
  const workflowName = WORKFLOW_DESCRIPTORS[workflow] || workflow;
  return `${workflowName}-${ts}.json`;
}

/**
 * Save a deployment output to disk.
 *
 * Saves deployment data to the file system with structure:
 * `deployments/{network}/{workflow}-{timestamp}.json`
 *
 * @param options - Save options including network, workflow, and data
 * @returns Save result (success with filepath or failure with error message)
 *
 * @example
 * ```typescript
 * import { saveDeploymentOutput } from '@scripts/infrastructure'
 *
 * const result = await saveDeploymentOutput({
 *   network: 'hedera-testnet',
 *   workflow: 'newBlr',
 *   data: deploymentOutput,
 * })
 *
 * if (result.success) {
 *   console.log(`Saved to: ${result.filepath}`)
 * } else {
 *   console.error(`Failed: ${result.error}`)
 * }
 * ```
 */
export async function saveDeploymentOutput<T = AnyDeploymentOutput>(
  options: SaveDeploymentOptions<T>,
): Promise<SaveResult> {
  try {
    const { network, workflow, data, customPath } = options;

    let filepath: string;
    let filename: string;

    if (customPath) {
      filepath = customPath;
      // Handle both Unix and Windows paths - try Windows first, then Unix
      const windowsFilename = win32.basename(filepath);
      const unixFilename = posix.basename(filepath);
      // Use the shorter one (basename removes path, so shorter = more processing done)
      filename = windowsFilename.length < unixFilename.length ? windowsFilename : unixFilename;
    } else {
      const networkDir = getNetworkDeploymentDir(network);
      const timestamp = generateTimestamp();
      filename = generateDeploymentFilename(workflow, timestamp);
      filepath = join(networkDir, filename);
    }

    // Ensure directory exists
    const dir = dirname(filepath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filepath, content, "utf-8");

    return {
      success: true,
      filepath,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Load a specific deployment by network, workflow, and timestamp.
 *
 * **Breaking change**: Now requires workflow parameter.
 *
 * @param network - Network name
 * @param workflow - Workflow type
 * @param timestamp - Deployment timestamp
 * @returns Deployment output data
 * @throws Error if deployment file not found or invalid JSON
 *
 * @example
 * ```typescript
 * import { loadDeployment } from '@scripts/infrastructure'
 *
 * const deployment = await loadDeployment(
 *   'hedera-testnet',
 *   'newBlr',
 *   '2025-01-09T14-30-45'
 * )
 *
 * console.log(`BLR Proxy: ${deployment.infrastructure.blr.proxy}`)
 * ```
 */
export async function loadDeployment(
  network: string,
  workflow: WorkflowType,
  timestamp: string,
): Promise<AnyDeploymentOutput> {
  const networkDir = getNetworkDeploymentDir(network);
  const filename = generateDeploymentFilename(workflow, timestamp);
  const filepath = join(networkDir, filename);

  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as AnyDeploymentOutput;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Deployment file not found: ${filename}`);
    }
    throw new Error(`Failed to load deployment ${filename}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load a deployment output from disk with flexible options.
 *
 * @param options - Load options (can specify network + workflow or full timestamp)
 * @returns Deployment output data, or null if not found
 *
 * @example
 * ```typescript
 * import { loadDeploymentByWorkflow } from '@scripts/infrastructure'
 *
 * // Load latest deployment for a workflow
 * const output = await loadDeploymentByWorkflow({
 *   network: 'hedera-testnet',
 *   workflow: 'newBlr',
 *   useLast: true,
 * })
 *
 * if (output) {
 *   console.log(`Loaded deployment: ${output.timestamp}`)
 * }
 * ```
 */
export async function loadDeploymentByWorkflow<T = AnyDeploymentOutput>(
  options: LoadDeploymentOptions,
): Promise<T | null> {
  try {
    const { network, workflow, timestamp, useLast } = options;

    if (timestamp && workflow) {
      return (await loadDeployment(network, workflow, timestamp)) as T;
    }

    if (useLast && workflow) {
      const latest = await findLatestDeployment(network, workflow);
      return (latest as T) || null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Find the latest deployment for a network and workflow type.
 *
 * **Breaking change**: Now requires workflow parameter.
 *
 * @param network - Network name
 * @param workflow - Workflow type
 * @returns Latest deployment output, or null if none found
 *
 * @example
 * ```typescript
 * import { findLatestDeployment } from '@scripts/infrastructure'
 *
 * const latest = await findLatestDeployment('hedera-testnet', 'newBlr')
 *
 * if (latest) {
 *   console.log(`Latest: ${latest.timestamp}`)
 * }
 * ```
 */
export async function findLatestDeployment(
  network: string,
  workflow: WorkflowType,
): Promise<AnyDeploymentOutput | null> {
  const files = await listDeploymentsByWorkflow(network, workflow);

  if (files.length === 0) {
    return null;
  }

  const networkDir = getNetworkDeploymentDir(network);
  const latestFile = files[0];
  const filepath = join(networkDir, latestFile);

  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as AnyDeploymentOutput;
  } catch {
    return null;
  }
}

/**
 * List all deployment files for a network and optional workflow type.
 *
 * Returns filenames sorted by timestamp (newest first).
 *
 * @param network - Network name
 * @param workflow - Optional workflow type to filter by
 * @returns Array of filenames, sorted newest first
 *
 * @example
 * ```typescript
 * import { listDeploymentsByWorkflow } from '@scripts/infrastructure'
 *
 * const files = await listDeploymentsByWorkflow('hedera-testnet', 'newBlr')
 *
 * console.log(`Found ${files.length} newBlr deployments`)
 * ```
 */
export async function listDeploymentsByWorkflow(network: string, workflow?: WorkflowType): Promise<string[]> {
  const networkDir = getNetworkDeploymentDir(network);

  try {
    const files = await fs.readdir(networkDir);

    // Filter by workflow if specified
    let filtered = files.filter((file) => file.endsWith(".json") && !file.startsWith("."));

    if (workflow) {
      const workflowName = WORKFLOW_DESCRIPTORS[workflow];
      filtered = filtered.filter((file) => file.startsWith(`${workflowName}-`));
    }

    // Sort by timestamp descending (newest first)
    return filtered.sort().reverse();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * List all deployment files across all workflows for a network.
 *
 * @param network - Network name
 * @returns Array of filenames from all workflows, sorted newest first
 * @deprecated Use listDeploymentsByWorkflow() instead
 *
 * @example
 * ```typescript
 * import { listDeploymentFiles } from '@scripts/infrastructure'
 *
 * const all = await listDeploymentFiles('hedera-testnet')
 * console.log(`Total deployments: ${all.length}`)
 * ```
 */
export async function listDeploymentFiles(network: string): Promise<string[]> {
  return listDeploymentsByWorkflow(network);
}
