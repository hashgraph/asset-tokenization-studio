// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import {
  type ResolverProxy,
  type ICore,
  ICore__factory,
  type AccessControlFacet,
  ICommonErrors__factory,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, TEST_ERC20_METADATA } from "@test";
import { ATS_ROLES, SecurityType } from "@scripts/domain";

describe("Core Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let coreFacet: ICore;
  let accessControlFacet: AccessControlFacet;

  const { name, symbol, decimals } = TEST_ERC20_METADATA.INITIAL;
  const { name: newName, symbol: newSymbol } = TEST_ERC20_METADATA.UPDATED;
  const isin = isinGenerator();

  async function deploySecurityFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
          erc20MetadataInfo: { name, symbol, decimals, isin },
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    // Attach Core facet via TypeChain factory
    coreFacet = ICore__factory.connect(await diamond.getAddress(), signer_A);
    accessControlFacet = base.accessControlFacet;

    // Grant _TREX_OWNER_ROLE to signer_A for setName/setSymbol tests
    await accessControlFacet.grantRole(ATS_ROLES._TREX_OWNER_ROLE, signer_A.address);

    return { diamond, signer_A, signer_B, coreFacet, accessControlFacet };
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Initialization", () => {
    it("GIVEN an already initialized token WHEN attempting to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const erc20Metadata = {
        info: { name, symbol, decimals, isin },
        securityType: SecurityType.EQUITY,
      };
      // AlreadyInitialized is declared in ICommonErrors — attach a handle at
      // the same proxy address to give the chai matcher the error fragment.
      const commonErrors = ICommonErrors__factory.connect(await diamond.getAddress(), signer_A);
      await expect(coreFacet.initializeCore(erc20Metadata)).to.be.revertedWithCustomError(
        commonErrors,
        "AlreadyInitialized",
      );
    });
  });

  describe("Metadata Getters", () => {
    it("GIVEN an initialized token WHEN calling name() THEN returns configured name", async () => {
      const retrieved = await coreFacet.name();
      expect(retrieved).to.equal(name);
    });

    it("GIVEN an initialized token WHEN calling symbol() THEN returns configured symbol", async () => {
      const retrieved = await coreFacet.symbol();
      expect(retrieved).to.equal(symbol);
    });

    it("GIVEN an initialized token WHEN calling decimals() THEN returns configured decimals", async () => {
      const retrieved = await coreFacet.decimals();
      expect(retrieved).to.equal(decimals);
    });

    it("GIVEN an initialized token WHEN calling getERC20Metadata() THEN returns full metadata object", async () => {
      const metadata = await coreFacet.getERC20Metadata();
      expect(metadata.info.name).to.equal(name);
      expect(metadata.info.symbol).to.equal(symbol);
      expect(metadata.info.decimals).to.equal(decimals);
      expect(metadata.info.isin).to.equal(isin);
      expect(metadata.securityType).to.equal(SecurityType.EQUITY);
    });
  });

  describe("Metadata Setters", () => {
    it("GIVEN token owner WHEN calling setName() THEN updates name", async () => {
      await coreFacet.setName(newName);
      expect(await coreFacet.name()).to.equal(newName);
    });

    it("GIVEN token owner WHEN calling setSymbol() THEN updates symbol", async () => {
      await coreFacet.setSymbol(newSymbol);
      expect(await coreFacet.symbol()).to.equal(newSymbol);
    });

    it("GIVEN non-owner WHEN calling setName() THEN transaction fails with AccessControl error", async () => {
      const coreFacetB = coreFacet.connect(signer_B);
      // signer_B does not have _TREX_OWNER_ROLE
      await expect(coreFacetB.setName(newName)).to.be.reverted;
    });

    it("GIVEN non-owner WHEN calling setSymbol() THEN transaction fails with AccessControl error", async () => {
      const coreFacetB = coreFacet.connect(signer_B);
      // signer_B does not have _TREX_OWNER_ROLE
      await expect(coreFacetB.setSymbol(newSymbol)).to.be.reverted;
    });
  });

  describe("Version", () => {
    it("GIVEN an initialized token WHEN calling version() THEN returns valid JSON with resolver, config ID, and version", async () => {
      const versionJson = await coreFacet.version();
      const parsed = JSON.parse(versionJson);

      // Verify structure and non-empty values
      expect(parsed).to.have.property("Resolver");
      expect(parsed).to.have.property("Config ID");
      expect(parsed).to.have.property("Version");

      expect(parsed["Resolver"]).to.match(/^0x[0-9a-fA-F]{40}$/);
      expect(parsed["Config ID"]).to.match(/^0x[0-9a-fA-F]{64}$/);
      expect(typeof parsed["Version"]).to.equal("string");
    });
  });
});
