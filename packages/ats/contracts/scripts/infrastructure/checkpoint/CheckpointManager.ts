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
import type { DeploymentCheckpoint, CheckpointStatus } from "../types/checkpoint";

/**
 * Parameters for creating a new checkpoint.
 */
export interface CreateCheckpointParams {
  network: string;
  deployer: string;
  workflowType: "newBlr" | "existingBlr";
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
   * @param checkpointsDir - Optional custom checkpoints directory path
   */
  constructor(checkpointsDir?: string) {
    // Default: deployments/.checkpoints relative to this file
    // scripts/infrastructure/checkpoint/CheckpointManager.ts -> ../../../deployments/.checkpoints
    this.checkpointsDir = checkpointsDir || join(__dirname, "../../../deployments/.checkpoints");
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
    const timestamp = Date.now();

    return {
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
      const json = JSON.stringify(checkpoint, this.mapReplacer, 2);

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
   * const checkpoint = await manager.loadCheckpoint('hedera-testnet-1731085200000')
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
      return JSON.parse(content, this.mapReviver) as DeploymentCheckpoint;
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
      // Ensure directory exists
      await fs.mkdir(this.checkpointsDir, { recursive: true });

      const files = await fs.readdir(this.checkpointsDir);

      // Filter files matching network pattern: network-timestamp.json
      const networkFiles = files.filter((file) => file.startsWith(`${network}-`) && file.endsWith(".json"));

      // Load all matching checkpoints
      const checkpoints: DeploymentCheckpoint[] = [];
      for (const file of networkFiles) {
        const checkpointId = file.replace(".json", "");
        const checkpoint = await this.loadCheckpoint(checkpointId);

        if (checkpoint) {
          // Apply status filter if provided
          if (!status || checkpoint.status === status) {
            checkpoints.push(checkpoint);
          }
        }
      }

      // Sort by timestamp (newest first)
      // Extract timestamp from checkpointId: network-timestamp
      return checkpoints.sort((a, b) => {
        const tsA = parseInt(a.checkpointId.split("-").pop() || "0");
        const tsB = parseInt(b.checkpointId.split("-").pop() || "0");
        return tsB - tsA; // Descending order
      });
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
      // Extract timestamp from checkpointId
      const timestamp = parseInt(checkpoint.checkpointId.split("-").pop() || "0");

      if (timestamp < cutoffTime) {
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
  private mapReplacer(key: string, value: unknown): unknown {
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
  private mapReviver(key: string, value: unknown): unknown {
    if (typeof value === "object" && value !== null && "__type" in value && value.__type === "Map") {
      const mapValue = value as { __value: Array<[string, unknown]> };
      return new Map(mapValue.__value);
    }
    return value;
  }
}
