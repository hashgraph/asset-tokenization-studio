// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  type AccessControlFacet,
  type PauseFacet,
  type AmortizationFacet,
  type IERC1410,
  type ScheduledCrossOrderedTasksFacet,
  type TimeTravelFacet,
} from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES } from "@scripts";
import { deployLoanTokenFixture, getDltTimestamp } from "@test";

const TOTAL_UNITS = 1_000;
const TOKENS_TO_REDEEM = 500;
const RECORD_DATE_OFFSET = 400;
const EXECUTION_DATE_OFFSET = 1200;

describe("AmortizationFacet", () => {
  let amortizationFacet: AmortizationFacet;
  let accessControlFacet: AccessControlFacet;
  let pauseFacet: PauseFacet;
  let erc1410Facet: IERC1410;
  let scheduledCrossOrderedTasksFacet: ScheduledCrossOrderedTasksFacet;
  let timeTravelFacet: TimeTravelFacet;
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
    const base = await deployLoanTokenFixture({ internalKycActivated: false });
    const { tokenAddress, deployer, nominalValueFacet } = base;

    const amortizationFacet = await ethers.getContractAt("AmortizationFacet", tokenAddress, deployer);

    const erc1410Facet = await ethers.getContractAt("IERC1410", tokenAddress, deployer);

    const scheduledCrossOrderedTasksFacet = await ethers.getContractAt(
      "ScheduledCrossOrderedTasksFacet",
      tokenAddress,
      deployer,
    );

    const [, user1, user2, user3] = await ethers.getSigners();

    return {
      ...base,
      amortizationFacet,
      erc1410Facet,
      nominalValueFacet,
      scheduledCrossOrderedTasksFacet,
      deployer,
      user1,
      user2,
      user3,
    };
  }

  beforeEach(async () => {
    const fixture = await loadFixture(deployAmortizationLoanFixture);
    amortizationFacet = fixture.amortizationFacet;
    accessControlFacet = fixture.accessControlFacet;
    pauseFacet = fixture.pauseFacet;
    erc1410Facet = fixture.erc1410Facet;
    scheduledCrossOrderedTasksFacet = fixture.scheduledCrossOrderedTasksFacet;
    timeTravelFacet = fixture.timeTravelFacet;
    deployer = fixture.deployer;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
  });

  describe("setAmortization", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
    });

    it("GIVEN account without CORPORATE_ACTION_ROLE WHEN setAmortization THEN reverts with AccountHasNoRole", async () => {
      const data = await makeAmortizationData();
      await expect(amortizationFacet.connect(user3).setAmortization(data))
        .to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._CORPORATE_ACTION_ROLE);
    });

    it("GIVEN paused token WHEN setAmortization THEN reverts with TokenIsPaused", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);
      await pauseFacet.connect(user1).pause();

      const data = await makeAmortizationData();
      await expect(amortizationFacet.connect(user2).setAmortization(data)).to.be.revertedWithCustomError(
        amortizationFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN recordDate >= executionDate WHEN setAmortization THEN reverts with WrongDates", async () => {
      const now = await getDltTimestamp();
      const wrongData = {
        recordDate: now + EXECUTION_DATE_OFFSET,
        executionDate: now + RECORD_DATE_OFFSET,
        tokensToRedeem: TOKENS_TO_REDEEM,
      };

      await expect(amortizationFacet.connect(user2).setAmortization(wrongData))
        .to.be.revertedWithCustomError(amortizationFacet, "WrongDates")
        .withArgs(wrongData.recordDate, wrongData.executionDate);
    });

    it("GIVEN past recordDate WHEN setAmortization THEN reverts with WrongTimestamp", async () => {
      const now = await getDltTimestamp();
      const wrongData = {
        recordDate: now - 1,
        executionDate: now + EXECUTION_DATE_OFFSET,
        tokensToRedeem: TOKENS_TO_REDEEM,
      };

      await expect(amortizationFacet.connect(user2).setAmortization(wrongData))
        .to.be.revertedWithCustomError(amortizationFacet, "WrongTimestamp")
        .withArgs(wrongData.recordDate);
    });

    it("GIVEN identical amortization data submitted twice WHEN second setAmortization THEN reverts with AmortizationCreationFailed", async () => {
      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data); // first — succeeds
      await expect(amortizationFacet.connect(user2).setAmortization(data)) // second — fails
        .to.be.revertedWithCustomError(amortizationFacet, "AmortizationCreationFailed");
    });

    it("GIVEN valid data WHEN setAmortization THEN emits AmortizationSet and all getters reflect correct pre-snapshot state", async () => {
      const data = await makeAmortizationData();

      await expect(amortizationFacet.connect(user2).setAmortization(data))
        .to.emit(amortizationFacet, "AmortizationSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          user2.address,
          data.recordDate,
          data.executionDate,
        );

      expect(await amortizationFacet.getAmortizationsCount()).to.equal(1n);

      const [registered, isDisabled] = await amortizationFacet.getAmortization(1);
      expect(registered.amortization.recordDate).to.equal(data.recordDate);
      expect(registered.amortization.executionDate).to.equal(data.executionDate);
      expect(registered.amortization.tokensToRedeem).to.equal(TOKENS_TO_REDEEM);
      expect(registered.snapshotId).to.equal(0n);
      expect(isDisabled).to.equal(false);

      const amortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
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

      expect(await amortizationFacet.getTotalAmortizationHolders(1)).to.equal(0n);
      expect(await amortizationFacet.getAmortizationHolders(1, 0, 100)).to.have.length(0);
    });
  });

  describe("cancelAmortization", () => {
    let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;

    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      amortizationData = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(amortizationData);
    });

    it("GIVEN account without CORPORATE_ACTION_ROLE WHEN cancelAmortization THEN reverts with AccountHasNoRole", async () => {
      await expect(amortizationFacet.connect(user3).cancelAmortization(1))
        .to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._CORPORATE_ACTION_ROLE);
    });

    it("GIVEN paused token WHEN cancelAmortization THEN reverts with TokenIsPaused", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);

      await pauseFacet.connect(user1).pause();

      await expect(amortizationFacet.connect(user2).cancelAmortization(1)).to.be.revertedWithCustomError(
        amortizationFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN non-existent amortization ID WHEN cancelAmortization THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.connect(user2).cancelAmortization(999)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN past execution date WHEN cancelAmortization THEN reverts with AmortizationAlreadyExecuted", async () => {
      await timeTravelFacet.changeSystemTimestamp(amortizationData.executionDate + 1);

      await expect(amortizationFacet.connect(user2).cancelAmortization(1))
        .to.be.revertedWithCustomError(amortizationFacet, "AmortizationAlreadyExecuted")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
    });

    it("GIVEN valid amortization WHEN cancelAmortization THEN emits AmortizationCancelled and getAmortization shows isDisabled=true", async () => {
      await expect(amortizationFacet.connect(user2).cancelAmortization(1))
        .to.emit(amortizationFacet, "AmortizationCancelled")
        .withArgs(1n, user2.address);

      const [, isDisabled] = await amortizationFacet.getAmortization(1);
      expect(isDisabled).to.equal(true);
    });

    it("GIVEN amortization with one active hold WHEN cancelAmortization THEN reverts with AmortizationHasActiveHolds", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await expect(amortizationFacet.connect(user2).cancelAmortization(1))
        .to.be.revertedWithCustomError(amortizationFacet, "AmortizationHasActiveHolds")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n);
    });

    it("GIVEN amortization with hold released WHEN cancelAmortization THEN emits AmortizationCancelled", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address);

      await expect(amortizationFacet.connect(user2).cancelAmortization(1))
        .to.emit(amortizationFacet, "AmortizationCancelled")
        .withArgs(1n, user2.address);
    });
  });

  describe("getAmortizationsCount", () => {
    it("GIVEN no amortizations WHEN getAmortizationsCount THEN returns 0", async () => {
      const count = await amortizationFacet.getAmortizationsCount();
      expect(count).to.equal(0n);
    });

    it("GIVEN 2 amortizations with one cancelled WHEN getAmortizationsCount THEN returns 2", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);

      const data1 = await makeAmortizationData(400, 1200);
      await amortizationFacet.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await amortizationFacet.connect(user2).setAmortization(data2);

      await amortizationFacet.connect(user2).cancelAmortization(1);

      const count = await amortizationFacet.getAmortizationsCount();
      expect(count).to.equal(2n);
    });
  });

  describe("getAmortization", () => {
    it("GIVEN invalid amortization ID WHEN getAmortization THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getAmortization(999)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("getAmortizationFor", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationFor THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getAmortizationFor(999, deployer.address)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("getAmortizationsFor", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationsFor THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getAmortizationsFor(999, 0, 10)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("getAmortizationHolders", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getAmortizationHolders(999, 0, 10)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("getTotalAmortizationHolders", () => {
    it("GIVEN invalid amortization ID WHEN getTotalAmortizationHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getTotalAmortizationHolders(999)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("getAmortizationPaymentAmount", () => {
    it("GIVEN invalid amortization ID WHEN getAmortizationPaymentAmount THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getAmortizationPaymentAmount(999, deployer.address)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN no hold created for holder WHEN getAmortizationPaymentAmount THEN returns (tokenAmount=0, decimals=0)", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);

      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data);

      const [tokenAmount, decimals] = await amortizationFacet.getAmortizationPaymentAmount(1, deployer.address);

      expect(tokenAmount).to.equal(0n);
      expect(decimals).to.equal(0);
    });

    it("GIVEN active hold for holder WHEN getAmortizationPaymentAmount THEN returns (holdAmount, decimals)", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      const [tokenAmount, decimals] = await amortizationFacet.getAmortizationPaymentAmount(1, deployer.address);

      expect(tokenAmount).to.equal(BigInt(TOKENS_TO_REDEEM));
      expect(decimals).to.equal(0);
    });
  });

  describe("Post-recordDate — with snapshot", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN 2 holders and snapshot triggered WHEN querying THEN getTotalAmortizationHolders=2, getAmortizationHolders contains both addresses, getAmortizationFor for each holder has correct tokenBalance", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      expect(await amortizationFacet.getTotalAmortizationHolders(1)).to.equal(2n);

      const holders = await amortizationFacet.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);

      const amForDeployer = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(amForDeployer.tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
      expect(amForDeployer.decimalsBalance).to.equal(0);
      expect(amForDeployer.recordDateReached).to.equal(true);
      expect(amForDeployer.abafAtSnapshot).to.equal(1n);
      expect(amForDeployer.nominalValueDecimals).to.equal(2);
      expect(amForDeployer.holdId).to.equal(0n);

      const amForUser1 = await amortizationFacet.getAmortizationFor(1, user1.address);
      expect(amForUser1.tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
      expect(amForUser1.decimalsBalance).to.equal(0);
      expect(amForUser1.recordDateReached).to.equal(true);
      expect(amForUser1.abafAtSnapshot).to.equal(1n);
      expect(amForUser1.nominalValueDecimals).to.equal(2);
      expect(amForUser1.holdId).to.equal(0n);
    });

    it("GIVEN cancelled amortization and snapshot triggered WHEN getAmortizationFor THEN no snapshot triggered", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      // Cancel before recordDate
      await amortizationFacet.connect(user2).cancelAmortization(1);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const [registered, isDisabled] = await amortizationFacet.getAmortization(1);
      expect(isDisabled).to.equal(true);
      expect(registered.snapshotId).to.equal(0n);
    });

    it("GIVEN cancelled amortization (isDisabled=true, snapshotId=0) WHEN querying holders past recordDate THEN returns empty (cancelled before snapshot)", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).cancelAmortization(1);

      // Advance past recordDate without triggering snapshot
      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);

      const [registered, isDisabled] = await amortizationFacet.getAmortization(1);
      expect(isDisabled).to.equal(true);
      expect(registered.snapshotId).to.equal(0n);

      expect(await amortizationFacet.getTotalAmortizationHolders(1)).to.equal(0n);

      const holders = await amortizationFacet.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(0);
    });

    it("GIVEN cancelled amortization (isDisabled=true, snapshotId!=0) WHEN querying holders THEN snapshot holders are still returned", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      // Cancel after snapshot is already taken
      await amortizationFacet.connect(user2).cancelAmortization(1);

      const [registered, isDisabled] = await amortizationFacet.getAmortization(1);
      expect(isDisabled).to.equal(true);
      expect(registered.snapshotId).to.not.equal(0n);

      // Cancelled after snapshot: holders from snapshot are preserved
      expect(await amortizationFacet.getTotalAmortizationHolders(1)).to.equal(2n);

      const holders = await amortizationFacet.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);
    });
  });

  describe("Post-recordDate — without snapshot (snapshotId == 0)", () => {
    it("GIVEN recordDate passed but no snapshot triggered WHEN getAmortizationFor, getAmortizationHolders and getTotalAmortizationHolders THEN uses live balances and holders", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      // Advance past recordDate WITHOUT triggering snapshot
      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);

      // getAmortizationFor uses live balance (_getTotalBalanceForAdjustedAt)
      const amortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.tokenBalance).to.equal(BigInt(TOTAL_UNITS)); // live balance
      expect(amortizationFor.holdId).to.equal(0n);
      expect(amortizationFor.recordDateReached).to.equal(true);
      expect(amortizationFor.abafAtSnapshot).to.equal(1n); // snapshotId==0 → _abafAtSnapshot(0) returns _getAbafAdjustedAt(now) = 1

      // getAmortizationHolders uses live holders (_getTokenHolders)
      const holders = await amortizationFacet.getAmortizationHolders(1, 0, 10);
      expect(holders.length).to.equal(2);
      expect([...holders]).to.have.members([deployer.address, user1.address]);

      // getTotalAmortizationHolders uses live count
      expect(await amortizationFacet.getTotalAmortizationHolders(1)).to.equal(2n);
    });
  });

  describe("setAmortizationHold", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN valid amortizationID and tokenHolder with balance WHEN setAmortizationHold THEN creates hold, emits AmortizationHoldSet", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const holdAmount = BigInt(TOKENS_TO_REDEEM);

      await expect(amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, holdAmount))
        .to.emit(amortizationFacet, "AmortizationHoldSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          deployer.address,
          1n,
          holdAmount,
        );

      const amortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.holdId).to.be.equal(1);
      expect(amortizationFor.holdActive).to.equal(true);
      // hold fields — adjusted at current block (no adjustBalance → decimals=0, abaf=1)
      expect(amortizationFor.tokenHeldAmount).to.equal(holdAmount);
      expect(amortizationFor.decimalsHeld).to.equal(0);
      expect(amortizationFor.abafAtHold).to.equal(1n);
      // snapshot fields — snapshotId != 0
      expect(amortizationFor.decimalsBalance).to.equal(0);
      expect(amortizationFor.recordDateReached).to.equal(true);
      expect(amortizationFor.abafAtSnapshot).to.equal(1n); // snapshotId != 0, no adjustBalance → _abafAtSnapshot fallback = 1
    });

    it("GIVEN tokenHolder already has pending hold WHEN setAmortizationHold called again THEN releases old hold and creates new hold", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      // First hold
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      const firstAmortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
      const firstHoldId = firstAmortizationFor.holdId;
      expect(firstHoldId).to.be.equal(1);

      // Second hold — should release the first and create a new one
      const newAmount = BigInt(TOKENS_TO_REDEEM) / 2n;
      await expect(amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, newAmount))
        .to.emit(amortizationFacet, "AmortizationHoldSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1n,
          deployer.address,
          2n,
          newAmount,
        );

      const secondAmortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(secondAmortizationFor.holdId).to.equal(2n);
      expect(secondAmortizationFor.holdId).to.not.equal(firstHoldId);
      expect(secondAmortizationFor.holdActive).to.equal(true);
      expect(secondAmortizationFor.tokenHeldAmount).to.equal(newAmount);
      expect(secondAmortizationFor.decimalsHeld).to.equal(0);
      expect(secondAmortizationFor.abafAtHold).to.equal(1n);
    });

    it("GIVEN invalid amortizationID WHEN setAmortizationHold THEN reverts with WrongIndexForAction", async () => {
      await expect(
        amortizationFacet.connect(user2).setAmortizationHold(999, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(amortizationFacet, "WrongIndexForAction");
    });

    it("GIVEN caller without AMORTIZATION_ROLE WHEN setAmortizationHold THEN reverts with AccountHasNoRole", async () => {
      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data);

      await expect(amortizationFacet.connect(user3).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)))
        .to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._AMORTIZATION_ROLE);
    });

    it("GIVEN paused token WHEN setAmortizationHold THEN reverts with TokenIsPaused", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);

      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await pauseFacet.connect(user1).pause();

      await expect(
        amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(amortizationFacet, "TokenIsPaused");
    });

    it("GIVEN tokenAmount exceeds holder balance WHEN setAmortizationHold THEN reverts with AmortizationHoldFailed or hold error", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: 10,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const excessiveAmount = BigInt(TOTAL_UNITS * 10);
      await expect(
        amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, excessiveAmount),
      ).to.be.revertedWithCustomError(erc1410Facet, "InsufficientBalance");
    });
  });

  describe("releaseAmortizationHold", () => {
    let amortizationData: Awaited<ReturnType<typeof makeAmortizationData>>;
    const holdAmount = BigInt(TOKENS_TO_REDEEM);

    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);

      amortizationData = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(amortizationData);
      await timeTravelFacet.changeSystemTimestamp(amortizationData.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);
    });

    it("GIVEN account without AMORTIZATION_ROLE WHEN releaseAmortizationHold THEN reverts with AccountHasNoRole", async () => {
      await expect(amortizationFacet.connect(user3).releaseAmortizationHold(1, deployer.address))
        .to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole")
        .withArgs(user3.address, ATS_ROLES._AMORTIZATION_ROLE);
    });

    it("GIVEN paused token WHEN releaseAmortizationHold THEN reverts with TokenIsPaused", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, user1.address);
      await pauseFacet.connect(user1).pause();

      await expect(
        amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address),
      ).to.be.revertedWithCustomError(amortizationFacet, "TokenIsPaused");
    });

    it("GIVEN invalid amortization ID WHEN releaseAmortizationHold THEN reverts with WrongIndexForAction", async () => {
      await expect(
        amortizationFacet.connect(user2).releaseAmortizationHold(999, deployer.address),
      ).to.be.revertedWithCustomError(amortizationFacet, "WrongIndexForAction");
    });

    it("GIVEN holder with no active hold WHEN releaseAmortizationHold THEN reverts with AmortizationHoldNotActive", async () => {
      await expect(amortizationFacet.connect(user2).releaseAmortizationHold(1, user3.address))
        .to.be.revertedWithCustomError(amortizationFacet, "AmortizationHoldNotActive")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, user3.address);
    });

    it("GIVEN already released hold WHEN releaseAmortizationHold called again THEN reverts with AmortizationHoldNotActive", async () => {
      await amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address);

      await expect(amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address))
        .to.be.revertedWithCustomError(amortizationFacet, "AmortizationHoldNotActive")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address);
    });

    it("GIVEN active hold WHEN releaseAmortizationHold THEN emits AmortizationHoldReleased and holdActive becomes false", async () => {
      await expect(amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address))
        .to.emit(amortizationFacet, "AmortizationHoldReleased")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1n, deployer.address, 1n);

      const amortizationFor = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(amortizationFor.holdActive).to.equal(false);
      expect(amortizationFor.tokenHeldAmount).to.equal(0n);
    });
  });

  describe("Post-adjustBalance — hold + snapshot + balance adjustment", () => {
    it("GIVEN hold created after snapshot WHEN adjustBalances(2, 0) called THEN tokenHeldAmount doubles, abafAtHold updates, abafAtSnapshot preserved", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, user2.address);

      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      // Advance past recordDate and trigger snapshot — abaf=1 at this point
      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      // Set hold of 500 tokens — holdLabaf=1 (current abaf when hold is created)
      const holdAmount = BigInt(TOKENS_TO_REDEEM);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, holdAmount);

      // Verify pre-adjustment values
      const beforeAdjust = await amortizationFacet.getAmortizationFor(1, deployer.address);
      expect(beforeAdjust.tokenHeldAmount).to.equal(holdAmount); // 500 * (abaf=1 / holdLabaf=1) = 500
      expect(beforeAdjust.abafAtHold).to.equal(1n);
      expect(beforeAdjust.abafAtSnapshot).to.equal(1n);

      // Apply 2x balance adjustment — _updateAbafSnapshot stores old abaf=1 before multiplying
      const adjustBalancesFacet = await ethers.getContractAt("IAdjustBalances", amortizationFacet.target, user2);
      await adjustBalancesFacet.adjustBalances(2, 0);

      // Verify post-adjustment values
      const afterAdjust = await amortizationFacet.getAmortizationFor(1, deployer.address);
      // hold amount adjusted: raw 500 * (abaf=2 / holdLabaf=1) = 1000
      expect(afterAdjust.tokenHeldAmount).to.equal(holdAmount * 2n);
      expect(afterAdjust.decimalsHeld).to.equal(0);
      // abafAtHold reflects current abaf
      expect(afterAdjust.abafAtHold).to.equal(2n);
      // abafAtSnapshot preserved — snapshotId != 0 → _abafAtSnapshot returns 1 (abaf stored at snapshot time, before adjustment)
      expect(afterAdjust.abafAtSnapshot).to.equal(1n);
      // snapshot fields unaffected by post-snapshot adjustment
      expect(afterAdjust.tokenBalance).to.equal(BigInt(TOTAL_UNITS));
      expect(afterAdjust.recordDateReached).to.equal(true);
    });
  });

  // BUG: _tokenHoldersAt ignores pageIndex offset in snapshot mode — `index = i + 1` instead of
  // `index = start + i + 1`. Fix location: SnapshotsStorageWrapper2.sol line ~232.
  // When fixed, delete the BUG test below and uncomment the CORRECT assertions in each test.
  describe("Pagination", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN 2 holders and snapshot WHEN getAmortizationsFor with pageLength=1 THEN returns 1 entry per page call", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const expectedAddresses = [deployer.address, user1.address];

      // pageLength=1, pageIndex=0 → 1 result with a valid holder and correct balance
      const page0 = await amortizationFacet.getAmortizationsFor(1, 0, 1);
      expect(page0.length).to.equal(1);
      expect(expectedAddresses).to.include(page0[0].account);
      expect(page0[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));
      expect(page0[0].holdId).to.equal(0n);

      // pageLength=1, pageIndex=1 → the other holder
      const page1 = await amortizationFacet.getAmortizationsFor(1, 1, 1);
      expect(page1.length).to.equal(1);
      expect(expectedAddresses).to.include(page1[0].account);
      // todo uncomment when bug is fixed
      // expect(page1[0].account).to.not.equal(page0[0].account);
      // expect(page1[0].tokenBalance).to.equal(BigInt(TOTAL_UNITS / 2));

      // pageLength=2, pageIndex=0 → both holders
      const allEntries = await amortizationFacet.getAmortizationsFor(1, 0, 2);
      expect(allEntries.length).to.equal(2);
      expect(allEntries.map((e) => e.account)).to.have.members(expectedAddresses);
    });

    it("GIVEN 2 holders and snapshot WHEN getAmortizationHolders with pageIndex=0 and pageIndex=1 THEN returns 1 holder per page", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const page0 = await amortizationFacet.getAmortizationHolders(1, 0, 1);
      expect(page0.length).to.equal(1);
      expect(page0[0]).to.equal(deployer.address);

      const page1 = await amortizationFacet.getAmortizationHolders(1, 1, 1);
      expect(page1.length).to.equal(1);
      // todo uncomment when bug is fixed
      // expect(page1[0]).to.equal(user1.address);
      // expect(page1[0]).to.not.equal(page0[0]);
      // expect([...page0, ...page1]).to.have.members([deployer.address, user1.address]);

      // Full page — unaffected by the bug
      const allHolders = await amortizationFacet.getAmortizationHolders(1, 0, 10);
      expect(allHolders.length).to.equal(2);
      expect([...allHolders]).to.have.members([deployer.address, user1.address]);
    });

    // todo: remove when _tokenHoldersAt is fixed
    it("BUG _tokenHoldersAt: GIVEN 2 holders and snapshot WHEN getAmortizationHolders(pageIndex=1, pageLength=1) THEN returns first holder instead of second due to missing start offset in loop", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS / 2,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);

      await timeTravelFacet.changeSystemTimestamp(data.recordDate + 1);
      await scheduledCrossOrderedTasksFacet.triggerPendingScheduledCrossOrderedTasks();

      const page0 = await amortizationFacet.getAmortizationHolders(1, 0, 1);
      const page1 = await amortizationFacet.getAmortizationHolders(1, 1, 1);

      // Delete this entire test once the bug is fixed and the CORRECT assertions above are uncommented.
      expect(page0[0]).to.equal(page1[0]);
    });
  });

  describe("getActiveAmortizationHoldHolders", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN invalid amortization ID WHEN getActiveAmortizationHoldHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getActiveAmortizationHoldHolders(999, 0, 10)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN amortization with no holds WHEN getActiveAmortizationHoldHolders THEN returns empty array", async () => {
      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data);

      expect(await amortizationFacet.getActiveAmortizationHoldHolders(1, 0, 10)).to.have.length(0);
    });

    it("GIVEN 1 active hold WHEN getActiveAmortizationHoldHolders THEN returns list with that holder", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      const holders = await amortizationFacet.getActiveAmortizationHoldHolders(1, 0, 10);
      expect(holders.length).to.equal(1);
      expect(holders[0]).to.equal(deployer.address);
    });

    it("GIVEN active hold released WHEN getActiveAmortizationHoldHolders THEN returns empty array", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address);

      expect(await amortizationFacet.getActiveAmortizationHoldHolders(1, 0, 10)).to.have.length(0);
    });

    it("GIVEN 2 active holds, 1 released WHEN getActiveAmortizationHoldHolders THEN returns only the unreleased holder", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address);

      const holders = await amortizationFacet.getActiveAmortizationHoldHolders(1, 0, 10);
      expect(holders.length).to.equal(1);
      expect(holders[0]).to.equal(user1.address);
    });

    it("GIVEN 2 active holds WHEN getActiveAmortizationHoldHolders with pageLength=1 THEN returns 1 holder per page and pages are disjoint", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

      const page0 = await amortizationFacet.getActiveAmortizationHoldHolders(1, 0, 1);
      const page1 = await amortizationFacet.getActiveAmortizationHoldHolders(1, 1, 1);

      expect(page0.length).to.equal(1);
      expect(page1.length).to.equal(1);
      expect(page0[0]).to.not.equal(page1[0]);
      expect([page0[0], page1[0]]).to.have.members([deployer.address, user1.address]);
    });

    it("GIVEN 1 active hold WHEN getActiveAmortizationHoldHolders with out-of-range pageIndex THEN returns empty array", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      const outOfRange = await amortizationFacet.getActiveAmortizationHoldHolders(1, 99, 10);
      expect(outOfRange).to.have.length(0);
    });
  });

  describe("getTotalActiveAmortizationHoldHolders", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, user2.address);
    });

    it("GIVEN invalid amortization ID WHEN getTotalActiveAmortizationHoldHolders THEN reverts with WrongIndexForAction", async () => {
      await expect(amortizationFacet.getTotalActiveAmortizationHoldHolders(999)).to.be.revertedWithCustomError(
        amortizationFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN amortization with no holds WHEN getTotalActiveAmortizationHoldHolders THEN returns 0", async () => {
      const data = await makeAmortizationData();
      await amortizationFacet.connect(user2).setAmortization(data);

      expect(await amortizationFacet.getTotalActiveAmortizationHoldHolders(1)).to.equal(0n);
    });

    it("GIVEN 1 active hold WHEN getTotalActiveAmortizationHoldHolders THEN returns 1", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));

      expect(await amortizationFacet.getTotalActiveAmortizationHoldHolders(1)).to.equal(1n);
    });

    it("GIVEN 2 active holds WHEN getTotalActiveAmortizationHoldHolders THEN returns 2", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));

      expect(await amortizationFacet.getTotalActiveAmortizationHoldHolders(1)).to.equal(2n);
    });

    it("GIVEN 2 active holds, 1 released WHEN getTotalActiveAmortizationHoldHolders THEN returns 1", async () => {
      const data = await makeAmortizationData();

      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: deployer.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });
      await erc1410Facet.connect(user2).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: user1.address,
        value: TOTAL_UNITS,
        data: EMPTY_HEX_BYTES,
      });

      await amortizationFacet.connect(user2).setAmortization(data);
      await amortizationFacet.connect(user2).setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).setAmortizationHold(1, user1.address, BigInt(TOKENS_TO_REDEEM));
      await amortizationFacet.connect(user2).releaseAmortizationHold(1, deployer.address);

      expect(await amortizationFacet.getTotalActiveAmortizationHoldHolders(1)).to.equal(1n);
    });
  });

  describe("getActiveAmortizationIds", () => {
    beforeEach(async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, user2.address);
    });

    it("GIVEN no amortizations WHEN getActiveAmortizationIds THEN returns empty array", async () => {
      const ids = await amortizationFacet.getActiveAmortizationIds();
      expect(ids).to.have.length(0);
    });

    it("GIVEN 2 amortizations with none cancelled WHEN getActiveAmortizationIds THEN returns both IDs", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await amortizationFacet.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await amortizationFacet.connect(user2).setAmortization(data2);

      const ids = await amortizationFacet.getActiveAmortizationIds();
      expect([...ids].map(Number)).to.have.members([1, 2]);
    });

    it("GIVEN 2 amortizations with one cancelled WHEN getActiveAmortizationIds THEN returns only the active one", async () => {
      const data1 = await makeAmortizationData(400, 1200);
      await amortizationFacet.connect(user2).setAmortization(data1);

      const data2 = await makeAmortizationData(500, 1300);
      await amortizationFacet.connect(user2).setAmortization(data2);

      await amortizationFacet.connect(user2).cancelAmortization(1);

      const ids = await amortizationFacet.getActiveAmortizationIds();
      expect([...ids].map(Number)).to.deep.equal([2]);
    });
  });

  describe("multiPartition — all amortization functions revert with NotAllowedInMultiPartitionMode", () => {
    let mpAmortizationFacet: AmortizationFacet;
    let mpAccessControlFacet: AccessControlFacet;

    async function deployMultiPartitionLoanFixture() {
      const base = await deployLoanTokenFixture({ isMultiPartition: true, internalKycActivated: false });
      const { tokenAddress, deployer } = base;

      const mpAmortizationFacet = await ethers.getContractAt("AmortizationFacet", tokenAddress, deployer);

      return { ...base, mpAmortizationFacet };
    }

    beforeEach(async () => {
      const fixture = await loadFixture(deployMultiPartitionLoanFixture);
      mpAmortizationFacet = fixture.mpAmortizationFacet;
      mpAccessControlFacet = fixture.accessControlFacet;

      await mpAccessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, deployer.address);
      await mpAccessControlFacet.grantRole(ATS_ROLES._AMORTIZATION_ROLE, deployer.address);
    });

    const amortizationData = {
      recordDate: Math.floor(Date.now() / 1000) + 400,
      executionDate: Math.floor(Date.now() / 1000) + 1200,
      tokensToRedeem: TOKENS_TO_REDEEM,
    };

    it("GIVEN multiPartition token WHEN setAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.setAmortization(amortizationData)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN cancelAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.cancelAmortization(1)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN setAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        mpAmortizationFacet.setAmortizationHold(1, deployer.address, BigInt(TOKENS_TO_REDEEM)),
      ).to.be.revertedWithCustomError(mpAmortizationFacet, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN multiPartition token WHEN releaseAmortizationHold THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.releaseAmortizationHold(1, deployer.address)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationsCount THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortizationsCount()).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortization THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortization(1)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortizationFor(1, deployer.address)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationsFor THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortizationsFor(1, 0, 10)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortizationHolders(1, 0, 10)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalAmortizationHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getTotalAmortizationHolders(1)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getAmortizationPaymentAmount THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getAmortizationPaymentAmount(1, deployer.address)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getActiveAmortizationHoldHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getActiveAmortizationHoldHolders(1, 0, 10)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getTotalActiveAmortizationHoldHolders THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getTotalActiveAmortizationHoldHolders(1)).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multiPartition token WHEN getActiveAmortizationIds THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(mpAmortizationFacet.getActiveAmortizationIds()).to.be.revertedWithCustomError(
        mpAmortizationFacet,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });
});
