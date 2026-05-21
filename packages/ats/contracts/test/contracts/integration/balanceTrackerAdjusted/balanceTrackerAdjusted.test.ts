// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, dateToUnixTimestamp, EMPTY_STRING, ZERO, EQUITY_CONFIG_ID } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const EMPTY_VC_ID = EMPTY_STRING;

describe("BalanceTrackerAdjusted Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquity() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CORPORATE_ACTION_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  afterEach(async () => {
    await asset.resetSystemTimestamp();
  });

  describe("balanceOfAt", () => {
    beforeEach(async () => {
      await loadFixture(deployEquity);
    });

    it("GIVEN a token holder with minted tokens WHEN balanceOfAt at current time THEN returns minted amount", async () => {
      const mintAmount = 1000;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
      expect(await asset.balanceOfAt(signer_A.address, currentTimestamp)).to.equal(mintAmount);
    });

    it("GIVEN an address with no tokens WHEN balanceOfAt THEN returns zero", async () => {
      const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
      expect(await asset.balanceOfAt(signer_C.address, currentTimestamp)).to.equal(0);
    });

    it("GIVEN a token holder with minted tokens WHEN balanceOfAt at timestamp 0 THEN returns minted amount unchanged", async () => {
      const mintAmount = 500;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      // timestamp 0 has no pending adjustments — balance is unchanged
      expect(await asset.balanceOfAt(signer_A.address, 0)).to.equal(mintAmount);
    });

    it("GIVEN a scheduled balance adjustment WHEN balanceOfAt before the adjustment THEN returns original balance", async () => {
      const mintAmount = 100;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      const adjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
      await asset.connect(signer_A).setScheduledBalanceAdjustment({
        executionDate: adjustmentDate.toString(),
        factor: 2,
        decimals: 0,
      });

      // one second before the adjustment the balance should be unchanged
      expect(await asset.balanceOfAt(signer_A.address, adjustmentDate - 1)).to.equal(mintAmount);
    });

    it("GIVEN a scheduled balance adjustment WHEN balanceOfAt after the adjustment THEN returns adjusted balance", async () => {
      const mintAmount = 100;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      const adjustmentFactor = 2;
      const adjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
      await asset.connect(signer_A).setScheduledBalanceAdjustment({
        executionDate: adjustmentDate.toString(),
        factor: adjustmentFactor,
        decimals: 0,
      });

      // one second after the adjustment the projected balance should be multiplied by the factor
      expect(await asset.balanceOfAt(signer_A.address, adjustmentDate + 1)).to.equal(mintAmount * adjustmentFactor);
    });

    it("GIVEN multiple scheduled adjustments WHEN balanceOfAt between them THEN applies only the earlier adjustment", async () => {
      const mintAmount = 100;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      const firstAdjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
      const secondAdjustmentDate = dateToUnixTimestamp("2031-06-01T00:00:00Z");

      await asset.connect(signer_A).setScheduledBalanceAdjustment({
        executionDate: firstAdjustmentDate.toString(),
        factor: 2,
        decimals: 0,
      });
      await asset.connect(signer_A).setScheduledBalanceAdjustment({
        executionDate: secondAdjustmentDate.toString(),
        factor: 3,
        decimals: 0,
      });

      // between the two adjustments: only the first factor (×2) is applied
      expect(await asset.balanceOfAt(signer_A.address, firstAdjustmentDate + 1)).to.equal(mintAmount * 2);

      // after both adjustments: both factors (×2×3 = ×6) are applied
      expect(await asset.balanceOfAt(signer_A.address, secondAdjustmentDate + 1)).to.equal(mintAmount * 2 * 3);
    });
  });
  describe("initializeBalanceTrackerAdjusted", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeBalanceTrackerAdjusted is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.user3).initializeBalanceTrackerAdjusted()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeBalanceTrackerAdjusted is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeBalanceTrackerAdjusted();
      await expect(freshAsset.connect(infra.deployer).initializeBalanceTrackerAdjusted()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBalanceTrackerAdjusted is called THEN it emits BalanceTrackerAdjustedInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeBalanceTrackerAdjusted()).to.emit(
        freshAsset,
        "BalanceTrackerAdjustedInitialized",
      );
    });
  });
});
