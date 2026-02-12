// SPDX-License-Identifier: Apache-2.0

/**
 * Checkpoint utilities for deployment workflows.
 *
 * Helper functions for converting checkpoints, formatting status,
 * mapping step numbers to names, and user confirmation prompts.
 *
 * @module infrastructure/checkpoint/utils
 */

import * as readline from "readline";
import type { DeploymentCheckpoint, DeploymentOutputType, WorkflowType } from "@scripts/infrastructure";
import type { CheckpointManager } from "./CheckpointManager";
import { warn, info } from "../utils/logging";

/**
 * Workflow step definitions for all supported workflows.
 * Single source of truth for step names and counts.
 */
const WORKFLOW_STEPS: Record<string, readonly string[]> = {
  newBlr: [
    "ProxyAdmin",
    "BLR",
    "Facets",
    "Register Facets",
    "Equity Configuration",
    "Bond Configuration",
    "Bond Fixed Rate Configuration",
    "Bond KpiLinked Rate Configuration",
    "Bond SPT Rate Configuration",
    "Factory",
  ] as const, // 10 steps (0-9)
  existingBlr: [
    "ProxyAdmin (Optional)",
    "Facets",
    "Register Facets",
    "Equity Configuration",
    "Bond Configuration",
    "Bond Fixed Rate Configuration",
    "Bond KpiLinked Rate Configuration",
    "Bond SPT Rate Configuration",
    "Factory",
  ] as const, // 9 steps (0-8)
  upgradeConfigurations: [
    "Facets",
    "Register Facets",
    "Equity Configuration",
    "Bond Configuration",
    "Proxy Updates",
  ] as const,
  upgradeTupProxies: [
    "Validate",
    "Deploy Implementations",
    "Verify Implementations",
    "Upgrade Proxies",
    "Verify Upgrades",
  ] as const,
};

/**
 * Safely parse gas string to number, returning 0 for invalid values.
 *
 * @param value - Gas value as string or undefined
 * @returns Parsed gas value or 0 if invalid
 */
