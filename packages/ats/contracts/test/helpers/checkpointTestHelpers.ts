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
import {
  TEST_ADDRESSES,
  TEST_NETWORKS,
  TEST_WORKFLOWS,
  TEST_CHECKPOINT_STATUS,
  TEST_TX_HASHES,
  TEST_CONFIG_IDS,
  TEST_CONTRACT_IDS,
  TEST_TIMESTAMPS,
} from "./constants";

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
  // Return test-specific checkpoint directory under deployments/test/
  // Isolated from production deployments (deployments/hardhat/.checkpoints)
  // Note: Tests run from build/ directory, so we need to go up 3 levels:
  // build/test/helpers/ → ../../../ → contracts/deployments/test/hardhat/.checkpoints
  return join(__dirname, "../../../deployments/test/hardhat/.checkpoints");
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

/**
 * Create a fully-populated completed checkpoint for conversion tests.
 *
 * Returns a checkpoint with all deployment steps completed, suitable for
 * testing checkpoint-to-output conversion and format verification.
 *
 * @param overrides - Optional partial data to merge/override defaults
 * @returns Complete checkpoint with all fields populated
 *
 * @example
 * ```typescript
 * // Create default completed checkpoint
 * const checkpoint = createCompletedTestCheckpoint();
 *
 * // Create with custom network
 * const mainnetCheckpoint = createCompletedTestCheckpoint({
 *   network: TEST_NETWORKS.MAINNET
 * });
 * ```
 */
export function createCompletedTestCheckpoint(overrides: Partial<DeploymentCheckpoint> = {}): DeploymentCheckpoint {
  const now = new Date().toISOString();

  return {
    checkpointId: `${TEST_NETWORKS.TESTNET}-1731085200000`,
    network: TEST_NETWORKS.TESTNET,
    deployer: TEST_ADDRESSES.VALID_0,
    status: TEST_CHECKPOINT_STATUS.COMPLETED,
    currentStep: 6,
    workflowType: TEST_WORKFLOWS.NEW_BLR,
    startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
    lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE_LATER,
    steps: {
      proxyAdmin: {
        address: TEST_ADDRESSES.VALID_2,
        contractId: TEST_CONTRACT_IDS.SAMPLE_0,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: now,
      },
      blr: {
        address: TEST_ADDRESSES.VALID_3,
        implementation: TEST_ADDRESSES.VALID_3.replace(/3/g, "2") + "1",
        implementationContractId: TEST_CONTRACT_IDS.SAMPLE_1,
        proxy: TEST_ADDRESSES.VALID_3,
        proxyContractId: TEST_CONTRACT_IDS.SAMPLE_2,
        txHash: TEST_TX_HASHES.SAMPLE_1,
        deployedAt: now,
      },
      facets: new Map([
        [
          "AccessControlFacet",
          {
            address: TEST_ADDRESSES.VALID_4,
            contractId: TEST_CONTRACT_IDS.SAMPLE_3,
            txHash: TEST_TX_HASHES.SAMPLE_2,
            gasUsed: "500000",
            deployedAt: now,
          },
        ],
        [
          "PausableFacet",
          {
            address: TEST_ADDRESSES.VALID_5,
            contractId: TEST_CONTRACT_IDS.SAMPLE_4,
            txHash: TEST_TX_HASHES.SAMPLE_3,
            gasUsed: "450000",
            deployedAt: now,
          },
        ],
      ]),
      facetsRegistered: true,
      configurations: {
        equity: {
          configId: TEST_CONFIG_IDS.EQUITY,
          version: 1,
          facetCount: 43,
          txHash: TEST_TX_HASHES.SAMPLE_4,
        },
        bond: {
          configId: TEST_CONFIG_IDS.BOND,
          version: 1,
          facetCount: 43,
          txHash: TEST_TX_HASHES.SAMPLE_5,
        },
        bondFixedRate: {
          configId: TEST_CONFIG_IDS.BOND_FIXED_RATE,
          version: 1,
          facetCount: 47,
          txHash: "0xabc789",
        },
        bondKpiLinkedRate: {
          configId: TEST_CONFIG_IDS.BOND_KPI_LINKED,
          version: 1,
          facetCount: 47,
          txHash: "0xdef123",
        },
        bondSustainabilityPerformanceTargetRate: {
          configId: TEST_CONFIG_IDS.BOND_SPT,
          version: 1,
          facetCount: 47,
          txHash: "0xghi456",
        },
      },
      factory: {
        address: TEST_ADDRESSES.VALID_6,
        implementation: TEST_ADDRESSES.VALID_6.replace(/5/g, "4"),
        implementationContractId: TEST_CONTRACT_IDS.SAMPLE_5,
        proxy: TEST_ADDRESSES.VALID_6,
        proxyContractId: TEST_CONTRACT_IDS.SAMPLE_6,
        txHash: "0xstu901",
        gasUsed: "800000",
        deployedAt: now,
      },
    },
    options: {},
    ...overrides,
    // Deep merge steps if provided
    ...(overrides.steps
      ? {
          steps: {
            ...overrides.steps,
          },
        }
      : {}),
  };
}

