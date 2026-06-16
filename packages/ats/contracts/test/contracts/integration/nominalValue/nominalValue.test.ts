// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";

describe("NominalValue Init Tests", () => {
  let signer_D: HardhatEthersSigner;

  before(async () => {
    const signers = await ethers.getSigners();
    signer_D = signers[3];
  });

  it("GIVEN an already-initialised facet WHEN initializeNominalValue is called again THEN it reverts with FacetAlreadyRegistered", async () => {
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
    await freshAsset.connect(infra.deployer).initializeNominalValue(100, 2, "0x455552");
    await expect(
      freshAsset.connect(infra.deployer).initializeNominalValue(100, 2, "0x455552"),
    ).to.be.revertedWithCustomError(freshAsset, "FacetAlreadyRegistered");
  });

  it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValue is called THEN it reverts with AccountHasNoRole", async () => {
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
    await expect(freshAsset.connect(signer_D).initializeNominalValue(100, 2, "0x455552")).to.be.revertedWithCustomError(
      freshAsset,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a new deployment WHEN initializeNominalValue is called THEN it emits NominalValueInitialized", async () => {
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
    await expect(freshAsset.connect(infra.deployer).initializeNominalValue(100, 2, "0x455552"))
      .to.emit(freshAsset, "NominalValueInitialized")
      .withArgs(100, 2, "0x455552");
  });
});
