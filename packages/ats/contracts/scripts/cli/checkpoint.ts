#!/usr/bin/env tsx
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI tool for checkpoint management.
 *
 * Provides commands to list, inspect, reset, and cleanup deployment checkpoints.
 *
 * @module cli/checkpoint
 *
 * @example
 * ```bash
 * # List all checkpoints for a network
 * npm run checkpoint:list -- hedera-testnet
 *
 * # Show checkpoint details
 * npm run checkpoint:show -- hedera-testnet-1731085200000
 *
 * # Reset a failed checkpoint to in-progress
 * npm run checkpoint:reset -- hedera-testnet-1731085200000
 *
 * # Delete a specific checkpoint
 * npm run checkpoint:delete -- hedera-testnet-1731085200000
 *
 * # Clean up completed checkpoints older than 30 days
 * npm run checkpoint:cleanup -- hedera-testnet 30
 * ```
 */

import { CheckpointManager, formatCheckpointStatus, info, warn, error } from "@scripts/infrastructure";

/**
 * Extract network name from checkpoint ID.
 *
 * Checkpoint IDs have format: network-timestamp
 * Network may contain hyphens (e.g., hedera-testnet)
 * Timestamp can be ISO format (YYYY-MM-DDTHH-MM-SS) or legacy numeric format
 */
function extractNetworkFromId(checkpointId: string): string {
  // Match ISO timestamp at end: YYYY-MM-DDTHH-MM-SS
  const isoMatch = checkpointId.match(/^(.+)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/);
  if (isoMatch) {
    return isoMatch[1];
  }

  // Fallback: legacy format with numeric timestamp at end
  const parts = checkpointId.split("-");
  if (parts.length < 2) {
    throw new Error(`Invalid checkpoint ID format: ${checkpointId}`);
  }
  const timestampPart = parts[parts.length - 1];
  if (!/^\d+$/.test(timestampPart)) {
    throw new Error(`Invalid checkpoint ID format (unrecognized timestamp): ${checkpointId}`);
  }
  return parts.slice(0, -1).join("-");
}

/**
 * CLI Commands
 */