/**
 * Create a minimal incomplete checkpoint for error condition tests.
 *
 * Returns a checkpoint with only basic fields, suitable for testing
 * validation error conditions (missing ProxyAdmin, BLR, etc.).
 *
 * @param overrides - Optional partial data to merge/override defaults
 * @returns Minimal checkpoint with basic fields only
 *
 * @example
 * ```typescript
 * // Create empty checkpoint (for missing ProxyAdmin test)
 * const checkpoint = createMinimalTestCheckpoint();
 *
 * // Create with only ProxyAdmin (for missing BLR test)
 * const checkpoint = createMinimalTestCheckpoint({
 *   steps: {
 *     proxyAdmin: {
 *       address: TEST_ADDRESSES.VALID_2,
 *       txHash: TEST_TX_HASHES.SAMPLE_0,
 *       deployedAt: new Date().toISOString()
 *     }
 *   }
 * });
 * ```
 */
export function createMinimalTestCheckpoint(overrides: Partial<DeploymentCheckpoint> = {}): DeploymentCheckpoint {
  return {
    checkpointId: `${TEST_NETWORKS.TESTNET}-1731085200000`,
    network: TEST_NETWORKS.TESTNET,
    deployer: TEST_ADDRESSES.VALID_0,
    status: TEST_CHECKPOINT_STATUS.COMPLETED,
    currentStep: 6,
    workflowType: TEST_WORKFLOWS.NEW_BLR,
    startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
    lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE_LATER,
    steps: {},
    options: {},
    ...overrides,
  };
}

/**
 * Create test checkpoint for status formatting tests.
 *
 * Returns a checkpoint with minimal fields needed for formatCheckpointStatus tests.
 *
 * @param status - Checkpoint status
 * @param step - Current step number
 * @param workflowType - Workflow type
 * @param failure - Optional failure information
 * @returns Checkpoint suitable for status formatting tests
 */
export function createStatusTestCheckpoint(
  status: "in-progress" | "completed" | "failed",
  step: number,
  workflowType: WorkflowType = "newBlr",
  failure?: DeploymentCheckpoint["failure"],
): DeploymentCheckpoint {
  return {
    checkpointId: `${TEST_NETWORKS.TESTNET}-1731085200000`,
    network: TEST_NETWORKS.TESTNET,
    deployer: TEST_ADDRESSES.VALID_0,
    status,
    currentStep: step,
    workflowType,
    startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
    lastUpdate: "2025-11-08T10:05:00.000Z",
    steps: {},
    options: {},
    ...(failure ? { failure } : {}),
  };
}

/**
 * Create checkpoint cleanup hooks for Mocha tests.
 *
 * Returns an object with methods for tracking and cleaning up checkpoint directories
 * created during tests. Use `trackDir` to register directories for cleanup,
 * `afterEachCleanup` in an `afterEach` hook, and `afterCleanup` in an `after` hook.
 *
 * @returns Object with trackDir, afterEachCleanup, and afterCleanup methods
 *
 * @example
 * ```typescript
 * import { createCheckpointCleanupHooks } from "@test";
 *
 * describe("My Checkpoint Tests", () => {
 *   const { trackDir, afterEachCleanup, afterCleanup } = createCheckpointCleanupHooks();
 *
 *   afterEach(afterEachCleanup);
 *   after(afterCleanup);
 *
 *   it("should create checkpoint", async () => {
 *     const checkpointDir = `deployments/test/hardhat/.checkpoints/test-${Date.now()}`;
 *     trackDir(checkpointDir);
 *
 *     // Test code that creates checkpoints in checkpointDir
 *   });
 * });
 * ```
 */
export function createCheckpointCleanupHooks(): {
  trackDir: (dir: string) => void;
  afterEachCleanup: () => Promise<void>;
  afterCleanup: () => Promise<void>;
} {
  const checkpointDirs: string[] = [];

  return {
    /**
     * Track a checkpoint directory for cleanup.
     * Call this with each directory created during tests.
     */
    trackDir: (dir: string) => {
      checkpointDirs.push(dir);
    },

    /**
     * Clean up tracked directories after each test.
     * Use in an `afterEach` hook.
     */
    afterEachCleanup: async () => {
      const fsModule = await import("fs").then((m) => m.promises);
      for (const dir of checkpointDirs) {
        try {
          await fsModule.rm(dir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      }
      checkpointDirs.length = 0; // Clear array
    },

    /**
     * Clean up the shared test checkpoint directory after all tests.
     * Use in an `after` hook.
     */
    afterCleanup: async () => {
      const fsModule = await import("fs").then((m) => m.promises);
      const testCheckpointDir = "deployments/test/hardhat/.checkpoints";
      try {
        await fsModule.rm(testCheckpointDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    },
  };
}
