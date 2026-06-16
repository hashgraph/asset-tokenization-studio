// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";

describe("Kyc Init Tests", () => {
  let signer_D: HardhatEthersSigner;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    signer_D = base.user3;
    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  it("GIVEN an initialized contract WHEN initializeInternalKyc is called again THEN it reverts with FacetAlreadyRegistered", async () => {
    await expect(asset.initializeInternalKyc(true)).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
  });

  it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeInternalKyc is called THEN it reverts with AccountHasNoRole", async () => {
    const { decodeEvent } = await import("@scripts/infrastructure");
    const infra = await loadFixture(deployAtsInfrastructureFixture);
    const proxyTx = await infra.factory.deployProxy(
      infra.blr.target as string,
      { configurationId: EQUITY_CONFIG_ID, configurationVersion: 1, replacementEnabled: false },
      [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] }],
      "0x",
    );
    const proxyReceipt = await proxyTx.wait();
    const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
    const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
    await expect(freshAsset.connect(signer_D).initializeInternalKyc(true)).to.be.revertedWithCustomError(
      freshAsset,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a new deployment WHEN initializeInternalKyc is called THEN it emits KycInitialized", async () => {
    const { decodeEvent } = await import("@scripts/infrastructure");
    const infra = await loadFixture(deployAtsInfrastructureFixture);
    const proxyTx = await infra.factory.deployProxy(
      infra.blr.target as string,
      { configurationId: EQUITY_CONFIG_ID, configurationVersion: 1, replacementEnabled: false },
      [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] }],
      "0x",
    );
    const proxyReceipt = await proxyTx.wait();
    const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
    const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
    await expect(freshAsset.connect(infra.deployer).initializeInternalKyc(true))
      .to.emit(freshAsset, "KycInitialized")
      .withArgs(true);
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN activateInternalKyc THEN reverts with AssetNotOperational", async () => {
      await expect(asset.activateInternalKyc()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });

    it("GIVEN non-operational asset WHEN deactivateInternalKyc THEN reverts with AssetNotOperational", async () => {
      await expect(asset.deactivateInternalKyc()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });

    it("GIVEN non-operational asset WHEN revokeKyc THEN reverts with AssetNotOperational", async () => {
      await expect(asset.revokeKyc(ethers.ZeroAddress)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
