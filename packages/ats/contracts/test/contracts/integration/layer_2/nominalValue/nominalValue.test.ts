// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBondTokenFixture } from "@test";
import { ATS_ROLES } from "@scripts";

describe("NominalValue Tests", () => {
  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setNominalValue THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).setNominalValue(0, 0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN setNominalValueCurrency THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setNominalValueCurrency("0x000000"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
