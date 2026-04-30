// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { SecurityType } from "@scripts/domain";
import { assertObject } from "@test";
import { deployEquityTokenFixture, executeRbac } from "@test";

const name = "TEST_Core";
const symbol = "TCR";
const decimals = 6;
const isin = isinGenerator();
const newName = "TEST_Core_Updated";
const newSymbol = "TCR_Updated";

describe("Core Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          erc20MetadataInfo: { name, symbol, decimals, isin },
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.TREX_OWNER_ROLE, members: [signer_A.address] },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initializeCore", () => {
    it("GIVEN an initialized token WHEN initializeCore is called again THEN reverts with AlreadyInitialized", async () => {
      await expect(
        asset.initializeCore({
          info: { name: "X", symbol: "Y", isin: "ES1234567890", decimals: 6 },
          securityType: SecurityType.BOND_VARIABLE_RATE,
        }),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });
  });

  describe("readers", () => {
    it("GIVEN an initialized token WHEN getERC20Metadata THEN returns the configured metadata", async () => {
      const metadata = await asset.getERC20Metadata();
      assertObject(metadata.info, { name, symbol, isin, decimals });
      expect(metadata.securityType).to.equal(SecurityType.EQUITY);
    });

    it("GIVEN an initialized token WHEN reading name, symbol, decimals THEN returns the configured values", async () => {
      expect(await asset.name()).to.equal(name);
      expect(await asset.symbol()).to.equal(symbol);
      expect(await asset.decimals()).to.equal(decimals);
    });

    it("GIVEN an initialized token WHEN reading version THEN returns a JSON string matching the BLR config", async () => {
      const json = await asset.version();
      const parsed = JSON.parse(json);
      const [configResolver, configId, configVersion] = await asset.getConfigInfo();

      expect(parsed["Resolver"].toLowerCase()).to.equal(configResolver.toLowerCase());
      expect(parsed["Config ID"].toLowerCase()).to.equal(configId.toLowerCase());
      expect(parsed["Version"]).to.equal(configVersion.toString());
    });
  });

  describe("setName", () => {
    it("GIVEN a TREX owner WHEN setName THEN name is updated and UpdatedTokenInformation is emitted", async () => {
      expect(await asset.name()).to.equal(name);
      const currentVersion = await asset.version();

      await expect(asset.connect(signer_A).setName(newName))
        .to.emit(asset, "UpdatedTokenInformation")
        .withArgs(newName, symbol, decimals, currentVersion, ethers.ZeroAddress);

      expect(await asset.name()).to.equal(newName);
    });

    it("GIVEN an account without TREX_OWNER role WHEN setName THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).setName(newName)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused token WHEN setName THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();
      await expect(asset.connect(signer_A).setName(newName)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });
  });

  describe("setSymbol", () => {
    it("GIVEN a TREX owner WHEN setSymbol THEN symbol is updated and UpdatedTokenInformation is emitted", async () => {
      expect(await asset.symbol()).to.equal(symbol);
      const currentVersion = await asset.version();

      await expect(asset.connect(signer_A).setSymbol(newSymbol))
        .to.emit(asset, "UpdatedTokenInformation")
        .withArgs(name, newSymbol, decimals, currentVersion, ethers.ZeroAddress);

      expect(await asset.symbol()).to.equal(newSymbol);
    });

    it("GIVEN an account without TREX_OWNER role WHEN setSymbol THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).setSymbol(newSymbol)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused token WHEN setSymbol THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();
      await expect(asset.connect(signer_A).setSymbol(newSymbol)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });
  });

  describe("interop", () => {
    it("callers that previously reached name/symbol/decimals via ERC20Facet still resolve through the diamond via CoreFacet", async () => {
      const viaCore = await ethers.getContractAt("CoreFacet", diamond.target);
      expect(await viaCore.name()).to.equal(name);
      expect(await viaCore.symbol()).to.equal(symbol);
      expect(await viaCore.decimals()).to.equal(decimals);
    });
  });
});
