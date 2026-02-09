// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for CheckpointManager class.
 *
 * Tests the checkpoint system that enables resumable deployment workflows
 * by persisting deployment state to disk with support for Map serialization.
 *
 * Note: These tests involve filesystem I/O and are categorized as integration tests.
 *
 * @module test/scripts/integration/checkpoint/CheckpointManager.test
 */

import { expect } from "chai";
import { promises as fs } from "fs";
import { join } from "path";
import { CheckpointManager, type DeployedContract } from "@scripts/infrastructure";
import {
  TEST_ADDRESSES,
  TEST_NETWORKS,
  TEST_WORKFLOWS,
  TEST_CHECKPOINT_STATUS,
  TEST_TX_HASHES,
  TEST_DIRS,
  TEST_TIME,
  TEST_STANDARD_CONTRACTS,
  TEST_DELAYS,
  TEST_NON_EXISTENT,
  removeTestDeployments,
  silenceScriptLogging,
} from "@test";

describe("CheckpointManager", () => {
  const testCheckpointsDir = TEST_DIRS.UNIT_CHECKPOINTS;
  let manager: CheckpointManager;

  before(silenceScriptLogging);

  beforeEach(async () => {
    // Create test checkpoint manager with custom directory
    manager = new CheckpointManager(undefined, testCheckpointsDir);

    // Ensure test directory exists and is empty
    await fs.rm(testCheckpointsDir, { recursive: true }).catch(() => {});
    await fs.mkdir(testCheckpointsDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    await fs.rm(testCheckpointsDir, { recursive: true }).catch(() => {});
  });

  after(async () => {
    await removeTestDeployments();
  });

  describe("createCheckpoint", () => {
    it("should create a checkpoint with correct structure", () => {
      const deployer = TEST_ADDRESSES.VALID_0;
      const network = TEST_NETWORKS.TESTNET;

      const checkpoint = manager.createCheckpoint({
        network,
        deployer,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {
          useTimeTravel: false,
          confirmations: 2,
        },
      });

      expect(checkpoint).to.have.property("checkpointId");
      expect(checkpoint.checkpointId).to.match(/^hedera-testnet-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}$/);
      expect(checkpoint.network).to.equal(network);
      expect(checkpoint.deployer).to.equal(deployer);
      expect(checkpoint.status).to.equal(TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      expect(checkpoint.currentStep).to.equal(-1);
      expect(checkpoint.workflowType).to.equal(TEST_WORKFLOWS.NEW_BLR);
      expect(checkpoint).to.have.property("startTime");
      expect(checkpoint).to.have.property("lastUpdate");
      expect(checkpoint.steps).to.deep.equal({});
      expect(checkpoint.options).to.deep.equal({
        useTimeTravel: false,
        confirmations: 2,
      });
      expect(checkpoint).to.not.have.property("failure");
    });

    it("should create unique checkpoint IDs", async () => {
      const deployer = TEST_ADDRESSES.VALID_0;
      const network = TEST_NETWORKS.TESTNET;

      const checkpoint1 = manager.createCheckpoint({
        network,
        deployer,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      // Wait to ensure different timestamp (non-blocking)
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.SHORT));

      const checkpoint2 = manager.createCheckpoint({
        network,
        deployer,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      expect(checkpoint1.checkpointId).to.not.equal(checkpoint2.checkpointId);
    });

    it("should support existingBlr workflow type", () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.MAINNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.EXISTING_BLR,
        options: {
          deployFacets: true,
          deployFactory: false,
        },
      });

      expect(checkpoint.workflowType).to.equal(TEST_WORKFLOWS.EXISTING_BLR);
      expect(checkpoint.options).to.deep.equal({
        deployFacets: true,
        deployFactory: false,
      });
    });
  });

  describe("saveCheckpoint", () => {
    it("should save checkpoint to disk", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      await manager.saveCheckpoint(checkpoint);

      const filepath = join(testCheckpointsDir, `${checkpoint.checkpointId}.json`);
      const exists = await fs
        .access(filepath)
        .then(() => true)
        .catch(() => false);

      expect(exists).to.be.true;
    });

    it("should update lastUpdate timestamp on save", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      const originalLastUpdate = checkpoint.lastUpdate;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      await manager.saveCheckpoint(checkpoint);

      expect(checkpoint.lastUpdate).to.not.equal(originalLastUpdate);
    });

    it("should serialize checkpoint with valid JSON", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      checkpoint.steps.proxyAdmin = {
        address: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint);

      const filepath = join(testCheckpointsDir, `${checkpoint.checkpointId}.json`);
      const content = await fs.readFile(filepath, "utf-8");
      const parsed = JSON.parse(content);

      expect(parsed).to.have.property("checkpointId");
      expect(parsed.steps.proxyAdmin).to.deep.equal(checkpoint.steps.proxyAdmin);
    });

    it("should handle Map serialization for facets", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      checkpoint.steps.facets = new Map([
        [
          TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET,
          {
            address: TEST_ADDRESSES.VALID_3 as string,
            txHash: TEST_TX_HASHES.SAMPLE_1 as string,
            deployedAt: new Date().toISOString(),
          },
        ],
        [
          TEST_STANDARD_CONTRACTS.PAUSABLE_FACET,
          {
            address: TEST_ADDRESSES.VALID_4 as string,
            txHash: TEST_TX_HASHES.SAMPLE_2 as string,
            deployedAt: new Date().toISOString(),
          },
        ],
      ]);

      await manager.saveCheckpoint(checkpoint);

      const filepath = join(testCheckpointsDir, `${checkpoint.checkpointId}.json`);
      const content = await fs.readFile(filepath, "utf-8");
      const parsed = JSON.parse(content);

      // Check Map was serialized to special format
      expect(parsed.steps.facets).to.have.property("__type", "Map");
      expect(parsed.steps.facets).to.have.property("__value");
      expect(parsed.steps.facets.__value).to.be.an("array");
      expect(parsed.steps.facets.__value).to.have.lengthOf(2);
    });
  });

  describe("loadCheckpoint", () => {
    it("should load checkpoint from disk", async () => {
      const original = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: { useTimeTravel: true },
      });

      original.steps.proxyAdmin = {
        address: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: new Date().toISOString(),
      };

      await manager.saveCheckpoint(original);

      const loaded = await manager.loadCheckpoint(original.checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.checkpointId).to.equal(original.checkpointId);
      expect(loaded!.network).to.equal(original.network);
      expect(loaded!.deployer).to.equal(original.deployer);
      expect(loaded!.workflowType).to.equal(original.workflowType);
      expect(loaded!.steps.proxyAdmin).to.deep.equal(original.steps.proxyAdmin);
      expect(loaded!.options).to.deep.equal(original.options);
    });

    it("should return null for non-existent checkpoint", async () => {
      const loaded = await manager.loadCheckpoint(`${TEST_NETWORKS.TESTNET}-99999999999`);

      expect(loaded).to.be.null;
    });

    it("should deserialize Map for facets", async () => {
      const original = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      const facet1: DeployedContract = {
        address: TEST_ADDRESSES.VALID_3 as string,
        txHash: TEST_TX_HASHES.SAMPLE_1 as string,
        deployedAt: new Date().toISOString(),
      };

      const facet2: DeployedContract = {
        address: TEST_ADDRESSES.VALID_4 as string,
        txHash: TEST_TX_HASHES.SAMPLE_2 as string,
        deployedAt: new Date().toISOString(),
      };

      original.steps.facets = new Map([
        [TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET, facet1],
        [TEST_STANDARD_CONTRACTS.PAUSABLE_FACET, facet2],
      ]);

      await manager.saveCheckpoint(original);

      const loaded = await manager.loadCheckpoint(original.checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.steps.facets).to.be.instanceOf(Map);
      expect(loaded!.steps.facets!.size).to.equal(2);
      expect(loaded!.steps.facets!.get(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET)).to.deep.equal(facet1);
      expect(loaded!.steps.facets!.get(TEST_STANDARD_CONTRACTS.PAUSABLE_FACET)).to.deep.equal(facet2);
    });

    it("should handle checkpoint with failure information", async () => {
      const original = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      original.status = TEST_CHECKPOINT_STATUS.FAILED;
      original.failure = {
        step: 2,
        stepName: "Facets",
        error: "Deployment failed: gas limit exceeded",
        timestamp: new Date().toISOString(),
        stackTrace: "Error: gas limit exceeded\n    at deployFacet...",
      };

      await manager.saveCheckpoint(original);

      const loaded = await manager.loadCheckpoint(original.checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.status).to.equal(TEST_CHECKPOINT_STATUS.FAILED);
      expect(loaded!.failure).to.deep.equal(original.failure);
    });
  });

  describe("findCheckpoints", () => {
    it("should find all checkpoints for a network", async () => {
      const checkpoint1 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      await manager.saveCheckpoint(checkpoint1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      const checkpoint2 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.EXISTING_BLR,
        options: {},
      });
      await manager.saveCheckpoint(checkpoint2);

      const found = await manager.findCheckpoints(TEST_NETWORKS.TESTNET);

      expect(found).to.have.lengthOf(2);
      expect(found.map((c) => c.checkpointId)).to.include.members([checkpoint1.checkpointId, checkpoint2.checkpointId]);
    });

    it("should filter by status", async () => {
      const checkpoint1 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      checkpoint1.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(checkpoint1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      const checkpoint2 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      checkpoint2.status = TEST_CHECKPOINT_STATUS.COMPLETED;
      await manager.saveCheckpoint(checkpoint2);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      const checkpoint3 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.NO_CODE,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      checkpoint3.status = TEST_CHECKPOINT_STATUS.FAILED;
      await manager.saveCheckpoint(checkpoint3);

      const inProgress = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      const completed = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.COMPLETED);
      const failed = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.FAILED);

      expect(inProgress).to.have.lengthOf(1);
      expect(inProgress[0].checkpointId).to.equal(checkpoint1.checkpointId);

      expect(completed).to.have.lengthOf(1);
      expect(completed[0].checkpointId).to.equal(checkpoint2.checkpointId);

      expect(failed).to.have.lengthOf(1);
      expect(failed[0].checkpointId).to.equal(checkpoint3.checkpointId);
    });

    it("should return empty array for non-existent network", async () => {
      const found = await manager.findCheckpoints(TEST_NON_EXISTENT.NETWORK);

      expect(found).to.be.an("array");
      expect(found).to.have.lengthOf(0);
    });

    it("should sort checkpoints by timestamp (newest first)", async () => {
      // Create checkpoints with slight delays to ensure different timestamps
      const checkpoint1 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_2,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      await manager.saveCheckpoint(checkpoint1);

      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      const checkpoint2 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_3,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      await manager.saveCheckpoint(checkpoint2);

      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      const checkpoint3 = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_4,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      await manager.saveCheckpoint(checkpoint3);

      const found = await manager.findCheckpoints(TEST_NETWORKS.TESTNET);

      expect(found).to.have.lengthOf(3);
      // Should be sorted newest first
      expect(found[0].checkpointId).to.equal(checkpoint3.checkpointId);
      expect(found[1].checkpointId).to.equal(checkpoint2.checkpointId);
      expect(found[2].checkpointId).to.equal(checkpoint1.checkpointId);
    });

    it("should not return checkpoints from other networks", async () => {
      const testnetCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      const mainnetCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.MAINNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      await manager.saveCheckpoint(testnetCheckpoint);
      await manager.saveCheckpoint(mainnetCheckpoint);

      const testnetFound = await manager.findCheckpoints(TEST_NETWORKS.TESTNET);
      const mainnetFound = await manager.findCheckpoints(TEST_NETWORKS.MAINNET);

      expect(testnetFound).to.have.lengthOf(1);
      expect(testnetFound[0].checkpointId).to.equal(testnetCheckpoint.checkpointId);

      expect(mainnetFound).to.have.lengthOf(1);
      expect(mainnetFound[0].checkpointId).to.equal(mainnetCheckpoint.checkpointId);
    });
  });

  describe("deleteCheckpoint", () => {
    it("should delete checkpoint from disk", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      await manager.saveCheckpoint(checkpoint);

      const filepath = join(testCheckpointsDir, `${checkpoint.checkpointId}.json`);
      let exists = await fs
        .access(filepath)
        .then(() => true)
        .catch(() => false);
      expect(exists).to.be.true;

      await manager.deleteCheckpoint(checkpoint.checkpointId);

      exists = await fs
        .access(filepath)
        .then(() => true)
        .catch(() => false);
      expect(exists).to.be.false;
    });

    it("should not throw error when deleting non-existent checkpoint", async () => {
      await expect(manager.deleteCheckpoint(`${TEST_NETWORKS.TESTNET}-99999999999`)).to.not.be.rejected;
    });
  });

  describe("cleanupOldCheckpoints", () => {
    it("should delete completed checkpoints older than specified days", async () => {
      // Create old checkpoint and manually backdate lastUpdate to simulate age
      const oldTimestamp = Date.now() - TEST_TIME.OLD_CHECKPOINT_DAYS * TEST_TIME.MS_PER_DAY;
      const oldCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      oldCheckpoint.status = TEST_CHECKPOINT_STATUS.COMPLETED;
      // Save first to create the file, then overwrite with old lastUpdate
      await manager.saveCheckpoint(oldCheckpoint);
      // Overwrite with backdated lastUpdate (saveCheckpoint sets lastUpdate to now)
      oldCheckpoint.lastUpdate = new Date(oldTimestamp).toISOString();
      const filepath = join(testCheckpointsDir, `${oldCheckpoint.checkpointId}.json`);
      await fs.writeFile(filepath, JSON.stringify(oldCheckpoint, null, 2), "utf-8");

      // Wait to ensure different checkpoint ID (millisecond resolution)
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.SHORT));

      // Create recent checkpoint
      const recentCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      recentCheckpoint.status = TEST_CHECKPOINT_STATUS.COMPLETED;
      await manager.saveCheckpoint(recentCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints(TEST_NETWORKS.TESTNET, TEST_TIME.CLEANUP_THRESHOLD_DAYS);

      expect(deleted).to.equal(1);

      const remaining = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.COMPLETED);
      expect(remaining).to.have.lengthOf(1);
      expect(remaining[0].checkpointId).to.equal(recentCheckpoint.checkpointId);
    });

    it("should not delete failed checkpoints", async () => {
      const oldTimestamp = Date.now() - TEST_TIME.OLD_CHECKPOINT_DAYS * TEST_TIME.MS_PER_DAY;
      const oldFailedCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      (oldFailedCheckpoint as any).checkpointId = `${TEST_NETWORKS.TESTNET}-${oldTimestamp}`;
      oldFailedCheckpoint.status = TEST_CHECKPOINT_STATUS.FAILED;
      await manager.saveCheckpoint(oldFailedCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints(TEST_NETWORKS.TESTNET, TEST_TIME.CLEANUP_THRESHOLD_DAYS);

      expect(deleted).to.equal(0);

      const remaining = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.FAILED);
      expect(remaining).to.have.lengthOf(1);
    });

    it("should not delete in-progress checkpoints", async () => {
      const oldTimestamp = Date.now() - TEST_TIME.OLD_CHECKPOINT_DAYS * TEST_TIME.MS_PER_DAY;
      const oldInProgressCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      (oldInProgressCheckpoint as any).checkpointId = `${TEST_NETWORKS.TESTNET}-${oldTimestamp}`;
      oldInProgressCheckpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(oldInProgressCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints(TEST_NETWORKS.TESTNET, TEST_TIME.CLEANUP_THRESHOLD_DAYS);

      expect(deleted).to.equal(0);

      const remaining = await manager.findCheckpoints(TEST_NETWORKS.TESTNET, TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      expect(remaining).to.have.lengthOf(1);
    });

    it("should return 0 when no checkpoints to cleanup", async () => {
      const deleted = await manager.cleanupOldCheckpoints(TEST_NETWORKS.TESTNET, TEST_TIME.CLEANUP_THRESHOLD_DAYS);

      expect(deleted).to.equal(0);
    });
  });

  describe("findResumableCheckpoints", () => {
    it("should find both in-progress and failed checkpoints", async () => {
      // Create in-progress checkpoint
      const inProgressCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      inProgressCheckpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(inProgressCheckpoint);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      // Create failed checkpoint
      const failedCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      failedCheckpoint.status = TEST_CHECKPOINT_STATUS.FAILED;
      failedCheckpoint.failure = {
        step: 2,
        stepName: "Facets",
        error: "Test error",
        timestamp: new Date().toISOString(),
      };
      await manager.saveCheckpoint(failedCheckpoint);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      // Create completed checkpoint (should NOT be included)
      const completedCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_2,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      completedCheckpoint.status = TEST_CHECKPOINT_STATUS.COMPLETED;
      await manager.saveCheckpoint(completedCheckpoint);

      const resumable = await manager.findResumableCheckpoints(TEST_NETWORKS.TESTNET);

      expect(resumable).to.have.lengthOf(2);
      // Should include both in-progress and failed
      const statuses = resumable.map((cp) => cp.status);
      expect(statuses).to.include(TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      expect(statuses).to.include(TEST_CHECKPOINT_STATUS.FAILED);
      // Should NOT include completed
      expect(statuses).to.not.include(TEST_CHECKPOINT_STATUS.COMPLETED);
    });

    it("should filter by workflow type", async () => {
      // Create newBlr checkpoint
      const newBlrCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      newBlrCheckpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(newBlrCheckpoint);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      // Create existingBlr checkpoint
      const existingBlrCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.EXISTING_BLR,
        options: {},
      });
      existingBlrCheckpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(existingBlrCheckpoint);

      // Find only newBlr checkpoints
      const newBlrResumable = await manager.findResumableCheckpoints(TEST_NETWORKS.TESTNET, TEST_WORKFLOWS.NEW_BLR);
      expect(newBlrResumable).to.have.lengthOf(1);
      expect(newBlrResumable[0].workflowType).to.equal(TEST_WORKFLOWS.NEW_BLR);

      // Find only existingBlr checkpoints
      const existingBlrResumable = await manager.findResumableCheckpoints(
        TEST_NETWORKS.TESTNET,
        TEST_WORKFLOWS.EXISTING_BLR,
      );
      expect(existingBlrResumable).to.have.lengthOf(1);
      expect(existingBlrResumable[0].workflowType).to.equal(TEST_WORKFLOWS.EXISTING_BLR);
    });

    it("should sort by timestamp (newest first)", async () => {
      // Create older checkpoint
      const olderCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      olderCheckpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(olderCheckpoint);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MEDIUM));

      // Create newer checkpoint
      const newerCheckpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      newerCheckpoint.status = TEST_CHECKPOINT_STATUS.FAILED;
      await manager.saveCheckpoint(newerCheckpoint);

      const resumable = await manager.findResumableCheckpoints(TEST_NETWORKS.TESTNET);

      expect(resumable).to.have.lengthOf(2);
      // Newest first
      expect(resumable[0].checkpointId).to.equal(newerCheckpoint.checkpointId);
      expect(resumable[1].checkpointId).to.equal(olderCheckpoint.checkpointId);
    });

    it("should return empty array when no resumable checkpoints", async () => {
      const resumable = await manager.findResumableCheckpoints(TEST_NETWORKS.TESTNET);
      expect(resumable).to.be.an("array");
      expect(resumable).to.have.lengthOf(0);
    });
  });

  describe("prepareForResume", () => {
    it("should reset failed status to in-progress", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      checkpoint.status = TEST_CHECKPOINT_STATUS.FAILED;
      checkpoint.failure = {
        step: 2,
        stepName: "Facets",
        error: "Test error",
        timestamp: new Date().toISOString(),
      };
      await manager.saveCheckpoint(checkpoint);

      expect(checkpoint.status).to.equal(TEST_CHECKPOINT_STATUS.FAILED);
      expect(checkpoint.failure).to.not.be.undefined;

      await manager.prepareForResume(checkpoint);

      expect(checkpoint.status).to.equal(TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      expect(checkpoint.failure).to.be.undefined;

      // Verify it was saved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.not.be.null;
      expect(loaded!.status).to.equal(TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      expect(loaded!.failure).to.be.undefined;
    });

    it("should be a no-op for in-progress checkpoints", async () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });
      checkpoint.status = TEST_CHECKPOINT_STATUS.IN_PROGRESS;
      await manager.saveCheckpoint(checkpoint);

      const originalLastUpdate = checkpoint.lastUpdate;

      // Small delay to detect if lastUpdate changes
      await new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.SHORT));

      await manager.prepareForResume(checkpoint);

      expect(checkpoint.status).to.equal(TEST_CHECKPOINT_STATUS.IN_PROGRESS);
      // Should not have been saved (lastUpdate unchanged)
      expect(checkpoint.lastUpdate).to.equal(originalLastUpdate);
    });
  });

  describe("schemaVersion", () => {
    it("should include schemaVersion when creating checkpoint", () => {
      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        options: {},
      });

      expect(checkpoint.schemaVersion).to.be.a("number");
      expect(checkpoint.schemaVersion).to.equal(2); // Current version
    });

    it("should load and migrate legacy checkpoints without schemaVersion", async () => {
      // Create checkpoint manually without schemaVersion (legacy)
      const checkpointId = `${TEST_NETWORKS.TESTNET}-${Date.now()}`;
      const legacyCheckpoint = {
        checkpointId,
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS,
        currentStep: 1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        steps: {},
        options: {},
        // Note: no schemaVersion field (legacy)
      };

      // Write directly to file
      const filepath = join(testCheckpointsDir, `${checkpointId}.json`);
      await fs.writeFile(filepath, JSON.stringify(legacyCheckpoint), "utf-8");

      // Load through manager (should migrate)
      const loaded = await manager.loadCheckpoint(checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.schemaVersion).to.equal(2); // Migrated to current version
    });

    it("should throw error for checkpoints with newer schema version", async () => {
      // Create checkpoint with future schema version
      const checkpointId = `${TEST_NETWORKS.TESTNET}-${Date.now()}`;
      const futureCheckpoint = {
        schemaVersion: 999, // Future version
        checkpointId,
        network: TEST_NETWORKS.TESTNET,
        deployer: TEST_ADDRESSES.VALID_0,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS,
        currentStep: 1,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        steps: {},
        options: {},
      };

      // Write directly to file
      const filepath = join(testCheckpointsDir, `${checkpointId}.json`);
      await fs.writeFile(filepath, JSON.stringify(futureCheckpoint), "utf-8");

      // Should throw when loading
      try {
        await manager.loadCheckpoint(checkpointId);
        expect.fail("Should have thrown error for future schema version");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect((err as Error).message).to.include("schema version 999");
        expect((err as Error).message).to.include("upgrade");
      }
    });
  });
});