function safeParseGas(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert checkpoint to DeploymentOutput format.
 *
 * Used when a deployment completes (from checkpoint or fresh) to
 * produce the standard deployment output format.
 *
 * @param checkpoint - Completed deployment checkpoint
 * @returns Deployment output in standard format
 * @throws Error if checkpoint is not completed or missing required data
 *
 * @example
 * ```typescript
 * // After successful deployment
 * checkpoint.status = 'completed'
 * const output = checkpointToDeploymentOutput(checkpoint)
 * ```
 */
export function checkpointToDeploymentOutput(checkpoint: DeploymentCheckpoint): DeploymentOutputType {
  const { steps, network, deployer, startTime } = checkpoint;

  // Validate required steps
  if (!steps.proxyAdmin) {
    throw new Error("Checkpoint missing ProxyAdmin deployment");
  }
  if (!steps.blr) {
    throw new Error("Checkpoint missing BLR deployment");
  }
  if (!steps.factory) {
    throw new Error("Checkpoint missing Factory deployment");
  }
  if (!steps.facets || steps.facets.size === 0) {
    throw new Error("Checkpoint missing facet deployments");
  }
  if (
    !steps.configurations?.equity ||
    !steps.configurations?.bond ||
    !steps.configurations?.bondFixedRate ||
    !steps.configurations?.bondKpiLinkedRate ||
    !steps.configurations?.bondSustainabilityPerformanceTargetRate
  ) {
    throw new Error("Checkpoint missing configurations");
  }

  // Convert facets Map to array format
  const facetsArray = Array.from(steps.facets.entries()).map(([name, deployed]) => ({
    name,
    address: deployed.address,
    contractId: deployed.contractId,
    key: "", // Will be populated from registry in actual workflow
  }));

  // Calculate deployment time
  const endTime = new Date(checkpoint.lastUpdate).getTime();
  const start = new Date(startTime).getTime();

  // Calculate total gas used (sum from all deployments)
  let totalGasUsed = 0;
  totalGasUsed += safeParseGas(steps.proxyAdmin.gasUsed);
  totalGasUsed += safeParseGas(steps.blr.gasUsed);
  totalGasUsed += safeParseGas(steps.factory.gasUsed);
  for (const facet of steps.facets.values()) {
    totalGasUsed += safeParseGas(facet.gasUsed);
  }

  return {
    network,
    timestamp: new Date(endTime).toISOString(),
    deployer,

    infrastructure: {
      proxyAdmin: {
        address: steps.proxyAdmin.address,
        contractId: steps.proxyAdmin.contractId,
      },
      blr: {
        implementation: steps.blr.implementation,
        implementationContractId: steps.blr.implementationContractId,
        proxy: steps.blr.proxy,
        proxyContractId: steps.blr.proxyContractId,
      },
      factory: {
        implementation: steps.factory.implementation,
        implementationContractId: steps.factory.implementationContractId,
        proxy: steps.factory.proxy,
        proxyContractId: steps.factory.proxyContractId,
      },
    },

    facets: facetsArray,

    configurations: {
      equity: {
        configId: steps.configurations.equity.configId,
        version: steps.configurations.equity.version,
        facetCount: steps.configurations.equity.facetCount,
        facets: [], // Will be populated in actual workflow
      },
      bond: {
        configId: steps.configurations.bond.configId,
        version: steps.configurations.bond.version,
        facetCount: steps.configurations.bond.facetCount,
        facets: [], // Will be populated in actual workflow
      },
      bondFixedRate: {
        configId: steps.configurations.bondFixedRate.configId,
        version: steps.configurations.bondFixedRate.version,
        facetCount: steps.configurations.bondFixedRate.facetCount,
        facets: [], // Will be populated in actual workflow
      },
      bondKpiLinkedRate: {
        configId: steps.configurations.bondKpiLinkedRate.configId,
        version: steps.configurations.bondKpiLinkedRate.version,
        facetCount: steps.configurations.bondKpiLinkedRate.facetCount,
        facets: [], // Will be populated in actual workflow
      },
      bondSustainabilityPerformanceTargetRate: {
        configId: steps.configurations.bondSustainabilityPerformanceTargetRate.configId,
        version: steps.configurations.bondSustainabilityPerformanceTargetRate.version,
        facetCount: steps.configurations.bondSustainabilityPerformanceTargetRate.facetCount,
        facets: [], // Will be populated in actual workflow
      },
    },

    summary: {
      totalContracts: 3 + steps.facets.size, // ProxyAdmin + BLR + Factory + facets
      totalFacets: steps.facets.size,
      totalConfigurations: steps.configurations ? Object.keys(steps.configurations).length : 0,
      deploymentTime: endTime - start,
      gasUsed: totalGasUsed.toString(),
      success: checkpoint.status === "completed",
    },

    helpers: {
      getEquityFacets: () => [],
      getBondFacets: () => [],
      getBondFixedRateFacets: () => [],
      getBondKpiLinkedRateFacets: () => [],
      getBondSustainabilityPerformanceTargetRateFacets: () => [],
    },
  };
}

/**
 * Get human-readable step name for a step number.
 *
 * Used for logging and error messages.
 *
 * @param step - Step number
 * @param workflowType - Workflow type for context
 * @returns Step name
 *
 * @example
 * ```typescript
 * const stepName = getStepName(2, 'newBlr') // Returns "Facets"
 * console.log(`Failed at step: ${stepName}`)
 * ```
 */
export function getStepName(step: number, workflowType: WorkflowType = "newBlr"): string {
  const steps = WORKFLOW_STEPS[workflowType] ?? WORKFLOW_STEPS.newBlr;
  return steps[step] ?? `Unknown Step ${step}`;
}

/**
 * Get total number of steps for a workflow.
 *
 * @param workflowType - Workflow type
 * @returns Total number of steps
 */
export function getTotalSteps(workflowType: WorkflowType = "newBlr"): number {
  const steps = WORKFLOW_STEPS[workflowType] ?? WORKFLOW_STEPS.newBlr;
  return steps.length;
}

/**
 * Format checkpoint status for logging.
 *
 * Creates a human-readable summary of checkpoint state.
 *
 * @param checkpoint - Checkpoint to format
 * @returns Formatted status string
 *
 * @example
 * ```typescript
 * const status = formatCheckpointStatus(checkpoint)
 * console.log(status)
 * // Output:
 * // Checkpoint: hedera-testnet-1731085200000
 * // Status: in-progress
 * // Step: 3/7 - Register Facets
 * // Started: 2025-11-08T10:30:00Z
 * ```
 */
export function formatCheckpointStatus(checkpoint: DeploymentCheckpoint): string {
  const totalSteps = getTotalSteps(checkpoint.workflowType);
  const currentStepName = getStepName(checkpoint.currentStep, checkpoint.workflowType);

  const lines = [
    `Checkpoint: ${checkpoint.checkpointId}`,
    `Status: ${checkpoint.status}`,
    `Step: ${checkpoint.currentStep + 1}/${totalSteps} - ${currentStepName}`,
    `Started: ${checkpoint.startTime}`,
    `Last Update: ${checkpoint.lastUpdate}`,
  ];

  if (checkpoint.failure) {
    lines.push(`Failed: ${checkpoint.failure.error}`);
  }

  return lines.join("\n");
}

/**
 * Format time duration in human-readable format.
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(65000)  // "1m 5s"
 * formatDuration(3661000)  // "1h 1m 1s"
 * ```
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const m = minutes % 60;
    const s = seconds % 60;
    return `${hours}h ${m}m ${s}s`;
  } else if (minutes > 0) {
    const s = seconds % 60;
    return `${minutes}m ${s}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format timestamp for display.
 *
 * @param isoString - ISO 8601 timestamp string
 * @returns Formatted timestamp
 *
 * @example
 * ```typescript
 * formatTimestamp('2025-11-08T10:30:45.123Z')
 * // Returns: "2025-11-08 10:30:45"
 * ```
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace("T", " ").split(".")[0];
}

// ============================================================================
// User Confirmation Utilities for Checkpoint Resume
// ============================================================================

/**
 * Prompt user to confirm resuming from a failed checkpoint.
 *
 * In non-interactive mode (CI), respects AUTO_RESUME environment variable:
 * - If AUTO_RESUME=true, auto-resume with warning
 * - Otherwise, starts fresh deployment (safe default for CI)
 * In interactive mode, shows failure details and prompts for confirmation.
 *
 * @param checkpoint - Failed checkpoint to potentially resume from
 * @returns Promise resolving to true if user confirms resume, false otherwise
 *
 * @example
 * ```typescript
 * if (checkpoint.status === 'failed') {
 *   const shouldResume = await confirmFailedCheckpointResume(checkpoint);
 *   if (!shouldResume) {
 *     info("User declined to resume. Starting fresh deployment.");
 *     checkpoint = null;
 *   }
 * }
 * ```
 */
export async function confirmFailedCheckpointResume(checkpoint: DeploymentCheckpoint): Promise<boolean> {
  // Non-interactive mode (CI) - respect AUTO_RESUME environment variable
  if (!process.stdin.isTTY) {
    if (process.env.AUTO_RESUME === "true") {
      warn("Non-interactive mode: auto-resuming from failed checkpoint (AUTO_RESUME=true)");
      return true;
    }
    warn("Non-interactive mode: starting fresh deployment (set AUTO_RESUME=true to auto-resume)");
    return false;
  }

  info("\n" + "═".repeat(60));
  warn("⚠️  FOUND FAILED DEPLOYMENT");
  info("═".repeat(60));
  info(`Checkpoint: ${checkpoint.checkpointId}`);
  info(`Started:    ${checkpoint.startTime}`);
  if (checkpoint.failure) {
    info(`Failed at:  Step ${checkpoint.failure.step} (${checkpoint.failure.stepName})`);
    info(`Error:      ${checkpoint.failure.error}`);
    info(`Time:       ${checkpoint.failure.timestamp}`);
  }
  info("═".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("\nResume from this failed checkpoint? [Y/n]: ", (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      // Accept empty (default yes), 'y', 'yes'
      resolve(normalized === "" || normalized === "y" || normalized === "yes");
    });
  });
}

