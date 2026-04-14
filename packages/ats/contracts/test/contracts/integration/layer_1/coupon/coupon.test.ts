// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  CouponFacetTimeTravel,
  AccessControl,
  TimeTravelFacet,
  Pause,
  Lock,
  Kyc,
  SsiManagement,
  IHold,
  FreezeFacet,
  ClearingActionsFacet,
  ClearingTransferFacet,
  ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel,
  BondUSAFacet,
  BondUSAReadFacet,
  type IERC1410,
} from "@contract-types";
import {
  DEFAULT_PARTITION,
  ATS_ROLES,
  TIME_PERIODS_S,
  ADDRESS_ZERO,
  ZERO,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
} from "@scripts";
import { getDltTimestamp, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture, deployBondKpiLinkedRateTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";

const numberOfUnits = 1000;
let startingDate = 0;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = 0;

let couponRecordDateInSeconds = 0;
let couponExecutionDateInSeconds = 0;
const couponRate = 50;
const couponRateDecimals = 1;
const couponPeriod = TIME_PERIODS_S.WEEK;
let couponFixingDateInSeconds = 0;
let couponEndDateInSeconds = 0;
let couponStartDateInSeconds = 0;
const EMPTY_VC_ID = EMPTY_STRING;
const couponRateStatus = 1;

let couponData = {
  recordDate: couponRecordDateInSeconds.toString(),
  executionDate: couponExecutionDateInSeconds.toString(),
  rate: couponRate,
  rateDecimals: couponRateDecimals,
  startDate: couponStartDateInSeconds.toString(),
  endDate: couponEndDateInSeconds.toString(),
  fixingDate: couponFixingDateInSeconds.toString(),
  rateStatus: couponRateStatus,
};

describe("Coupon Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let couponFacet: CouponFacetTimeTravel;
  let bondFacet: BondUSAFacet;
  let bondReadFacet: BondUSAReadFacet;
  let accessControlFacet: AccessControl;
  let timeTravelFacet: TimeTravelFacet;
  let pauseFacet: Pause;
  let lockFacet: Lock;
  let holdFacet: IHold;
  let erc1410Facet: IERC1410;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let freezeFacet: FreezeFacet;
  let clearingActionsFacet: ClearingActionsFacet;
  let clearingTransferFacet: ClearingTransferFacet;

  async function deploySecurityFixture() {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition: false,
        },
        bondDetails: {
          startingDate: startingDate,
          maturityDate: maturityDate,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._FREEZE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._MATURITY_REDEEMER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._AGENT_ROLE,
        members: [signer_A.address],
      },
    ]);

    couponFacet = await ethers.getContractAt("CouponFacetTimeTravel", diamond.target, signer_A);
    bondFacet = await ethers.getContractAt("BondUSAFacetTimeTravel", diamond.target, signer_A);
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacetTimeTravel", diamond.target, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    lockFacet = await ethers.getContractAt("Lock", diamond.target, signer_A);
    holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target, signer_A);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);
    clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  before(async () => {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + numberOfCoupons * frequency;
  });

  beforeEach(async () => {
    const currentTimestamp = await getDltTimestamp();
    couponRecordDateInSeconds = currentTimestamp + 400;
    couponExecutionDateInSeconds = currentTimestamp + 1200;
    couponFixingDateInSeconds = currentTimestamp + 1200;
    couponEndDateInSeconds = couponFixingDateInSeconds - 1;
    couponStartDateInSeconds = couponEndDateInSeconds - couponPeriod;
    couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: 1,
    };
    await loadFixture(deploySecurityFixture);
  });

  it("GIVEN an account without corporateActions role WHEN setCoupon THEN transaction fails with AccountHasNoRole", async () => {
    await expect(couponFacet.connect(signer_C).setCoupon(couponData)).to.be.revertedWithCustomError(
      couponFacet,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN setCoupon THEN transaction fails with TokenIsPaused", async () => {
    await grantRoleAndPauseToken(
      accessControlFacet,
      pauseFacet,
      ATS_ROLES._CORPORATE_ACTION_ROLE,
      signer_A,
      signer_B,
      signer_C.address,
    );

    await expect(couponFacet.connect(signer_C).setCoupon(couponData)).to.be.revertedWithCustomError(
      couponFacet,
      "TokenIsPaused",
    );
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with wrong dates THEN transaction fails", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const wrongcouponData_1 = {
      recordDate: couponExecutionDateInSeconds.toString(),
      executionDate: couponRecordDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(wrongcouponData_1)).to.be.revertedWithCustomError(
      couponFacet,
      "WrongDates",
    );

    const wrongcouponData_2 = {
      recordDate: (await getDltTimestamp()) - 1,
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(wrongcouponData_2)).to.be.revertedWithCustomError(
      couponFacet,
      "WrongTimestamp",
    );
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with period THEN period is stored correctly", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    const customPeriod = 3 * 24 * 60 * 60;
    const customStartDate = couponEndDateInSeconds - customPeriod;
    const customCouponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: customStartDate.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(customCouponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        customStartDate,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);

    const [registeredCoupon] = await couponFacet.getCoupon(1);
    expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.coupon.startDate).to.equal(customStartDate);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    expect(couponFor.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(couponFor.coupon.startDate).to.equal(customStartDate);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with period 0 THEN transaction succeeds", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const minValidPeriodCouponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponEndDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(minValidPeriodCouponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponEndDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon THEN transaction succeeds", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    await expect(couponFacet.connect(signer_C).setCoupon(couponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);

    const listCount = await couponFacet.getCouponCount();
    const [registeredCoupon] = await couponFacet.getCoupon(1);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    const couponAmountFor = await couponFacet.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await couponFacet.getTotalCouponHolders(1);
    const couponHolders = await couponFacet.getCouponHolders(1, 0, couponTotalHolders);
    const couponsOrderedListTotal = await couponFacet.getCouponsOrderedListTotal();

    expect(listCount).to.equal(1);
    expect(registeredCoupon.snapshotId).to.equal(0);
    expect(registeredCoupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(registeredCoupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(registeredCoupon.coupon.rate).to.equal(couponRate);
    expect(registeredCoupon.coupon.rateDecimals).to.equal(couponRateDecimals);
    expect(registeredCoupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(registeredCoupon.coupon.rateStatus).to.equal(couponRateStatus);

    expect(couponFor.tokenBalance).to.equal(0);
    expect(couponFor.recordDateReached).to.equal(false);
    expect(couponFor.decimals).to.be.equal(0);

    expect(couponTotalHolders).to.equal(0);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponAmountFor.numerator).to.equal(0);
    expect(couponAmountFor.denominator).to.equal(0);

    expect(couponsOrderedListTotal).to.equal(0);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon and lock THEN transaction succeeds", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await ssiManagementFacet.addIssuer(signer_C.address);

    const TotalAmount = numberOfUnits;
    const LockedAmount = TotalAmount - 5;

    await erc1410Facet.connect(signer_C).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, MAX_UINT256);

    await expect(couponFacet.connect(signer_C).setCoupon(couponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await accessControlFacet.revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    const couponAmountFor = await couponFacet.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await couponFacet.getTotalCouponHolders(1);
    const couponHolders = await couponFacet.getCouponHolders(1, 0, couponTotalHolders);

    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponTotalHolders).to.equal(1);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect([...couponHolders]).to.have.members([signer_A.address]);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon and hold THEN transaction succeeds", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await ssiManagementFacet.addIssuer(signer_C.address);

    const TotalAmount = numberOfUnits;
    const HeldAmount = TotalAmount - 5;

    await erc1410Facet.connect(signer_C).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    const hold = {
      amount: HeldAmount,
      expirationTimestamp: MAX_UINT256,
      escrow: signer_B.address,
      to: ADDRESS_ZERO,
      data: "0x",
    };

    await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold);

    await expect(couponFacet.connect(signer_C).setCoupon(couponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await accessControlFacet.revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    const couponAmountFor = await couponFacet.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await couponFacet.getTotalCouponHolders(1);
    const couponHolders = await couponFacet.getCouponHolders(1, 0, couponTotalHolders);

    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponTotalHolders).to.equal(1);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect([...couponHolders]).to.have.members([signer_A.address]);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
  });

  it("Given a coupon and account with normal, cleared, held, locked and frozen balance WHEN  getCouponFor THEN sum of balances is correct", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await ssiManagementFacet.addIssuer(signer_C.address);

    const totalAmount = numberOfUnits;
    const lockedAmount = totalAmount / 5;
    const heldAmount = totalAmount / 5;
    const frozenAmount = totalAmount / 5;
    const clearedAmount = totalAmount / 5;

    await erc1410Facet.connect(signer_C).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: totalAmount,
      data: "0x",
    });

    const hold = {
      amount: heldAmount,
      expirationTimestamp: MAX_UINT256,
      escrow: signer_B.address,
      to: ADDRESS_ZERO,
      data: "0x",
    };

    await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold);
    await lockFacet.connect(signer_C).lock(lockedAmount, signer_A.address, MAX_UINT256);
    await freezeFacet.freezePartialTokens(signer_A.address, frozenAmount);
    await clearingActionsFacet.activateClearing();

    const clearingOperation = {
      partition: DEFAULT_PARTITION,
      expirationTimestamp: (await getDltTimestamp()) + 500,
      data: EMPTY_HEX_BYTES,
    };

    await clearingTransferFacet.clearingTransferByPartition(clearingOperation, clearedAmount, signer_D.address);

    await expect(couponFacet.connect(signer_C).setCoupon(couponData))
      .to.emit(couponFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        couponRate,
        couponRateDecimals,
        couponRateStatus,
      ]);

    const before = await couponFacet.getCouponFor(1, signer_A.address);
    const couponAmountForBefore = await couponFacet.getCouponAmountFor(1, signer_A.address);
    expect(before.recordDateReached).to.equal(false);
    expect(before.tokenBalance).to.equal(0);
    expect(couponAmountForBefore.recordDateReached).to.equal(before.recordDateReached);
    expect(couponAmountForBefore.numerator).to.equal(0);
    expect(couponAmountForBefore.denominator).to.equal(0);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await accessControlFacet.revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    const couponAmountForAfter = await couponFacet.getCouponAmountFor(1, signer_A.address);

    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponFor.tokenBalance).to.equal(totalAmount);
    expect(couponAmountForAfter.recordDateReached).to.equal(couponFor.recordDateReached);
  });

  it("GIVEN a coupon with snapshot WHEN getCouponHolders is called THEN returns token holders from snapshot", async () => {
    const TotalAmount = 1000;
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await erc1410Facet.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const localCouponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await couponFacet.connect(signer_A).setCoupon(localCouponData);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    await erc1410Facet.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_B.address,
      value: 500,
      data: "0x",
    });

    const [registeredCoupon] = await couponFacet.getCoupon(1);
    const couponTotalHolders = await couponFacet.getTotalCouponHolders(1);
    const couponHolders = await couponFacet.getCouponHolders(1, 0, couponTotalHolders);

    expect(registeredCoupon.snapshotId).to.be.greaterThan(0);
    expect(couponTotalHolders).to.equal(1);
    expect([...couponHolders]).to.have.members([signer_A.address]);
  });

  it("GIVEN a coupon without snapshot WHEN getCouponFor is called after record date THEN uses current balance", async () => {
    const TotalAmount = 1000;
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

    await erc1410Facet.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const localCouponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await couponFacet.connect(signer_A).setCoupon(localCouponData);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    const [registeredCoupon] = await couponFacet.getCoupon(1);

    expect(registeredCoupon.snapshotId).to.equal(0);
    expect(couponFor.recordDateReached).to.be.true;
    expect(couponFor.tokenBalance).to.equal(TotalAmount);
  });

  it("GIVEN a coupon WHEN getCoupon is called THEN decodes coupon data", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const localCouponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await couponFacet.connect(signer_A).setCoupon(localCouponData);

    const [registeredCoupon] = await couponFacet.getCoupon(1);

    expect(registeredCoupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(registeredCoupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(registeredCoupon.coupon.rate).to.equal(couponRate);
    expect(registeredCoupon.coupon.rateDecimals).to.equal(couponRateDecimals);
    expect(registeredCoupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(registeredCoupon.coupon.rateStatus).to.equal(couponRateStatus);
  });

  it("GIVEN a non-coupon corporate action WHEN call with invalid index view methods THEN transaction fails with WrongActionType", async () => {
    await expect(couponFacet.getCoupon(999)).to.be.reverted;
    await expect(couponFacet.getCouponFor(999, signer_A.address)).to.be.reverted;
    await expect(couponFacet.getCouponAmountFor(999, signer_A.address)).to.be.reverted;
    await expect(couponFacet.getTotalCouponHolders(999)).to.be.reverted;
    await expect(couponFacet.getCouponHolders(999, 0, 10)).to.be.reverted;
  });

  it("GIVEN invalid startDate > endDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
      couponFacet,
      "WrongDates",
    );
  });

  it("GIVEN invalid fixingDate > executionDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp,
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
      couponFacet,
      "WrongDates",
    );
  });

  it("GIVEN fixingDate in the past WHEN setCoupon THEN transaction fails with WrongTimestamp", async () => {
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp - TIME_PERIODS_S.DAY * 3,
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      fixingDate: currentTimestamp - TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };

    await expect(couponFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
      couponFacet,
      "WrongTimestamp",
    );
  });

  it("GIVEN multiple coupons WHEN triggerScheduledCrossOrderedTasks is called after fixingDate THEN coupons are added to ordered list", async () => {
    const kpiLinkedRateBase = await deployBondKpiLinkedRateTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition: false,
        },
        bondDetails: {
          startingDate: startingDate,
          maturityDate: maturityDate,
        },
      },
    });

    const kpiDiamond = kpiLinkedRateBase.diamond;
    const couponKpiFacet = await ethers.getContractAt("CouponFacetTimeTravel", kpiDiamond.target, signer_A);
    const accessControlKpi: AccessControl = await ethers.getContractAt("AccessControl", kpiDiamond.target, signer_A);
    const scheduledTasksKpi: ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel = await ethers.getContractAt(
      "ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel",
      kpiDiamond.target,
      signer_A,
    );
    const timeTravelKpi = await ethers.getContractAt("TimeTravelFacet", kpiDiamond.target, signer_A);

    await accessControlKpi.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

    const timestamp = await getDltTimestamp();

    const coupon1 = {
      recordDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
      executionDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
      rate: 0,
      rateDecimals: 0,
      startDate: timestamp.toString(),
      endDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
      fixingDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
      rateStatus: 0,
    };

    const coupon2 = {
      recordDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
      executionDate: (timestamp + TIME_PERIODS_S.DAY * 3).toString(),
      rate: 0,
      rateDecimals: 0,
      startDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
      endDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
      fixingDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
      rateStatus: 0,
    };

    await expect(couponKpiFacet.connect(signer_A).setCoupon(coupon1)).to.emit(couponKpiFacet, "CouponSet");

    await expect(couponKpiFacet.connect(signer_A).setCoupon(coupon2)).to.emit(couponKpiFacet, "CouponSet");

    let orderedList = await couponKpiFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(0);

    await timeTravelKpi.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);
    await scheduledTasksKpi.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    orderedList = await couponKpiFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(1);
    expect(orderedList[0]).to.equal(1);

    await timeTravelKpi.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY * 2 + 1);
    await scheduledTasksKpi.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    orderedList = await couponKpiFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(2);
    expect(orderedList[0]).to.equal(1);
    expect(orderedList[1]).to.equal(2);

    const couponIdAtPos0 = await couponKpiFacet.getCouponFromOrderedListAt(0);
    const couponIdAtPos1 = await couponKpiFacet.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos0).to.equal(1);
    expect(couponIdAtPos1).to.equal(2);

    const totalCouponsInOrderedList = await couponKpiFacet.getCouponsOrderedListTotal();
    expect(totalCouponsInOrderedList).to.equal(2);
  });

  it("GIVEN an account with bondManager role WHEN setMaturityDate THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
    const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate))
      .to.emit(bondFacet, "MaturityDateUpdated")
      .withArgs(bondFacet.target, newMaturityDate, maturityDateBefore);
    const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
    expect(maturityDateAfter).not.to.be.equal(maturityDateBefore);
    expect(maturityDateAfter).to.be.equal(newMaturityDate);
  });

  it("GIVEN an account with bondManager role WHEN setMaturityDate to earlier date THEN transaction fails", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
    const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
    const dayBeforeCurrentMaturity = maturityDateBefore - 86400n;

    await expect(
      bondFacet.connect(signer_C).updateMaturityDate(dayBeforeCurrentMaturity),
    ).to.be.revertedWithCustomError(bondFacet, "BondMaturityDateWrong");
    const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("GIVEN an account without bondManager role WHEN setMaturityDate THEN transaction fails with AccountHasNoRole", async () => {
    const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.revertedWithCustomError(
      accessControlFacet,
      "AccountHasNoRole",
    );
    const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("GIVEN a paused Token WHEN setMaturityDate THEN transaction fails with TokenIsPaused", async () => {
    await grantRoleAndPauseToken(
      accessControlFacet,
      pauseFacet,
      ATS_ROLES._BOND_MANAGER_ROLE,
      signer_A,
      signer_B,
      signer_C.address,
    );
    const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.revertedWithCustomError(
      pauseFacet,
      "TokenIsPaused",
    );
    const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("GIVEN an account with corporateActions role WHEN cancelling a coupon THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await couponFacet.connect(signer_C).setCoupon(couponData);

    await expect(couponFacet.connect(signer_C).cancelCoupon(1))
      .to.emit(couponFacet, "CouponCancelled")
      .withArgs(1, signer_C.address);
    const isDisabled = (await couponFacet.getCoupon(1)).isDisabled_;
    expect(isDisabled).to.equal(true);
    const couponFor = await couponFacet.getCouponFor(1, signer_A.address);
    expect(couponFor.isDisabled).to.equal(true);
  });

  it("GIVEN a coupon after execution date WHEN cancelCoupon THEN transaction fails with CorporateActionAlreadyExecuted", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await couponFacet.connect(signer_C).setCoupon(couponData);

    await timeTravelFacet.changeSystemTimestamp(couponExecutionDateInSeconds + 1);

    await expect(couponFacet.connect(signer_C).cancelCoupon(1)).to.be.revertedWithCustomError(
      couponFacet,
      "CouponAlreadyExecuted",
    );
  });

  it("GIVEN a coupon after record date but before execution date WHEN cancelCoupon THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await couponFacet.connect(signer_C).setCoupon(couponData);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    await expect(couponFacet.connect(signer_C).cancelCoupon(1))
      .to.emit(couponFacet, "CouponCancelled")
      .withArgs(1, signer_C.address);
  });

  it("GIVEN an account without corporateActions role WHEN cancelCoupon THEN transaction fails with AccountHasNoRole", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await couponFacet.connect(signer_C).setCoupon(couponData);

    await expect(couponFacet.connect(signer_D).cancelCoupon(1)).to.be.revertedWithCustomError(
      accessControlFacet,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN cancelCoupon THEN transaction fails with TokenIsPaused", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await couponFacet.connect(signer_C).setCoupon(couponData);

    await pauseFacet.connect(signer_B).pause();

    await expect(couponFacet.connect(signer_C).cancelCoupon(1)).to.be.revertedWithCustomError(
      pauseFacet,
      "TokenIsPaused",
    );
  });

  it("GIVEN no existing coupon WHEN cancelCoupon with invalid ID THEN transaction fails", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await expect(couponFacet.connect(signer_C).cancelCoupon(999)).to.be.reverted;
  });

  it("GIVEN empty ordered list WHEN getCouponFromOrderedListAt with _pos >= getCouponsOrderedListTotalAdjustedAt THEN returns 0", async () => {
    const couponIdAtPos0 = await couponFacet.getCouponFromOrderedListAt(0);
    expect(couponIdAtPos0).to.equal(0);

    const couponIdAtPos1 = await couponFacet.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos1).to.equal(0);

    const couponIdAtPos100 = await couponFacet.getCouponFromOrderedListAt(100);
    expect(couponIdAtPos100).to.equal(0);
  });
});
