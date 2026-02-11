// SPDX-License-Identifier: Apache-2.0

/**
 * Checkpoint manager for deployment state tracking and resumability.
 *
 * Manages checkpoint lifecycle: creation, saving, loading, and cleanup.
 * Handles Map serialization/deserialization for facet tracking.
 *
 * @module infrastructure/checkpoint/CheckpointManager
 */

import { promises as fs } from "fs";
import { join } from "path";
// Import directly from source files to avoid circular dependency with NullCheckpointManager
// (barrel export @scripts/infrastructure includes NullCheckpointManager which imports CheckpointManager)
import type { DeploymentCheckpoint, CheckpointStatus, WorkflowType } from "../types/checkpoint";
import { CHECKPOINT_SCHEMA_VERSION } from "../types/checkpoint";
import { warn, info } from "../utils/logging";
import { getDeploymentsDir, getCheckpointsDir, getTestCheckpointsDir } from "../paths";
import { generateTimestamp } from "../utils/time";

/**
 * Parameters for creating a new checkpoint.
 */
export interface CreateCheckpointParams {
  network: string;
  deployer: string;
  workflowType: WorkflowType;
  options: Record<string, unknown>;
}

/**
 * Checkpoint manager for handling deployment state persistence.
 *
 * Provides methods for creating, saving, loading, and managing checkpoints
 * throughout the deployment lifecycle.
 */
export class CheckpointManager {
  private checkpointsDir: string;

  /**
   * Create a checkpoint manager instance.
   *
   * @param network - Network name for network-specific checkpoint directories
   * @param checkpointsDir - Optional custom checkpoints directory path (overrides network-based path)
   */
  constructor(network?: string, checkpointsDir?: string) {
    // Determine checkpoint directory:
    // 1. If checkpointsDir is provided, use it (explicit override)
    // 2. If network is "hardhat", use deployments/test/hardhat/.checkpoints (test isolation)
    // 3. If network is provided, use deployments/{network}/.checkpoints
    // 4. Otherwise, fall back to deployments/.checkpoints (backward compatibility)
    if (checkpointsDir) {
      this.checkpointsDir = checkpointsDir;
    } else if (network === "hardhat") {
      // Test isolation: hardhat network always uses test checkpoint directory
      this.checkpointsDir = getTestCheckpointsDir("hardhat");
    } else if (network) {
      this.checkpointsDir = getCheckpointsDir(network);
    } else {
      this.checkpointsDir = join(getDeploymentsDir(), ".checkpoints");
    }

    // Warn if checkpoint directory is inside node_modules (will be deleted on npm install)
    if (this.checkpointsDir.includes("node_modules")) {
      warn("⚠️  Checkpoint directory is inside node_modules and will be deleted on npm install/ci.");
      warn(`   Current path: ${this.checkpointsDir}`);
      warn(`   Recommended: Specify a persistent directory using the 'checkpointDir' option.`);
      warn(`   Example: { checkpointDir: './deployments/.checkpoints' }`);
    }
  }

  /**
   * Create a new checkpoint.
   *
   * @param params - Checkpoint creation parameters
   * @returns New checkpoint with initial state
   *
   * @example
   * ```typescript
   * const manager = new CheckpointManager()
   * const checkpoint = manager.createCheckpoint({
   *   network: 'hedera-testnet',
   *   deployer: '0x123...',
   *   workflowType: 'newBlr',
   *   options: { useTimeTravel: false }
   * })
   * ```
   */
  createCheckpoint(params: CreateCheckpointParams): DeploymentCheckpoint {
    const { network, deployer, workflowType, options } = params;
    const now = new Date().toISOString();
    const timestamp = generateTimestamp();

    return {
      schemaVersion: CHECKPOINT_SCHEMA_VERSION,
      checkpointId: `${network}-${timestamp}`,
      network,
      deployer,
      status: "in-progress",
      currentStep: -1, // Will be set to 0 when first step completes
      workflowType,
      startTime: now,
      lastUpdate: now,
      steps: {},
      options,
    };
  }

