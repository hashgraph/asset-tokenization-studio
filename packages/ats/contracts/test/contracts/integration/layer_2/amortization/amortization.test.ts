// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, IAmortization__factory } from "@contract-types";
import type { IAmortization } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, RESOLVER_KEY_AMORTIZATION } from "@scripts";
import { getDltTimestamp } from "@test";
import { DEFAULT_SECURITY_PARAMS } from "@test/fixtures/tokens/common.fixture";
import { ASSET_MOCK_CONFIG_ID } from "../../../../fixtures/deploy/assetMockConfiguration";
import type { AssetMockCtx } from "@test";

const TOTAL_UNITS = 1_000;
const TOKENS_TO_REDEEM = 500;
const RECORD_DATE_OFFSET = 400;
const EXECUTION_DATE_OFFSET = 1200;

export function amortizationTests(getCtx: () => AssetMockCtx): void {
  describe("AmortizationFacet", () => {
    let asset: IAssetMock;
    let amort: IAmortization;
    let deployer: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let user3: HardhatEthersSigner;

    async function makeAmortizationData(recordOffset = RECORD_DATE_OFFSET, executionOffset = EXECUTION_DATE_OFFSET) {
      const now = await getDltTimestamp();
      return {
        recordDate: now + recordOffset,
        executionDate: now + executionOffset,
        tokensToRedeem: TOKENS_TO_REDEEM,
      };
    }

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      user1 = ctx.user1;
      user2 = ctx.user2;
      user3 = ctx.user3;

      amort = IAmortization__factory.connect(ctx.diamond.target as string, deployer);

      await asset.forceDecimals(DEFAULT_SECURITY_PARAMS.decimals);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_NOMINAL_VALUE, deployer.address);
      await asset.connect(deployer).setNominalValue(100, 2);
    });

    describe("setAmortization", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
      });

      it("GIVEN account without ROLE_CORPORATE_ACTION WHEN setAmortization THEN reverts with AccountHasNoRole", async () => {
        const data = await makeAmortizationData();
        await expect(amort.connect(user3).setAmortization(data))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user3.address, ATS_ROLES.ROLE_CORPORATE_ACTION);
      });

      it("GIVEN paused token WHEN setAmortization THEN reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, user1.address);
        await asset.connect(user1).pause();

        const data = await makeAmortizationData();
        await expect(amort.connect(user2).setAmortization(data)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN recordDate >= executionDate WHEN setAmortization THEN reverts with WrongDates", async () => {
        const now = await getDltTimestamp();
        const wrongData = {
          recordDate: now + EXECUTION_DATE_OFFSET,
          executionDate: now + RECORD_DATE_OFFSET,
          tokensToRedeem: TOKENS_TO_REDEEM,
        };

        await expect(amort.connect(user2).setAmortization(wrongData))
          .to.be.revertedWithCustomError(asset, "WrongDates")
          .withArgs(wrongData.recordDate, wrongData.executionDate);
      });

      it("GIVEN past recordDate WHEN setAmortization THEN reverts with WrongTimestamp", async () => {
        const now = await getDltTimestamp();
        const wrongData = {
          recordDate: now - 1,
          executionDate: now + EXECUTION_DATE_OFFSET,
          tokensToRedeem: TOKENS_TO_REDEEM,
        };

        await expect(amort.connect(user2).setAmortization(wrongData)).to.be.revertedWithCustomError(
          asset,
          "WrongTimestamp",
        );
      });

      it("GIVEN identical amortization data submitted twice WHEN second setAmortization THEN reverts with AmortizationCreationFailed", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);
        await expect(amort.connect(user2).setAmortization(data)).to.be.revertedWithCustomError(
          asset,
          "AmortizationCreationFailed",
        );
      });

      it("GIVEN valid data WHEN setAmortization THEN emits AmortizationSet and all getters reflect correct pre-snapshot state", async () => {
        const data = await makeAmortizationData();

        await expect(amort.connect(user2).setAmortization(data))
          .to.emit(asset, "AmortizationSet")
          .withArgs(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            1n,
            user2.address,
            data.recordDate,
            data.executionDate,
          );

        expect(await amort.getAmortizationsCount()).to.equal(1n);

        const [registered, isDisabled] = await amort.getAmortization(1);
        expect(registered.amortization.recordDate).to.equal(data.recordDate);
        expect(registered.amortization.executionDate).to.equal(data.executionDate);
        expect(registered.amortization.tokensToRedeem).to.equal(TOKENS_TO_REDEEM);
        expect(registered.snapshotId).to.equal(0n);
        expect(isDisabled).to.equal(false);

        const amortizationFor = await amort.getAmortizationFor(1, deployer.address);
        expect(amortizationFor.holdId).to.equal(0n);
        expect(amortizationFor.holdActive).to.equal(false);
        expect(amortizationFor.tokenHeldAmount).to.equal(0n);
        expect(amortizationFor.decimalsHeld).to.equal(0);
        expect(amortizationFor.abafAtHold).to.equal(0n);
        expect(amortizationFor.tokenBalance).to.equal(0n);
        expect(amortizationFor.decimalsBalance).to.equal(0);
        expect(amortizationFor.recordDateReached).to.equal(false);
        expect(amortizationFor.abafAtSnapshot).to.equal(1n);

        expect(amortizationFor.nominalValue).to.equal(100n);
        expect(amortizationFor.nominalValueDecimals).to.equal(2);
        expect(amortizationFor.recordDate).to.equal(data.recordDate);
        expect(amortizationFor.executionDate).to.equal(data.executionDate);

        expect(await amort.getTotalAmortizationHolders(1)).to.equal(0n);
        expect(await amort.getAmortizationHolders(1, 0, 100)).to.have.length(0);
      });
    });

    describe("cancelAmortization", () => {
      let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;

      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        amortizationData = await makeAmortizationData();
        await amort.connect(user2).setAmortization(amortizationData);
      });

      it("GIVEN account without ROLE_CORPORATE_ACTION WHEN cancelAmortization THEN reverts with AccountHasNoRole", async () => {
        await expect(amort.connect(user3).cancelAmortization(1))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user3.address, ATS_ROLES.ROLE_CORPORATE_ACTION);
      });

      it("GIVEN paused token WHEN cancelAmortization THEN reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, user1.address);

        await asset.connect(user1).pause();

        await expect(amort.connect(user2).cancelAmortization(1)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN non-existent amortization ID WHEN cancelAmortization THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.connect(user2).cancelAmortization(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN past execution date WHEN cancelAmortization THEN reverts with AmortizationAlreadyExecuted", async () => {
        await asset.changeSystemTimestamp(amortizationData.executionDate + 1);

        await expect(amort.connect(user2).cancelAmortization(1))
          .to.be.revertedWithCustomError(asset, "AmortizationAlreadyExecuted")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
      });

      it("GIVEN valid amortization WHEN cancelAmortization THEN emits AmortizationCancelled and getAmortization shows isDisabled=true", async () => {
        await expect(amort.connect(user2).cancelAmortization(1))
          .to.emit(asset, "AmortizationCancelled")
          .withArgs(1n, user2.address);

        const [, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
      });

      it("GIVEN amortization with one active hold WHEN cancelAmortization THEN reverts with AmortizationHasActiveHolds", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await expect(amort.connect(user2).cancelAmortization(1))
          .to.be.revertedWithCustomError(asset, "AmortizationHasActiveHolds")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
      });

      it("GIVEN amortization with hold released WHEN cancelAmortization THEN emits AmortizationCancelled", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        await expect(amort.connect(user2).cancelAmortization(1))
          .to.emit(asset, "AmortizationCancelled")
          .withArgs(1n, user2.address);
      });

      it("GIVEN already cancelled amortization WHEN cancelAmortization THEN reverts with AmortizationNotActive", async () => {
        await amort.connect(user2).cancelAmortization(1);

        await expect(amort.connect(user2).cancelAmortization(1))
          .to.be.revertedWithCustomError(asset, "AmortizationNotActive")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
      });
    });

    describe("forceCancelAmortization", () => {
      let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;

      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, user2.address);
        amortizationData = await makeAmortizationData();
        await amort.connect(user2).setAmortization(amortizationData);
      });

      it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelAmortization before execution date THEN emits AmortizationForceCancelled and isDisabled is true", async () => {
        await expect(amort.connect(user2).forceCancelAmortization(1))
          .to.emit(asset, "AmortizationForceCancelled")
          .withArgs(1n, user2.address);

        const [, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
      });

      it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelAmortization after execution date THEN transaction succeeds bypassing date guard", async () => {
        await asset.changeSystemTimestamp(amortizationData.executionDate + 1);

        await expect(amort.connect(user2).forceCancelAmortization(1))
          .to.emit(asset, "AmortizationForceCancelled")
          .withArgs(1n, user2.address);

        const [, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
      });

      it("GIVEN account without ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelAmortization THEN reverts with AccountHasNoRole", async () => {
        await expect(amort.connect(user3).forceCancelAmortization(1))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user3.address, ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL);
      });

      it("GIVEN paused token WHEN forceCancelAmortization THEN reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, user1.address);

        await asset.connect(user1).pause();

        await expect(amort.connect(user2).forceCancelAmortization(1)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN non-existent amortization ID WHEN forceCancelAmortization THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.connect(user2).forceCancelAmortization(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN amortization with one active hold WHEN forceCancelAmortization THEN succeeds bypassing hold guard", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        await expect(amort.connect(user2).forceCancelAmortization(1))
          .to.emit(asset, "AmortizationForceCancelled")
          .withArgs(1n, user2.address);
        const [, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
      });
    });

    describe("getAmortizationsCount", () => {
      it("GIVEN no amortizations WHEN getAmortizationsCount THEN returns 0", async () => {
        const count = await amort.getAmortizationsCount();
        expect(count).to.equal(0n);
      });

      it("GIVEN 2 amortizations with one cancelled WHEN getAmortizationsCount THEN returns 2", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);

        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        await amort.connect(user2).cancelAmortization(1);

        const count = await amort.getAmortizationsCount();
        expect(count).to.equal(2n);
      });
    });

    describe("getAmortization", () => {
      it("GIVEN invalid amortization ID WHEN getAmortization THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getAmortization(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      });
    });

    describe("getAmortizationFor", () => {
      it("GIVEN invalid amortization ID WHEN getAmortizationFor THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getAmortizationFor(999, deployer.address)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });
    });

    describe("getAmortizationsFor", () => {
      it("GIVEN invalid amortization ID WHEN getAmortizationsFor THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getAmortizationsFor(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      });
    });

    describe("getAmortizationHolders", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });
      it("GIVEN invalid amortization ID WHEN getAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getAmortizationHolders(999, 0, 10)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN 2 holders and snapshot WHEN getAmortizationsFor with pageLength=1 THEN returns 1 entry per page call", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const expectedAddresses = [deployer.address, user1.address];

        const [page0, page0Holders] = await amort.getAmortizationsFor(1, 0, 1);
        expect(page0.length).to.equal(1);
        expect(expectedAddresses).to.include(page0Holders[0]);
        expect(page0[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
        expect(page0[0].holdId).to.equal(0n);

        const [page1, page1Holders] = await amort.getAmortizationsFor(1, 1, 1);
        expect(page1.length).to.equal(1);
        expect(expectedAddresses).to.include(page1Holders[0]);

        expect(page1Holders[0]).to.not.equal(page0Holders[0]);
        expect(page1[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));

        const [allEntries, allHolders] = await amort.getAmortizationsFor(1, 0, 2);
        expect(allEntries.length).to.equal(2);
        expect([...allHolders]).to.have.members(expectedAddresses);
      });

      it("GIVEN 2 holders and snapshot WHEN getAmortizationHolders with pageIndex=0 and pageIndex=1 THEN returns 1 holder per page", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const page0 = await amort.getAmortizationHolders(1, 0, 1);
        expect(page0.length).to.equal(1);
        expect(page0[0]).to.equal(deployer.address);

        const page1 = await amort.getAmortizationHolders(1, 1, 1);
        expect(page1.length).to.equal(1);

        expect(page1[0]).to.equal(user1.address);
        expect(page1[0]).to.not.equal(page0[0]);
        expect([...page0, ...page1]).to.have.members([deployer.address, user1.address]);

        const allHolders = await amort.getAmortizationHolders(1, 0, 10);
        expect(allHolders.length).to.equal(2);
        expect([...allHolders]).to.have.members([deployer.address, user1.address]);
      });
    });

    describe("getTotalAmortizationHolders", () => {
      it("GIVEN invalid amortization ID WHEN getTotalAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getTotalAmortizationHolders(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });
    });

    describe("Post-recordDate — with snapshot", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });

      it("GIVEN 2 holders and snapshot triggered WHEN querying THEN getTotalAmortizationHolders=2, getAmortizationHolders contains both addresses, getAmortizationFor for each holder has correct tokenBalance", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        expect(await amort.getTotalAmortizationHolders(1)).to.equal(2n);

        const holders = await amort.getAmortizationHolders(1, 0, 10);
        expect(holders.length).to.equal(2);
        expect([...holders]).to.have.members([deployer.address, user1.address]);

        const amForDeployer = await amort.getAmortizationFor(1, deployer.address);
        expect(amForDeployer.tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
        expect(amForDeployer.decimalsBalance).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(amForDeployer.recordDateReached).to.equal(true);
        expect(amForDeployer.abafAtSnapshot).to.equal(1n);
        expect(amForDeployer.nominalValueDecimals).to.equal(2);
        expect(amForDeployer.holdId).to.equal(0n);

        const amForUser1 = await amort.getAmortizationFor(1, user1.address);
        expect(amForUser1.tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
        expect(amForUser1.decimalsBalance).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(amForUser1.recordDateReached).to.equal(true);
        expect(amForUser1.abafAtSnapshot).to.equal(1n);
        expect(amForUser1.nominalValueDecimals).to.equal(2);
        expect(amForUser1.holdId).to.equal(0n);
      });

      it("GIVEN cancelled amortization and snapshot triggered WHEN getAmortizationFor THEN no snapshot triggered", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await amort.connect(user2).cancelAmortization(1);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const [registered, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
        expect(registered.snapshotId).to.equal(0n);
      });

      it("GIVEN cancelled amortization (isDisabled=true, snapshotId=0) WHEN querying holders past recordDate THEN returns empty (cancelled before snapshot)", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).cancelAmortization(1);

        await asset.changeSystemTimestamp(data.recordDate + 1);

        const [registered, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
        expect(registered.snapshotId).to.equal(0n);

        expect(await amort.getTotalAmortizationHolders(1)).to.equal(0n);

        const holders = await amort.getAmortizationHolders(1, 0, 10);
        expect(holders.length).to.equal(0);
      });

      it("GIVEN cancelled amortization (isDisabled=true, snapshotId!=0) WHEN querying holders THEN snapshot holders are still returned", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        await amort.connect(user2).cancelAmortization(1);

        const [registered, isDisabled] = await amort.getAmortization(1);
        expect(isDisabled).to.equal(true);
        expect(registered.snapshotId).to.not.equal(0n);

        expect(await amort.getTotalAmortizationHolders(1)).to.equal(2n);

        const holders = await amort.getAmortizationHolders(1, 0, 10);
        expect(holders.length).to.equal(2);
        expect([...holders]).to.have.members([deployer.address, user1.address]);
      });
    });

    describe("Post-recordDate — without snapshot (snapshotId == 0)", () => {
      it("GIVEN recordDate passed but no snapshot triggered WHEN getAmortizationFor, getAmortizationHolders and getTotalAmortizationHolders THEN uses live balances and holders", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);

        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS / 2,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);

        const amortizationFor = await amort.getAmortizationFor(1, deployer.address);
        expect(amortizationFor.tokenBalance).to.equal(BigInt(TOTAL_UNITS));
        expect(amortizationFor.holdId).to.equal(0n);
        expect(amortizationFor.recordDateReached).to.equal(true);
        expect(amortizationFor.abafAtSnapshot).to.equal(1n);

        const holders = await amort.getAmortizationHolders(1, 0, 10);
        expect(holders.length).to.equal(2);
        expect([...holders]).to.have.members([deployer.address, user1.address]);

        expect(await amort.getTotalAmortizationHolders(1)).to.equal(2n);
      });
    });

    describe("setAmortizationHold", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });

      it("GIVEN valid amortizationID and tokenHolder with balance WHEN setAmortizationHold THEN creates hold, emits AmortizationHoldSet", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const holdAmount = BigInt(TOKENS_TO_REDEEM);

        await expect(amort.connect(user2).setAmortizationHold(1, deployer.address, holdAmount))
          .to.emit(asset, "AmortizationHoldSet")
          .withArgs(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            1n,
            deployer.address,
            1n,
            holdAmount,
          );

        const amortizationFor = await amort.getAmortizationFor(1, deployer.address);
        expect(amortizationFor.holdId).to.be.equal(1);
        expect(amortizationFor.holdActive).to.equal(true);
        expect(amortizationFor.tokenHeldAmount).to.equal(holdAmount);
        expect(amortizationFor.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(amortizationFor.abafAtHold).to.equal(1n);
        expect(amortizationFor.decimalsBalance).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(amortizationFor.recordDateReached).to.equal(true);
        expect(amortizationFor.abafAtSnapshot).to.equal(1n);
      });

      it("GIVEN tokenHolder already has pending hold WHEN setAmortizationHold called again THEN releases old hold and creates new hold", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        const firstAmortizationFor = await amort.getAmortizationFor(1, deployer.address);
        const firstHoldId = firstAmortizationFor.holdId;
        expect(firstHoldId).to.be.equal(1);

        const newAmount = BigInt(TOKENS_TO_REDEEM) / 2n;
        await expect(amort.connect(user2).setAmortizationHold(1, deployer.address, newAmount))
          .to.emit(asset, "AmortizationHoldSet")
          .withArgs(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            1n,
            deployer.address,
            2n,
            newAmount,
          );

        const secondAmortizationFor = await amort.getAmortizationFor(1, deployer.address);
        expect(secondAmortizationFor.holdId).to.equal(2n);
        expect(secondAmortizationFor.holdId).to.not.equal(firstHoldId);
        expect(secondAmortizationFor.holdActive).to.equal(true);
        expect(secondAmortizationFor.tokenHeldAmount).to.equal(newAmount);
        expect(secondAmortizationFor.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(secondAmortizationFor.abafAtHold).to.equal(1n);
      });

      it("GIVEN invalid amortizationID WHEN setAmortizationHold THEN reverts with WrongIndexForAction", async () => {
        await expect(
          amort.connect(user2).setAmortizationHold(999, deployer.address, BigInt(TOKENS_TO_REDEEM)),
        ).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      });

      it("GIVEN caller without ROLE_AMORTIZATION WHEN setAmortizationHold THEN reverts with AccountHasNoRole", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);

        await expect(amort.connect(user3).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user3.address, ATS_ROLES.ROLE_AMORTIZATION);
      });

      it("GIVEN paused token WHEN setAmortizationHold THEN reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, user1.address);

        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await asset.connect(user1).pause();

        await expect(
          amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN tokenAmount exceeds holder balance WHEN setAmortizationHold THEN reverts with AmortizationHoldFailed or hold error", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: 10,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const excessiveAmount = BigInt(TOTAL_UNITS * 10);
        await expect(
          amort.connect(user2).setAmortizationHold(1, deployer.address, excessiveAmount),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
      });

      it("GIVEN cancelled amortization WHEN setAmortizationHold THEN reverts with AmortizationNotActive", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).cancelAmortization(1);

        await expect(amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)))
          .to.be.revertedWithCustomError(asset, "AmortizationNotActive")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
      });

      it("GIVEN holder with released hold WHEN setAmortizationHold called again THEN creates new hold without releasing the already-released one", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        expect((await amort.getAmortizationFor(1, deployer.address)).holdId).to.equal(1n);

        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);
        expect((await amort.getAmortizationFor(1, deployer.address)).holdActive).to.equal(false);

        const newAmount = BigInt(TOKENS_TO_REDEEM) / 2n;
        await expect(amort.connect(user2).setAmortizationHold(1, deployer.address, newAmount))
          .to.emit(asset, "AmortizationHoldSet")
          .withArgs(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            1n,
            deployer.address,
            2n,
            newAmount,
          );

        const result = await amort.getAmortizationFor(1, deployer.address);
        expect(result.holdId).to.equal(2n);
        expect(result.holdActive).to.equal(true);
        expect(result.tokenHeldAmount).to.equal(newAmount);
        expect(await amort.getTotalAmortizationActiveHolders(1)).to.equal(1n);
      });

      it("GIVEN tokenAmount = 0 WHEN setAmortizationHold THEN reverts with InvalidAmortizationHoldAmount", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await expect(amort.connect(user2).setAmortizationHold(1, deployer.address, 0n))
          .to.be.revertedWithCustomError(asset, "InvalidAmortizationHoldAmount")
          .withArgs(1n);
      });
    });

    describe("releaseAmortizationHold", () => {
      let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;
      const holdAmount = BigInt(TOKENS_TO_REDEEM);

      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);

        amortizationData = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(amortizationData);
        await asset.changeSystemTimestamp(amortizationData.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();
        await amort.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);
      });

      it("GIVEN account without ROLE_AMORTIZATION WHEN releaseAmortizationHold THEN reverts with AccountHasNoRole", async () => {
        await expect(amort.connect(user3).releaseAmortizationHold(1, deployer.address))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user3.address, ATS_ROLES.ROLE_AMORTIZATION);
      });

      it("GIVEN paused token WHEN releaseAmortizationHold THEN reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, user1.address);
        await asset.connect(user1).pause();

        await expect(amort.connect(user2).releaseAmortizationHold(1, deployer.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN invalid amortization ID WHEN releaseAmortizationHold THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.connect(user2).releaseAmortizationHold(999, deployer.address)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN holder with no active hold WHEN releaseAmortizationHold THEN reverts with AmortizationHoldNotActive", async () => {
        await expect(amort.connect(user2).releaseAmortizationHold(1, user3.address))
          .to.be.revertedWithCustomError(asset, "AmortizationHoldNotActive")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, user3.address);
      });

      it("GIVEN already released hold WHEN releaseAmortizationHold called again THEN reverts with AmortizationHoldNotActive", async () => {
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        await expect(amort.connect(user2).releaseAmortizationHold(1, deployer.address))
          .to.be.revertedWithCustomError(asset, "AmortizationHoldNotActive")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address);
      });

      it("GIVEN active hold WHEN releaseAmortizationHold THEN emits AmortizationHoldReleased and holdActive becomes false", async () => {
        await expect(amort.connect(user2).releaseAmortizationHold(1, deployer.address))
          .to.emit(asset, "AmortizationHoldReleased")
          .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address, 1n);

        const amortizationFor = await amort.getAmortizationFor(1, deployer.address);
        expect(amortizationFor.holdActive).to.equal(false);
        expect(amortizationFor.tokenHeldAmount).to.equal(0n);
      });
    });

    describe("Post-adjustBalance — hold + snapshot + balance adjustment", () => {
      it("GIVEN hold created after snapshot WHEN adjustBalances(2, 0) called THEN tokenHeldAmount doubles, abafAtHold updates, abafAtSnapshot preserved", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, user2.address);

        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);

        await asset.changeSystemTimestamp(data.recordDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const holdAmount = BigInt(TOKENS_TO_REDEEM);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);

        const beforeAdjust = await amort.getAmortizationFor(1, deployer.address);
        expect(beforeAdjust.tokenHeldAmount).to.equal(holdAmount);
        expect(beforeAdjust.abafAtHold).to.equal(1n);
        expect(beforeAdjust.abafAtSnapshot).to.equal(1n);

        await asset.connect(user2).adjustBalances(2, 0);

        const afterAdjust = await amort.getAmortizationFor(1, deployer.address);
        expect(afterAdjust.tokenHeldAmount).to.equal(holdAmount * 2n);
        expect(afterAdjust.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
        expect(afterAdjust.abafAtHold).to.equal(2n);
        expect(afterAdjust.abafAtSnapshot).to.equal(1n);
        expect(afterAdjust.tokenBalance).to.equal(BigInt(TOTAL_UNITS));
        expect(afterAdjust.recordDateReached).to.equal(true);
      });
    });

    describe("getAmortizationActiveHolders", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });

      it("GIVEN invalid amortization ID WHEN getAmortizationActiveHolders THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getAmortizationActiveHolders(999, 0, 10)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN amortization with no holds WHEN getAmortizationActiveHolders THEN returns empty array", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);

        expect(await amort.getAmortizationActiveHolders(1, 0, 10)).to.have.length(0);
      });

      it("GIVEN 1 active hold WHEN getAmortizationActiveHolders THEN returns list with that holder", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        const holders = await amort.getAmortizationActiveHolders(1, 0, 10);
        expect(holders.length).to.equal(1);
        expect(holders[0]).to.equal(deployer.address);
      });

      it("GIVEN active hold released WHEN getAmortizationActiveHolders THEN returns empty array", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        expect(await amort.getAmortizationActiveHolders(1, 0, 10)).to.have.length(0);
      });

      it("GIVEN 2 active holds, 1 released WHEN getAmortizationActiveHolders THEN returns only the unreleased holder", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        const holders = await amort.getAmortizationActiveHolders(1, 0, 10);
        expect(holders.length).to.equal(1);
        expect(holders[0]).to.equal(user1.address);
      });

      it("GIVEN 2 active holds WHEN getAmortizationActiveHolders with pageLength=1 THEN returns 1 holder per page and pages are disjoint", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

        const page0 = await amort.getAmortizationActiveHolders(1, 0, 1);
        const page1 = await amort.getAmortizationActiveHolders(1, 1, 1);

        expect(page0.length).to.equal(1);
        expect(page1.length).to.equal(1);
        expect(page0[0]).to.not.equal(page1[0]);
        expect([page0[0], page1[0]]).to.have.members([deployer.address, user1.address]);
      });

      it("GIVEN 1 active hold WHEN getAmortizationActiveHolders with out-of-range pageIndex THEN returns empty array", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        const outOfRange = await amort.getAmortizationActiveHolders(1, 99, 10);
        expect(outOfRange).to.have.length(0);
      });

      it("GIVEN hold on amortization 1 WHEN querying amortization 2 active hold holders THEN returns empty (no cross-amortization bleed)", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        const data2 = await makeAmortizationData(500, 1300);

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data1);
        await amort.connect(user2).setAmortization(data2);

        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        expect(await amort.getTotalAmortizationActiveHolders(2)).to.equal(0n);
        expect(await amort.getAmortizationActiveHolders(2, 0, 10)).to.have.length(0);
      });
    });

    describe("getTotalAmortizationActiveHolders", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });

      it("GIVEN invalid amortization ID WHEN getTotalAmortizationActiveHolders THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getTotalAmortizationActiveHolders(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN amortization with no holds WHEN getTotalAmortizationActiveHolders THEN returns 0", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);

        expect(await amort.getTotalAmortizationActiveHolders(1)).to.equal(0n);
      });

      it("GIVEN 1 active hold WHEN getTotalAmortizationActiveHolders THEN returns 1", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        expect(await amort.getTotalAmortizationActiveHolders(1)).to.equal(1n);
      });

      it("GIVEN 2 active holds WHEN getTotalAmortizationActiveHolders THEN returns 2", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

        expect(await amort.getTotalAmortizationActiveHolders(1)).to.equal(2n);
      });

      it("GIVEN 2 active holds, 1 released WHEN getTotalAmortizationActiveHolders THEN returns 1", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        expect(await amort.getTotalAmortizationActiveHolders(1)).to.equal(1n);
      });
    });

    describe("getTotalHoldByAmortizationId", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
        await asset.grantRole(ATS_ROLES.ROLE_ISSUER, user2.address);
      });

      it("GIVEN invalid amortization ID WHEN getTotalHoldByAmortizationId THEN reverts with WrongIndexForAction", async () => {
        await expect(amort.getTotalHoldByAmortizationId(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN amortization with no holds WHEN getTotalHoldByAmortizationId THEN returns 0", async () => {
        const data = await makeAmortizationData();
        await amort.connect(user2).setAmortization(data);

        expect(await amort.getTotalHoldByAmortizationId(1)).to.equal(0n);
      });

      it("GIVEN 1 active hold WHEN getTotalHoldByAmortizationId THEN returns hold amount", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

        expect(await amort.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM));
      });

      it("GIVEN 2 active holds WHEN getTotalHoldByAmortizationId THEN returns sum of both amounts", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

        expect(await amort.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM * 2));
      });

      it("GIVEN 2 active holds, 1 released WHEN getTotalHoldByAmortizationId THEN returns only remaining hold amount", async () => {
        const data = await makeAmortizationData();

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: user1.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).releaseAmortizationHold(1, deployer.address);

        expect(await amort.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM));
      });

      it("GIVEN hold replaced with new amount WHEN getTotalHoldByAmortizationId THEN reflects updated total", async () => {
        const data = await makeAmortizationData();
        const newAmount = TOKENS_TO_REDEEM - 100;

        await asset.connect(user2).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: deployer.address,
          value: TOTAL_UNITS,
          data: EMPTY_HEX_BYTES,
        });

        await amort.connect(user2).setAmortization(data);
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
        await amort.connect(user2).setAmortizationHold(1, deployer.address, BigInt(newAmount));

        expect(await amort.getTotalHoldByAmortizationId(1)).to.equal(BigInt(newAmount));
      });
    });

    describe("getActiveAmortizationIds", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
      });

      it("GIVEN no amortizations WHEN getActiveAmortizationIds THEN returns empty array", async () => {
        const ids = await amort.getActiveAmortizationIds(0, 10);
        expect(ids).to.have.length(0);
      });

      it("GIVEN 2 amortizations with none cancelled WHEN getActiveAmortizationIds THEN returns both IDs", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        const ids = await amort.getActiveAmortizationIds(0, 10);
        expect([...ids].map(Number)).to.have.members([1, 2]);
      });

      it("GIVEN 2 amortizations with one cancelled WHEN getActiveAmortizationIds THEN returns only the active one", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        await amort.connect(user2).cancelAmortization(1);

        const ids = await amort.getActiveAmortizationIds(0, 10);
        expect([...ids].map(Number)).to.deep.equal([2]);
      });

      it("GIVEN 3 amortizations WHEN getActiveAmortizationIds with page 0 length 2 THEN returns first 2", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        const data3 = await makeAmortizationData(600, 1400);
        await amort.connect(user2).setAmortization(data3);

        const ids = await amort.getActiveAmortizationIds(0, 2);
        expect([...ids].map(Number)).to.have.members([1, 2]);
      });

      it("GIVEN 3 amortizations WHEN getActiveAmortizationIds with page 1 length 2 THEN returns last 1", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        const data3 = await makeAmortizationData(600, 1400);
        await amort.connect(user2).setAmortization(data3);

        const ids = await amort.getActiveAmortizationIds(1, 2);
        expect([...ids].map(Number)).to.deep.equal([3]);
      });
    });

    describe("getTotalActiveAmortizationIds", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, user2.address);
      });

      it("GIVEN no amortizations WHEN getTotalActiveAmortizationIds THEN returns 0", async () => {
        expect(await amort.getTotalActiveAmortizationIds()).to.equal(0n);
      });

      it("GIVEN 2 amortizations with none cancelled WHEN getTotalActiveAmortizationIds THEN returns 2", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        expect(await amort.getTotalActiveAmortizationIds()).to.equal(2n);
      });

      it("GIVEN 2 amortizations with one cancelled WHEN getTotalActiveAmortizationIds THEN returns 1", async () => {
        const data1 = await makeAmortizationData(400, 1200);
        await amort.connect(user2).setAmortization(data1);

        const data2 = await makeAmortizationData(500, 1300);
        await amort.connect(user2).setAmortization(data2);

        await amort.connect(user2).cancelAmortization(1);

        expect(await amort.getTotalActiveAmortizationIds()).to.equal(1n);
      });
    });

    describe("multiPartition — all amortization functions revert with NotAllowedInMultiPartitionMode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
        await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, deployer.address);
        await asset.grantRole(ATS_ROLES.ROLE_AMORTIZATION, deployer.address);
      });

      const amortizationData = {
        recordDate: Math.floor(Date.now() / 1000) + 400,
        executionDate: Math.floor(Date.now() / 1000) + 1200,
        tokensToRedeem: TOKENS_TO_REDEEM,
      };

      it("GIVEN multiPartition token WHEN setAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.setAmortization(amortizationData)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN cancelAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.cancelAmortization(1)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN setAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          amort.setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN multiPartition token WHEN releaseAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.releaseAmortizationHold(1, deployer.address)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getAmortizationsCount THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortizationsCount()).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortization(1)).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN multiPartition token WHEN getAmortizationFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortizationFor(1, deployer.address)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getAmortizationsFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortizationsFor(1, 0, 10)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortizationHolders(1, 0, 10)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getTotalAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getTotalAmortizationHolders(1)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getAmortizationActiveHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getAmortizationActiveHolders(1, 0, 10)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getTotalAmortizationActiveHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getTotalAmortizationActiveHolders(1)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getActiveAmortizationIds THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getActiveAmortizationIds(0, 10)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getTotalActiveAmortizationIds THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getTotalActiveAmortizationIds()).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN getTotalHoldByAmortizationId THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.getTotalHoldByAmortizationId(1)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multiPartition token WHEN forceCancelAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
        await expect(amort.forceCancelAmortization(1)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN cancelAmortization THEN transaction fails with Deactivated", async () => {
        await expect(amort.cancelAmortization(0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN setAmortization THEN transaction fails with Deactivated", async () => {
        await expect(
          amort.setAmortization({ recordDate: 0, executionDate: 0, tokensToRedeem: 0 }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN releaseAmortizationHold THEN transaction fails with Deactivated", async () => {
        await expect(amort.releaseAmortizationHold(0, ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN setAmortizationHold THEN transaction fails with Deactivated", async () => {
        await expect(amort.setAmortizationHold(0, ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN forceCancelAmortization THEN transaction fails with Deactivated", async () => {
        await expect(amort.forceCancelAmortization(0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeAmortization", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeAmortization is called THEN AccountHasNoRole", async () => {
        await expect(amort.connect(user2).initializeAmortization())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(user2.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeAmortization is called again THEN FacetAlreadyRegistered", async () => {
        await expect(amort.initializeAmortization())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_AMORTIZATION, 1);
      });
    });

    describe("initializeAmortization event", () => {
      it("GIVEN a fresh deployment WHEN initializeAmortization is called THEN emits AmortizationInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_AMORTIZATION);
        await expect(amort.initializeAmortization()).to.emit(asset, "AmortizationInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN setAmortization is called THEN AssetNotOperational", async () => {
        await expect(amort.setAmortization({ recordDate: 0n, executionDate: 0n, tokensToRedeem: 0n }))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN cancelAmortization is called THEN AssetNotOperational", async () => {
        await expect(amort.cancelAmortization(0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN releaseAmortizationHold is called THEN AssetNotOperational", async () => {
        await expect(amort.releaseAmortizationHold(0n, ethers.ZeroAddress))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN setAmortizationHold is called THEN AssetNotOperational", async () => {
        await expect(amort.setAmortizationHold(0n, ethers.ZeroAddress, 0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
