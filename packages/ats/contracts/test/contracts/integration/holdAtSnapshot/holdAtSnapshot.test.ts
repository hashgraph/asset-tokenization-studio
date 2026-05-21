// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, EQUITY_CONFIG_ID, ZERO } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("HoldAtSnapshot Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquity() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: { isMultiPartition: true },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SNAPSHOT_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  beforeEach(async () => {
    await loadFixture(deployEquity);
  });

  describe("heldBalanceOfAtSnapshot", () => {
    it("GIVEN no snapshot taken WHEN heldBalanceOfAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.heldBalanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdNull",
      );
    });

    it("GIVEN no snapshot taken WHEN heldBalanceOfAtSnapshot at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.heldBalanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
    });

    it("GIVEN a snapshot taken WHEN heldBalanceOfAtSnapshot for holder with no holds THEN returns zero", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const balance = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
      expect(balance).to.equal(0);
    });

    it("GIVEN a snapshot taken after createHoldByPartition WHEN heldBalanceOfAtSnapshot THEN returns the exact held amount at that snapshot", async () => {
      const heldAmount = 300;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, {
        amount: heldAmount,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const balance = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
      expect(balance).to.equal(heldAmount);
    });

    it("GIVEN two snapshots where held amount differs between them WHEN heldBalanceOfAtSnapshot at first snapshot THEN returns the value recorded at the first snapshot", async () => {
      const heldAmountFirst = 100;
      const heldAmountSecond = 250;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      // snapshot 1: no holds yet
      await asset.connect(signer_A).takeSnapshot();

      await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, {
        amount: heldAmountFirst,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x",
      });

      // snapshot 2: first hold active
      await asset.connect(signer_A).takeSnapshot();

      await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, {
        amount: heldAmountSecond,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x",
      });

      const balanceAtSnapshot1 = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
      const balanceAtSnapshot2 = await asset.heldBalanceOfAtSnapshot(2, signer_A.address);

      expect(balanceAtSnapshot1).to.equal(0);
      expect(balanceAtSnapshot2).to.equal(heldAmountFirst);
    });

    it("GIVEN two holders each with different held amounts at snapshot time WHEN heldBalanceOfAtSnapshot THEN returns each holder's individual held amount independently", async () => {
      const heldAmountA = 200;
      const heldAmountC = 450;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, {
        amount: heldAmountA,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: signer_C.address,
        data: "0x",
      });
      await asset.connect(signer_C).createHoldByPartition(_PARTITION_ID_2, {
        amount: heldAmountC,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: signer_A.address,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const balanceA = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
      const balanceC = await asset.heldBalanceOfAtSnapshot(1, signer_C.address);

      expect(balanceA).to.equal(heldAmountA);
      expect(balanceC).to.equal(heldAmountC);
    });
  });

  describe("initializeHoldAtSnapshot", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeHoldAtSnapshot is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_C).initializeHoldAtSnapshot()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeHoldAtSnapshot is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeHoldAtSnapshot();
      await expect(freshAsset.connect(infra.deployer).initializeHoldAtSnapshot()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeHoldAtSnapshot is called THEN it emits HoldAtSnapshotInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeHoldAtSnapshot()).to.emit(
        freshAsset,
        "HoldAtSnapshotInitialized",
      );
    });
  });
});
