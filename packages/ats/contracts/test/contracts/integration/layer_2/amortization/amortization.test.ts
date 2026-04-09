// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES } from "@scripts";
import { deployLoanTokenFixture, getDltTimestamp } from "@test";
import { DEFAULT_SECURITY_PARAMS } from "test/fixtures/tokens/common.fixture";

const TOTAL_UNITS = 1_000;
const TOKENS_TO_REDEEM = 500;
const RECORD_DATE_OFFSET = 400;
const EXECUTION_DATE_OFFSET = 1200;

describe("AmortizationFacet", () => {
  let asset: IAsset;
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

  async function deployAmortizationLoanFixture() {
    const base = await deployLoanTokenFixture({ loanParams: { securityDataParams: { internalKycActivated: false } } });
    const { tokenAddress, deployer } = base;

    const asset = await ethers.getContractAt("IAsset", tokenAddress, deployer);

    const [, user1, user2, user3] = await ethers.getSigners();

    return {
      ...base,
      asset,
      deployer,
      user1,
      user2,
      user3,
    };
  }

  beforeEach(async () => {
    const fixture = await loadFixture(deployAmortizationLoanFixture);
    asset = fixture.asset;
    deployer = fixture.deployer;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
  });

  describe("setAmortization", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
    });

    it("GIVEN account without CORPORATE_ACTION_ROLE WHEN setAmortization THEN reverts with AccountHasNoRole", async () => {
      const data = await makeAmortizationData();
      await expect(asset.connect(user3).setAmortization(data))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._CORPORATE_ACTION_ROLE);
    });

    it("GIVEN paused token WHEN setAmortization THEN reverts with TokenIsPaused", async () => {
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);
      await asset.connect(user1).pause();

      const data = await makeAmortizationData();
      await expect(asset.connect(user2).setAmortization(data)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN recordDate >= executionDate WHEN setAmortization THEN reverts with WrongDates", async () => {
      const now = await getDltTimestamp();
      const wrongData = {
        recordDate: now + EXECUTION_DATE_OFFSET,
        executionDate: now + RECORD_DATE_OFFSET,
        tokensToRedeem: TOKENS_TO_REDEEM,
      };

      await expect(asset.connect(user2).setAmortization(wrongData))
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

      await expect(asset.connect(user2).setAmortization(wrongData)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
      // .withArgs(wrongData.recordDate);
    });

    it("GIVEN identical amortization data submitted twice WHEN second setAmortization THEN reverts with AmortizationCreationFailed", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data); // first — succeeds
      await expect(asset.connect(user2).setAmortization(data)) // second — fails
        .to.be.revertedWithCustomError(asset, "AmortizationCreationFailed");
    });

    it("GIVEN valid data WHEN setAmortization THEN emits AmortizationSet and all getters reflect correct pre-snapshot state", async () => {
      const data = await makeAmortizationData();

      await expect(asset.connect(user2).setAmortization(data))
        .to.emit(asset, "AmortizationSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          user2.address,
          data.recordDate,
          data.executionDate,
        );

      expect(await asset.getAmortizationsCount()).to.equal(1n);

      const [registered, isDisabled] = await asset.getAmortization(1);
      expect(registered.amortization.recordDate).to.equal(data.recordDate);
      expect(registered.amortization.executionDate).to.equal(data.executionDate);
      expect(registered.amortization.tokensToRedeem).to.equal(TOKENS_TO_REDEEM);
      expect(registered.snapshotId).to.equal(0n);
      expect(isDisabled).to.equal(false);

      const amortizationFor = await asset.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.holdId).to.equal(0n);
      expect(amortizationFor.holdActive).to.equal(false);
      // hold fields — all zero because no hold exists
      expect(amortizationFor.tokenHeldAmount).to.equal(0n);
      expect(amortizationFor.decimalsHeld).to.equal(0);
      expect(amortizationFor.abafAtHold).to.equal(0n);
      // snapshot fields — recordDate not reached yet
      expect(amortizationFor.tokenBalance).to.equal(0n);
      expect(amortizationFor.decimalsBalance).to.equal(0);
      expect(amortizationFor.recordDateReached).to.equal(false);
      expect(amortizationFor.abafAtSnapshot).to.equal(1n);

      expect(amortizationFor.nominalValue).to.equal(100n);
      expect(amortizationFor.nominalValueDecimals).to.equal(2);
      expect(amortizationFor.recordDate).to.equal(data.recordDate);
      expect(amortizationFor.executionDate).to.equal(data.executionDate);

      expect(await asset.getTotalAmortizationHolders(1)).to.equal(0n);
      expect(await asset.getAmortizationHolders(1, 0, 100)).to.have.length(0);
    });
  });

  describe("cancelAmortization", () => {
    let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;

    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      amortizationData = await makeAmortizationData();
      await asset.connect(user2).setAmortization(amortizationData);
    });

    it("GIVEN account without CORPORATE_ACTION_ROLE WHEN cancelAmortization THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(user3).cancelAmortization(1))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._CORPORATE_ACTION_ROLE);
    });

    it("GIVEN paused token WHEN cancelAmortization THEN reverts with TokenIsPaused", async () => {
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);

      await asset.connect(user1).pause();

      await expect(asset.connect(user2).cancelAmortization(1)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN non-existent amortization ID WHEN cancelAmortization THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.connect(user2).cancelAmortization(999)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });

    it("GIVEN past execution date WHEN cancelAmortization THEN reverts with AmortizationAlreadyExecuted", async () => {
      await asset.changeSystemTimestamp(amortizationData.executionDate + 1);

      await expect(asset.connect(user2).cancelAmortization(1))
        .to.be.revertedWithCustomError(asset, "AmortizationAlreadyExecuted")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
    });

    it("GIVEN valid amortization WHEN cancelAmortization THEN emits AmortizationCancelled and getAmortization shows isDisabled=true", async () => {
      await expect(asset.connect(user2).cancelAmortization(1))
        .to.emit(asset, "AmortizationCancelled")
        .withArgs(1n, user2.address);

      const [, isDisabled] = await asset.getAmortization(1);
      expect(isDisabled).to.equal(true);
    });

    it("GIVEN amortization with one active hold WHEN cancelAmortization THEN reverts with AmortizationHasActiveHolds", async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await expect(asset.connect(user2).cancelAmortization(1))
        .to.be.revertedWithCustomError(asset, "AmortizationHasActiveHolds")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
    });

    it("GIVEN amortization with hold released WHEN cancelAmortization THEN emits AmortizationCancelled", async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      await expect(asset.connect(user2).cancelAmortization(1))
        .to.emit(asset, "AmortizationCancelled")
        .withArgs(1n, user2.address);
    });

    it("GIVEN already cancelled amortization WHEN cancelAmortization THEN reverts with AmortizationNotActive", async () => {
      await asset.connect(user2).cancelAmortization(1);

      await expect(asset.connect(user2).cancelAmortization(1))
        .to.be.revertedWithCustomError(asset, "AmortizationNotActive")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
    });
  });

  describe("getAmortizationsCount", () => {
    it("GIVEN no amortizations WHEN getAmortizationsCount THEN returns 0", async () => {
      const count = await asset.getAmortizationsCount();
      expect(count).to.equal(0n);
    });

    it("GIVEN 2 amortizations with one cancelled WHEN getAmortizationsCount THEN returns 2", async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);

      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      await asset.connect(user2).cancelAmortization(1);

      const count = await asset.getAmortizationsCount();
      expect(count).to.equal(2n);
    });
  });

  describe("getAmortization", () => {
    it("GIVEN invalid amortization ID WHEN getAmortization THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getAmortization(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });
  });

  describe("getAmortizationFor", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationFor THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getAmortizationFor(999, deployer.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });
  });

  describe("getAmortizationsFor", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationsFor THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getAmortizationsFor(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });
  });

  describe("getAmortizationHolders", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });
    it("GIVEN invalid amortization ID WHEN getAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getAmortizationHolders(999, 0, 10)).to.be.revertedWithCustomError(
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

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      const expectedAddresses = [deployer.address, user1.address];

      // pageLength=1, pageIndex=0 → 1 result with a valid holder and correct balance
      const [page0, page0Holders] = await asset.getAmortizationsFor(1, 0, 1);
      expect(page0.length).to.equal(1);
      expect(expectedAddresses).to.include(page0Holders[0]);
      expect(page0[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
      expect(page0[0].holdId).to.equal(0n);

      // pageLength=1, pageIndex=1 → the other holder
      const [page1, page1Holders] = await asset.getAmortizationsFor(1, 1, 1);
      expect(page1.length).to.equal(1);
      expect(expectedAddresses).to.include(page1Holders[0]);

      expect(page1Holders[0]).to.not.equal(page0Holders[0]);
      expect(page1[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));

      // pageLength=2, pageIndex=0 → both holders
      const [allEntries, allHolders] = await asset.getAmortizationsFor(1, 0, 2);
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

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      const page0 = await asset.getAmortizationHolders(1, 0, 1);
      expect(page0.length).to.equal(1);
      expect(page0[0]).to.equal(deployer.address);

      const page1 = await asset.getAmortizationHolders(1, 1, 1);
      expect(page1.length).to.equal(1);

      expect(page1[0]).to.equal(user1.address);
      expect(page1[0]).to.not.equal(page0[0]);
      expect([...page0, ...page1]).to.have.members([deployer.address, user1.address]);

      const allHolders = await asset.getAmortizationHolders(1, 0, 10);
      expect(allHolders.length).to.equal(2);
      expect([...allHolders]).to.have.members([deployer.address, user1.address]);
    });
  });

  describe("getTotalAmortizationHolders", () => {
    it("GIVEN invalid amortization ID WHEN getTotalAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getTotalAmortizationHolders(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });
  });

  describe("Post-recordDate — with snapshot", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
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

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      expect(await asset.getTotalAmortizationHolders(1)).to.equal(2n);

      const holders = await asset.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);

      const amForDeployer = await asset.getAmortizationFor(1, deployer.address);
      expect(amForDeployer.tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
      expect(amForDeployer.decimalsBalance).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
      expect(amForDeployer.recordDateReached).to.equal(true);
      expect(amForDeployer.abafAtSnapshot).to.equal(1n);
      expect(amForDeployer.nominalValueDecimals).to.equal(2);
      expect(amForDeployer.holdId).to.equal(0n);

      const amForUser1 = await asset.getAmortizationFor(1, user1.address);
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

      await asset.connect(user2).setAmortization(data);

      // Cancel before recordDate
      await asset.connect(user2).cancelAmortization(1);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      const [registered, isDisabled] = await asset.getAmortization(1);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).cancelAmortization(1);

      // Advance past recordDate without triggering snapshot
      await asset.changeSystemTimestamp(data.recordDate + 1);

      const [registered, isDisabled] = await asset.getAmortization(1);
      expect(isDisabled).to.equal(true);
      expect(registered.snapshotId).to.equal(0n);

      expect(await asset.getTotalAmortizationHolders(1)).to.equal(0n);

      const holders = await asset.getAmortizationHolders(1, 0, 10);
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

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      // Cancel after snapshot is already taken
      await asset.connect(user2).cancelAmortization(1);

      const [registered, isDisabled] = await asset.getAmortization(1);
      expect(isDisabled).to.equal(true);
      expect(registered.snapshotId).to.not.equal(0n);

      // Cancelled after snapshot: holders from snapshot are preserved
      expect(await asset.getTotalAmortizationHolders(1)).to.equal(2n);

      const holders = await asset.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);
    });
  });

  describe("Post-recordDate — without snapshot (snapshotId == 0)", () => {
    it("GIVEN recordDate passed but no snapshot triggered WHEN getAmortizationFor, getAmortizationHolders and getTotalAmortizationHolders THEN uses live balances and holders", async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

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

      await asset.connect(user2).setAmortization(data);

      // Advance past recordDate WITHOUT triggering snapshot
      await asset.changeSystemTimestamp(data.recordDate + 1);

      // getAmortizationFor uses live balance (_getTotalBalanceForAdjustedAt)
      const amortizationFor = await asset.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.tokenBalance).to.equal(BigInt(TOTAL_UNITS)); // live balance
      expect(amortizationFor.holdId).to.equal(0n);
      expect(amortizationFor.recordDateReached).to.equal(true);
      expect(amortizationFor.abafAtSnapshot).to.equal(1n); // snapshotId==0 → _abafAtSnapshot(0) returns _getAbafAdjustedAt(now) = 1

      // getAmortizationHolders uses live holders (_getTokenHolders)
      const holders = await asset.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);

      // getTotalAmortizationHolders uses live count
      expect(await asset.getTotalAmortizationHolders(1)).to.equal(2n);
    });
  });

  describe("setAmortizationHold", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN valid amortizationID and tokenHolder with balance WHEN setAmortizationHold THEN creates hold, emits AmortizationHoldSet", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      const holdAmount = BigInt(TOKENS_TO_REDEEM);

      await expect(asset.connect(user2).setAmortizationHold(1, deployer.address, holdAmount))
        .to.emit(asset, "AmortizationHoldSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          deployer.address,
          1n,
          holdAmount,
        );

      const amortizationFor = await asset.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.holdId).to.be.equal(1);
      expect(amortizationFor.holdActive).to.equal(true);
      // hold fields — adjusted at current block (no adjustBalance → decimals=6, abaf=1)
      expect(amortizationFor.tokenHeldAmount).to.equal(holdAmount);
      expect(amortizationFor.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
      expect(amortizationFor.abafAtHold).to.equal(1n);
      // snapshot fields — snapshotId != 0
      expect(amortizationFor.decimalsBalance).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
      expect(amortizationFor.recordDateReached).to.equal(true);
      expect(amortizationFor.abafAtSnapshot).to.equal(1n); // snapshotId != 0, no adjustBalance → _abafAtSnapshot fallback = 1
    });

    it("GIVEN tokenHolder already has pending hold WHEN setAmortizationHold called again THEN releases old hold and creates new hold", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      // First hold
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      const firstAmortizationFor = await asset.getAmortizationFor(1, deployer.address);
      const firstHoldId = firstAmortizationFor.holdId;
      expect(firstHoldId).to.be.equal(1);

      // Second hold — should release the first and create a new one
      const newAmount = BigInt(TOKENS_TO_REDEEM) / 2n;
      await expect(asset.connect(user2).setAmortizationHold(1, deployer.address, newAmount))
        .to.emit(asset, "AmortizationHoldSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          deployer.address,
          2n,
          newAmount,
        );

      const secondAmortizationFor = await asset.getAmortizationFor(1, deployer.address);
      expect(secondAmortizationFor.holdId).to.equal(2n);
      expect(secondAmortizationFor.holdId).to.not.equal(firstHoldId);
      expect(secondAmortizationFor.holdActive).to.equal(true);
      expect(secondAmortizationFor.tokenHeldAmount).to.equal(newAmount);
      expect(secondAmortizationFor.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
      expect(secondAmortizationFor.abafAtHold).to.equal(1n);
    });

    it("GIVEN invalid amortizationID WHEN setAmortizationHold THEN reverts with WrongIndexForAction", async () => {
      await expect(
        asset.connect(user2).setAmortizationHold(999, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });

    it("GIVEN caller without AMORTIZATION_ROLE WHEN setAmortizationHold THEN reverts with AccountHasNoRole", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data);

      await expect(asset.connect(user3).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._AMORTIZATION_ROLE);
    });

    it("GIVEN paused token WHEN setAmortizationHold THEN reverts with TokenIsPaused", async () => {
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);

      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user1).pause();

      await expect(
        asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN tokenAmount exceeds holder balance WHEN setAmortizationHold THEN reverts with AmortizationHoldFailed or hold error", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: 10,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      const excessiveAmount = BigInt(TOTAL_UNITS * 10);
      await expect(
        asset.connect(user2).setAmortizationHold(1, deployer.address, excessiveAmount),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    it("GIVEN cancelled amortization WHEN setAmortizationHold THEN reverts with AmortizationNotActive", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).cancelAmortization(1);

      await expect(asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)))
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

      await asset.connect(user2).setAmortization(data);

      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      // First hold
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      expect((await asset.getAmortizationFor(1, deployer.address)).holdId).to.equal(1n);

      // Release — holdActive becomes false
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);
      expect((await asset.getAmortizationFor(1, deployer.address)).holdActive).to.equal(false);

      // Second hold via holdActive=false code path — no attempt to release holdId=1
      const newAmount = BigInt(TOKENS_TO_REDEEM) / 2n;
      await expect(asset.connect(user2).setAmortizationHold(1, deployer.address, newAmount))
        .to.emit(asset, "AmortizationHoldSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          deployer.address,
          2n,
          newAmount,
        );

      const result = await asset.getAmortizationFor(1, deployer.address);
      expect(result.holdId).to.equal(2n);
      expect(result.holdActive).to.equal(true);
      expect(result.tokenHeldAmount).to.equal(newAmount);
      expect(await asset.getTotalAmortizationActiveHolders(1)).to.equal(1n);
    });

    it("GIVEN tokenAmount = 0 WHEN setAmortizationHold THEN reverts with InvalidAmortizationHoldAmount", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);

      await expect(asset.connect(user2).setAmortizationHold(1, deployer.address, 0n))
        .to.be.revertedWithCustomError(asset, "InvalidAmortizationHoldAmount")
        .withArgs(1n);
    });
  });

  describe("releaseAmortizationHold", () => {
    let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;
    const holdAmount = BigInt(TOKENS_TO_REDEEM);

    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      amortizationData = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(amortizationData);
      await asset.changeSystemTimestamp(amortizationData.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();
      await asset.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);
    });

    it("GIVEN account without AMORTIZATION_ROLE WHEN releaseAmortizationHold THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(user3).releaseAmortizationHold(1, deployer.address))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._AMORTIZATION_ROLE);
    });

    it("GIVEN paused token WHEN releaseAmortizationHold THEN reverts with TokenIsPaused", async () => {
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);
      await asset.connect(user1).pause();

      await expect(asset.connect(user2).releaseAmortizationHold(1, deployer.address)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN invalid amortization ID WHEN releaseAmortizationHold THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.connect(user2).releaseAmortizationHold(999, deployer.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });

    it("GIVEN holder with no active hold WHEN releaseAmortizationHold THEN reverts with AmortizationHoldNotActive", async () => {
      await expect(asset.connect(user2).releaseAmortizationHold(1, user3.address))
        .to.be.revertedWithCustomError(asset, "AmortizationHoldNotActive")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, user3.address);
    });

    it("GIVEN already released hold WHEN releaseAmortizationHold called again THEN reverts with AmortizationHoldNotActive", async () => {
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      await expect(asset.connect(user2).releaseAmortizationHold(1, deployer.address))
        .to.be.revertedWithCustomError(asset, "AmortizationHoldNotActive")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address);
    });

    it("GIVEN active hold WHEN releaseAmortizationHold THEN emits AmortizationHoldReleased and holdActive becomes false", async () => {
      await expect(asset.connect(user2).releaseAmortizationHold(1, deployer.address))
        .to.emit(asset, "AmortizationHoldReleased")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address, 1n);

      const amortizationFor = await asset.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.holdActive).to.equal(false);
      expect(amortizationFor.tokenHeldAmount).to.equal(0n);
    });
  });

  describe("Post-adjustBalance — hold + snapshot + balance adjustment", () => {
    it("GIVEN hold created after snapshot WHEN adjustBalances(2, 0) called THEN tokenHeldAmount doubles, abafAtHold updates, abafAtSnapshot preserved", async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, user2.address);

      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);

      // Advance past recordDate and trigger snapshot — abaf=1 at this point
      await asset.changeSystemTimestamp(data.recordDate + 1);
      await asset.triggerPendingScheduledCrossOrderedTasks();

      // Set hold of 500 tokens — holdLabaf=1 (current abaf when hold is created)
      const holdAmount = BigInt(TOKENS_TO_REDEEM);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);

      // Verify pre-adjustment values
      const beforeAdjust = await asset.getAmortizationFor(1, deployer.address);
      expect(beforeAdjust.tokenHeldAmount).to.equal(holdAmount); // 500 * (abaf=1 / holdLabaf=1) = 500
      expect(beforeAdjust.abafAtHold).to.equal(1n);
      expect(beforeAdjust.abafAtSnapshot).to.equal(1n);

      // Apply 2x balance adjustment — _updateAbafSnapshot stores old abaf=1 before multiplying
      await asset.connect(user2).adjustBalances(2, 0);

      // Verify post-adjustment values
      const afterAdjust = await asset.getAmortizationFor(1, deployer.address);
      // hold amount adjusted: raw 500 * (abaf=2 / holdLabaf=1) = 1000
      expect(afterAdjust.tokenHeldAmount).to.equal(holdAmount * 2n);
      expect(afterAdjust.decimalsHeld).to.equal(DEFAULT_SECURITY_PARAMS.decimals);
      // abafAtHold reflects current abaf
      expect(afterAdjust.abafAtHold).to.equal(2n);
      // abafAtSnapshot preserved — snapshotId != 0 → _abafAtSnapshot returns 1 (abaf stored at snapshot time, before adjustment)
      expect(afterAdjust.abafAtSnapshot).to.equal(1n);
      // snapshot fields unaffected by post-snapshot adjustment
      expect(afterAdjust.tokenBalance).to.equal(BigInt(TOTAL_UNITS));
      expect(afterAdjust.recordDateReached).to.equal(true);
    });
  });

  describe("getAmortizationActiveHolders", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN invalid amortization ID WHEN getAmortizationActiveHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getAmortizationActiveHolders(999, 0, 10)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });

    it("GIVEN amortization with no holds WHEN getAmortizationActiveHolders THEN returns empty array", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data);

      expect(await asset.getAmortizationActiveHolders(1, 0, 10)).to.have.length(0);
    });

    it("GIVEN 1 active hold WHEN getAmortizationActiveHolders THEN returns list with that holder", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      const holders = await asset.getAmortizationActiveHolders(1, 0, 10);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      expect(await asset.getAmortizationActiveHolders(1, 0, 10)).to.have.length(0);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      const holders = await asset.getAmortizationActiveHolders(1, 0, 10);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

      const page0 = await asset.getAmortizationActiveHolders(1, 0, 1);
      const page1 = await asset.getAmortizationActiveHolders(1, 1, 1);

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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      const outOfRange = await asset.getAmortizationActiveHolders(1, 99, 10);
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

      await asset.connect(user2).setAmortization(data1);
      await asset.connect(user2).setAmortization(data2);

      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      expect(await asset.getTotalAmortizationActiveHolders(2)).to.equal(0n);
      expect(await asset.getAmortizationActiveHolders(2, 0, 10)).to.have.length(0);
    });
  });

  describe("getTotalAmortizationActiveHolders", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN invalid amortization ID WHEN getTotalAmortizationActiveHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getTotalAmortizationActiveHolders(999)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });

    it("GIVEN amortization with no holds WHEN getTotalAmortizationActiveHolders THEN returns 0", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data);

      expect(await asset.getTotalAmortizationActiveHolders(1)).to.equal(0n);
    });

    it("GIVEN 1 active hold WHEN getTotalAmortizationActiveHolders THEN returns 1", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      expect(await asset.getTotalAmortizationActiveHolders(1)).to.equal(1n);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

      expect(await asset.getTotalAmortizationActiveHolders(1)).to.equal(2n);
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      expect(await asset.getTotalAmortizationActiveHolders(1)).to.equal(1n);
    });
  });

  describe("getTotalHoldByAmortizationId", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN invalid amortization ID WHEN getTotalHoldByAmortizationId THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getTotalHoldByAmortizationId(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });

    it("GIVEN amortization with no holds WHEN getTotalHoldByAmortizationId THEN returns 0", async () => {
      const data = await makeAmortizationData();
      await asset.connect(user2).setAmortization(data);

      expect(await asset.getTotalHoldByAmortizationId(1)).to.equal(0n);
    });

    it("GIVEN 1 active hold WHEN getTotalHoldByAmortizationId THEN returns hold amount", async () => {
      const data = await makeAmortizationData();

      await asset.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      expect(await asset.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM));
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

      expect(await asset.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM * 2));
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).releaseAmortizationHold(1, deployer.address);

      expect(await asset.getTotalHoldByAmortizationId(1)).to.equal(BigInt(TOKENS_TO_REDEEM));
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

      await asset.connect(user2).setAmortization(data);
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await asset.connect(user2).setAmortizationHold(1, deployer.address, BigInt(newAmount));

      expect(await asset.getTotalHoldByAmortizationId(1)).to.equal(BigInt(newAmount));
    });
  });

  describe("getActiveAmortizationIds", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
    });

    it("GIVEN no amortizations WHEN getActiveAmortizationIds THEN returns empty array", async () => {
      const ids = await asset.getActiveAmortizationIds(0, 10);
      expect(ids).to.have.length(0);
    });

    it("GIVEN 2 amortizations with none cancelled WHEN getActiveAmortizationIds THEN returns both IDs", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      const ids = await asset.getActiveAmortizationIds(0, 10);
      expect([...ids].map(Number)).to.have.members([1, 2]);
    });

    it("GIVEN 2 amortizations with one cancelled WHEN getActiveAmortizationIds THEN returns only the active one", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      await asset.connect(user2).cancelAmortization(1);

      const ids = await asset.getActiveAmortizationIds(0, 10);
      expect([...ids].map(Number)).to.deep.equal([2]);
    });

    it("GIVEN 3 amortizations WHEN getActiveAmortizationIds with page 0 length 2 THEN returns first 2", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      const data3 = await makeAmortizationData(600, 1400);
      await asset.connect(user2).setAmortization(data3);

      const ids = await asset.getActiveAmortizationIds(0, 2);
      expect([...ids].map(Number)).to.have.members([1, 2]);
    });

    it("GIVEN 3 amortizations WHEN getActiveAmortizationIds with page 1 length 2 THEN returns last 1", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      const data3 = await makeAmortizationData(600, 1400);
      await asset.connect(user2).setAmortization(data3);

      const ids = await asset.getActiveAmortizationIds(1, 2);
      expect([...ids].map(Number)).to.deep.equal([3]);
    });
  });

  describe("getTotalActiveAmortizationIds", () => {
    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
    });

    it("GIVEN no amortizations WHEN getTotalActiveAmortizationIds THEN returns 0", async () => {
      expect(await asset.getTotalActiveAmortizationIds()).to.equal(0n);
    });

    it("GIVEN 2 amortizations with none cancelled WHEN getTotalActiveAmortizationIds THEN returns 2", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      expect(await asset.getTotalActiveAmortizationIds()).to.equal(2n);
    });

    it("GIVEN 2 amortizations with one cancelled WHEN getTotalActiveAmortizationIds THEN returns 1", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await asset.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await asset.connect(user2).setAmortization(data2);

      await asset.connect(user2).cancelAmortization(1);

      expect(await asset.getTotalActiveAmortizationIds()).to.equal(1n);
    });
  });

  describe("multiPartition — all amortization functions revert with NotAllowedInMultiPartitionMode", () => {
    let mpAsset: IAsset;

    async function deployMultiPartitionLoanFixture() {
      const base = await deployLoanTokenFixture({
        loanParams: { securityDataParams: { isMultiPartition: true, internalKycActivated: false } },
      });
      const { tokenAddress, deployer } = base;

      const mpAsset = await ethers.getContractAt("IAsset", tokenAddress, deployer);

      return { ...base, mpAsset };
    }

    beforeEach(async () => {
      const fixture = await loadFixture(deployMultiPartitionLoanFixture);
      mpAsset = fixture.mpAsset;

      await mpAsset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, deployer.address);
      await mpAsset.grantRole(ATS_ROLES._AMORTIZATION_ROLE, deployer.address);
    });

    const amortizationData = {
      recordDate: Math.floor(Date.now() / 1000) + 400,
      executionDate: Math.floor(Date.now() / 1000) + 1200,
      tokensToRedeem: TOKENS_TO_REDEEM,
    };

    it("GIVEN multiPartition token WHEN setAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.setAmortization(amortizationData)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN cancelAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.cancelAmortization(1)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN setAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        mpAsset.setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(mpAsset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN multiPartition token WHEN releaseAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.releaseAmortizationHold(1, deployer.address)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationsCount THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortizationsCount()).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortization(1)).to.be.revertedWithCustomError(mpAsset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN multiPartition token WHEN getAmortizationFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortizationFor(1, deployer.address)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationsFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortizationsFor(1, 0, 10)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortizationHolders(1, 0, 10)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getTotalAmortizationHolders(1)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationActiveHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getAmortizationActiveHolders(1, 0, 10)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalAmortizationActiveHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getTotalAmortizationActiveHolders(1)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getActiveAmortizationIds THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getActiveAmortizationIds(0, 10)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalActiveAmortizationIds THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getTotalActiveAmortizationIds()).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalHoldByAmortizationId THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAsset.getTotalHoldByAmortizationId(1)).to.be.revertedWithCustomError(
        mpAsset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });
});
