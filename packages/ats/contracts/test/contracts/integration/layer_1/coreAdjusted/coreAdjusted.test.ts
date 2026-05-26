// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, CORE_ADJUSTED_RESOLVER_KEY } from "@scripts";
import { deployEquityTokenFixture, executeRbac } from "@test";

const decimals = 6;
const decimalAdjustment = 2;
const adjustmentTimestamp = 100_000;

describe("CoreAdjusted Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          erc20MetadataInfo: { name: "TEST_CoreAdjusted", symbol: "TCA", decimals, isin: "US0378331005" },
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, [
      { role: ATS_ROLES.CORPORATE_ACTION_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, members: [signer_A.address] },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("decimalsAt", () => {
    it("GIVEN an initialized token WHEN decimalsAt is called with current timestamp THEN returns current decimals", async () => {
      const currentTimestamp = await asset.blockTimestamp();

      expect(await asset.decimalsAt(currentTimestamp)).to.equal(decimals);
    });

    it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp after the adjustment THEN returns adjusted decimals", async () => {
      await asset.setScheduledBalanceAdjustment({
        executionDate: adjustmentTimestamp,
        factor: 100,
        decimals: decimalAdjustment,
      });

      expect(await asset.decimalsAt(adjustmentTimestamp + 1)).to.equal(decimals + decimalAdjustment);
    });

    it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp before the adjustment THEN returns original decimals", async () => {
      await asset.setScheduledBalanceAdjustment({
        executionDate: adjustmentTimestamp,
        factor: 100,
        decimals: decimalAdjustment,
      });

      expect(await asset.decimalsAt(adjustmentTimestamp - 1)).to.equal(decimals);
    });
  });
  describe("initializeCoreAdjusted", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCoreAdjusted is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).initializeCoreAdjusted())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCoreAdjusted is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCoreAdjusted())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(CORE_ADJUSTED_RESOLVER_KEY, 1);
    });
  });

  describe("initializeCoreAdjusted event", () => {
    it("GIVEN a fresh deployment WHEN initializeCoreAdjusted is called THEN emits CoreAdjustedInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(CORE_ADJUSTED_RESOLVER_KEY);
      await expect(asset.initializeCoreAdjusted()).to.emit(asset, "CoreAdjustedInitialized");
    });
  });
});
