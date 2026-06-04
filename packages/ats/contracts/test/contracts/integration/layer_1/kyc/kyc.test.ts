// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { deployEquityTokenFixture } from "@test";
import { ATS_ROLES } from "@scripts";
import { MockDiamondCut } from "@contract-types";

// TODO: Apply beforeEach general with fixture instead in each test.
describe("Kyc Tests", () => {
  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN activateInternalKyc THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).activateInternalKyc()).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN deactivateInternalKyc THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).deactivateInternalKyc()).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN grantKyc THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).grantKyc(ethers.ZeroAddress, "", 0, 0, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN revokeKyc THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).revokeKyc(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("nonOperational", () => {
    let asset: any;
    let mockDiamondCut: MockDiamondCut;

    beforeEach(async () => {
      // TODO: Fix it. deploy don't needed.
      const base = await deployEquityTokenFixture();
      asset = await ethers.getContractAt("IAsset", base.diamond.target);
      mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN grantKyc THEN reverts with AssetNotOperational", async () => {
      await expect(asset.grantKyc(ethers.ZeroAddress, "", 0, 0, ethers.ZeroAddress)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });
});
