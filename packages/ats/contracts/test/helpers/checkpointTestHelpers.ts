// SPDX-License-Identifier: Apache-2.0

/**
 * Test helper utilities for checkpoint resumability integration tests.
 *
 * Provides utilities for setting up test checkpoints, simulating failures,
 * and verifying checkpoint state in deployment workflow tests.
 *
 * @module test/helpers/checkpointTestHelpers
 */

import { promises as fs } from "fs";
import { join } from "path";
import type {
  DeploymentCheckpoint,
  DeployedContract,
  ConfigurationResult,
  WorkflowType,
} from "@scripts/infrastructure";
import { CheckpointManager, getStepName } from "@scripts/infrastructure";

/**
 * Create a pre-populated checkpoint with specific deployment state.
 *
 * Useful for testing resume logic without running full deployment.
 * Allows partial specification of checkpoint data; missing fields are initialized.
 *
 * @param manager - CheckpointManager instance to use for creation
 * @param partialData - Partial checkpoint data to merge with defaults
 * @returns Complete checkpoint object with merged state
 *
 * @example
 * ```typescript
 * // Create checkpoint with specific state
 * const checkpoint = await createCheckpointWithState(manager, {
 *   network: 'hedera-testnet',
 *   currentStep: 2,
 *   status: 'in-progress',
 *   steps: {
 *     proxyAdmin: {
 *       address: '0x1111111111111111111111111111111111111111',
 *       txHash: '0xabc123',
 *       deployedAt: new Date().toISOString()
 *     },
 *     blr: {
 *       implementation: '0x2222222222222222222222222222222222222222',
 *       proxy: '0x3333333333333333333333333333333333333333',
 *       txHash: '0xdef456',
 *       deployedAt: new Date().toISOString()
 *     }
 *   }
 * })
 *
 * // Verify checkpoint has expected data
 * console.log(checkpoint.currentStep) // 2
 * console.log(checkpoint.steps.proxyAdmin?.address) // 0x111...
 * ```
 */
export async function createCheckpointWithState(
  manager: CheckpointManager,
  partialData: Partial<DeploymentCheckpoint>,
): Promise<DeploymentCheckpoint> {
  // Create base checkpoint with required fields
  const baseCheckpoint = manager.createCheckpoint({
    network: partialData.network || "hedera-testnet",
    deployer: partialData.deployer || "0x0000000000000000000000000000000000000000",
    workflowType: (partialData.workflowType as WorkflowType) || "newBlr",
    options: partialData.options || {},
  });

  // Merge partial data into base checkpoint
  const checkpoint: DeploymentCheckpoint = {
    ...baseCheckpoint,
    ...partialData,
    steps: {
      ...baseCheckpoint.steps,
      ...partialData.steps,
      // Handle facets Map specially (deep merge required)
      facets:
        partialData.steps?.facets instanceof Map
          ? partialData.steps.facets
          : new Map(partialData.steps?.facets ? Object.entries(partialData.steps.facets) : []),
    },
  };

  return checkpoint;
}

/**
 * Simulate a failure at specific deployment step.
 *
 * Marks checkpoint as failed and populates failure information with
 * step details, error message, and timestamp.
 *
 * @param checkpoint - Checkpoint to modify
 * @param step - Step number where failure occurred
 * @param errorMessage - Error message describing the failure
 * @param workflowType - Workflow type for step name resolution
 * @returns Modified checkpoint with failure information
 *
 * @example
 * ```typescript
 * // Simulate failure at facets deployment step
 * const failedCheckpoint = simulateFailureAtStep(
 *   checkpoint,
 *   2,
 *   'Deployment failed: gas limit exceeded',
 *   'newBlr'
 * )
 *
 * // Verify failure state
 * expect(failedCheckpoint.status).to.equal('failed')
 * expect(failedCheckpoint.failure?.step).to.equal(2)
 * expect(failedCheckpoint.failure?.stepName).to.equal('Facets')
 * expect(failedCheckpoint.failure?.error).to.include('gas limit')
 * ```
 */
export function simulateFailureAtStep(
  checkpoint: DeploymentCheckpoint,
  step: number,
  errorMessage: string,
  workflowType: WorkflowType = "newBlr",
): DeploymentCheckpoint {
  const stepName = getStepName(step, workflowType);

  checkpoint.status = "failed";
  checkpoint.currentStep = step;
  checkpoint.failure = {
    step,
    stepName,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  };

  return checkpoint;
}

