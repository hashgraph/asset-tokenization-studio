// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { deployEquityTokenFixture } from "@test";
import { ATS_ROLES } from "@scripts";

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
});
