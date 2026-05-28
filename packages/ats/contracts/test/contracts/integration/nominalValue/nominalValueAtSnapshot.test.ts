// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT } from "@scripts";
import { deployBondTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NominalValueAtSnapshot Tests", () => {
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let unknownSigner: HardhatEthersSigner;

  async function deployFixture() {
    const base = await deployBondTokenFixture();
    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
    const signers = await ethers.getSigners();
    unknownSigner = signers[signers.length - 1];
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initializeNominalValueAtSnapshot", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValueAtSnapshot THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeNominalValueAtSnapshot())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeNominalValueAtSnapshot THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeNominalValueAtSnapshot())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT, 1);
    });
  });

  describe("initializeNominalValueAtSnapshot event", () => {
    it("GIVEN fresh facet WHEN initializeNominalValueAtSnapshot THEN emits NominalValueAtSnapshotInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT);
      await expect(asset.initializeNominalValueAtSnapshot()).to.emit(asset, "NominalValueAtSnapshotInitialized");
    });
  });
});
