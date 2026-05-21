// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, deployAtsInfrastructureFixture } from "@test";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";

describe("DividendSecurityHolders Tests", () => {
  let signer_C: HardhatEthersSigner;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    signer_C = base.user2;
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  describe("initializeDividendSecurityHolders", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeDividendSecurityHolders is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_C).initializeDividendSecurityHolders()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeDividendSecurityHolders is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeDividendSecurityHolders();
      await expect(
        freshAsset.connect(infra.deployer).initializeDividendSecurityHolders(),
      ).to.be.revertedWithCustomError(freshAsset, "FacetAlreadyRegistered");
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeDividendSecurityHolders is called THEN it emits DividendSecurityHoldersInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeDividendSecurityHolders()).to.emit(
        freshAsset,
        "DividendSecurityHoldersInitialized",
      );
    });
  });
});
