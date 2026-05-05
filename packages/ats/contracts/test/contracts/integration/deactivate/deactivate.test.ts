// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ATS_ROLES } from "@scripts";
import { deployEquityTokenFixture, grantRoleAndPauseToken } from "@test";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { Signer } from "ethers";
import { ethers } from "hardhat";

describe("Deactivate Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;
  let deployer: HardhatEthersSigner;
  let unknownSigner: Signer;

  // Fixture: Deploy equity token used as the Deactivate facet host
  async function deployEquityForDeactivateFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    asset = await ethers.getContractAt("IAsset", diamond.target);
    deployer = base.deployer;
    unknownSigner = base.unknownSigner;
  }

  // Pre-load fixture to separate deployment time from test execution time
  beforeEach(async () => {
    await loadFixture(deployEquityForDeactivateFixture);
  });

  it("GIVEN an account without deactivate role WHEN deactivate THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(unknownSigner).deactivate()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN deactivate THEN transaction fails with TokenIsPaused", async () => {
    // Grant DEACTIVATE_ROLE to unknownSigner and pause the token using deployer's PAUSER_ROLE
    await asset.connect(deployer).grantRole(ATS_ROLES.PAUSER_ROLE, deployer.address);
    await grantRoleAndPauseToken(
      asset,
      ATS_ROLES.DEACTIVATE_ROLE,
      deployer,
      deployer,
      await unknownSigner.getAddress(),
    );

    // deactivate fails because token is paused
    await expect(asset.connect(unknownSigner).deactivate()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
  });

  it("GIVEN an account with deactivate role WHEN deactivate THEN transaction succeeds and isDeactivated returns true", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, await unknownSigner.getAddress());

    // Initial state must be active
    expect(await asset.isDeactivated()).to.be.equal(false);

    // DEACTIVATE
    await expect(asset.connect(unknownSigner).deactivate()).not.to.be.reverted;

    // State must reflect deactivation
    expect(await asset.isDeactivated()).to.be.equal(true);
  });

  it("GIVEN an already deactivated Token WHEN deactivate THEN transaction fails with Deactivated", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, await unknownSigner.getAddress());

    // First deactivation
    await asset.connect(unknownSigner).deactivate();
    expect(await asset.isDeactivated()).to.be.equal(true);

    // Second deactivation does not revert and state stays deactivated (idempotent)
    await expect(asset.connect(unknownSigner).deactivate()).to.be.revertedWithCustomError(asset, "Deactivated");
    expect(await asset.isDeactivated()).to.be.equal(true);
  });
});
