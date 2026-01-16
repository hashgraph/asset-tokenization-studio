// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { promises as fs } from "fs";
import { join } from "path";
import { CheckpointManager } from "../../../../scripts/infrastructure/checkpoint/CheckpointManager";

describe("CheckpointManager", () => {
  const testCheckpointsDir = join(__dirname, "../../../../deployments/test/unit/.checkpoints");
  let manager: CheckpointManager;

  beforeEach(async () => {
    // Create test checkpoint manager with custom directory
    manager = new CheckpointManager(undefined, testCheckpointsDir);

    // Ensure test directory exists and is empty
    try {
      await fs.rm(testCheckpointsDir, { recursive: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }
    await fs.mkdir(testCheckpointsDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testCheckpointsDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("createCheckpoint", () => {
    it("should create a checkpoint with correct structure", () => {
      const checkpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {
          useTimeTravel: false,
          confirmations: 2,
        },
      });

      expect(checkpoint).to.have.property("checkpointId");
      expect(checkpoint.checkpointId).to.match(/^hedera-testnet-\d+$/);
      expect(checkpoint.network).to.equal("hedera-testnet");
      expect(checkpoint.deployer).to.equal("0x1234567890123456789012345678901234567890");
      expect(checkpoint.status).to.equal("in-progress");
      expect(checkpoint.currentStep).to.equal(-1);
      expect(checkpoint.workflowType).to.equal("newBlr");
      expect(checkpoint).to.have.property("startTime");
      expect(checkpoint).to.have.property("lastUpdate");
      expect(checkpoint.steps).to.deep.equal({});
      expect(checkpoint.options).to.deep.equal({
        useTimeTravel: false,
        confirmations: 2,
      });
      expect(checkpoint).to.not.have.property("failure");
    });

    it("should create unique checkpoint IDs", () => {
      const checkpoint1 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      // Wait a bit to ensure different timestamp
      const now = Date.now();
      while (Date.now() === now) {
        // Busy wait
      }

      const checkpoint2 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      expect(checkpoint1.checkpointId).to.not.equal(checkpoint2.checkpointId);
    });

    it("should support existingBlr workflow type", () => {
      const checkpoint = manager.createCheckpoint({
        network: "hedera-mainnet",
        deployer: "0xabcdef0123456789012345678901234567890123",
        workflowType: "existingBlr",
        options: {
          deployFacets: true,
          deployFactory: false,
        },
      });

      expect(checkpoint.workflowType).to.equal("existingBlr");
      expect(checkpoint.options).to.deep.equal({
        deployFacets: true,
        deployFactory: false,
      });
    });
  });

  describe("saveCheckpoint", () => {
    it("should save checkpoint to disk", async () => {
      const checkpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
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
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      const originalLastUpdate = checkpoint.lastUpdate;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      await manager.saveCheckpoint(checkpoint);

      expect(checkpoint.lastUpdate).to.not.equal(originalLastUpdate);
    });

    it("should serialize checkpoint with valid JSON", async () => {
      const checkpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      checkpoint.steps.proxyAdmin = {
        address: "0x1111111111111111111111111111111111111111",
        txHash: "0xabc123",
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
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      checkpoint.steps.facets = new Map([
        [
          "AccessControlFacet",
          {
            address: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: new Date().toISOString(),
          },
        ],
        [
          "PausableFacet",
          {
            address: "0x3333333333333333333333333333333333333333",
            txHash: "0xghi789",
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
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: { useTimeTravel: true },
      });

      original.steps.proxyAdmin = {
        address: "0x1111111111111111111111111111111111111111",
        txHash: "0xabc123",
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
      const loaded = await manager.loadCheckpoint("hedera-testnet-99999999999");

      expect(loaded).to.be.null;
    });

    it("should deserialize Map for facets", async () => {
      const original = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      const facet1 = {
        address: "0x2222222222222222222222222222222222222222",
        txHash: "0xdef456",
        deployedAt: new Date().toISOString(),
      };

      const facet2 = {
        address: "0x3333333333333333333333333333333333333333",
        txHash: "0xghi789",
        deployedAt: new Date().toISOString(),
      };

      original.steps.facets = new Map([
        ["AccessControlFacet", facet1],
        ["PausableFacet", facet2],
      ]);

      await manager.saveCheckpoint(original);

      const loaded = await manager.loadCheckpoint(original.checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.steps.facets).to.be.instanceOf(Map);
      expect(loaded!.steps.facets!.size).to.equal(2);
      expect(loaded!.steps.facets!.get("AccessControlFacet")).to.deep.equal(facet1);
      expect(loaded!.steps.facets!.get("PausableFacet")).to.deep.equal(facet2);
    });

    it("should handle checkpoint with failure information", async () => {
      const original = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      original.status = "failed";
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
      expect(loaded!.status).to.equal("failed");
      expect(loaded!.failure).to.deep.equal(original.failure);
    });
  });

  describe("findCheckpoints", () => {
    it("should find all checkpoints for a network", async () => {
      const checkpoint1 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });
      await manager.saveCheckpoint(checkpoint1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint2 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0xabcdef0123456789012345678901234567890123",
        workflowType: "existingBlr",
        options: {},
      });
      await manager.saveCheckpoint(checkpoint2);

      const found = await manager.findCheckpoints("hedera-testnet");

      expect(found).to.have.lengthOf(2);
      expect(found.map((c) => c.checkpointId)).to.include.members([checkpoint1.checkpointId, checkpoint2.checkpointId]);
    });

    it("should filter by status", async () => {
      const checkpoint1 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });
      checkpoint1.status = "in-progress";
      await manager.saveCheckpoint(checkpoint1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint2 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0xabcdef0123456789012345678901234567890123",
        workflowType: "newBlr",
        options: {},
      });
      checkpoint2.status = "completed";
      await manager.saveCheckpoint(checkpoint2);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint3 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0xfedcba9876543210987654321098765432109876",
        workflowType: "newBlr",
        options: {},
      });
      checkpoint3.status = "failed";
      await manager.saveCheckpoint(checkpoint3);

      const inProgress = await manager.findCheckpoints("hedera-testnet", "in-progress");
      const completed = await manager.findCheckpoints("hedera-testnet", "completed");
      const failed = await manager.findCheckpoints("hedera-testnet", "failed");

      expect(inProgress).to.have.lengthOf(1);
      expect(inProgress[0].checkpointId).to.equal(checkpoint1.checkpointId);

      expect(completed).to.have.lengthOf(1);
      expect(completed[0].checkpointId).to.equal(checkpoint2.checkpointId);

      expect(failed).to.have.lengthOf(1);
      expect(failed[0].checkpointId).to.equal(checkpoint3.checkpointId);
    });

    it("should return empty array for non-existent network", async () => {
      const found = await manager.findCheckpoints("non-existent-network");

      expect(found).to.be.an("array");
      expect(found).to.have.lengthOf(0);
    });

    it("should sort checkpoints by timestamp (newest first)", async () => {
      // Create checkpoints with slight delays to ensure different timestamps
      const checkpoint1 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1111111111111111111111111111111111111111",
        workflowType: "newBlr",
        options: {},
      });
      await manager.saveCheckpoint(checkpoint1);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint2 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x2222222222222222222222222222222222222222",
        workflowType: "newBlr",
        options: {},
      });
      await manager.saveCheckpoint(checkpoint2);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const checkpoint3 = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x3333333333333333333333333333333333333333",
        workflowType: "newBlr",
        options: {},
      });
      await manager.saveCheckpoint(checkpoint3);

      const found = await manager.findCheckpoints("hedera-testnet");

      expect(found).to.have.lengthOf(3);
      // Should be sorted newest first
      expect(found[0].checkpointId).to.equal(checkpoint3.checkpointId);
      expect(found[1].checkpointId).to.equal(checkpoint2.checkpointId);
      expect(found[2].checkpointId).to.equal(checkpoint1.checkpointId);
    });

    it("should not return checkpoints from other networks", async () => {
      const testnetCheckpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });

      const mainnetCheckpoint = manager.createCheckpoint({
        network: "hedera-mainnet",
        deployer: "0xabcdef0123456789012345678901234567890123",
        workflowType: "newBlr",
        options: {},
      });

      await manager.saveCheckpoint(testnetCheckpoint);
      await manager.saveCheckpoint(mainnetCheckpoint);

      const testnetFound = await manager.findCheckpoints("hedera-testnet");
      const mainnetFound = await manager.findCheckpoints("hedera-mainnet");

      expect(testnetFound).to.have.lengthOf(1);
      expect(testnetFound[0].checkpointId).to.equal(testnetCheckpoint.checkpointId);

      expect(mainnetFound).to.have.lengthOf(1);
      expect(mainnetFound[0].checkpointId).to.equal(mainnetCheckpoint.checkpointId);
    });
  });

  describe("deleteCheckpoint", () => {
    it("should delete checkpoint from disk", async () => {
      const checkpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
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
      await expect(manager.deleteCheckpoint("hedera-testnet-99999999999")).to.not.be.rejected;
    });
  });

  describe("cleanupOldCheckpoints", () => {
    it("should delete completed checkpoints older than specified days", async () => {
      // Create old checkpoint (simulate by manually setting timestamp in ID)
      const oldTimestamp = Date.now() - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const oldCheckpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });
      // Override checkpointId with old timestamp
      (oldCheckpoint as any).checkpointId = `hedera-testnet-${oldTimestamp}`;
      oldCheckpoint.status = "completed";
      await manager.saveCheckpoint(oldCheckpoint);

      // Create recent checkpoint
      const recentCheckpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0xabcdef0123456789012345678901234567890123",
        workflowType: "newBlr",
        options: {},
      });
      recentCheckpoint.status = "completed";
      await manager.saveCheckpoint(recentCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      expect(deleted).to.equal(1);

      const remaining = await manager.findCheckpoints("hedera-testnet", "completed");
      expect(remaining).to.have.lengthOf(1);
      expect(remaining[0].checkpointId).to.equal(recentCheckpoint.checkpointId);
    });

    it("should not delete failed checkpoints", async () => {
      const oldTimestamp = Date.now() - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const oldFailedCheckpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });
      (oldFailedCheckpoint as any).checkpointId = `hedera-testnet-${oldTimestamp}`;
      oldFailedCheckpoint.status = "failed";
      await manager.saveCheckpoint(oldFailedCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      expect(deleted).to.equal(0);

      const remaining = await manager.findCheckpoints("hedera-testnet", "failed");
      expect(remaining).to.have.lengthOf(1);
    });

    it("should not delete in-progress checkpoints", async () => {
      const oldTimestamp = Date.now() - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const oldInProgressCheckpoint = manager.createCheckpoint({
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        workflowType: "newBlr",
        options: {},
      });
      (oldInProgressCheckpoint as any).checkpointId = `hedera-testnet-${oldTimestamp}`;
      oldInProgressCheckpoint.status = "in-progress";
      await manager.saveCheckpoint(oldInProgressCheckpoint);

      const deleted = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      expect(deleted).to.equal(0);

      const remaining = await manager.findCheckpoints("hedera-testnet", "in-progress");
      expect(remaining).to.have.lengthOf(1);
    });

    it("should return 0 when no checkpoints to cleanup", async () => {
      const deleted = await manager.cleanupOldCheckpoints("hedera-testnet", 30);

      expect(deleted).to.equal(0);
    });
  });
});
