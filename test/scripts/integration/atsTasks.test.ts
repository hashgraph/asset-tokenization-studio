// SPDX-License-Identifier: Apache-2.0

/**
 * Smoke tests for the ats:* Hardhat tasks.
 *
 * The tasks are thin wrappers over @lib operations (which have their own
 * integration suites); these tests only verify the task wiring — argument
 * parsing, signer resolution and the call into the operation — by running each
 * task through hre.run against the standard fixtures.
 *
 * @module test/scripts/integration/atsTasks.test
 */

import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CONFIG_IDS } from "@lib";
import { deployContract, deployProxy, getResolverProxyConfigInfo } from "@lib/operations";
import {
  deployAtsInfrastructureFixture,
  deployBlrFixture,
  deployResolverProxyFixture,
  deployResolverProxyWithAltConfigFixture,
  getBondDetails,
  getRegulationData,
  getSecurityData,
  makeEquityDetailsData,
} from "@test";

describe("ats:* tasks - Integration Smoke Tests", () => {
  describe("ats:token:*", () => {
    it("ats:token:info returns the pinned configuration", async () => {
      const { proxyAddress, blrAddress, configId, initialVersion } = await loadFixture(deployResolverProxyFixture);

      const info = await hre.run("ats:token:info", { proxy: proxyAddress });

      expect(info.resolver).to.equal(blrAddress);
      expect(info.configurationId).to.equal(configId);
      expect(info.configurationVersion).to.equal(initialVersion);
    });

    it("ats:token:update-version updates the pinned version on-chain", async () => {
      const { deployer, proxyAddress, initialVersion } = await loadFixture(deployResolverProxyFixture);

      await hre.run("ats:token:update-version", {
        proxy: proxyAddress,
        newVersion: initialVersion + 1,
      });

      const onChain = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(onChain.configurationVersion).to.equal(initialVersion + 1);
    });

    it("ats:token:update-config re-pins configuration ID and version", async () => {
      const { deployer, proxyAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      await hre.run("ats:token:update-config", {
        proxy: proxyAddress,
        configId: altConfigId,
        newVersion: initialVersion,
      });

      const onChain = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(onChain.configurationId).to.equal(altConfigId);
    });

    it("ats:token:update-resolver re-points the token to a resolver, configuration and version", async () => {
      const { deployer, proxyAddress, blrAddress, altConfigId, initialVersion } = await loadFixture(
        deployResolverProxyWithAltConfigFixture,
      );

      await hre.run("ats:token:update-resolver", {
        proxy: proxyAddress,
        resolver: blrAddress,
        configId: altConfigId,
        newVersion: initialVersion,
      });

      const onChain = await getResolverProxyConfigInfo(deployer, proxyAddress);
      expect(onChain.resolver).to.equal(blrAddress);
      expect(onChain.configurationId).to.equal(altConfigId);
      expect(onChain.configurationVersion).to.equal(initialVersion);
    });

    it("ats:token:update-version throws when the operation fails", async () => {
      const { proxyAddress, maxVersion } = await loadFixture(deployResolverProxyFixture);

      // No configuration exists at maxVersion + 1, so the update must revert
      try {
        await hre.run("ats:token:update-version", { proxy: proxyAddress, newVersion: maxVersion + 1 });
        expect.fail("Expected the task to throw");
      } catch (err) {
        expect((err as Error).message).to.contain("ResolverProxy update failed");
      }
    });
  });

  describe("ats:blr:*", () => {
    it("ats:blr:info lists registered facets with names resolved from the registry", async () => {
      const { blrAddress } = await loadFixture(deployResolverProxyFixture);

      const facets = await hre.run("ats:blr:info", { blr: blrAddress });

      expect(facets.length).to.be.greaterThanOrEqual(2);
      const names = facets.map((f: { name: string }) => f.name);
      expect(names).to.include("DiamondFacet");
      expect(names).to.include("AccessControlFacet");
    });

    it("ats:blr:register-facets registers a new facet in the BLR", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
      const kyc = await deployContract(kycFactory);

      const result = await hre.run("ats:blr:register-facets", {
        blr: blrAddress,
        facets: `KycFacet=${kyc.address}`,
        allowOverwrite: false,
      });

      expect(result.registered).to.include("KycFacet");
      expect(await blr.getBusinessLogicCount()).to.equal(1n);
    });

    it("ats:blr:register-facets rejects facets unknown to the registry", async () => {
      const { blrAddress } = await loadFixture(deployBlrFixture);

      try {
        await hre.run("ats:blr:register-facets", {
          blr: blrAddress,
          facets: "NotARealFacet=0x0000000000000000000000000000000000000001",
          allowOverwrite: false,
        });
        expect.fail("Expected the task to throw");
      } catch (err) {
        expect((err as Error).message).to.contain("No resolver key found");
      }
    });
  });

  describe("ats:blr:upgrade", () => {
    it("deploys, registers and re-creates the affected configurations reading versions from the chain", async () => {
      const { blr, deployment, facetKeys } = await loadFixture(deployAtsInfrastructureFixture);
      const blrAddress = deployment.infrastructure.blr.proxy;

      const pauseKey = facetKeys["PauseFacet"];
      const versionBefore = Number((await blr.getLatestVersions([pauseKey]))[0]);
      const { CONFIG_IDS } = await import("@lib/domain");
      const equityVersionBefore = Number(await blr.getLatestVersionByConfiguration(CONFIG_IDS.equity));

      const result = await hre.run("ats:blr:upgrade", { blr: blrAddress, facets: "PauseFacet" });

      // Facet key bumped +1 on-chain
      expect(result.facets[0].name).to.equal("PauseFacet");
      expect(result.facets[0].version).to.equal(versionBefore + 1);
      // Every configuration containing PauseFacet was re-created one version up
      expect(result.configs.equity).to.equal(equityVersionBefore + 1);
      expect(Number(await blr.getLatestVersionByConfiguration(CONFIG_IDS.equity))).to.equal(equityVersionBefore + 1);
    });

    it("upgrades a library-linked facet deploying fresh orchestrator libraries", async () => {
      const { blr, deployment, facetKeys } = await loadFixture(deployAtsInfrastructureFixture);
      const blrAddress = deployment.infrastructure.blr.proxy;

      // BurnFacet links the tokenCoreOps orchestrator library
      const burnKey = facetKeys["BurnFacet"];
      expect(burnKey, "BurnFacet key missing from fixture").to.be.a("string");
      const versionBefore = Number((await blr.getLatestVersions([burnKey]))[0]);

      const result = await hre.run("ats:blr:upgrade", {
        blr: blrAddress,
        facets: "BurnFacet",
        configs: "equity",
      });

      expect(result.facets[0].version).to.equal(versionBefore + 1);
      expect(result.configs).to.have.all.keys("equity");
    });

    it("rejects unknown configurations before sending any transaction", async () => {
      const { deployment } = await loadFixture(deployAtsInfrastructureFixture);

      try {
        await hre.run("ats:blr:upgrade", {
          blr: deployment.infrastructure.blr.proxy,
          facets: "PauseFacet",
          configs: "nonsense",
        });
        expect.fail("Expected the task to throw");
      } catch (err) {
        expect((err as Error).message).to.contain("Unknown configuration");
      }
    });
  });

  describe("ats:blr:deploy-system", () => {
    it("deploys the full system on an existing BLR reading every version from the chain", async () => {
      const { deployer, blr, deployment, facetKeys } = await loadFixture(deployAtsInfrastructureFixture);
      const blrAddress = deployment.infrastructure.blr.proxy;
      const { CONFIG_IDS, PRODUCTION_DEPLOY_FACETS } = await import("@lib/domain");

      const pauseKey = facetKeys["PauseFacet"];
      const pauseVersionBefore = Number((await blr.getLatestVersions([pauseKey]))[0]);
      const factoryConfigVersionBefore = Number(await blr.getLatestVersionByConfiguration(CONFIG_IDS.factory));

      const result = await hre.run("ats:blr:deploy-system", { blr: blrAddress });

      // Every production facet freshly deployed and its key bumped on-chain
      expect(result.facets).to.have.length(PRODUCTION_DEPLOY_FACETS.length);
      const pause = result.facets.find((f: { name: string }) => f.name === "PauseFacet");
      expect(pause.version).to.equal(pauseVersionBefore + 1);
      // Configurations re-created one version up, read back from the chain
      expect(result.configs.factory).to.equal(factoryConfigVersionBefore + 1);
      expect(Number(await blr.getLatestVersionByConfiguration(CONFIG_IDS.factory))).to.equal(
        factoryConfigVersionBefore + 1,
      );
      // The new Factory routes calls through the BLR at the version it is
      // pinned to — a routed view call proves the pin (the factory
      // configuration has no DiamondFacet, so getConfigInfo is not available)
      const { IFactory__factory } = await import("@contract-types");
      const factory = IFactory__factory.connect(result.factory.address, deployer);
      const regulation = await factory.getAppliedRegulationData(1, 0); // REG_S, NONE
      expect(regulation.regulationType).to.equal(1n);
    });

    it("rejects a signer without the BLR roles before sending any transaction", async () => {
      const { deployment, unknownSigner } = await loadFixture(deployAtsInfrastructureFixture);

      try {
        await hre.run("ats:blr:deploy-system", {
          blr: deployment.infrastructure.blr.proxy,
          signerAddress: await unknownSigner.getAddress(),
        });
        expect.fail("Expected the task to throw");
      } catch (err) {
        expect((err as Error).message).to.contain("is missing DEFAULT_ADMIN_ROLE");
      }
    });
  });

  describe("ats:factory:*", () => {
    /** The tasks take runtime data from a JSON file — write one per test. */
    function writeParamsFile(params: object): string {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ats-task-params-"));
      const file = path.join(dir, "token.json");
      fs.writeFileSync(
        file,
        JSON.stringify(params, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
      );
      return file;
    }

    it("ats:factory:deploy-equity deploys an equity token from a params file", async () => {
      const { deployer, blr, factory } = await loadFixture(deployAtsInfrastructureFixture);

      const paramsFile = writeParamsFile({
        factory: await factory.getAddress(),
        securityData: getSecurityData(blr),
        equityDetails: makeEquityDetailsData(),
        regulation: getRegulationData(),
      });

      const result = await hre.run("ats:factory:deploy-equity", { params: paramsFile });

      expect(result.address).to.be.properAddress;
      const info = await getResolverProxyConfigInfo(deployer, result.address);
      expect(info.configurationId).to.equal(CONFIG_IDS.equity);
    });

    it("ats:factory:deploy-bond deploys a bond token from a params file", async () => {
      const { deployer, blr, factory } = await loadFixture(deployAtsInfrastructureFixture);

      const paramsFile = writeParamsFile({
        factory: await factory.getAddress(),
        securityData: getSecurityData(blr, {
          resolverProxyConfigurationV2: {
            configurationId: CONFIG_IDS.bond,
            configurationVersion: 1,
            replacementEnabled: true,
          },
        }),
        bondDetails: await getBondDetails(),
        regulation: getRegulationData(),
      });

      const result = await hre.run("ats:factory:deploy-bond", { params: paramsFile });

      expect(result.address).to.be.properAddress;
      const info = await getResolverProxyConfigInfo(deployer, result.address);
      expect(info.configurationId).to.equal(CONFIG_IDS.bond);
    });
  });

  describe("ats:proxy:upgrade", () => {
    async function deployTupFixture() {
      const [deployer] = await ethers.getSigners();
      const implementationFactory = await ethers.getContractFactory("BusinessLogicResolver", deployer);
      const result = await deployProxy(deployer, {
        implementationFactory,
      });
      return { deployer, ...result };
    }

    it("--check reports no upgrade needed for the current implementation", async () => {
      const { proxyAddress, proxyAdminAddress, implementationAddress } = await loadFixture(deployTupFixture);

      const result = await hre.run("ats:proxy:upgrade", {
        proxy: proxyAddress,
        proxyAdmin: proxyAdminAddress,
        impl: implementationAddress,
        check: true,
        prepareOnly: false,
      });

      expect(result.needsUpgrade).to.be.false;
    });

    it("--prepare-only deploys the implementation without touching the proxy", async () => {
      const { proxyAddress, proxyAdminAddress, implementationAddress } = await loadFixture(deployTupFixture);

      const result = await hre.run("ats:proxy:upgrade", {
        proxy: proxyAddress,
        proxyAdmin: proxyAdminAddress,
        contract: "BusinessLogicResolver",
        check: false,
        prepareOnly: true,
      });

      expect(result.implAddress).to.be.properAddress;
      expect(result.implAddress).to.not.equal(implementationAddress);
      // Proxy still points at the original implementation
      const check = await hre.run("ats:proxy:upgrade", {
        proxy: proxyAddress,
        proxyAdmin: proxyAdminAddress,
        impl: implementationAddress,
        check: true,
        prepareOnly: false,
      });
      expect(check.needsUpgrade).to.be.false;
    });

    it("upgrades the proxy to a prepared implementation", async () => {
      const { proxyAddress, proxyAdminAddress, implementationAddress } = await loadFixture(deployTupFixture);

      const prepared = await hre.run("ats:proxy:upgrade", {
        proxy: proxyAddress,
        proxyAdmin: proxyAdminAddress,
        contract: "BusinessLogicResolver",
        check: false,
        prepareOnly: true,
      });

      const result = await hre.run("ats:proxy:upgrade", {
        proxy: proxyAddress,
        proxyAdmin: proxyAdminAddress,
        impl: prepared.implAddress,
        check: false,
        prepareOnly: false,
      });

      expect(result.oldImplementation.toLowerCase()).to.equal(implementationAddress.toLowerCase());
      expect(result.newImplementation.toLowerCase()).to.equal(prepared.implAddress.toLowerCase());
    });
  });
});