const commands = {
  /**
   * List all checkpoints for a network.
   */
  async list(network: string): Promise<void> {
    if (!network) {
      error("Usage: checkpoint list <network>");
      error("Example: checkpoint list hedera-testnet");
      process.exit(1);
    }

    const manager = new CheckpointManager(network);
    const all = await manager.findCheckpoints(network);

    if (all.length === 0) {
      info(`No checkpoints found for network: ${network}`);
      return;
    }

    info(`\nCheckpoints for ${network} (${all.length} total):\n`);
    info("═".repeat(70));

    for (const cp of all) {
      const statusIcon = cp.status === "completed" ? "✅" : cp.status === "failed" ? "❌" : "⏳";

      info(`\n${statusIcon} ${cp.checkpointId}`);
      info(`   Workflow: ${cp.workflowType}`);
      info(`   Status:   ${cp.status}`);
      info(`   Step:     ${cp.currentStep + 1}`);
      info(`   Started:  ${cp.startTime}`);
      info(`   Updated:  ${cp.lastUpdate}`);
      if (cp.failure) {
        info(`   Error:    ${cp.failure.error}`);
      }
    }

    info("\n" + "═".repeat(70));
  },

  /**
   * Show detailed checkpoint information.
   */
  async show(checkpointId: string): Promise<void> {
    if (!checkpointId) {
      error("Usage: checkpoint show <checkpoint-id>");
      error("Example: checkpoint show hedera-testnet-1731085200000");
      process.exit(1);
    }

    const network = extractNetworkFromId(checkpointId);
    const manager = new CheckpointManager(network);
    const cp = await manager.loadCheckpoint(checkpointId);

    if (!cp) {
      error(`Checkpoint not found: ${checkpointId}`);
      process.exit(1);
    }

    info("\n" + "═".repeat(70));
    info("CHECKPOINT DETAILS");
    info("═".repeat(70));
    info(formatCheckpointStatus(cp));
    info("\n--- Full JSON ---\n");
    // Use console.log for raw JSON output (not affected by logging library formatting)
    console.log(JSON.stringify(cp, replacer, 2));
    info("\n" + "═".repeat(70));
  },

  /**
   * Delete a specific checkpoint.
   */
  async delete(checkpointId: string): Promise<void> {
    if (!checkpointId) {
      error("Usage: checkpoint delete <checkpoint-id>");
      error("Example: checkpoint delete hedera-testnet-1731085200000");
      process.exit(1);
    }

    const network = extractNetworkFromId(checkpointId);
    const manager = new CheckpointManager(network);

    // Verify checkpoint exists
    const cp = await manager.loadCheckpoint(checkpointId);
    if (!cp) {
      error(`Checkpoint not found: ${checkpointId}`);
      process.exit(1);
    }

    await manager.deleteCheckpoint(checkpointId);
    info(`✅ Deleted checkpoint: ${checkpointId}`);
  },

  /**
   * Clean up old completed checkpoints.
   */
  async cleanup(network: string, daysStr: string): Promise<void> {
    if (!network || !daysStr) {
      error("Usage: checkpoint cleanup <network> <days>");
      error("Example: checkpoint cleanup hedera-testnet 30");
      process.exit(1);
    }

    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days < 1) {
      error("Days must be a positive integer");
      process.exit(1);
    }

    const manager = new CheckpointManager(network);
    const deleted = await manager.cleanupOldCheckpoints(network, days);

    if (deleted === 0) {
      info(`No completed checkpoints older than ${days} days found.`);
    } else {
      info(`✅ Deleted ${deleted} completed checkpoint(s) older than ${days} days.`);
    }
  },

  /**
   * Reset a failed checkpoint to in-progress status.
   */
  async reset(checkpointId: string): Promise<void> {
    if (!checkpointId) {
      error("Usage: checkpoint reset <checkpoint-id>");
      error("Example: checkpoint reset hedera-testnet-1731085200000");
      process.exit(1);
    }

    const network = extractNetworkFromId(checkpointId);
    const manager = new CheckpointManager(network);
    const cp = await manager.loadCheckpoint(checkpointId);

    if (!cp) {
      error(`Checkpoint not found: ${checkpointId}`);
      process.exit(1);
    }

    if (cp.status !== "failed") {
      warn(`Checkpoint is not in failed status (current status: ${cp.status})`);
      warn("Only failed checkpoints can be reset.");
      process.exit(1);
    }

    await manager.prepareForResume(cp);
    info(`✅ Reset checkpoint to in-progress: ${checkpointId}`);
    info(`   Previous failure: ${cp.failure?.error}`);
  },

  /**
   * Show help information.
   */
  help(): void {
    info(`
Checkpoint Management CLI

Usage: checkpoint <command> [arguments]

Commands:
  list <network>                   List all checkpoints for a network
  show <checkpoint-id>             Show detailed checkpoint information
  delete <checkpoint-id>           Delete a specific checkpoint
  cleanup <network> <days>         Delete completed checkpoints older than N days
  reset <checkpoint-id>            Reset a failed checkpoint to in-progress
  help                             Show this help message

Examples:
  checkpoint list hedera-testnet
  checkpoint show hedera-testnet-1731085200000
  checkpoint reset hedera-testnet-1731085200000
  checkpoint cleanup hedera-testnet 30
  checkpoint delete hedera-testnet-1731085200000
`);
  },
};

/**
 * JSON replacer for Map serialization in output.
 */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  return value;
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    commands.help();
    return;
  }

  const commandFn = commands[command as keyof typeof commands];
  if (!commandFn || typeof commandFn !== "function") {
    error(`Unknown command: ${command}`);
    info("Run 'checkpoint help' for usage information.");
    process.exit(1);
  }

  try {
    await (commandFn as (...args: string[]) => Promise<void>)(...args);
  } catch (err) {
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}

export { main, commands };