/**
 * Verify checkpoint contains expected data at specific deployment step.
 *
 * Throws assertion error if checkpoint state doesn't match expectations.
 * Useful for validating that resume logic has properly restored state.
 *
 * @param checkpoint - Checkpoint to verify
 * @param expectedStep - Expected current step number
 * @param shouldHaveData - Optional validation of step-specific data existence
 * @throws Error if checkpoint doesn't match expectations
 *
 * @example
 * ```typescript
 * // Verify checkpoint is at step 3 with registered facets
 * assertCheckpointAtStep(checkpoint, 3, {
 *   facetsRegistered: true,
 *   facetsDeployed: true
 * })
 *
 * // Verify only proxyAdmin deployed (step 1)
 * assertCheckpointAtStep(checkpoint, 1, {
 *   proxyAdminDeployed: true,
 *   blrDeployed: false
 * })
 *
 * // Verify checkpoint structure without specific data validation
 * assertCheckpointAtStep(checkpoint, 2)
 * ```
 */
export function assertCheckpointAtStep(
  checkpoint: DeploymentCheckpoint,
  expectedStep: number,
  shouldHaveData?: {
    proxyAdminDeployed?: boolean;
    blrDeployed?: boolean;
    facetsDeployed?: boolean;
    facetsRegistered?: boolean;
    configurationsCreated?: boolean;
    factoryDeployed?: boolean;
  },
): void {
  // Verify current step
  if (checkpoint.currentStep !== expectedStep) {
    throw new Error(`Checkpoint step mismatch: expected step ${expectedStep}, got ${checkpoint.currentStep}`);
  }

  // Verify step-specific data if requested
  if (shouldHaveData) {
    if (shouldHaveData.proxyAdminDeployed === true && !checkpoint.steps.proxyAdmin) {
      throw new Error("Checkpoint missing ProxyAdmin deployment at expected step");
    }
    if (shouldHaveData.proxyAdminDeployed === false && checkpoint.steps.proxyAdmin) {
      throw new Error("Checkpoint has unexpected ProxyAdmin deployment");
    }

    if (shouldHaveData.blrDeployed === true && !checkpoint.steps.blr) {
      throw new Error("Checkpoint missing BLR deployment at expected step");
    }
    if (shouldHaveData.blrDeployed === false && checkpoint.steps.blr) {
      throw new Error("Checkpoint has unexpected BLR deployment");
    }

    if (shouldHaveData.facetsDeployed === true && (!checkpoint.steps.facets || checkpoint.steps.facets.size === 0)) {
      throw new Error("Checkpoint missing facet deployments at expected step");
    }
    if (shouldHaveData.facetsDeployed === false && checkpoint.steps.facets && checkpoint.steps.facets.size > 0) {
      throw new Error("Checkpoint has unexpected facet deployments");
    }

    if (shouldHaveData.facetsRegistered === true && !checkpoint.steps.facetsRegistered) {
      throw new Error("Checkpoint facets not registered at expected step");
    }
    if (shouldHaveData.facetsRegistered === false && checkpoint.steps.facetsRegistered) {
      throw new Error("Checkpoint has unexpected facet registration");
    }

    if (
      shouldHaveData.configurationsCreated === true &&
      (!checkpoint.steps.configurations?.equity || !checkpoint.steps.configurations?.bond)
    ) {
      throw new Error("Checkpoint missing configurations at expected step");
    }
    if (
      shouldHaveData.configurationsCreated === false &&
      (checkpoint.steps.configurations?.equity || checkpoint.steps.configurations?.bond)
    ) {
      throw new Error("Checkpoint has unexpected configurations");
    }

    if (shouldHaveData.factoryDeployed === true && !checkpoint.steps.factory) {
      throw new Error("Checkpoint missing Factory deployment at expected step");
    }
    if (shouldHaveData.factoryDeployed === false && checkpoint.steps.factory) {
      throw new Error("Checkpoint has unexpected Factory deployment");
    }
  }
}

/**
 * Get shared checkpoint directory path for tests.
 *
 * Returns path to the shared checkpoint directory used by both tests and production.
 * All checkpoints (test and production) are stored in the same directory with
 * unique filenames based on network and timestamp.
 *
 * @returns Path to shared checkpoint directory
 *
 * @example
 * ```typescript
 * // Get shared checkpoint directory
 * const testDir = createTestCheckpointsDir()
 * // Returns: /path/to/project/deployments/.checkpoints
 *
 * // Create manager using shared directory
 * const manager = new CheckpointManager(testDir)
 *
 * // Use manager for test...
 * const checkpoint = manager.createCheckpoint({ ... })
 * ```
 */
