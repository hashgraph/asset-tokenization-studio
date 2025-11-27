// SPDX-License-Identifier: Apache-2.0

/**
 * Null checkpoint manager for test environments.
 *
 * Provides no-op implementations of checkpoint operations to eliminate
 * filesystem I/O overhead during test execution. All checkpoint state is
 * maintained in memory only.
 *
 * Use this manager when `ignoreCheckpoint: true` is specified in deployment
 * options to prevent unnecessary disk writes and improve test performance.
 *
 * @module infrastructure/checkpoint/NullCheckpointManager
 */

import type { DeploymentCheckpoint, CheckpointStatus } from "../types/checkpoint";
import { CheckpointManager } from "./CheckpointManager";

/**
 * No-op checkpoint manager for test environments.
 *
 * Extends CheckpointManager but overrides all filesystem operations to be
 * no-ops. Checkpoints are created in memory but never persisted to disk.
 *
 * **Performance Benefits:**
 * - Eliminates filesystem I/O during test execution
 * - Prevents checkpoint file accumulation
 * - Avoids race conditions in parallel test execution
 * - Reduces test initialization overhead by ~500-1000ms per test
 *
 * @example
 * ```typescript
 * // In deployment workflow
 * const checkpointManager = ignoreCheckpoint
 *   ? new NullCheckpointManager()
 *   : new CheckpointManager(checkpointDir);
 *
 * // Checkpoint operations work but don't touch filesystem
 * const checkpoint = checkpointManager.createCheckpoint({ ... });
 * await checkpointManager.saveCheckpoint(checkpoint); // No-op
 * ```
 */
export class NullCheckpointManager extends CheckpointManager {
  /**
   * Create a null checkpoint manager.
   *
   * Directory parameter is accepted for API compatibility but ignored.
   */
  constructor(checkpointsDir?: string) {
    super(checkpointsDir);
  }

  /**
   * No-op save operation.
   *
   * Checkpoint is not written to disk. This eliminates filesystem I/O
   * overhead during test execution while maintaining API compatibility.
   *
   * @param checkpoint - Checkpoint to save (ignored)
   */
  async saveCheckpoint(checkpoint: DeploymentCheckpoint): Promise<void> {
    // No-op - don't write to disk
    // Update lastUpdate for consistency with in-memory state
    checkpoint.lastUpdate = new Date().toISOString();
  }

  /**
   * Always returns null (no checkpoints exist on disk).
   *
   * @param _checkpointId - Checkpoint ID to load (ignored)
   * @returns null (checkpoints are never persisted)
   */
  async loadCheckpoint(_checkpointId: string): Promise<DeploymentCheckpoint | null> {
    return null; // No checkpoints exist
  }

  /**
   * Always returns empty array (no checkpoints exist on disk).
   *
   * @param _network - Network name (ignored)
   * @param _status - Status filter (ignored)
   * @returns Empty array (no checkpoints to find)
   */
  async findCheckpoints(_network: string, _status?: CheckpointStatus): Promise<DeploymentCheckpoint[]> {
    return []; // No checkpoints exist
  }

  /**
   * No-op delete operation.
   *
   * @param _checkpointId - Checkpoint ID to delete (ignored)
   */
  async deleteCheckpoint(_checkpointId: string): Promise<void> {
    // No-op - nothing to delete
  }

  /**
   * No-op cleanup operation.
   *
   * @param _network - Network name (ignored)
   * @param _daysToKeep - Days to keep (ignored)
   * @returns 0 (no checkpoints to clean up)
   */
  async cleanupOldCheckpoints(_network: string, _daysToKeep?: number): Promise<number> {
    return 0; // No checkpoints to clean up
  }
}
