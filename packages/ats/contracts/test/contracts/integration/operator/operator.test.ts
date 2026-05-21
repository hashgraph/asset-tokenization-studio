// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, EQUITY_CONFIG_ID, ZERO } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const EMPTY_VC_ID = EMPTY_STRING;

describe("Operator Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_A.address] },
    ]);

    await asset.addIssuer(signer_A.address);
    await asset.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("isOperator", () => {
    it("GIVEN no authorization WHEN isOperator is called THEN returns false", async () => {
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });

    it("GIVEN an authorized operator WHEN isOperator is called THEN returns true", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
    });

    it("GIVEN a revoked operator WHEN isOperator is called THEN returns false", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.connect(signer_C).revokeOperator(signer_B.address);
      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });
  });

  describe("authorizeOperator", () => {
    it("GIVEN KYC'd addresses WHEN authorizeOperator THEN emits AuthorizedOperator and OperatorAuthorized and state is updated", async () => {
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address))
        .to.emit(asset, "AuthorizedOperator")
        .withArgs(signer_B.address, signer_C.address)
        .to.emit(asset, "OperatorAuthorized")
        .withArgs(signer_B.address, signer_C.address);

      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
    });

    it("GIVEN a paused token WHEN authorizeOperator THEN reverts with IsPaused", async () => {
      await asset.pause();
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a blocked operator WHEN authorizeOperator THEN reverts with AccountIsBlocked", async () => {
      await asset.addToControlList(signer_B.address);
      await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });
  });

  describe("revokeOperator", () => {
    it("GIVEN an authorized operator WHEN revokeOperator THEN emits RevokedOperator and OperatorRevoked and state is updated", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);

      await expect(asset.connect(signer_C).revokeOperator(signer_B.address))
        .to.emit(asset, "RevokedOperator")
        .withArgs(signer_B.address, signer_C.address)
        .to.emit(asset, "OperatorRevoked")
        .withArgs(signer_B.address, signer_C.address);

      expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
    });

    it("GIVEN a paused token WHEN revokeOperator THEN reverts with IsPaused", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.pause();
      await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a blocked operator WHEN revokeOperator THEN reverts with AccountIsBlocked", async () => {
      await asset.connect(signer_C).authorizeOperator(signer_B.address);
      await asset.addToControlList(signer_B.address);
      await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN authorizeOperator THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).authorizeOperator(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN revokeOperator THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).revokeOperator(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe("initializeOperator", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeOperator is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_C).initializeOperator()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeOperator is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeOperator();
      await expect(freshAsset.connect(infra.deployer).initializeOperator()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeOperator is called THEN it emits OperatorInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeOperator()).to.emit(freshAsset, "OperatorInitialized");
    });
  });
});
