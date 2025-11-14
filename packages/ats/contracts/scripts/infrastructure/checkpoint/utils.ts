// SPDX-License-Identifier: Apache-2.0

/**
 * Checkpoint utilities for deployment workflows.
 *
 * Helper functions for converting checkpoints, formatting status,
 * and mapping step numbers to names.
 *
 * @module infrastructure/checkpoint/utils
 */

import type { DeploymentCheckpoint } from "../types/checkpoint";
import type { DeploymentOutput } from "../../workflows/deploySystemWithNewBlr";

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
export function checkpointToDeploymentOutput(checkpoint: DeploymentCheckpoint): DeploymentOutput {
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
  if (!steps.configurations?.equity || !steps.configurations?.bond) {
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
  const deploymentTime = endTime - start;

  // Calculate total gas used (sum from all deployments)
  let totalGasUsed = 0;
  if (steps.proxyAdmin.gasUsed) totalGasUsed += parseInt(steps.proxyAdmin.gasUsed);
  if (steps.blr.gasUsed) totalGasUsed += parseInt(steps.blr.gasUsed);
  if (steps.factory.gasUsed) totalGasUsed += parseInt(steps.factory.gasUsed);
  for (const facet of steps.facets.values()) {
    if (facet.gasUsed) totalGasUsed += parseInt(facet.gasUsed);
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
        proxy: steps.blr.proxy,
        contractId: steps.blr.contractId,
      },
      factory: {
        implementation: steps.factory.implementation,
        proxy: steps.factory.proxy,
        contractId: steps.factory.contractId,
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
    },

    summary: {
      totalContracts: 3 + steps.facets.size, // ProxyAdmin + BLR + Factory + facets
      totalFacets: steps.facets.size,
      totalConfigurations: 2,
      deploymentTime,
      gasUsed: totalGasUsed.toString(),
      success: checkpoint.status === "completed",
    },

    helpers: {
      getEquityFacets: () => [],
      getBondFacets: () => [],
    },
  };
}

/**
 * Get human-readable step name for a step number.
 *
 * Used for logging and error messages.
 *
 * @param step - Step number (0-6 for newBlr workflow, 0-5 for existingBlr)
 * @param workflowType - Workflow type for context
 * @returns Step name
 *
 * @example
 * ```typescript
 * const stepName = getStepName(2, 'newBlr') // Returns "Facets"
 * console.log(`Failed at step: ${stepName}`)
 * ```
 */
export function getStepName(step: number, workflowType: "newBlr" | "existingBlr" = "newBlr"): string {
  if (workflowType === "newBlr") {
    switch (step) {
      case 0:
        return "ProxyAdmin";
      case 1:
        return "BLR";
      case 2:
        return "Facets";
      case 3:
        return "Register Facets";
      case 4:
        return "Equity Configuration";
      case 5:
        return "Bond Configuration";
      case 6:
        return "Factory";
      default:
        return `Unknown Step ${step}`;
    }
  } else {
    // existingBlr workflow
    switch (step) {
      case 0:
        return "ProxyAdmin (Optional)";
      case 1:
        return "Facets";
      case 2:
        return "Register Facets";
      case 3:
        return "Equity Configuration";
      case 4:
        return "Bond Configuration";
      case 5:
        return "Factory";
      default:
        return `Unknown Step ${step}`;
    }
  }
}

/**
 * Get total number of steps for a workflow.
 *
 * @param workflowType - Workflow type
 * @returns Total number of steps
 */
export function getTotalSteps(workflowType: "newBlr" | "existingBlr" = "newBlr"): number {
  return workflowType === "newBlr" ? 7 : 6;
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
