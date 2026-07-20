// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for the three updateResolverProxy* operations
 * (version / config / resolver) and their access control.
 *
 * @module test/scripts/integration/updateResolverProxyConfig.test
 */

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// Infrastructure layer
import {
  updateResolverProxyVersion,
  updateResolverProxyConfig,
  updateResolverProxyResolver,
  getResolverProxyConfigInfo,
  deployProxy,
  registerFacets,
} from "@lib/operations";

// Domain layer
import { ATS_ROLES, atsRegistry } from "@lib/domain";

// Test helpers
import {
  BLR_VERSIONS,
  deployResolverProxyFixture,
  deployResolverProxyWithAltConfigFixture,
  TEST_ADDRESSES,
} from "@test";

// Contract types
import { BusinessLogicResolver__factory } from "@contract-types";

describe("updateResolverProxy* - Integration Tests", () => {
  describe("updateResolverProxyVersion", () => {
    it("should update version successfully", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      expect(result.transactionHash).to.exist;
    });

    it("should return previous and new config", async () => {
      const { deployer, proxyAddress, configId, blrAddress, initialVersion } =
        await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      expect(result.previousConfig).to.deep.include({
        resolver: blrAddress,
        configurationId: configId,
        configurationVersion: BLR_VERSIONS.FIRST,
      });
      expect(result.newConfig).to.deep.include({
        resolver: blrAddress,
        configurationId: configId,
        configurationVersion: BLR_VERSIONS.SECOND,
      });
    });

    it("should verify version changed on-chain", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const configBefore = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configBefore.configurationVersion).to.equal(BLR_VERSIONS.FIRST);

      // Update version
      await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      const configAfter = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configAfter.configurationVersion).to.equal(BLR_VERSIONS.SECOND);
    });
  });

  describe("updateResolverProxyConfig", () => {
    it("should update configId and version", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const result = await updateResolverProxyConfig(deployer, proxyAddress, altConfigId, initialVersion + 1, {
      });

      expect(result.newConfig?.configurationId).to.equal(altConfigId);
      expect(result.newConfig?.configurationVersion).to.equal(BLR_VERSIONS.SECOND);
    });

    it("should verify configId changed on-chain", async () => {
      const { deployer, proxyAddress, configId, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      const configBefore = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configBefore.configurationId).to.equal(configId);

      // Update config
      await updateResolverProxyConfig(deployer, proxyAddress, altConfigId, initialVersion + 1, {
      });

      const configAfter = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configAfter.configurationId).to.equal(altConfigId);
    });

    it("should fail for unregistered configuration", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);
      const unregisteredConfigId = "0x00000000000000000000000000000000000000000000000000000000000000ff";

      await expect(
        updateResolverProxyConfig(deployer, proxyAddress, unregisteredConfigId, initialVersion + 1, {
        }),
      ).to.be.rejectedWith(/ResolverProxy update failed/);
    });
  });

  describe("updateResolverProxyResolver", () => {
    it("should update BLR address, configId, and version", async () => {
      const { deployer, proxyAddress, initialVersion, facetAddresses } = await loadFixture(deployResolverProxyFixture);

      const newBlrResult = await deployProxy(deployer, {
        implementationFactory: new BusinessLogicResolver__factory(deployer),
      });
      const newBlr = BusinessLogicResolver__factory.connect(newBlrResult.proxyAddress, deployer);
      await newBlr.initializeBusinessLogicResolver();

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

      await newBlr.grantRole(ATS_ROLES.ROLE_CREATE_CONFIGURATION, deployer.address);
      await newBlr.createConfiguration(newConfigId, facetConfigs, "0x");
      await newBlr.createConfiguration(newConfigId, facetConfigs, "0x");

      // Update resolver to new BLR
      const result = await updateResolverProxyResolver(
        deployer,
        proxyAddress,
        newBlrResult.proxyAddress,
        newConfigId,
        initialVersion + 1,
      );

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
      await blr.createConfiguration(newConfigId, facetConfigs, "0x");
      await blr.createConfiguration(newConfigId, facetConfigs, "0x");

      // Update resolver (using same BLR but different config)
      await updateResolverProxyResolver(deployer, proxyAddress, blrAddress, newConfigId, initialVersion + 1, {
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

      const result = await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      expect(result.newConfig.configurationVersion).to.equal(initialVersion + 1);
    });

    it("should fail when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      await expect(
        updateResolverProxyVersion(unknownSigner, proxyAddress, initialVersion + 1, {
        }),
      ).to.be.rejectedWith(/AccountHasNoRole/);
    });

    it("should fail config update when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      await expect(
        updateResolverProxyConfig(unknownSigner, proxyAddress, altConfigId, initialVersion + 1, {
        }),
      ).to.be.rejectedWith(/AccountHasNoRole/);
    });

    it("should fail full resolver update when caller lacks DEFAULT_ADMIN_ROLE", async () => {
      const { unknownSigner, proxyAddress, blrAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      await expect(
        updateResolverProxyResolver(unknownSigner, proxyAddress, blrAddress, altConfigId, initialVersion + 1, {
        }),
      ).to.be.rejectedWith(/AccountHasNoRole/);
    });
  });

  describe("Error Handling", () => {
    it("should fail for invalid proxy address", async () => {
      const { deployer } = await loadFixture(deployResolverProxyFixture);

      await expect(
        updateResolverProxyVersion(deployer, TEST_ADDRESSES.NO_CODE, 2, {
        }),
      ).to.be.rejected;
    });
  });

  describe("State Verification", () => {
    it("should preserve proxy address (unchanged)", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const result = await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      expect(result.proxyAddress).to.equal(proxyAddress);
    });

    it("should persist changes after update", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      // Update version
      await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.configurationVersion).to.equal(BLR_VERSIONS.SECOND);
    });

    it("should allow subsequent version updates within registered versions", async () => {
      const { deployer, proxyAddress, initialVersion, maxVersion } = await loadFixture(deployResolverProxyFixture);

      // First update: version 1 -> 2
      await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });

      // Verify final state is at max registered version
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.configurationVersion).to.equal(maxVersion);
    });

    it("should allow subsequent config updates", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      // First update: configId -> altConfigId at version 2
      await updateResolverProxyConfig(deployer, proxyAddress, altConfigId, initialVersion + 1, {
      });

      // Verify final state
      const configInfo = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(configInfo.configurationId).to.equal(altConfigId);
      expect(configInfo.configurationVersion).to.equal(initialVersion + 1);
    });
  });

  describe("Gas Usage", () => {
    it("should report gas used for version update", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      await updateResolverProxyVersion(deployer, proxyAddress, initialVersion + 1, {
      });
    });

    it("should report gas used for config update", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      await updateResolverProxyConfig(deployer, proxyAddress, altConfigId, initialVersion + 1, {
      });
    });
  });
});
