// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for updateResolverProxyConfig operation.
 *
 * Tests parameter-based action detection and input validation logic.
 * These tests verify the operation correctly determines which update
 * method to call based on the provided parameters.
 *
 * @module test/scripts/unit/operations/updateResolverProxyConfig.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  updateResolverProxyConfig,
  getResolverProxyConfigInfo,
  configureLogger,
  LogLevel,
} from "@scripts/infrastructure";
import { BLR_VERSIONS, deployResolverProxyFixture } from "@test";

describe("updateResolverProxyConfig - Unit Tests", () => {
  before(() => {
    configureLogger({ level: LogLevel.SILENT });
  });

  describe("Parameter-Based Action Detection", () => {
    it("should return updateType 'version' when only newVersion is provided", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("version");
    });

    it("should return updateType 'config' when newVersion and newConfigurationId are provided", async () => {
      const { deployer, proxyAddress, blr, initialVersion, facetAddresses } =
        await loadFixture(deployResolverProxyFixture);

      // Create alternative configuration at version 1 and 2
      const altConfigId = "0x00000000000000000000000000000000000000000000000000000000000000bb";
      const { atsRegistry } = await import("@scripts/domain");

      const facetNames = Object.keys(facetAddresses);
      const facetConfigs = facetNames.map((name) => ({
        id: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
        version: 1,
      }));
      // Create at version 1
      await blr.createConfiguration(altConfigId, facetConfigs);
      // Create at version 2
      await blr.createConfiguration(altConfigId, facetConfigs);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
        newConfigurationId: altConfigId,
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("config");
    });

    it("should return updateType 'resolver' when all parameters are provided", async () => {
      const { deployer, proxyAddress, blr, blrAddress, initialVersion, facetAddresses } =
        await loadFixture(deployResolverProxyFixture);

      // Create alternative configuration at version 1 and 2
      const altConfigId = "0x00000000000000000000000000000000000000000000000000000000000000cc";
      const { atsRegistry } = await import("@scripts/domain");

      const facetNames = Object.keys(facetAddresses);
      const facetConfigs = facetNames.map((name) => ({
        id: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
        version: 1,
      }));
      // Create at version 1
      await blr.createConfiguration(altConfigId, facetConfigs);
      // Create at version 2
      await blr.createConfiguration(altConfigId, facetConfigs);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
        newConfigurationId: altConfigId,
        newBlrAddress: blrAddress, // Using same BLR for test
      });

      expect(result.success).to.be.true;
      expect(result.updateType).to.equal("resolver");
    });
  });

  describe("Input Validation", () => {
    it("should fail with invalid proxy address format", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress: "0xinvalid",
        newVersion: 2,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it("should fail with invalid BLR address format when provided", async () => {
      const { deployer, proxyAddress } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: 2,
        newConfigurationId: "0x0000000000000000000000000000000000000000000000000000000000000001",
        newBlrAddress: "not-an-address",
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it("should fail when proxy address does not exist", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);
      const nonExistentAddress = "0x1234567890123456789012345678901234567890";

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress: nonExistentAddress,
        newVersion: 2,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe("Result Structure", () => {
    it("should return all required fields on success", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.equal(proxyAddress);
      expect(result.updateType).to.be.oneOf(["version", "config", "resolver"]);
      expect(result.previousConfig).to.exist;
      expect(result.newConfig).to.exist;
      expect(result.transactionHash).to.exist;
      expect(result.blockNumber).to.be.greaterThan(0);
      expect(result.gasUsed).to.be.greaterThan(0);
      expect(result.error).to.be.undefined;
    });

    it("should return error message on failure", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);
      const invalidAddress = "0x1234567890123456789012345678901234567890";

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress: invalidAddress,
        newVersion: 2,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.be.a("string");
      expect(result.proxyAddress).to.equal(invalidAddress);
    });

    it("should return previous and new config with correct versions", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyConfig(deployer, {
        proxyAddress,
        newVersion: initialVersion + 1,
      });

      expect(result.success).to.be.true;
      expect(result.previousConfig?.version).to.equal(BLR_VERSIONS.FIRST);
      expect(result.newConfig?.version).to.equal(BLR_VERSIONS.SECOND);
    });
  });

  describe("getResolverProxyConfigInfo Helper", () => {
    it("should return current configuration info", async () => {
      const { deployer, proxyAddress, blrAddress, configId, initialVersion } =
        await loadFixture(deployResolverProxyFixture);

      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);

      expect(configInfo.resolver).to.equal(blrAddress);
      expect(configInfo.configurationId).to.equal(configId);
      expect(configInfo.version).to.equal(initialVersion);
    });

    it("should fail for invalid proxy address", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);
      const invalidAddress = "0x1234567890123456789012345678901234567890";

      await expect(getResolverProxyConfigInfo(deployer, invalidAddress)).to.be.rejected;
    });

    it("should work with provider instead of signer", async () => {
      const { proxyAddress, blrAddress, configId, initialVersion } = await loadFixture(deployResolverProxyFixture);

      // Get provider from ethers
      const provider = ethers.provider;
      const configInfo = await getResolverProxyConfigInfo(provider, proxyAddress);

      expect(configInfo.resolver).to.equal(blrAddress);
      expect(configInfo.configurationId).to.equal(configId);
      expect(configInfo.version).to.equal(initialVersion);
    });
  });
});
