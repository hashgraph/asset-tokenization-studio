// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for upgradeTupProxies workflow.
 *
 * Tests the complete workflow for upgrading TransparentUpgradeableProxy implementations including:
 * - Deploying new implementations or using provided addresses (two patterns)
 * - Upgrading one or both proxies (BLR and Factory)
 * - Verifying implementations before and after upgrades
 * - Checkpoint resumability from each workflow step
 * - Error handling with continue-on-error pattern
 * - Gas tracking and output formatting
 *
 * @module test/scripts/integration/upgradeTupProxies.test
 */

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { join } from "path";
import { upgradeTupProxies } from "@scripts";
import { getTestCheckpointsDir } from "@scripts/infrastructure";
import { silenceScriptLogging, createCheckpointCleanupHooks, removeTestDeployments, TEST_OPTIONS } from "@test";
import {
  deployTupUpgradeTestFixture,
  deployBlrV2Implementation,
  deployFactoryV2Implementation,
} from "../../fixtures/upgradeTupProxies.fixture";

describe("upgradeTupProxies - Integration Tests", () => {
  before(silenceScriptLogging);

  after(async () => {
    await removeTestDeployments();
  });

  describe("Basic Upgrade Flow - Deploy New Implementations", () => {
    it("should upgrade both BLR and Factory with new implementations", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        deployNewBlrImpl: true,
        deployNewFactoryImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.summary.proxiesUpgraded).to.equal(2);
      expect(result.summary.proxiesFailed).to.equal(0);
      expect(result.blrUpgrade).to.exist;
      expect(result.blrUpgrade?.success).to.be.true;
      expect(result.blrUpgrade?.upgraded).to.be.true;
      expect(result.factoryUpgrade).to.exist;
      expect(result.factoryUpgrade?.success).to.be.true;
      expect(result.factoryUpgrade?.upgraded).to.be.true;
      expect(result.implementations?.blr).to.exist;
      expect(result.implementations?.factory).to.exist;
    });

    it("should upgrade BLR only with new implementation", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.summary.proxiesUpgraded).to.equal(1);
      expect(result.blrUpgrade?.success).to.be.true;
      expect(result.blrUpgrade?.upgraded).to.be.true;
      expect(result.factoryUpgrade).to.be.undefined;
      expect(result.implementations?.blr).to.exist;
      expect(result.implementations?.factory).to.be.undefined;
    });

    it("should upgrade Factory only with new implementation", async () => {
      const { deployer, proxyAdminAddress, factoryProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        factoryProxyAddress,
        deployNewFactoryImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.summary.proxiesUpgraded).to.equal(1);
      expect(result.factoryUpgrade?.success).to.be.true;
      expect(result.factoryUpgrade?.upgraded).to.be.true;
      expect(result.blrUpgrade).to.be.undefined;
      expect(result.implementations?.factory).to.exist;
    });

    it("should include correct implementation addresses in upgrade results", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.blrUpgrade?.newImplementation).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.blrUpgrade?.oldImplementation).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.blrUpgrade?.oldImplementation).to.not.equal(result.blrUpgrade?.newImplementation);
    });

    it("should track gas usage correctly", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(parseInt(result.summary.gasUsed)).to.be.greaterThan(0);
      expect(result.blrUpgrade?.gasUsed).to.be.greaterThan(0);
    });

    it("should generate correct output structure", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        deployNewBlrImpl: true,
        deployNewFactoryImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.network).to.equal("hardhat");
      expect(result.timestamp).to.exist;
      expect(result.deployer).to.equal(await deployer.getAddress());
      expect(result.proxyAdmin.address).to.equal(proxyAdminAddress);
      expect(result.summary).to.have.all.keys(
        "proxiesUpgraded",
        "proxiesFailed",
        "deploymentTime",
        "gasUsed",
        "success",
      );
    });

    it("should include transaction hashes in upgrade results", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.blrUpgrade?.transactionHash).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should not upgrade if already at target implementation", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      // First upgrade to V2
      const firstUpgrade = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(firstUpgrade.blrUpgrade?.upgraded).to.be.true;

      // Try upgrading again to same version
      const secondUpgrade = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        blrImplementationAddress: firstUpgrade.blrUpgrade?.newImplementation,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(secondUpgrade.blrUpgrade?.upgraded).to.be.false;
    });
  });

  describe("Basic Upgrade Flow - Use Provided Implementations", () => {
    it("should upgrade both using provided implementations", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      // Deploy new implementations
      const blrV2 = await deployBlrV2Implementation(deployer);
      const factoryV2 = await deployFactoryV2Implementation(deployer);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        blrImplementationAddress: blrV2.address,
        factoryImplementationAddress: factoryV2.address,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.summary.proxiesUpgraded).to.equal(2);
      expect(result.blrUpgrade?.newImplementation).to.equal(blrV2.address);
      expect(result.factoryUpgrade?.newImplementation).to.equal(factoryV2.address);
      expect(result.implementations).to.be.undefined;
    });

    it("should upgrade BLR using provided implementation", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const blrV2 = await deployBlrV2Implementation(deployer);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        blrImplementationAddress: blrV2.address,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.blrUpgrade?.newImplementation).to.equal(blrV2.address);
      expect(result.blrUpgrade?.upgraded).to.be.true;
    });
  });

  describe("Mixed Patterns - Deploy and Provide", () => {
    it("should upgrade one proxy with new impl and one with provided impl", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      // Pre-deploy one implementation
      const factoryV2 = await deployFactoryV2Implementation(deployer);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        deployNewBlrImpl: true,
        factoryImplementationAddress: factoryV2.address,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.summary.proxiesUpgraded).to.equal(2);
      expect(result.implementations?.blr).to.exist;
      expect(result.implementations?.factory).to.be.undefined;
      expect(result.factoryUpgrade?.newImplementation).to.equal(factoryV2.address);
    });
  });

  describe("Error Handling", () => {
    it("should fail if ProxyAdmin address is invalid", async () => {
      const { deployer, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress: "0x0000000000000000000000000000000000000000",
          blrProxyAddress,
          deployNewBlrImpl: true,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        });
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
      }
    });

    it("should fail if neither proxy address specified", async () => {
      const { deployer, proxyAdminAddress } = await loadFixture(deployTupUpgradeTestFixture);

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        });
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
        expect((err as Error).message).to.include("At least one proxy address");
      }
    });

    it("should fail if BLR proxy specified without impl source", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress,
          blrProxyAddress,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        });
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
        expect((err as Error).message).to.include("deployNewBlrImpl");
      }
    });

    it("should fail if Factory proxy specified without impl source", async () => {
      const { deployer, proxyAdminAddress, factoryProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress,
          factoryProxyAddress,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        });
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
        expect((err as Error).message).to.include("deployNewFactoryImpl");
      }
    });

    it("should fail with validation error for invalid options schema", async () => {
      const { deployer } = await loadFixture(deployTupUpgradeTestFixture);

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress: "",
          blrProxyAddress: "0x1111111111111111111111111111111111111111",
          deployNewBlrImpl: true,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        } as any);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
        expect((err as Error).message).to.include("Invalid upgrade options");
      }
    });
  });

  describe("Output and Metadata", () => {
    it("should include deployment timestamps", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const before = new Date().toISOString();
      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });
      const after = new Date().toISOString();

      expect(result.timestamp).to.exist;
      expect(new Date(result.timestamp).getTime()).to.be.greaterThanOrEqual(new Date(before).getTime());
      expect(new Date(result.timestamp).getTime()).to.be.lessThanOrEqual(new Date(after).getTime());
    });

    it("should include deployment time in summary", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.deploymentTime).to.be.greaterThan(0);
    });

    it("should handle multiple upgrade results in output", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        deployNewBlrImpl: true,
        deployNewFactoryImpl: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.blrUpgrade).to.exist;
      expect(result.factoryUpgrade).to.exist;
      expect(result.summary.proxiesUpgraded).to.equal(2);
    });
  });

  describe("Continue-on-Error Pattern", () => {
    it("should continue upgrading even if one proxy fails", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress, factoryProxyAddress } =
        await loadFixture(deployTupUpgradeTestFixture);

      // Deploy only one new implementation
      const blrV2 = await deployBlrV2Implementation(deployer);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        factoryProxyAddress,
        blrImplementationAddress: blrV2.address,
        deployNewFactoryImpl: true,
        enableRetry: false,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.blrUpgrade).to.exist;
      expect(result.factoryUpgrade).to.exist;
    });
  });

  describe("Checkpoint Resumability", () => {
    const { trackDir, afterEachCleanup, afterCleanup } = createCheckpointCleanupHooks();

    afterEach(afterEachCleanup);
    after(afterCleanup);

    it("should support checkpoint creation during workflow", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const timestamp = Date.now();
      const checkpointDir = join(getTestCheckpointsDir("hardhat"), `test-upgrade-${timestamp}`);
      trackDir(checkpointDir);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        checkpointDir,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
      });

      expect(result.summary.success).to.be.true;
    });

    it("should respect ignoreCheckpoint flag", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        ignoreCheckpoint: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
      });

      expect(result.summary.success).to.be.true;
    });

    it("should delete checkpoint on success if requested", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const timestamp = Date.now();
      const checkpointDir = join(getTestCheckpointsDir("hardhat"), `test-delete-${timestamp}`);
      trackDir(checkpointDir);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        deleteOnSuccess: true,
        checkpointDir,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
      });

      expect(result.summary.success).to.be.true;
    });
  });

  describe("Idempotency and Verification", () => {
    it("should verify implementations before upgrade", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        verifyDeployment: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.summary.success).to.be.true;
      expect(result.blrUpgrade?.oldImplementation).to.exist;
      expect(result.blrUpgrade?.newImplementation).to.exist;
    });

    it("should verify implementations after upgrade", async () => {
      const { deployer, proxyAdminAddress, blrProxyAddress } = await loadFixture(deployTupUpgradeTestFixture);

      const result = await upgradeTupProxies(deployer, "hardhat", {
        proxyAdminAddress,
        blrProxyAddress,
        deployNewBlrImpl: true,
        verifyDeployment: true,
        saveOutput: false,
        confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
        ignoreCheckpoint: true,
      });

      expect(result.blrUpgrade?.oldImplementation).to.not.equal(result.blrUpgrade?.newImplementation);
    });
  });

  describe("Proxy Admin Permissions", () => {
    it("should fail if ProxyAdmin is not admin of proxy", async () => {
      const { deployer, proxyAdminAddress } = await loadFixture(deployTupUpgradeTestFixture);

      // Use a non-existent proxy address
      const invalidProxyAddress = "0x2222222222222222222222222222222222222222";

      try {
        await upgradeTupProxies(deployer, "hardhat", {
          proxyAdminAddress,
          blrProxyAddress: invalidProxyAddress,
          deployNewBlrImpl: true,
          saveOutput: false,
          confirmations: TEST_OPTIONS.CONFIRMATIONS_INSTANT,
          ignoreCheckpoint: true,
        });
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err instanceof Error).to.be.true;
      }
    });
  });
});