  /**
   * Save checkpoint to disk.
   *
   * Creates checkpoint directory if it doesn't exist.
   * Serializes Map fields to JSON using custom replacer.
   *
   * @param checkpoint - Checkpoint to save
   * @throws Error if save fails
   *
   * @example
   * ```typescript
   * checkpoint.steps.proxyAdmin = { address: '0x...', txHash: '0x...', deployedAt: '...' }
   * await manager.saveCheckpoint(checkpoint)
   * ```
   */
  async saveCheckpoint(checkpoint: DeploymentCheckpoint): Promise<void> {
    try {
      // Ensure checkpoints directory exists
      await fs.mkdir(this.checkpointsDir, { recursive: true });

      // Update last update time
      checkpoint.lastUpdate = new Date().toISOString();

      // Build filename: network-timestamp.json
      const filename = `${checkpoint.checkpointId}.json`;
      const filepath = join(this.checkpointsDir, filename);

      // Serialize with Map support
      const json = JSON.stringify(checkpoint, CheckpointManager.mapReplacer, 2);

      // Write to file
      await fs.writeFile(filepath, json, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save checkpoint ${checkpoint.checkpointId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load checkpoint by ID.
   *
   * Deserializes Map fields from JSON using custom reviver.
   *
   * @param checkpointId - Checkpoint ID to load
   * @returns Loaded checkpoint, or null if not found
   *
   * @example
   * ```typescript
   * const checkpoint = await manager.loadCheckpoint('hedera-testnet-2025-02-04T10-15-30-456')
   * if (checkpoint) {
   *   console.log(`Loaded checkpoint from ${checkpoint.startTime}`)
   * }
   * ```
   */
  async loadCheckpoint(checkpointId: string): Promise<DeploymentCheckpoint | null> {
    try {
      const filename = `${checkpointId}.json`;
      const filepath = join(this.checkpointsDir, filename);

      const content = await fs.readFile(filepath, "utf-8");
      const checkpoint = JSON.parse(content, CheckpointManager.mapReviver) as DeploymentCheckpoint;

      // Validate and migrate schema if needed
      this.validateAndMigrateSchema(checkpoint);

      return checkpoint;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return null; // File not found
      }
      throw new Error(
        `Failed to load checkpoint ${checkpointId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Validate checkpoint schema version and apply migrations if needed.
   *
   * @param checkpoint - Checkpoint to validate and migrate
   * @throws Error if checkpoint schema version is newer than supported
   * @private
   */
  private validateAndMigrateSchema(checkpoint: DeploymentCheckpoint): void {
    // Handle legacy checkpoints (pre-versioning)
    if (!checkpoint.schemaVersion) {
      checkpoint.schemaVersion = 1;
      info(`Migrating legacy checkpoint ${checkpoint.checkpointId} to schema v1`);
    }

    // Check for unsupported future versions
    if (checkpoint.schemaVersion > CHECKPOINT_SCHEMA_VERSION) {
      throw new Error(
        `Checkpoint ${checkpoint.checkpointId} has schema version ${checkpoint.schemaVersion}, ` +
          `but this version of ATS only supports up to v${CHECKPOINT_SCHEMA_VERSION}. ` +
          `Please upgrade your @hashgraph/asset-tokenization-contracts package.`,
      );
    }

    // Apply migrations for older schemas
    if (checkpoint.schemaVersion < CHECKPOINT_SCHEMA_VERSION) {
      this.migrateCheckpoint(checkpoint);
    }
  }

  /**
   * Apply schema migrations to bring checkpoint up to current version.
   *
   * @param checkpoint - Checkpoint to migrate
   * @private
   */
  private migrateCheckpoint(checkpoint: DeploymentCheckpoint): void {
    // Version 1 -> 2 migration
    // Currently no structural changes needed, just update version
    if (checkpoint.schemaVersion === 1) {
      info(`Migrating checkpoint ${checkpoint.checkpointId} from v1 to v2`);
      checkpoint.schemaVersion = 2;
      // Future: Add any v1 -> v2 data transformations here
    }

    // Add more migrations as needed when CHECKPOINT_SCHEMA_VERSION increases
    // if (checkpoint.schemaVersion === 2) {
    //   checkpoint.schemaVersion = 3;
    //   // v2 -> v3 migrations
    // }
  }

  /**
   * Find checkpoints by network and optional status filter.
   *
   * Returns checkpoints sorted by timestamp (newest first).
   *
   * @param network - Network name to filter by
   * @param status - Optional status filter
   * @returns Array of matching checkpoints
   *
   * @example
   * ```typescript
   * // Find all in-progress checkpoints for testnet
   * const inProgress = await manager.findCheckpoints('hedera-testnet', 'in-progress')
   *
   * // Find all checkpoints (any status)
   * const all = await manager.findCheckpoints('hedera-testnet')
   * ```
   */
  async findCheckpoints(network: string, status?: CheckpointStatus): Promise<DeploymentCheckpoint[]> {
    try {
      // Ensure checkpoints directory exists
      await fs.mkdir(this.checkpointsDir, { recursive: true });

      // Read all checkpoint files for this network
      const files = await fs.readdir(this.checkpointsDir);
      const networkFiles = files.filter((file) => file.startsWith(`${network}-`) && file.endsWith(".json"));

      const checkpoints: DeploymentCheckpoint[] = [];
      for (const file of networkFiles) {
        const checkpointPath = join(this.checkpointsDir, file);
        try {
          const content = await fs.readFile(checkpointPath, "utf-8");
          const checkpoint = JSON.parse(content, CheckpointManager.mapReviver) as DeploymentCheckpoint;

          // Validate and migrate schema for consistency with loadCheckpoint
          this.validateAndMigrateSchema(checkpoint);

          if (!status || checkpoint.status === status) {
            checkpoints.push(checkpoint);
          }
        } catch (err) {
          // Skip invalid checkpoint files
          continue;
        }
      }

      // Sort by lastUpdate field (newest first)
      return checkpoints.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return []; // Directory doesn't exist yet
      }
      throw new Error(`Failed to find checkpoints: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete checkpoint by ID.
   *
   * Does not throw if checkpoint doesn't exist.
   *
   * @param checkpointId - Checkpoint ID to delete
   *
   * @example
   * ```typescript
   * // Delete checkpoint after successful deployment
   * await manager.deleteCheckpoint(checkpoint.checkpointId)
   * ```
   */
  async deleteCheckpoint(checkpointId: string): Promise<void> {
    try {
      const filename = `${checkpointId}.json`;
      const filepath = join(this.checkpointsDir, filename);
      await fs.unlink(filepath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw new Error(
        `Failed to delete checkpoint ${checkpointId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find checkpoints that can be resumed (in-progress or failed).
   *
   * Returns checkpoints sorted by timestamp (newest first).
   * Used by workflows to auto-detect resumable deployments.
   *
   * @param network - Network name to filter by
   * @param workflowType - Optional workflow type filter
   * @returns Array of resumable checkpoints (in-progress and failed)
   *
   * @example
   * ```typescript
   * // Find all resumable checkpoints for testnet
   * const resumable = await manager.findResumableCheckpoints('hedera-testnet')
   *
   * // Find resumable checkpoints for specific workflow
   * const newBlrResumable = await manager.findResumableCheckpoints(
   *   'hedera-testnet',
   *   'newBlr'
   * )
   *
   * if (resumable.length > 0) {
   *   const checkpoint = resumable[0] // Newest
   *   if (checkpoint.status === 'failed') {
   *     // Prompt user to confirm resume from failed checkpoint
   *   }
   * }
   * ```
   */
  async findResumableCheckpoints(network: string, workflowType?: WorkflowType): Promise<DeploymentCheckpoint[]> {
    // Read all checkpoints once, then filter in memory
    const all = await this.findCheckpoints(network);
    let resumable = all.filter((cp) => cp.status === "in-progress" || cp.status === "failed");

    // Filter by workflow type if specified
    if (workflowType) {
      resumable = resumable.filter((cp) => cp.workflowType === workflowType);
    }

    // Already sorted by lastUpdate (newest first) from findCheckpoints
    return resumable;
  }

  /**
   * Prepare a checkpoint for resume.
   *
   * Resets status to in-progress and clears failure info.
   * Call this before resuming from a failed checkpoint.
   *
   * @param checkpoint - Checkpoint to prepare for resume
   *
   * @example
   * ```typescript
   * if (checkpoint.status === 'failed') {
   *   await manager.prepareForResume(checkpoint)
   *   // checkpoint.status is now 'in-progress'
   *   // checkpoint.failure is now undefined
   * }
   * ```
   */
  async prepareForResume(checkpoint: DeploymentCheckpoint): Promise<void> {
    if (checkpoint.status === "failed") {
      warn(`Clearing failure status from checkpoint: ${checkpoint.checkpointId}`);
      checkpoint.status = "in-progress";
      checkpoint.failure = undefined;
      await this.saveCheckpoint(checkpoint);
    }
  }

  /**
   * Clean up old completed checkpoints.
   *
   * Deletes completed checkpoints older than specified days.
   * Keeps failed checkpoints indefinitely for debugging.
   *
   * @param network - Network to clean up
   * @param daysToKeep - Number of days to keep completed checkpoints (default: 30)
   * @returns Number of checkpoints deleted
   *
   * @example
   * ```typescript
   * // Clean up completed checkpoints older than 30 days
   * const deleted = await manager.cleanupOldCheckpoints('hedera-testnet', 30)
   * console.log(`Deleted ${deleted} old checkpoints`)
   * ```
   */
  async cleanupOldCheckpoints(network: string, daysToKeep: number = 30): Promise<number> {
    const checkpoints = await this.findCheckpoints(network, "completed");
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    let deleted = 0;
    for (const checkpoint of checkpoints) {
      const lastUpdateTime = new Date(checkpoint.lastUpdate).getTime();

      if (lastUpdateTime < cutoffTime) {
        await this.deleteCheckpoint(checkpoint.checkpointId);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Custom JSON replacer for Map serialization.
   *
   * Converts Map objects to a special format that can be deserialized.
   *
   * @private
   */
  private static mapReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Map) {
      return {
        __type: "Map",
        __value: Array.from(value.entries()),
      };
    }
    return value;
  }

  /**
   * Custom JSON reviver for Map deserialization.
   *
   * Converts special Map format back to Map objects.
   *
   * @private
   */
  private static mapReviver(_key: string, value: unknown): unknown {
    if (typeof value === "object" && value !== null && "__type" in value && value.__type === "Map") {
      // First cast to unknown, then to the expected type to handle the conversion safely
      const mapValue = value as unknown as { __value: Array<[string, unknown]> };
      return new Map(mapValue.__value);
    }
    return value;
  }
}
