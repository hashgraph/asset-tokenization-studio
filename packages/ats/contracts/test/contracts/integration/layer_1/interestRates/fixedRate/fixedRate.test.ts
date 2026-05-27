// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DEFAULT_BOND_FIXED_RATE_PARAMS, deployBondFixedRateTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Fixed Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondFixedRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(
      asset.connect(signer_A).initialize_FixedRate({ rate: 1, rateDecimals: 0 }),
    ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setFixedRate THEN transaction fails with IsPaused", async () => {
      // transfer with data fails
      await expect(asset.connect(signer_A).setRate(1, 2)).to.be.revertedWithCustomError(asset, "IsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without interest rate manager role WHEN setFixedRate THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(asset.connect(signer_C).setRate(1, 2)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });
  });

  describe("New Interest Rate OK", () => {
    it("GIVEN a token WHEN setFixedRate THEN transaction succeeds", async () => {
      const newRate = 355;
      const newRateDecimals = 3;

      const oldRateValues = await asset.connect(signer_A).getRate();

      await expect(asset.connect(signer_A).setRate(newRate, newRateDecimals))
        .to.emit(asset, "RateUpdated")
        .withArgs(signer_A.address, newRate, newRateDecimals);

      const newRateValues = await asset.connect(signer_A).getRate();

      expect(oldRateValues.rate_).to.equal(DEFAULT_BOND_FIXED_RATE_PARAMS.rate);
      expect(oldRateValues.decimals_).to.equal(DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals);
      expect(newRateValues.rate_).to.equal(newRate);
      expect(newRateValues.decimals_).to.equal(newRateDecimals);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setRate THEN transaction fails with Deactivated", async () => {
      const base = await deployBondFixedRateTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).setRate(0, 0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });
});
