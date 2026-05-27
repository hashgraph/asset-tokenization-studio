// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ATS_ROLES, DEACTIVATE_RESOLVER_KEY } from "@scripts";
import { deployEquityTokenFixture, grantRoleAndPauseToken } from "@test";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { Signer } from "ethers";
import { ethers } from "hardhat";

describe("Deactivate Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let deployer: HardhatEthersSigner;
  let unknownSigner: Signer;

  // Fixture: Deploy equity token used as the Deactivate facet host
  async function deployEquityForDeactivateFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
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

  it("GIVEN a paused Token WHEN deactivate THEN transaction fails with IsPaused", async () => {
    // Grant ROLE_DEACTIVATE to unknownSigner and pause the token using deployer's ROLE_PAUSER
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_PAUSER, deployer.address);
    await grantRoleAndPauseToken(
      asset,
      ATS_ROLES.ROLE_DEACTIVATE,
      deployer,
      deployer,
      await unknownSigner.getAddress(),
    );

    // deactivate fails because token is paused
    await expect(asset.connect(unknownSigner).deactivate()).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN an account with deactivate role WHEN deactivate THEN transaction succeeds and isDeactivated returns true", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, await unknownSigner.getAddress());

    // Initial state must be active
    expect(await asset.isDeactivated()).to.be.equal(false);

    // DEACTIVATE
    await expect(asset.connect(unknownSigner).deactivate()).not.to.be.reverted;

    // State must reflect deactivation
    expect(await asset.isDeactivated()).to.be.equal(true);
  });

  it("GIVEN an already deactivated Token WHEN deactivate THEN transaction fails with Deactivated", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, await unknownSigner.getAddress());

    // First deactivation
    await asset.connect(unknownSigner).deactivate();
    expect(await asset.isDeactivated()).to.be.equal(true);

    // Second deactivation does not revert and state stays deactivated (idempotent)
    await expect(asset.connect(unknownSigner).deactivate()).to.be.revertedWithCustomError(asset, "Deactivated");
    expect(await asset.isDeactivated()).to.be.equal(true);
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN deactivate THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).deactivate()).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("initializeDeactivate", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeDeactivate is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeDeactivate())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeDeactivate is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeDeactivate())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(DEACTIVATE_RESOLVER_KEY, 1);
    });
  });

  describe("initializeDeactivate event", () => {
    it("GIVEN a fresh deployment WHEN initializeDeactivate is called THEN emits DeactivateInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(DEACTIVATE_RESOLVER_KEY);
      await expect(asset.initializeDeactivate()).to.emit(asset, "DeactivateInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN deactivate THEN reverts with AssetNotOperational", async () => {
      await expect(asset.deactivate()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
