// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";

describe("Freeze Tests", () => {
  let signer_D: HardhatEthersSigner;

  async function deployFreezeFixture() {
    const base = await deployEquityTokenFixture();
    signer_D = base.user3;
  }

  beforeEach(async () => {
    await loadFixture(deployFreezeFixture);
  });

  describe("initializeFreeze", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeFreeze is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_D).initializeFreeze()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeFreeze is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeFreeze();
      await expect(freshAsset.connect(infra.deployer).initializeFreeze()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeFreeze is called THEN it emits FreezeInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeFreeze()).to.emit(freshAsset, "FreezeInitialized");
    });
  });
});
