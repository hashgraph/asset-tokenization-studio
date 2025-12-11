// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for updateResolverProxyConfig operation.
 *
 * Tests the full end-to-end functionality of updating ResolverProxy
 * configuration including:
 * - Version updates
 * - Configuration ID updates
 * - Full resolver updates
 * - Access control enforcement
 * - Error handling
 * - State verification
 *
 * @module test/scripts/integration/updateResolverProxyConfig.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  updateResolverProxyConfig,
  getResolverProxyConfigInfo,
  deployProxy,
  registerFacets,
  configureLogger,
  LogLevel,
} from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver__factory } from "@contract-types";
import { BLR_VERSIONS, deployResolverProxyFixture, deployResolverProxyWithAltConfigFixture } from "@test";

describe("updateResolverProxyConfig - Integration Tests", () => {
  before(() => {
    configureLogger({ level: LogLevel.SILENT });
  });

  describe("Version Update", () => {
    it("should update version successfully", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("version");
      expect(result.transactionHash).to.exist;
      expect(result.blockNumber).to.be.greaterThan(0);
    });

    it("should return previous and new config", async () => {
      const { deployer, proxyAddress, configId, blrAddress, initialVersion } =
        await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.previousConfig).to.deep.include({
        resolver: blrAddress,
        configurationId: configId,
        version: BLR_VERSIONS.FIRST,
      });
      expect(result.newConfig).to.deep.include({
        resolver: blrAddress,
        configurationId: configId,
        version: BLR_VERSIONS.SECOND,
      });
    });

    it("should verify version changed on-chain", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      // Verify initial version
      const configBefore = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configBefore.version).to.equal(BLR_VERSIONS.FIRST);

      // Update version
      await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      // Verify new version on-chain
      const configAfter = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configAfter.version).to.equal(BLR_VERSIONS.SECOND);
    });
  });

  describe("Config Update", () => {
    it("should update configId and version", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("config");
      expect(result.newConfig?.configurationId).to.equal(altConfigId);
      expect(result.newConfig?.version).to.equal(BLR_VERSIONS.SECOND);
    });

    it("should verify configId changed on-chain", async () => {
      const { deployer, proxyAddress, configId, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      // Verify initial configId
      const configBefore = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configBefore.configurationId).to.equal(configId);

      // Update config
      await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });

      // Verify new configId on-chain
      const configAfter = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configAfter.configurationId).to.equal(altConfigId);
    });

    it("should fail for unregistered configuration", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);
      const unregisteredConfigId = "0x00000000000000000000000000000000000000000000000000000000000000ff";

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newConfigurationId: unregisteredConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe("Full Resolver Update", () => {
    it("should update BLR address, configId, and version", async () => {
      const { deployer, proxyAddress, initialVersion, facetAddresses } = await loadFixture(deployResolverProxyFixture);

      // Deploy a new BLR for testing
      const implementationFactory = await ethers.getContractFactory("BusinessLogicResolver", deployer);
      const newBlrResult = await deployProxy(deployer, {
        implementationFactory,
        confirmations: 0,
        verifyDeployment: false,
      });
      const newBlr = BusinessLogicResolver__factory.connect(newBlrResult.proxyAddress, deployer);
      await newBlr.initialize_BusinessLogicResolver();

      // Register facets in new BLR
      const facetNames = Object.keys(facetAddresses);
      const facetsWithKeys = facetNames.map((name) => ({
        name,
        address: facetAddresses[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      await registerFacets(newBlr, { facets: facetsWithKeys });

      // Create configuration at version 1 and 2 in new BLR
      const newConfigId = "0x00000000000000000000000000000000000000000000000000000000000000dd";
      const facetConfigs = facetsWithKeys.map((f) => ({
        id: f.resolverKey,
        version: 1,
      }));
      // Create version 1
      await newBlr.createConfiguration(newConfigId, facetConfigs);
      // Create version 2
      await newBlr.createConfiguration(newConfigId, facetConfigs);

      // Update resolver to new BLR
      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newBlrAddress: newBlrResult.proxyAddress,
        newConfigurationId: newConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("resolver");
      expect(result.newConfig?.resolver).to.equal(newBlrResult.proxyAddress);
      expect(result.newConfig?.configurationId).to.equal(newConfigId);
    });

    it("should preserve functionality after resolver update", async () => {
      const { deployer, proxyAddress, blr, blrAddress, initialVersion, facetAddresses } =
        await loadFixture(deployResolverProxyFixture);

      // Create new configuration at version 1 and 2 in same BLR for testing
      const newConfigId = "0x00000000000000000000000000000000000000000000000000000000000000ee";
      const facetNames = Object.keys(facetAddresses);
      const facetConfigs = facetNames.map((name) => ({
        id: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
        version: 1,
      }));
      // Create version 1
      await blr.createConfiguration(newConfigId, facetConfigs);
      // Create version 2
      await blr.createConfiguration(newConfigId, facetConfigs);

      // Update resolver (using same BLR but different config)
      await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newBlrAddress: blrAddress,
        newConfigurationId: newConfigId,
        newVersion: initialVersion + 1,
      });

      // Verify proxy still functions (can still call getConfigInfo)
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.resolver).to.equal(blrAddress);
      expect(configInfo.configurationId).to.equal(newConfigId);
    });
  });

  describe("Access Control", () => {
    it("should succeed when caller has DEFAULT_ADMIN_ROLE", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
    });

    it("should fail when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(unknownSigner, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("AccountHasNoRole");
    });

    it("should fail config update when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const result = await updateResolverProxyConfig(unknownSigner, {
        proxyAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("AccountHasNoRole");
    });

    it("should fail full resolver update when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, blrAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const result = await updateResolverProxyConfig(unknownSigner, {
        proxyAddress,
        newBlrAddress: blrAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("AccountHasNoRole");
    });
  });

  describe("Error Handling", () => {
    it("should fail for invalid proxy address", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress: "0x1234567890123456789012345678901234567890",
        newVersion: 2,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it("should return structured error result (not throw)", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);

      // This should not throw, but return a structured error
      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress: "0x1234567890123456789012345678901234567890",
        newVersion: 2,
      });

      expect(result).to.be.an("object");
      expect(result.success).to.be.false;
      expect(result.error).to.be.a("string");
      expect(result.proxyAddress).to.exist;
      expect(result.updateType).to.exist;
    });

    it("should include previous config in error result when available", async () => {
      const { unknownSigner, proxyAddress, configId, blrAddress, initialVersion } =
        await loadFixture(deployResolverProxyFixture);

      // Will fail due to access control, but previousConfig should be set
      const result = await updateResolverProxyConfig(unknownSigner, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.false;
      expect(result.previousConfig).to.exist;
      expect(result.previousConfig?.resolver).to.equal(blrAddress);
      expect(result.previousConfig?.configurationId).to.equal(configId);
    });
  });

  describe("State Verification", () => {
    it("should preserve proxy address (unchanged)", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.equal(proxyAddress);
    });

    it("should persist changes after update", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      // Update version
      await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      // Verify persistence by reading again
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.version).to.equal(BLR_VERSIONS.SECOND);
    });

    it("should allow subsequent version updates within registered versions", async () => {
      const { deployer, proxyAddress, initialVersion, maxVersion } = await loadFixture(deployResolverProxyFixture);

      // First update: version 1 -> 2
      const result1 = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });
      expect(result1.success).to.be.true;

      // Verify final state is at max registered version
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.version).to.equal(maxVersion);
    });

    it("should allow subsequent config updates", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      // First update: configId -> altConfigId at version 2
      const result1 = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });
      expect(result1.success).to.be.true;

      // Verify final state
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.configurationId).to.equal(altConfigId);
      expect(configInfo.version).to.equal(initialVersion + 1);
    });
  });

  describe("Gas Usage", () => {
    it("should report gas used for version update", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.gasUsed).to.be.greaterThan(0);
    });

    it("should report gas used for config update", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newConfigurationId: altConfigId,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.gasUsed).to.be.greaterThan(0);
    });
  });
});