export function createTestCheckpointsDir(): string {
  // Return shared checkpoint directory
  return join(__dirname, "../../deployments/.checkpoints");
}

/**
 * Clean test checkpoint directory.
 *
 * Removes all files and directories from test checkpoint directory.
 * Creates directory if missing. Safe to call multiple times.
 *
 * Useful for test setup/teardown to ensure clean state.
 *
 * @param testCheckpointsDir - Path to test checkpoint directory
 * @throws Error if cleanup fails unexpectedly
 *
 * @example
 * ```typescript
 * // Setup: Get shared directory and clean it
 * const testDir = createTestCheckpointsDir()
 * await cleanupTestCheckpoints(testDir)
 *
 * // Run tests...
 *
 * // Teardown: Clean up
 * await cleanupTestCheckpoints(testDir)
 * ```
 */
export async function cleanupTestCheckpoints(testCheckpointsDir: string): Promise<void> {
  try {
    // Remove directory and all contents
    await fs.rm(testCheckpointsDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if already removed
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      throw new Error(
        `Failed to cleanup test checkpoints directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Ensure directory exists for test use
  try {
    await fs.mkdir(testCheckpointsDir, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to create test checkpoints directory: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create deployed contract record with all required fields.
 *
 * Utility function for populating checkpoint contract deployment data.
 *
 * @param address - Contract address
 * @param txHash - Transaction hash of deployment
 * @param gasUsed - Optional gas used for deployment
 * @param contractId - Optional Hedera Contract ID
 * @returns Complete deployed contract record
 *
 * @example
 * ```typescript
 * const deployed = createDeployedContract(
 *   '0x1111111111111111111111111111111111111111',
 *   '0xabc123',
 *   '100000',
 *   '0.0.123456'
 * )
 *
 * checkpoint.steps.proxyAdmin = deployed
 * ```
 */
export function createDeployedContract(
  address: string,
  txHash: string,
  gasUsed?: string,
  contractId?: string,
): DeployedContract {
  return {
    address,
    txHash,
    deployedAt: new Date().toISOString(),
    gasUsed,
    contractId,
  };
}

/**
 * Create configuration result record with all required fields.
 *
 * Utility function for populating checkpoint configuration data.
 *
 * @param configId - Configuration ID (bytes32)
 * @param version - Configuration version number
 * @param facetCount - Number of facets in configuration
 * @param txHash - Transaction hash of configuration creation
 * @param gasUsed - Optional gas used for configuration
 * @returns Complete configuration result record
 *
 * @example
 * ```typescript
 * const equityConfig = createConfigurationResult(
 *   '0x0000000000000000000000000000000000000000000000000000000000000001',
 *   1,
 *   42,
 *   '0xdef456'
 * )
 *
 * checkpoint.steps.configurations = { equity: equityConfig }
 * ```
 */
export function createConfigurationResult(
  configId: string,
  version: number,
  facetCount: number,
  txHash: string,
  gasUsed?: string,
): ConfigurationResult {
  return {
    configId,
    version,
    facetCount,
    txHash,
    gasUsed,
  };
}

/**
 * Add facet deployment to checkpoint facets map.
 *
 * Helper for incrementally populating checkpoint facets.
 *
 * @param checkpoint - Checkpoint to modify
 * @param facetName - Facet contract name
 * @param facetData - Deployed contract data
 * @returns Modified checkpoint
 *
 * @example
 * ```typescript
 * // Initialize facets map if needed
 * if (!checkpoint.steps.facets) {
 *   checkpoint.steps.facets = new Map()
 * }
 *
 * // Add facet deployments
 * addFacetToCheckpoint(checkpoint, 'AccessControlFacet', {
 *   address: '0x2222...',
 *   txHash: '0xabc...',
 *   deployedAt: new Date().toISOString()
 * })
 *
 * addFacetToCheckpoint(checkpoint, 'PausableFacet', {
 *   address: '0x3333...',
 *   txHash: '0xdef...',
 *   deployedAt: new Date().toISOString()
 * })
 * ```
 */
export function addFacetToCheckpoint(
  checkpoint: DeploymentCheckpoint,
  facetName: string,
  facetData: DeployedContract,
): DeploymentCheckpoint {
  if (!checkpoint.steps.facets) {
    checkpoint.steps.facets = new Map();
  }
  checkpoint.steps.facets.set(facetName, facetData);
  return checkpoint;
}