/**
 * Prompt user to select which checkpoint to resume from when multiple exist.
 *
 * In non-TTY environments, returns the newest checkpoint (first in sorted list).
 * In interactive mode, shows a selection menu with checkpoint details.
 *
 * @param checkpoints - Array of resumable checkpoints (sorted newest first)
 * @returns Promise resolving to selected checkpoint, or null to start fresh
 *
 * @example
 * ```typescript
 * const resumable = await checkpointManager.findResumableCheckpoints(network);
 * if (resumable.length > 1) {
 *   const selected = await selectCheckpointToResume(resumable);
 *   if (!selected) {
 *     info("Starting fresh deployment.");
 *   }
 * }
 * ```
 */
export async function selectCheckpointToResume(
  checkpoints: DeploymentCheckpoint[],
): Promise<DeploymentCheckpoint | null> {
  if (checkpoints.length === 0) {
    return null;
  }

  // Non-interactive: return newest
  if (!process.stdin.isTTY) {
    info("Non-interactive mode: selecting newest checkpoint");
    return checkpoints[0];
  }

  info("\n" + "═".repeat(60));
  info("📋 MULTIPLE CHECKPOINTS FOUND");
  info("═".repeat(60));

  checkpoints.forEach((cp, i) => {
    const status = cp.status === "failed" ? "❌ FAILED" : "⏳ In Progress";
    const stepName = getStepName(cp.currentStep, cp.workflowType);
    info(`\n[${i + 1}] ${cp.checkpointId}`);
    info(`    Status: ${status}`);
    info(`    Step:   ${cp.currentStep + 1} - ${stepName}`);
    info(`    Started: ${formatTimestamp(cp.startTime)}`);
    if (cp.failure) {
      info(`    Error:  ${cp.failure.error}`);
    }
  });

  info(`\n[0] Start fresh deployment`);
  info("═".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("\nSelect checkpoint to resume (default: 1): ", (answer) => {
      rl.close();
      const trimmed = answer.trim() || "1";
      const num = parseInt(trimmed);
      if (num === 0) {
        resolve(null); // Intentional fresh start
      } else if (isNaN(num) || num < 0 || num > checkpoints.length) {
        warn(`Invalid selection: "${trimmed}". Starting fresh deployment.`);
        resolve(null);
      } else {
        resolve(checkpoints[num - 1]);
      }
    });
  });
}

