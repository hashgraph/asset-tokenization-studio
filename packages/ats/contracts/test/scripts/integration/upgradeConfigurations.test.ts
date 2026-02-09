// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for upgradeConfigurations workflow.
 *
 * Tests the complete workflow for upgrading facet configurations including:
 * - Facet deployment and registration in existing BLR
 * - Configuration version creation (Equity, Bond, or both)
 * - Optional proxy updates with continue-on-error pattern
 * - Checkpoint resumability from each workflow step
 * - TimeTravel mode support
 * - Access control and error handling
 *
 * @module test/scripts/integration/upgradeConfigurations.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { CheckpointManager, getResolverProxyConfigInfo } from "@scripts/infrastructure";
import { upgradeConfigurations } from "@scripts";
import { silenceScriptLogging } from "@test";
import {
  deployUpgradeTestFixture,
  deployUpgradeInfrastructureOnlyFixture,
} from "../../fixtures/upgradeConfigurations.fixture";
import {
  createCheckpointWithState,
  simulateFailureAtStep,
  cleanupTestCheckpoints,
  createTestCheckpointsDir,
  createDeployedContract,
  createConfigurationResult,
} from "../../helpers/checkpointTestHelpers";

describe("upgradeConfigurations - Integration Tests", () => {
  before(silenceScriptLogging);

  describe("Basic Upgrade Flow", () => {
    it("should deploy facets, register, and create both configurations", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "both",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.facets).to.have.length.greaterThan(40);
      expect(result.configurations.equity).to.exist;
      expect(result.configurations.bond).to.exist;
      expect(result.configurations.equity?.version).to.equal(2);
      expect(result.configurations.bond?.version).to.equal(2);
      expect(result.summary.totalFacetsDeployed).to.be.greaterThan(40);
      expect(result.summary.configurationsCreated).to.equal(2);
    });

    it("should create only equity configuration when specified", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.configurations.equity).to.exist;
      expect(result.configurations.bond).to.be.undefined;
      expect(result.summary.configurationsCreated).to.equal(1);
    });

    it("should create only bond configuration when specified", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "bond",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.configurations.equity).to.be.undefined;
      expect(result.configurations.bond).to.exist;
      expect(result.summary.configurationsCreated).to.equal(1);
    });

    it("should include network and timestamp in output", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.network).to.equal("hardhat");
      expect(result.timestamp).to.exist;
      expect(result.deployer).to.equal(await deployer.getAddress());
      expect(result.blr.address).to.equal(blrAddress);
      expect(result.blr.isExternal).to.be.true;
    });

    it("should include facet details with addresses and keys", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.facets).to.be.an("array");
      expect(result.facets.length).to.be.greaterThan(40);

      const facet = result.facets[0];
      expect(facet.name).to.exist;
      expect(facet.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(facet.key).to.exist;
    });
  });

  describe("Proxy Updates", () => {
    it("should update single proxy successfully", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);

      // Verify initial version
      const configBefore = await getResolverProxyConfigInfo(deployer, equityTokenAddress);
      expect(configBefore.version).to.equal(1);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [equityTokenAddress],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates).to.exist;
      expect(result.proxyUpdates).to.have.length(1);
      expect(result.proxyUpdates![0].success).to.be.true;
      expect(result.proxyUpdates![0].proxyAddress).to.equal(equityTokenAddress);
      expect(result.proxyUpdates![0].previousVersion).to.equal(1);
      expect(result.proxyUpdates![0].newVersion).to.equal(2);
      expect(result.summary.proxiesUpdated).to.equal(1);
      expect(result.summary.proxiesFailed).to.equal(0);

      // Verify version was updated on-chain
      const configAfter = await getResolverProxyConfigInfo(deployer, equityTokenAddress);
      expect(configAfter.version).to.equal(2);
    });

    it("should update multiple proxies successfully", async () => {
      const { deployer, blrAddress, equityTokenAddress, bondTokenAddress } =
        await loadFixture(deployUpgradeTestFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "both",
        proxyAddresses: [equityTokenAddress, bondTokenAddress],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates).to.have.length(2);
      expect(result.proxyUpdates![0].success).to.be.true;
      expect(result.proxyUpdates![1].success).to.be.true;
      expect(result.summary.proxiesUpdated).to.equal(2);
      expect(result.summary.proxiesFailed).to.equal(0);

      // Verify both proxies were updated
      const equityConfig = await getResolverProxyConfigInfo(deployer, equityTokenAddress);
      const bondConfig = await getResolverProxyConfigInfo(deployer, bondTokenAddress);
      expect(equityConfig.version).to.equal(2);
      expect(bondConfig.version).to.equal(2);
    });

    it("should continue on partial proxy update failures", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);
      const invalidProxyAddress = "0x1234567890123456789012345678901234567890";

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [invalidProxyAddress, equityTokenAddress],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      // Workflow should succeed even with partial failures
      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates).to.have.length(2);

      // First proxy should fail
      expect(result.proxyUpdates![0].success).to.be.false;
      expect(result.proxyUpdates![0].error).to.exist;
      expect(result.proxyUpdates![0].proxyAddress).to.equal(invalidProxyAddress);

      // Second proxy should succeed
      expect(result.proxyUpdates![1].success).to.be.true;
      expect(result.proxyUpdates![1].proxyAddress).to.equal(equityTokenAddress);

      expect(result.summary.proxiesUpdated).to.equal(1);
      expect(result.summary.proxiesFailed).to.equal(1);
    });

    it("should skip proxy updates when proxyAddresses is empty", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates).to.be.undefined;
      expect(result.summary.proxiesUpdated).to.equal(0);
      expect(result.summary.proxiesFailed).to.equal(0);
    });

    it("should skip proxy updates when proxyAddresses is not provided", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates).to.be.undefined;
      expect(result.summary.proxiesUpdated).to.equal(0);
      expect(result.summary.proxiesFailed).to.equal(0);
    });
  });

  describe("Checkpoint Resumability", () => {
    let testDir: string;
    let manager: CheckpointManager;
    let signers: HardhatEthersSigner[];

    beforeEach(async () => {
      testDir = createTestCheckpointsDir();
      manager = new CheckpointManager(undefined, testDir);
      await cleanupTestCheckpoints(testDir);
      signers = await ethers.getSigners();
    });

    afterEach(async () => {
      await cleanupTestCheckpoints(testDir);
    });

    it("should resume from facets step failure", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();
      const blrAddress = "0x1111111111111111111111111111111111111111";

      // Create checkpoint with partial facets deployed
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 0,
        workflowType: "upgradeConfigurations",
        steps: {
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x4444444444444444444444444444444444444444", "0x222...")],
          ]),
        },
        options: {
          blrAddress,
          configurations: "both",
        },
      });

      // Simulate failure at facets step
      simulateFailureAtStep(checkpoint, 0, "Simulated facet deployment failure", "upgradeConfigurations");
      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint can be loaded
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;
      expect(loaded?.status).to.equal("failed");
      expect(loaded?.currentStep).to.equal(0);
      expect(loaded?.steps.facets?.size).to.equal(2);
      expect(loaded?.options.blrAddress).to.equal(blrAddress);
      expect(loaded?.options.configurations).to.equal("both");
    });

    it("should resume from register facets step failure", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();
      const blrAddress = "0x1111111111111111111111111111111111111111";

      // Create checkpoint with all facets deployed
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 1,
        workflowType: "upgradeConfigurations",
        steps: {
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x4444444444444444444444444444444444444444", "0x222...")],
            ["PauseFacet", createDeployedContract("0x5555555555555555555555555555555555555555", "0x333...")],
          ]),
        },
        options: {
          blrAddress,
          configurations: "equity",
        },
      });

      // Simulate failure at register facets step
      simulateFailureAtStep(checkpoint, 1, "Simulated facet registration failure", "upgradeConfigurations");
      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint can be loaded
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;
      expect(loaded?.status).to.equal("failed");
      expect(loaded?.currentStep).to.equal(1);
      expect(loaded?.steps.facets?.size).to.equal(3);
      expect(loaded?.options.configurations).to.equal("equity");
    });

    it("should resume from equity configuration step failure", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();
      const blrAddress = "0x1111111111111111111111111111111111111111";

      // Create checkpoint with facets deployed and registered
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 2,
        workflowType: "upgradeConfigurations",
        steps: {
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
            ["ERC20Facet", createDeployedContract("0x4444444444444444444444444444444444444444", "0x222...")],
          ]),
          facetsRegistered: true,
        },
        options: {
          blrAddress,
          configurations: "both",
        },
      });

      // Simulate failure at equity configuration step
      simulateFailureAtStep(checkpoint, 2, "Simulated equity configuration failure", "upgradeConfigurations");
      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint can be loaded
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;
      expect(loaded?.status).to.equal("failed");
      expect(loaded?.currentStep).to.equal(2);
      expect(loaded?.steps.facetsRegistered).to.be.true;
    });

    it("should resume from proxy updates step failure", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();
      const blrAddress = "0x1111111111111111111111111111111111111111";
      const proxyAddress = "0x6666666666666666666666666666666666666666";

      // Create checkpoint with configurations created
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 4,
        workflowType: "upgradeConfigurations",
        steps: {
          facets: new Map([
            ["AccessControlFacet", createDeployedContract("0x3333333333333333333333333333333333333333", "0x111...")],
          ]),
          facetsRegistered: true,
          configurations: {
            equity: createConfigurationResult(
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              2,
              43,
              "0xeq123",
            ),
          },
          proxyUpdates: new Map([
            [
              proxyAddress,
              {
                success: false,
                error: "Simulated proxy update failure",
              },
            ],
          ]),
        },
        options: {
          blrAddress,
          configurations: "equity",
          proxyAddresses: [proxyAddress],
        },
      });

      // Simulate failure at proxy updates step
      simulateFailureAtStep(checkpoint, 4, "Simulated proxy update failure", "upgradeConfigurations");
      await manager.saveCheckpoint(checkpoint);

      // Verify checkpoint can be loaded
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.exist;
      expect(loaded?.status).to.equal("failed");
      expect(loaded?.currentStep).to.equal(4);
      expect(loaded?.steps.configurations?.equity).to.exist;
      expect(loaded?.steps.proxyUpdates?.size).to.equal(1);
    });

    it("should save and restore workflow options", async () => {
      const deployer = signers[0];
      const deployerAddress = await deployer.getAddress();
      const blrAddress = "0x1111111111111111111111111111111111111111";

      // Create checkpoint with workflow-specific options
      const checkpoint = await createCheckpointWithState(manager, {
        network: "hardhat",
        deployer: deployerAddress,
        status: "in-progress",
        currentStep: 0,
        workflowType: "upgradeConfigurations",
        steps: {
          facets: new Map(),
        },
        options: {
          blrAddress,
          configurations: "equity",
        },
      });

      await manager.saveCheckpoint(checkpoint);

      // Verify workflow options were saved
      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded?.options.blrAddress).to.equal(blrAddress);
      expect(loaded?.options.configurations).to.equal("equity");
    });
  });

  describe("TimeTravel Mode", () => {
    it("should deploy TimeTravel facets when useTimeTravel is true", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: true,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;

      // Check that TimeTravel variants are present
      const timeTravelFacets = result.facets.filter((f: { name: string }) => f.name.includes("TimeTravel"));
      expect(timeTravelFacets.length).to.be.greaterThan(0);
    });

    it("should not deploy TimeTravel facets when useTimeTravel is false", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;

      // Check that no TimeTravel variants are present
      const timeTravelFacets = result.facets.filter((f: { name: string }) => f.name.includes("TimeTravel"));
      expect(timeTravelFacets.length).to.equal(0);
    });
  });

  describe("Error Handling", () => {
    it("should fail for invalid BLR address format", async () => {
      const [deployer] = await ethers.getSigners();

      await expect(
        upgradeConfigurations(deployer, "hardhat", {
          blrAddress: "invalid-address",
          useTimeTravel: false,
          configurations: "equity",
          saveOutput: false,
          ignoreCheckpoint: true,
        }),
      ).to.be.rejectedWith("Invalid BLR address format");
    });

    it("should fail for non-existent BLR address", async () => {
      const [deployer] = await ethers.getSigners();
      const nonExistentBLR = "0x1234567890123456789012345678901234567890";

      await expect(
        upgradeConfigurations(deployer, "hardhat", {
          blrAddress: nonExistentBLR,
          useTimeTravel: false,
          configurations: "equity",
          saveOutput: false,
          ignoreCheckpoint: true,
        }),
      ).to.be.rejectedWith(/No contract found at BLR address/);
    });

    it("should fail when caller lacks required permissions", async () => {
      const { blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);
      const signers = await ethers.getSigners();
      const unauthorizedSigner = signers[1]; // Not the deployer

      await expect(
        upgradeConfigurations(unauthorizedSigner, "hardhat", {
          blrAddress,
          useTimeTravel: false,
          configurations: "equity",
          saveOutput: false,
          ignoreCheckpoint: true,
        }),
      ).to.be.rejected;
    });

    it("should handle resumeFrom for non-existent checkpoint", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);
      const nonExistentCheckpoint = "hardhat-invalid-checkpoint-id";

      await expect(
        upgradeConfigurations(deployer, "hardhat", {
          blrAddress,
          useTimeTravel: false,
          configurations: "equity",
          saveOutput: false,
          resumeFrom: nonExistentCheckpoint,
        }),
      ).to.be.rejectedWith(/Checkpoint not found/);
    });
  });

  describe("Configuration Options", () => {
    it("should respect custom batchSize option", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        batchSize: 10,
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      // Configuration should still be created successfully with custom batch size
      expect(result.configurations.equity).to.exist;
    });

    it("should respect confirmations option", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        confirmations: 1, // Use 1 confirmation for Hardhat network compatibility
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.configurations.equity).to.exist;
    });

    it("should save output when saveOutput is true", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);
      const fs = require("fs/promises");
      const path = require("path");

      // Use explicit output path for testing
      const outputPath = path.join(__dirname, "../../..", "deployments", "test-output-verification.json");

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: true,
        outputPath,
      });

      expect(result.summary.success).to.be.true;

      // Verify file was created
      const fileExists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists, "Output file should exist").to.be.true;

      // Verify file content matches the result
      const fileContent = JSON.parse(await fs.readFile(outputPath, "utf-8"));
      expect(fileContent.network).to.equal(result.network);
      expect(fileContent.deployer).to.equal(result.deployer);
      expect(fileContent.facets).to.have.lengthOf(result.facets.length);
      expect(fileContent.configurations.equity).to.exist;
      expect(fileContent.summary.success).to.be.true;

      // Cleanup test file
      await fs.unlink(outputPath).catch(() => {});
    });
  });

  describe("Proxy Update Results", () => {
    it("should include transaction hash for successful proxy updates", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [equityTokenAddress],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.proxyUpdates![0].transactionHash).to.exist;
      expect(result.proxyUpdates![0].transactionHash).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should include error message for failed proxy updates", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);
      const invalidProxy = "0x1234567890123456789012345678901234567890";

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [invalidProxy],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true; // Workflow succeeds even with proxy failures
      expect(result.proxyUpdates![0].success).to.be.false;
      expect(result.proxyUpdates![0].error).to.exist;
      expect(result.proxyUpdates![0].error).to.be.a("string");
    });

    it("should track previous and new version for successful updates", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [equityTokenAddress],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.proxyUpdates![0].previousVersion).to.equal(1);
      expect(result.proxyUpdates![0].newVersion).to.equal(2);
    });
  });

  describe("Summary Statistics", () => {
    it("should accurately count deployed facets", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.totalFacetsDeployed).to.equal(result.facets.length);
      expect(result.summary.totalFacetsDeployed).to.be.greaterThan(40);
    });

    it("should accurately count configurations created", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const resultEquity = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });
      expect(resultEquity.summary.configurationsCreated).to.equal(1);

      const resultBoth = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "both",
        saveOutput: false,
        ignoreCheckpoint: true,
      });
      expect(resultBoth.summary.configurationsCreated).to.equal(2);
    });

    it("should accurately count proxy update successes and failures", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);
      const invalidProxy = "0x1234567890123456789012345678901234567890";

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        proxyAddresses: [equityTokenAddress, invalidProxy],
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.proxiesUpdated).to.equal(1);
      expect(result.summary.proxiesFailed).to.equal(1);
    });

    it("should mark success as true when workflow completes", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      const result = await upgradeConfigurations(deployer, "hardhat", {
        blrAddress,
        useTimeTravel: false,
        configurations: "equity",
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
    });
  });

  describe("Input Immutability", () => {
    it("should not modify input options during execution", async () => {
      const { deployer, blrAddress } = await loadFixture(deployUpgradeInfrastructureOnlyFixture);

      // Create deeply frozen options to ensure immutability
      const options = Object.freeze({
        blrAddress,
        configurations: "equity" as const,
        useTimeTravel: false,
        batchSize: 10,
        proxyAddresses: Object.freeze([]),
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      // Store original values for comparison
      const originalOptions = JSON.parse(JSON.stringify(options));

      // Execute workflow
      await upgradeConfigurations(deployer, "hardhat", options);

      // Verify options weren't mutated
      expect(options).to.deep.equal(originalOptions);
      expect(options.proxyAddresses).to.have.lengthOf(0);
      expect(options.configurations).to.equal("equity");
      expect(options.useTimeTravel).to.be.false;
      expect(options.batchSize).to.equal(10);
    });

    it("should not modify options with proxy addresses", async () => {
      const { deployer, blrAddress, equityTokenAddress } = await loadFixture(deployUpgradeTestFixture);

      // Create frozen options with proxy addresses
      const options = Object.freeze({
        blrAddress,
        configurations: "equity" as const,
        useTimeTravel: false,
        proxyAddresses: Object.freeze([equityTokenAddress]),
        saveOutput: false,
        ignoreCheckpoint: true,
      });

      const originalOptions = JSON.parse(JSON.stringify(options));

      // Execute workflow
      await upgradeConfigurations(deployer, "hardhat", options);

      // Verify options weren't mutated
      expect(options).to.deep.equal(originalOptions);
      expect(options.proxyAddresses).to.have.lengthOf(1);
      expect(options.proxyAddresses[0]).to.equal(equityTokenAddress);
    });
  });
});
