// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { assertObject, executeRbac } from "@test";

const name = "TEST_Core";
const symbol = "TCR";
const decimals = 6;
const newName = "TEST_Core_Updated";
const newSymbol = "TCR_Updated";

export function coreTests(getCtx: () => AssetMockCtx): void {
  describe("Core Facet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_TREX_OWNER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).setName(name);
      await asset.connect(signer_A).setSymbol(symbol);
      await asset.forceDecimals(decimals);
    });

    describe("initializeCore", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCore is called THEN AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_D).initializeCore({ name: "X", symbol: "Y", decimals: 6 }),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN already-initialised WHEN initializeCore is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCore({ name: "X", symbol: "Y", decimals: 6 })).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    describe("initializeCore event", () => {
      it("GIVEN a fresh deployment WHEN initializeCore is called THEN emits CoreInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.core);
        await expect(asset.initializeCore({ name, symbol, decimals })).to.emit(asset, "CoreInitialized");
      });
    });

    describe("readers", () => {
      it("GIVEN an initialized token WHEN getERC20Metadata THEN returns the configured metadata", async () => {
        const metadata = await asset.getERC20Metadata();
        assertObject(metadata, { name, symbol, decimals });
      });

      it("GIVEN an initialized token WHEN reading name, symbol, decimals THEN returns the configured values", async () => {
        expect(await asset.name()).to.equal(name);
        expect(await asset.symbol()).to.equal(symbol);
        expect(await asset.decimals()).to.equal(decimals);
      });

      it("GIVEN an initialized token WHEN reading version THEN returns a JSON string matching the BLR config", async () => {
        const json = await asset.version();
        const parsed = JSON.parse(json);
        const [configResolver, , configId, configVersion] = await asset.getConfigInfo();

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

      it("GIVEN a paused token WHEN setName THEN reverts with IsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(asset.connect(signer_A).setName(newName)).to.be.revertedWithCustomError(asset, "IsPaused");
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

      it("GIVEN a paused token WHEN setSymbol THEN reverts with IsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(asset.connect(signer_A).setSymbol(newSymbol)).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("interop", () => {
      it("callers that previously reached name/symbol/decimals via ERC20Facet still resolve through the diamond via CoreFacet", async () => {
        expect(await asset.name()).to.equal(name);
        expect(await asset.symbol()).to.equal(symbol);
        expect(await asset.decimals()).to.equal(decimals);
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN setName THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).setName("")).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN setSymbol THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).setSymbol("")).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setName THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setName("")).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN setSymbol THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setSymbol("")).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
