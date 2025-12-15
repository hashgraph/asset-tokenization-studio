// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for checkpoint resumability functionality.
 *
 * Tests the checkpoint system's ability to:
 * - Create and track deployment state across major steps
 * - Resume deployments from checkpoints after simulated failures
 * - Isolate checkpoints by network
 * - Clean up old checkpoints
 * - Handle TimeTravel facet variants
 *
 * These tests verify the complete checkpoint lifecycle and resumability patterns
 * for both newBlr and existingBlr deployment workflows.
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { configureLogger, LogLevel, CheckpointManager } from "@scripts/infrastructure";
import {
  createCheckpointWithState,
  simulateFailureAtStep,
  cleanupTestCheckpoints,
  createTestCheckpointsDir,
  createDeployedContract,
  createConfigurationResult,
  addFacetToCheckpoint,
} from "../../helpers/checkpointTestHelpers";

describe("Checkpoint Resumability - Integration Tests", () => {
  let signers: SignerWithAddress[];

  before(async () => {
    configureLogger({ level: LogLevel.SILENT });
    signers = await ethers.getSigners();
  });

  describe("Scenario 1: Happy Path - Create and Save Checkpoint", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should create and save checkpoint through all deployment steps", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint simulating full deployment
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x3333333333333333333333333333333333333333",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x4444444444444444444444444444444444444444", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x5555555555555555555555555555555555555555", "0x222...")],
            ["PauseFacet", createDeployedContract("0x6666666666666666666666666666666666666666", "0x333...")],
          ]),
          facetsRegistered: true,
          configurations: {
            equity: createConfigurationResult(
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              1,
              43,
              "0xeq123",
            ),
            bond: createConfigurationResult(
              "0x0000000000000000000000000000000000000000000000000000000000000002",
              1,
              43,
              "0xbo456",
            ),
          },
          factory: {
            address: "0x7777777777777777777777777777777777777777",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x7777777777777777777777777777777777777777",
            txHash: "0xfac789",
            deployedAt: new Date().toISOString(),
          },
        },
        options: {
          useTimeTravel: false,
          saveOutput: false,
        },
      });

      // Save checkpoint
      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint was saved and can be retrieved
      const checkpoints = await manager.findCheckpoints("hardhat", "completed");
      expect(checkpoints.length).to.be.greaterThan(0);

      const saved = checkpoints[0];
      expect(saved.status).to.equal("completed");
      expect(saved.currentStep).to.equal(6);

      // Verify all steps populated
      expect(saved.steps.proxyAdmin).to.exist;
      expect(saved.steps.proxyAdmin?.address).to.equal("0x1111111111111111111111111111111111111111");

      expect(saved.steps.blr).to.exist;
      expect(saved.steps.blr?.proxy).to.equal("0x2222222222222222222222222222222222222222");

      expect(saved.steps.facets).to.exist;
      expect(saved.steps.facets?.size).to.equal(3);

      expect(saved.steps.facetsRegistered).to.be.true;

      expect(saved.steps.configurations?.equity).to.exist;
      expect(saved.steps.configurations?.bond).to.exist;

      expect(saved.steps.factory).to.exist;
      expect(saved.steps.factory?.proxy).to.equal("0x7777777777777777777777777777777777777777");
    });

    it("should preserve deployment options in checkpoint", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with specific options
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        options: {
          useTimeTravel: false,
          saveOutput: true,
          confirmations: 2,
          enableRetry: true,
          verifyDeployment: true,
        },
      });

      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint options
      const checkpoints = await manager.findCheckpoints("hardhat", "completed");
      const saved = checkpoints[0];

      expect(saved.options.useTimeTravel).to.be.false;
      expect(saved.options.saveOutput).to.be.true;
      expect(saved.options.confirmations).to.equal(2);
      expect(saved.options.enableRetry).to.be.true;
      expect(saved.options.verifyDeployment).to.be.true;
    });
  });

  describe("Scenario 2: Resume from Facet Deployment Failure", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should resume deployment after partial facet deployment", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with ProxyAdmin and BLR deployed, partial facets
      const partialCheckpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123", "100000"),
          blr: {
            address: "0x4444444444444444444444444444444444444444",
            implementation: "0x2222222222222222222222222222222222222222",
            proxy: "0x4444444444444444444444444444444444444444",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x5555555555555555555555555555555555555555", "0x222...")],
            ["ERC1410Facet", createDeployedContract("0x6666666666666666666666666666666666666666", "0x333...")],
            ["ERC1594Facet", createDeployedContract("0x7777777777777777777777777777777777777777", "0x444...")],
            ["ERC1643Facet", createDeployedContract("0x8888888888888888888888888888888888888888", "0x555...")],
          ]),
        },
      });

      // Simulate failure at facets step
      simulateFailureAtStep(partialCheckpoint, 2, "Simulated facet deployment failure", "newBlr");
      await manager.saveCheckpoint(partialCheckpoint);

      // Verify failure was saved
      let failedCheckpoints = await manager.findCheckpoints("hardhat", "failed");
      expect(failedCheckpoints.length).to.be.greaterThan(0);

      const savedFailedCheckpoint = failedCheckpoints[0];
      expect(savedFailedCheckpoint.status).to.equal("failed");
      expect(savedFailedCheckpoint.failure?.step).to.equal(2);
      expect(savedFailedCheckpoint.failure?.error).to.include("facet deployment failure");

      // Resume deployment (note: actual resume would need BLR and facets already deployed on chain)
      // For this test, we verify the checkpoint can be loaded and has correct state
      const loadedCheckpoint = await manager.loadCheckpoint(partialCheckpoint.checkpointId);
      expect(loadedCheckpoint).to.exist;
      expect(loadedCheckpoint?.status).to.equal("failed");
      expect(loadedCheckpoint?.currentStep).to.equal(2);
      expect(loadedCheckpoint?.steps.facets?.size).to.equal(5);

      // Verify all partial facets are preserved
      expect(loadedCheckpoint?.steps.facets?.has("AccessControlFacet")).to.be.true;
      expect(loadedCheckpoint?.steps.facets?.has("ERC20Facet")).to.be.true;
      expect(loadedCheckpoint?.steps.facets?.has("ERC1410Facet")).to.be.true;
    });

    it("should handle incremental facet deployment checkpoints", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint and incrementally add facets
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x4444444444444444444444444444444444444444",
            implementation: "0x2222222222222222222222222222222222222222",
            proxy: "0x4444444444444444444444444444444444444444",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map(),
        },
      });

      // Add facets one by one (simulating incremental saves)
      const facetNames = ["AccessControlFacet", "ERC20Facet", "PauseFacet"];
      for (let i = 0; i < facetNames.length; i++) {
        const facetName = facetNames[i];
        addFacetToCheckpoint(
          checkpoint,
          facetName,
          createDeployedContract(`0x${(i + 1).toString().padStart(40, "1")}`, `0x${i}${i}${i}...`),
        );
        checkpoint.currentStep = 2;
        await manager.saveCheckpoint(checkpoint);
      }

      // Load and verify all facets were saved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.steps.facets?.size).to.equal(3);
      expect(loaded?.steps.facets?.has("AccessControlFacet")).to.be.true;
      expect(loaded?.steps.facets?.has("ERC20Facet")).to.be.true;
      expect(loaded?.steps.facets?.has("PauseFacet")).to.be.true;
    });
  });

  describe("Scenario 3: Resume from Configuration Failure", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should resume after configuration creation failure", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with infrastructure and facets deployed
      const partialCheckpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 3, // After facet registration
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x4444444444444444444444444444444444444444",
            implementation: "0x2222222222222222222222222222222222222222",
            proxy: "0x4444444444444444444444444444444444444444",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x5555555555555555555555555555555555555555", "0x222...")],
          ]),
          facetsRegistered: true,
        },
      });

      // Simulate failure at equity config step
      simulateFailureAtStep(partialCheckpoint, 4, "Equity configuration failed: insufficient balance", "newBlr");
      await manager.saveCheckpoint(partialCheckpoint);

      // Verify failure checkpoint is saved
      const failedCheckpoints = await manager.findCheckpoints("hardhat", "failed");
      const failedCheckpoint = failedCheckpoints[0];

      expect(failedCheckpoint.status).to.equal("failed");
      expect(failedCheckpoint.currentStep).to.equal(4);
      expect(failedCheckpoint.failure?.stepName).to.equal("Equity Configuration");

      // Load and verify state is preserved for resume
      const loaded = await manager.loadCheckpoint(failedCheckpoint.checkpointId);
      expect(loaded?.steps.facetsRegistered).to.be.true;
      expect(loaded?.steps.facets?.size).to.equal(2);
      expect(loaded?.steps.configurations?.equity).to.not.exist; // Configuration failed
    });

    it("should handle bond configuration failure separately", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with equity config done, bond config failing
      const partialCheckpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 4,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x4444444444444444444444444444444444444444",
            implementation: "0x2222222222222222222222222222222222222222",
            proxy: "0x4444444444444444444444444444444444444444",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
          ]),
          facetsRegistered: true,
          configurations: {
            equity: createConfigurationResult(
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              1,
              42,
              "0xequity123",
            ),
          },
        },
      });

      // Simulate failure at bond config step
      simulateFailureAtStep(partialCheckpoint, 5, "Bond configuration failed: invalid parameter", "newBlr");
      await manager.saveCheckpoint(partialCheckpoint);

      // Verify checkpoint preserves equity config but marks bond as failed
      const loaded = await manager.loadCheckpoint(partialCheckpoint.checkpointId);
      expect(loaded?.steps.configurations?.equity).to.exist;
      expect(loaded?.steps.configurations?.equity?.configId).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      );
      expect(loaded?.steps.configurations?.bond).to.not.exist;
    });
  });

  describe("Scenario 4: Network Isolation", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should isolate checkpoints by network", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create testnet checkpoint
      const testnetCheckpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
        },
      });
      await manager.saveCheckpoint(testnetCheckpoint);

      // Create mainnet checkpoint
      const mainnetCheckpoint = await createCheckpointWithState(manager, {
        network: "hedera-mainnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 4,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x2222222222222222222222222222222222222222", "0xdef456"),
          blr: {
            address: "0x3333333333333333333333333333333333333333",
            implementation: "0x4444444444444444444444444444444444444444",
            proxy: "0x3333333333333333333333333333333333333333",
            txHash: "0xghi789",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      await manager.saveCheckpoint(mainnetCheckpoint);

      // Verify network-specific retrieval
      const testnetCheckpoints = await manager.findCheckpoints("hedera-testnet");
      expect(testnetCheckpoints.length).to.equal(1);
      expect(testnetCheckpoints[0].network).to.equal("hedera-testnet");
      expect(testnetCheckpoints[0].currentStep).to.equal(2);

      const mainnetCheckpoints = await manager.findCheckpoints("hedera-mainnet");
      expect(mainnetCheckpoints.length).to.equal(1);
      expect(mainnetCheckpoints[0].network).to.equal("hedera-mainnet");
      expect(mainnetCheckpoints[0].currentStep).to.equal(4);

      // Verify no cross-contamination
      expect(testnetCheckpoints[0].checkpointId).to.not.equal(mainnetCheckpoints[0].checkpointId);
    });

    it("should filter checkpoints by status within network", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create multiple checkpoints with different statuses
      const checkpoint1 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 1,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
        },
      });
      checkpoint1.checkpointId = `hedera-testnet-${Date.now()}`;
      await manager.saveCheckpoint(checkpoint1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint2 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        steps: {
          factory: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      checkpoint2.checkpointId = `hedera-testnet-${Date.now()}`;
      await manager.saveCheckpoint(checkpoint2);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint3 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 3,
        workflowType: "newBlr",
        steps: {
          facetsRegistered: false,
        },
      });
      checkpoint3.checkpointId = `hedera-testnet-${Date.now()}`;
      await manager.saveCheckpoint(checkpoint3);

      // Filter by status
      const inProgress = await manager.findCheckpoints("hedera-testnet", "in-progress");
      expect(inProgress.length).to.equal(1);
      expect(inProgress[0].status).to.equal("in-progress");

      const completed = await manager.findCheckpoints("hedera-testnet", "completed");
      expect(completed.length).to.equal(1);
      expect(completed[0].status).to.equal("completed");

      const failed = await manager.findCheckpoints("hedera-testnet", "failed");
      expect(failed.length).to.equal(1);
      expect(failed[0].status).to.equal("failed");

      // Get all (any status)
      const all = await manager.findCheckpoints("hedera-testnet");
      expect(all.length).to.equal(3);
    });
  });

  describe("Scenario 5: Explicit Checkpoint Resume", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should resume from explicitly specified checkpoint ID", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create 3 checkpoints with different timestamps
      const checkpoint1 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 1,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
        },
      });
      checkpoint1.checkpointId = "hedera-testnet-1000000000000";
      await manager.saveCheckpoint(checkpoint1);

      const checkpoint2 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x2222222222222222222222222222222222222222", "0xdef456"),
          blr: {
            address: "0x3333333333333333333333333333333333333333",
            implementation: "0x4444444444444444444444444444444444444444",
            proxy: "0x3333333333333333333333333333333333333333",
            txHash: "0xghi789",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      checkpoint2.checkpointId = "hedera-testnet-2000000000000";
      await manager.saveCheckpoint(checkpoint2);

      const checkpoint3 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 3,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x5555555555555555555555555555555555555555", "0xjkl012"),
          blr: {
            address: "0x6666666666666666666666666666666666666666",
            implementation: "0x7777777777777777777777777777777777777777",
            proxy: "0x6666666666666666666666666666666666666666",
            txHash: "0xmno345",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x8888888888888888888888888888888888888888", "0x666...")],
          ]),
        },
      });
      checkpoint3.checkpointId = "hedera-testnet-3000000000000";
      await manager.saveCheckpoint(checkpoint3);

      // Load specific checkpoint (middle one)
      const loadedCheckpoint = await manager.loadCheckpoint("hedera-testnet-2000000000000");

      expect(loadedCheckpoint).to.exist;
      expect(loadedCheckpoint?.checkpointId).to.equal("hedera-testnet-2000000000000");
      expect(loadedCheckpoint?.currentStep).to.equal(2);
      expect(loadedCheckpoint?.steps.blr?.proxy).to.equal("0x3333333333333333333333333333333333333333");

      // Verify other checkpoints are still distinct
      const checkpoint1Loaded = await manager.loadCheckpoint("hedera-testnet-1000000000000");
      expect(checkpoint1Loaded?.currentStep).to.equal(1);
      expect(checkpoint1Loaded?.steps.blr).to.not.exist;

      const checkpoint3Loaded = await manager.loadCheckpoint("hedera-testnet-3000000000000");
      expect(checkpoint3Loaded?.currentStep).to.equal(3);
      expect(checkpoint3Loaded?.steps.facets?.size).to.equal(1);
    });

    it("should return null for non-existent checkpoint ID", async () => {
      const loaded = await manager.loadCheckpoint("non-existent-checkpoint-id");
      expect(loaded).to.be.null;
    });

    it("should maintain checkpoint ordering by timestamp", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoints (they'll have different internal timestamps)
      const cp1 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 1,
        workflowType: "newBlr",
      });
      cp1.checkpointId = `hedera-testnet-${Date.now()}`;
      await manager.saveCheckpoint(cp1);

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cp2 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 2,
        workflowType: "newBlr",
      });
      cp2.checkpointId = `hedera-testnet-${Date.now()}`;
      await manager.saveCheckpoint(cp2);

      // Retrieve all checkpoints (should be ordered newest first)
      const all = await manager.findCheckpoints("hedera-testnet");
      expect(all.length).to.equal(2);

      // Verify ordering: newest first
      const id1Timestamp = parseInt(all[0].checkpointId.split("-").pop() || "0");
      const id2Timestamp = parseInt(all[1].checkpointId.split("-").pop() || "0");
      expect(id1Timestamp).to.be.greaterThan(id2Timestamp);
    });
  });

  describe("Scenario 6: Checkpoint Cleanup", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should clean up old completed checkpoints while preserving failed ones", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Create completed checkpoints at different ages
      const recentCompleted = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        steps: {
          factory: {
            address: "0x1111111111111111111111111111111111111111",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x1111111111111111111111111111111111111111",
            txHash: "0xabc123",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      recentCompleted.checkpointId = `hedera-testnet-${now}`;
      await manager.saveCheckpoint(recentCompleted);

      const mediumOldCompleted = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        steps: {
          factory: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      mediumOldCompleted.checkpointId = `hedera-testnet-${now - 20 * oneDay}`;
      await manager.saveCheckpoint(mediumOldCompleted);

      const veryOldCompleted = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        steps: {
          factory: {
            address: "0x3333333333333333333333333333333333333333",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x3333333333333333333333333333333333333333",
            txHash: "0xghi789",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      veryOldCompleted.checkpointId = `hedera-testnet-${now - 40 * oneDay}`;
      await manager.saveCheckpoint(veryOldCompleted);

      // Create old failed checkpoint (should NOT be deleted)
      const oldFailed = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x4444444444444444444444444444444444444444", "0xjkl012"),
          factory: {
            address: "0x3333333333333333333333333333333333333333",
            implementation: "0x8888888888888888888888888888888888888888",
            proxy: "0x3333333333333333333333333333333333333333",
            txHash: "0xghi789",
            deployedAt: new Date().toISOString(),
          },
        },
      });
      oldFailed.checkpointId = `hedera-testnet-${now - 50 * oneDay}`;
      await manager.saveCheckpoint(oldFailed);

      // Clean up checkpoints older than 30 days
      const deletedCount = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      // Verify cleanup results (only veryOldCompleted should be deleted)
      expect(deletedCount).to.equal(1);

      const allCheckpoints = await manager.findCheckpoints("hedera-testnet");
      expect(allCheckpoints.length).to.equal(3);

      const checkpointIds = allCheckpoints.map((cp) => cp.checkpointId);
      expect(checkpointIds).to.include(recentCompleted.checkpointId);
      expect(checkpointIds).to.include(mediumOldCompleted.checkpointId);
      expect(checkpointIds).to.include(oldFailed.checkpointId);
      expect(checkpointIds).to.not.include(veryOldCompleted.checkpointId);
    });

    it("should only delete completed checkpoints", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Create old in-progress checkpoint
      const oldInProgress = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
      });
      oldInProgress.checkpointId = `hedera-testnet-${now - 40 * oneDay}`;
      await manager.saveCheckpoint(oldInProgress);

      // Create old failed checkpoint
      const oldFailed = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 3,
        workflowType: "newBlr",
      });
      oldFailed.checkpointId = `hedera-testnet-${now - 40 * oneDay - 1000}`;
      await manager.saveCheckpoint(oldFailed);

      // Create old completed checkpoint
      const oldCompleted = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
      });
      oldCompleted.checkpointId = `hedera-testnet-${now - 40 * oneDay - 2000}`;
      await manager.saveCheckpoint(oldCompleted);

      // Clean up checkpoints older than 30 days
      const deletedCount = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      // Only completed checkpoint should be deleted
      expect(deletedCount).to.equal(1);

      const remaining = await manager.findCheckpoints("hedera-testnet");
      expect(remaining.length).to.equal(2);

      const statuses = remaining.map((cp) => cp.status);
      expect(statuses).to.include("in-progress");
      expect(statuses).to.include("failed");
    });

    it("should handle cleanup with no checkpoints", async () => {
      const deletedCount = await manager.cleanupOldCheckpoints("hedera-testnet", 30);
      expect(deletedCount).to.equal(0);
    });

    it("should delete individual checkpoint", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
      });
      await manager.saveCheckpoint(checkpoint);

      // Verify it exists
      let loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;

      // Delete it
      await manager.deleteCheckpoint(checkpoint.checkpointId);

      // Verify it's deleted
      loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.be.null;
    });
  });

  describe("Scenario 7: TimeTravel Facet Variants", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should handle TimeTravel facet variants in checkpoints", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with TimeTravel variants
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x3333333333333333333333333333333333333333",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            [
              "AccessControlFacetTimeTravel",
              createDeployedContract("0x4444444444444444444444444444444444444444", "0xghi789"),
            ],
            ["ERC20FacetTimeTravel", createDeployedContract("0x5555555555555555555555555555555555555555", "0xjkl012")],
            [
              "SnapshotsFacetTimeTravel",
              createDeployedContract("0x6666666666666666666666666666666666666666", "0xmno345"),
            ],
          ]),
        },
      });

      await manager.saveCheckpoint(checkpoint);

      // Load checkpoint and verify TimeTravel variants preserved
      const loadedCheckpoint = await manager.loadCheckpoint(checkpoint.checkpointId);

      expect(loadedCheckpoint).to.exist;
      expect(loadedCheckpoint?.steps.facets).to.exist;
      expect(loadedCheckpoint?.steps.facets?.has("AccessControlFacetTimeTravel")).to.be.true;
      expect(loadedCheckpoint?.steps.facets?.has("ERC20FacetTimeTravel")).to.be.true;
      expect(loadedCheckpoint?.steps.facets?.has("SnapshotsFacetTimeTravel")).to.be.true;

      // Verify facet names include "TimeTravel" suffix
      const facetNames = Array.from(loadedCheckpoint!.steps.facets!.keys());
      expect(facetNames.every((name) => name.includes("TimeTravel"))).to.be.true;

      // Verify addresses are preserved
      expect(loadedCheckpoint?.steps.facets?.get("AccessControlFacetTimeTravel")?.address).to.equal(
        "0x4444444444444444444444444444444444444444",
      );
    });

    it("should preserve mixed TimeTravel and non-TimeTravel facets", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with mix of TimeTravel and regular facets
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x3333333333333333333333333333333333333333",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x4444444444444444444444444444444444444444", "0x111...")],
            [
              "AccessControlFacetTimeTravel",
              createDeployedContract("0x5555555555555555555555555555555555555555", "0x222..."),
            ],
            ["KycFacet", createDeployedContract("0x6666666666666666666666666666666666666666", "0x333...")],
            ["ERC20FacetTimeTravel", createDeployedContract("0x7777777777777777777777777777777777777777", "0x444...")],
          ]),
        },
      });

      await manager.saveCheckpoint(checkpoint);

      // Load and verify both types preserved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);

      expect(loaded?.steps.facets?.size).to.equal(4);

      // Regular facets
      expect(loaded?.steps.facets?.has("AccessControlFacet")).to.be.true;
      expect(loaded?.steps.facets?.has("KycFacet")).to.be.true;

      // TimeTravel facets
      expect(loaded?.steps.facets?.has("AccessControlFacetTimeTravel")).to.be.true;
      expect(loaded?.steps.facets?.has("ERC20FacetTimeTravel")).to.be.true;

      // Verify distinction in naming
      const facetNames = Array.from(loaded!.steps.facets!.keys());
      const timeTravelCount = facetNames.filter((n) => n.includes("TimeTravel")).length;
      const regularCount = facetNames.filter((n) => !n.includes("TimeTravel")).length;

      expect(timeTravelCount).to.equal(2);
      expect(regularCount).to.equal(2);
    });

    it("should handle TimeTravel deployment options in checkpoint", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with TimeTravel enabled
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 0,
        workflowType: "newBlr",
        options: {
          useTimeTravel: true,
        },
      });

      await manager.saveCheckpoint(checkpoint);

      // Load and verify options preserved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.options.useTimeTravel).to.be.true;

      // Create checkpoint with TimeTravel disabled
      const checkpoint2 = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 0,
        workflowType: "newBlr",
        options: {
          useTimeTravel: false,
        },
      });

      await manager.saveCheckpoint(checkpoint2);

      // Load and verify
      const loaded2 = await manager.loadCheckpoint(checkpoint2.checkpointId);
      expect(loaded2?.options.useTimeTravel).to.be.false;
    });
  });

  describe("Edge Cases and Error Handling", () => {
    let testDir: string;
    let manager: CheckpointManager;

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(testDir);
      await cleanupTestCheckpoints(testDir);
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should handle checkpoint with missing optional fields", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create minimal checkpoint
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: -1,
        workflowType: "newBlr",
        steps: {},
      });

      await manager.saveCheckpoint(checkpoint);

      // Load and verify it's preserved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;
      // steps will have at least facets as an empty Map due to initialization
      expect(loaded?.currentStep).to.equal(-1);
      expect(loaded?.steps.proxyAdmin).to.not.exist;
      expect(loaded?.steps.blr).to.not.exist;
    });

    it("should handle empty facets map", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          facets: new Map(),
        },
      });

      await manager.saveCheckpoint(checkpoint);

      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.steps.facets).to.exist;
      expect(loaded?.steps.facets?.size).to.equal(0);
    });

    it("should handle large facets count", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      // Create checkpoint with many facets (simulate full deployment)
      const facetsMap = new Map<string, ReturnType<typeof createDeployedContract>>();
      for (let i = 0; i < 50; i++) {
        const paddedNum = String(i).padStart(2, "0");
        const address = `0xaa${paddedNum}${"bb".repeat(19)}`; // Creates addresses like 0xaa00bb...
        facetsMap.set(`Facet${i}`, createDeployedContract(address, `0x${paddedNum}hash...`));
      }

      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          facets: facetsMap,
        },
      });

      await manager.saveCheckpoint(checkpoint);

      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.steps.facets?.size).to.equal(50);

      // Verify specific facets
      expect(loaded?.steps.facets?.has("Facet0")).to.be.true;
      expect(loaded?.steps.facets?.has("Facet49")).to.be.true;
      expect(loaded?.steps.facets?.get("Facet10")?.address).to.equal(`0xaa10${"bb".repeat(19)}`);
    });

    it("should handle checkpoint with extensive failure information", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const checkpoint = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "failed",
        currentStep: 2,
        workflowType: "newBlr",
      });

      // Simulate detailed failure with stack trace
      simulateFailureAtStep(
        checkpoint,
        2,
        "Detailed error: Contract deployment failed due to insufficient gas.\nThe deployment tx was reverted.\nEstimated gas: 5000000\nAvailable gas: 3000000",
        "newBlr",
      );

      checkpoint.failure!.stackTrace = `
Error: Deployment failed
    at deployFacet (file:///path/to/deployment.ts:123:45)
    at processAllFacets (file:///path/to/deployment.ts:456:78)
    at deploySystemWithNewBlr (file:///path/to/workflow.ts:789:12)
    at async main (file:///path/to/index.ts:234:56)
      `;

      await manager.saveCheckpoint(checkpoint);

      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.failure).to.exist;
      expect(loaded?.failure?.error).to.include("insufficient gas");
      expect(loaded?.failure?.stackTrace).to.include("deployFacet");
    });

    it("should maintain checkpoint data integrity across save/load cycles", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();

      const original = await createCheckpointWithState(manager, {
        network: "hedera-testnet",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        steps: {
          proxyAdmin: createDeployedContract("0x1111111111111111111111111111111111111111", "0xabc123"),
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x3333333333333333333333333333333333333333",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            ["Facet1", createDeployedContract("0x4444444444444444444444444444444444444444", "0xghi789")],
          ]),
        },
      });

      // Save and load multiple times
      for (let i = 0; i < 3; i++) {
        await manager.saveCheckpoint(original);
        const loaded = await manager.loadCheckpoint(original.checkpointId);

        expect(loaded?.checkpointId).to.equal(original.checkpointId);
        expect(loaded?.currentStep).to.equal(original.currentStep);
        expect(loaded?.steps.proxyAdmin?.address).to.equal(original.steps.proxyAdmin?.address);
        expect(loaded?.steps.blr?.proxy).to.equal(original.steps.blr?.proxy);
        expect(loaded?.steps.facets?.size).to.equal(original.steps.facets?.size);
      }
    });
  });
});
