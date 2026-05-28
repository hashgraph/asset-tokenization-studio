// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { ATS_ROLES, buildRegulationData, EQUITY_CONFIG_ID, RegulationSubType, RegulationType } from "@scripts";

const REGULATION_DATA = buildRegulationData(RegulationType.REG_S, RegulationSubType.NONE);
const ADDITIONAL_SECURITY_DATA = {
  countriesControlListType: true,
  listOfCountries: "US,GB,CH",
  info: "Test security token",
};

describe("Security Tests", () => {
  let signer_D: HardhatEthersSigner;

  before(async () => {
    const signers = await ethers.getSigners();
    signer_D = signers[3];
  });

  describe("InitializeSecurity", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeSecurity is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(
        freshAsset.connect(signer_D).initializeSecurity(REGULATION_DATA, ADDITIONAL_SECURITY_DATA),
      ).to.be.revertedWithCustomError(freshAsset, "AccountHasNoRole");
    });

    it("GIVEN an already-initialised facet WHEN initializeSecurity is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeSecurity(REGULATION_DATA, ADDITIONAL_SECURITY_DATA);
      await expect(
        freshAsset.connect(infra.deployer).initializeSecurity(REGULATION_DATA, ADDITIONAL_SECURITY_DATA),
      ).to.be.revertedWithCustomError(freshAsset, "FacetAlreadyRegistered");
    });

    it("GIVEN a new deployment WHEN the factory calls initializeSecurity THEN it emits SecurityInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(
        freshAsset.connect(infra.deployer).initializeSecurity(REGULATION_DATA, ADDITIONAL_SECURITY_DATA),
      ).to.emit(freshAsset, "SecurityInitialized");
    });
  });
});