/**
 * Resolve a checkpoint for resume from a workflow.
 *
 * Encapsulates the common pattern of finding resumable checkpoints,
 * selecting one (if multiple), confirming failed checkpoints, and
 * preparing for resume.
 *
 * @param manager - Checkpoint manager instance
 * @param network - Network name
 * @param workflowType - Workflow type to filter by
 * @returns Resolved checkpoint ready for resume, or null to start fresh
 *
 * @example
 * ```typescript
 * const resolved = await resolveCheckpointForResume(checkpointManager, network, "newBlr");
 * if (resolved) {
 *   info(`Resuming from: ${resolved.checkpointId}`);
 *   checkpoint = resolved;
 * }
 * ```
 */
export async function resolveCheckpointForResume(
  manager: CheckpointManager,
  network: string,
  workflowType: WorkflowType,
): Promise<DeploymentCheckpoint | null> {
  const resumable = await manager.findResumableCheckpoints(network, workflowType);
  if (resumable.length === 0) return null;

  let selected: DeploymentCheckpoint | null =
    resumable.length > 1 ? await selectCheckpointToResume(resumable) : resumable[0];

  if (!selected) return null;

  if (selected.status === "failed") {
    const shouldResume = await confirmFailedCheckpointResume(selected);
    if (!shouldResume) {
      info("User declined to resume. Starting fresh deployment.");
      return null;
    }
  }

  await manager.prepareForResume(selected);
  return selected;
}
