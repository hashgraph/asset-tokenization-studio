// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, TimeTravelFacet as TimeTravel, type IAsset } from "@contract-types";
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
const YEAR_SECONDS = 365 * 24 * 60 * 60;
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

  let asset: IAsset;
  let timeTravelFacet: TimeTravel;

  async function deploySecurityFixture(isMultiPartition = false) {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition,
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

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
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

    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);

    await asset.connect(signer_A).addIssuer(signer_A.address);

    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
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
    await expect(asset.connect(signer_C).setCoupon(couponData)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN setCoupon THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, asset, ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

    await expect(asset.connect(signer_C).setCoupon(couponData)).to.be.rejectedWith("TokenIsPaused");
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with wrong dates THEN transaction fails", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
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

    await expect(asset.connect(signer_C).setCoupon(wrongcouponData_1)).to.be.revertedWithCustomError(
      asset,
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

    await expect(asset.connect(signer_C).setCoupon(wrongcouponData_2)).to.be.revertedWithCustomError(
      asset,
      "WrongTimestamp",
    );
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with period THEN period is stored correctly", async () => {
    await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    const customPeriod = 3 * 24 * 60 * 60; // 3 days in seconds
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

    await expect(asset.connect(signer_C).setCoupon(customCouponData))
      .to.emit(asset, "CouponSet")
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

    const registeredCoupon = await asset.getCoupon(1);
    expect(registeredCoupon.registeredCoupon_.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.registeredCoupon_.coupon.startDate).to.equal(customStartDate);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    expect(couponFor.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(couponFor.coupon.startDate).to.equal(customStartDate);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with period 0 THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
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

    await expect(asset.connect(signer_C).setCoupon(minValidPeriodCouponData))
      .to.emit(asset, "CouponSet")
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
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    await expect(asset.connect(signer_C).setCoupon(couponData))
      .to.emit(asset, "CouponSet")
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

    const listCount = await asset.getCouponCount();
    const [coupon, isDisabled] = await asset.getCoupon(1);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await asset.getTotalCouponHolders(1);
    const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);

    const [couponsFor, accounts] = await asset.getCouponsFor(1, 0, 10);

    const couponsOrderedListTotal = await asset.getCouponsOrderedListTotal();

    expect(listCount).to.equal(1);
    expect(isDisabled).to.be.false;
    expect(coupon.snapshotId).to.equal(0);
    expect(coupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(coupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(coupon.coupon.rate).to.equal(couponRate);
    expect(coupon.coupon.rateDecimals).to.equal(couponRateDecimals);
    expect(coupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(coupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(coupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(coupon.coupon.rateStatus).to.equal(couponRateStatus);

    expect(couponFor.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(couponFor.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(couponFor.coupon.rate).to.equal(couponRate);
    expect(couponFor.coupon.rateDecimals).to.equal(couponRateDecimals);
    expect(couponFor.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(couponFor.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(couponFor.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(couponFor.coupon.rateStatus).to.equal(couponRateStatus);
    expect(couponFor.tokenBalance).to.equal(0);
    expect(couponFor.recordDateReached).to.equal(false);
    expect(couponFor.isDisabled).to.equal(false);
    expect(couponFor.nominalValue).to.be.equal(0);
    expect(couponFor.decimals).to.be.equal(0);

    expect(couponFor.couponAmount.recordDateReached).to.equal(false);
    expect(couponFor.couponAmount.numerator).to.equal(0);
    expect(couponFor.couponAmount.denominator).to.equal(0);

    expect(couponTotalHolders).to.equal(0);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponAmountFor.numerator).to.equal(0);
    expect(couponAmountFor.denominator).to.equal(0);

    expect(couponsFor.length).to.equal(0); // No holders yet, so no entries
    expect(accounts.length).to.equal(0);

    expect(couponsOrderedListTotal).to.equal(0);
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon and lock THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    // issue and lock
    const TotalAmount = numberOfUnits;
    const LockedAmount = TotalAmount - 5;

    await asset.connect(signer_C).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    await asset.connect(signer_C).lock(LockedAmount, signer_A.address, MAX_UINT256);

    await expect(asset.connect(signer_C).setCoupon(couponData))
      .to.emit(asset, "CouponSet")
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
    await asset.connect(signer_A).revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await asset.getTotalCouponHolders(1);
    const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);
    const nominalValue = await asset.getNominalValue();
    const nominalValueDecimals = await asset.getNominalValueDecimals();
    const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

    const [couponsForList, accountsList] = await asset.getCouponsFor(1, 0, 10);
    expect(couponsForList.length).to.equal(1);
    expect(accountsList.length).to.equal(1);
    expect(accountsList[0]).to.equal(signer_A.address);

    const couponForFromList = couponsForList[0];
    expect(couponForFromList.tokenBalance).to.equal(TotalAmount);
    expect(couponForFromList.recordDateReached).to.equal(true);
    expect(couponForFromList.isDisabled).to.equal(false);
    expect(couponForFromList.nominalValue).to.be.greaterThan(0);
    expect(couponForFromList.decimals).to.be.greaterThan(0);

    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponTotalHolders).to.equal(1);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect([...couponHolders]).to.have.members([signer_A.address]);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponAmountFor.numerator).to.equal(couponFor.tokenBalance * nominalValue * couponFor.coupon.rate * period);
    expect(couponAmountFor.denominator).to.equal(
      10n ** (couponFor.decimals + nominalValueDecimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon and hold THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const TotalAmount = numberOfUnits;
    const HeldAmount = TotalAmount - 5;

    await asset.connect(signer_C).issueByPartition({
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

    await asset.createHoldByPartition(DEFAULT_PARTITION, hold);

    await expect(asset.connect(signer_C).setCoupon(couponData))
      .to.emit(asset, "CouponSet")
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
    await asset.connect(signer_A).revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await asset.getTotalCouponHolders(1);
    const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);
    const nominalValue = await asset.getNominalValue();
    const nominalValueDecimals = await asset.getNominalValueDecimals();
    const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

    const [couponsForList, accountsList] = await asset.getCouponsFor(1, 0, 10);
    expect(couponsForList.length).to.equal(1);
    expect(accountsList.length).to.equal(1);
    expect(accountsList[0]).to.equal(signer_A.address);

    const couponForFromList = couponsForList[0];
    expect(couponForFromList.tokenBalance).to.equal(TotalAmount);
    expect(couponForFromList.recordDateReached).to.equal(true);
    expect(couponForFromList.isDisabled).to.equal(false);
    expect(couponForFromList.nominalValue).to.be.greaterThan(0);
    expect(couponForFromList.decimals).to.be.greaterThan(0);

    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponTotalHolders).to.equal(1);
    expect(couponHolders.length).to.equal(couponTotalHolders);
    expect([...couponHolders]).to.have.members([signer_A.address]);
    expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponAmountFor.numerator).to.equal(couponFor.tokenBalance * nominalValue * couponFor.coupon.rate * period);
    expect(couponAmountFor.denominator).to.equal(
      10n ** (couponFor.decimals + nominalValueDecimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN an account with bondManager role WHEN setMaturityDate THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
    const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate))
      .to.emit(asset, "MaturityDateUpdated")
      .withArgs(asset.target, newMaturityDate, maturityDateBefore);
    const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
    expect(maturityDateAfter).not.to.be.equal(maturityDateBefore);
    expect(maturityDateAfter).to.be.equal(newMaturityDate);
  });

  it("GIVEN an account with bondManager role WHEN setMaturityDate to earlier date THEN transaction fails", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
    const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
    const dayBeforeCurrentMaturity = maturityDateBefore - 86400n;

    await expect(asset.connect(signer_C).updateMaturityDate(dayBeforeCurrentMaturity)).to.be.revertedWithCustomError(
      asset,
      "BondMaturityDateWrong",
    );
    const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("GIVEN an account without bondManager role WHEN setMaturityDate THEN transaction fails with AccountHasNoRole", async () => {
    const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.rejectedWith("AccountHasNoRole");
    const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("GIVEN a paused Token WHEN setMaturityDate THEN transaction fails with TokenIsPaused", async () => {
    await grantRoleAndPauseToken(asset, asset, ATS_ROLES._BOND_MANAGER_ROLE, signer_A, signer_B, signer_C.address);

    const maturityDateBefore = (await asset.getBondDetails()).maturityDate;
    const newMaturityDate = maturityDateBefore + 86400n;

    await expect(asset.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.rejectedWith("TokenIsPaused");
    const maturityDateAfter = (await asset.getBondDetails()).maturityDate;
    expect(maturityDateAfter).to.be.equal(maturityDateBefore);
  });

  it("Given a coupon and account with normal, cleared, held, locked and frozen balance WHEN  getCouponFor THEN sum of balances is correct", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const totalAmount = numberOfUnits;
    const lockedAmount = totalAmount / 5;
    const heldAmount = totalAmount / 5;
    const frozenAmount = totalAmount / 5;
    const clearedAmount = totalAmount / 5;

    await asset.connect(signer_C).issueByPartition({
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

    await asset.createHoldByPartition(DEFAULT_PARTITION, hold);
    await asset.connect(signer_C).lock(lockedAmount, signer_A.address, MAX_UINT256);
    await asset.freezePartialTokens(signer_A.address, frozenAmount);
    await asset.activateClearing();

    const clearingOperation = {
      partition: DEFAULT_PARTITION,
      expirationTimestamp: (await getDltTimestamp()) + 500,
      data: EMPTY_HEX_BYTES,
    };

    await asset.clearingTransferByPartition(clearingOperation, clearedAmount, signer_D.address);

    await expect(asset.connect(signer_C).setCoupon(couponData))
      .to.emit(asset, "CouponSet")
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

    const before = await asset.getCouponFor(1, signer_A.address);
    const couponAmountForBefore = await asset.getCouponAmountFor(1, signer_A.address);
    expect(before.recordDateReached).to.equal(false);
    expect(before.tokenBalance).to.equal(0);
    expect(couponAmountForBefore.recordDateReached).to.equal(before.recordDateReached);
    expect(couponAmountForBefore.numerator).to.equal(0);
    expect(couponAmountForBefore.denominator).to.equal(0);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await asset.revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountForAfter = await asset.getCouponAmountFor(1, signer_A.address);
    const bondDetails = await asset.getBondDetails();
    const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

    const [couponsForList, accountsList] = await asset.getCouponsFor(1, 0, 10);
    expect(couponsForList.length).to.equal(1);
    expect(accountsList.length).to.equal(1);
    expect(accountsList[0]).to.equal(signer_A.address);

    const couponForFromList = couponsForList[0];
    expect(couponForFromList.tokenBalance).to.equal(couponFor.tokenBalance);
    expect(couponForFromList.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponForFromList.isDisabled).to.equal(couponFor.isDisabled);
    expect(couponForFromList.nominalValue).to.equal(couponFor.nominalValue);
    expect(couponForFromList.decimals).to.equal(couponFor.decimals);
    expect(couponForFromList.coupon.recordDate).to.equal(couponFor.coupon.recordDate);
    expect(couponForFromList.coupon.executionDate).to.equal(couponFor.coupon.executionDate);
    expect(couponForFromList.coupon.rate).to.equal(couponFor.coupon.rate);
    expect(couponForFromList.coupon.rateDecimals).to.equal(couponFor.coupon.rateDecimals);
    expect(couponForFromList.coupon.startDate).to.equal(couponFor.coupon.startDate);
    expect(couponForFromList.coupon.endDate).to.equal(couponFor.coupon.endDate);
    expect(couponForFromList.coupon.fixingDate).to.equal(couponFor.coupon.fixingDate);
    expect(couponForFromList.coupon.rateStatus).to.equal(couponFor.coupon.rateStatus);
    expect(couponForFromList.couponAmount.numerator).to.equal(couponFor.couponAmount.numerator);
    expect(couponForFromList.couponAmount.denominator).to.equal(couponFor.couponAmount.denominator);
    expect(couponForFromList.couponAmount.recordDateReached).to.equal(couponFor.couponAmount.recordDateReached);

    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponFor.tokenBalance).to.equal(totalAmount); // normal+cleared+held+locked+frozen
    expect(couponAmountForAfter.recordDateReached).to.equal(couponFor.recordDateReached);
    expect(couponAmountForAfter.numerator).to.equal(
      couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period,
    );
    expect(couponAmountForAfter.denominator).to.equal(
      10n ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
        BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN an account with corporateActions role WHEN cancelling a coupon THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await expect(asset.connect(signer_C).cancelCoupon(1))
      .to.emit(asset, "CouponCancelled")
      .withArgs(1, signer_C.address);
    const isDisabled = (await asset.getCoupon(1)).isDisabled_;
    expect(isDisabled).to.equal(true);
    const couponFor = await asset.getCouponFor(1, signer_A.address);
    expect(couponFor.isDisabled).to.equal(true);
  });

  it("GIVEN a coupon after execution date WHEN cancelCoupon THEN transaction fails with CorporateActionAlreadyExecuted", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await timeTravelFacet.changeSystemTimestamp(couponExecutionDateInSeconds + 1);

    await expect(asset.connect(signer_C).cancelCoupon(1)).to.be.revertedWithCustomError(asset, "CouponAlreadyExecuted");
  });

  it("GIVEN a coupon after record date but before execution date WHEN cancelCoupon THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    await expect(asset.connect(signer_C).cancelCoupon(1))
      .to.emit(asset, "CouponCancelled")
      .withArgs(1, signer_C.address);
  });

  it("GIVEN an account without corporateActions role WHEN cancelCoupon THEN transaction fails with AccountHasNoRole", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await expect(asset.connect(signer_D).cancelCoupon(1)).to.be.rejectedWith("AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN cancelCoupon THEN transaction fails with TokenIsPaused", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await asset.connect(signer_B).pause();

    await expect(asset.connect(signer_C).cancelCoupon(1)).to.be.rejectedWith("TokenIsPaused");
  });

  it("GIVEN no existing coupon WHEN cancelCoupon with invalid ID THEN transaction fails", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C);

    await expect(asset.connect(signer_C).cancelCoupon(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
  });

  it("GIVEN a coupon with snapshot WHEN getCouponHolders is called THEN returns token holders from snapshot", async () => {
    const TotalAmount = 1000;
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await asset.connect(signer_A).setCoupon(couponData);

    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    // Trigger scheduled tasks by performing an action
    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_B.address,
      value: 500,
      data: "0x",
    });

    const coupon = (await asset.getCoupon(1)).registeredCoupon_;
    const couponTotalHolders = await asset.getTotalCouponHolders(1);
    const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);

    expect(coupon.snapshotId).to.be.greaterThan(0); // Snapshot should have been taken
    expect(couponTotalHolders).to.equal(1);
    expect([...couponHolders]).to.have.members([signer_A.address]);
  });

  it("GIVEN a coupon without snapshot WHEN getCouponFor is called after record date THEN uses current balance", async () => {
    const TotalAmount = 1000;
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await asset.connect(signer_A).setCoupon(couponData);

    // Time travel past record date but DON'T trigger snapshot
    await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    // Query couponFor without triggering snapshot - should use current balance path
    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const coupon = (await asset.getCoupon(1)).registeredCoupon_;

    expect(coupon.snapshotId).to.equal(0); // No snapshot taken
    expect(couponFor.recordDateReached).to.be.true;
    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.isDisabled).to.be.false;
  });

  it("GIVEN a coupon WHEN getCoupon is called THEN decodes coupon data", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
    couponRecordDateInSeconds = (await getDltTimestamp()) + 1000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 2000;

    const couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: couponRateStatus,
    };

    await asset.connect(signer_A).setCoupon(couponData);

    const coupon = (await asset.getCoupon(1)).registeredCoupon_;

    expect(coupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(coupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(coupon.coupon.rate).to.equal(couponRate);
    expect(coupon.coupon.rateDecimals).to.equal(couponRateDecimals);
    expect(coupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(coupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(coupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(coupon.coupon.rateStatus).to.equal(couponRateStatus);
  });

  it("GIVEN a non-coupon corporate action WHEN call with invalid index view methods THEN transaction fails with WrongActionType", async () => {
    await expect(asset.getCoupon(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    await expect(asset.getCouponFor(999, signer_A.address)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    await expect(asset.getCouponAmountFor(999, signer_A.address)).to.be.revertedWithCustomError(
      asset,
      "WrongIndexForAction",
    );
    await expect(asset.getTotalCouponHolders(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    await expect(asset.getCouponHolders(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

    await expect(asset.getCouponsFor(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
  });

  it("GIVEN invalid startDate > endDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp + TIME_PERIODS_S.DAY * 3, // startDate > endDate
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };

    await expect(asset.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(asset, "WrongDates");
  });

  it("GIVEN invalid fixingDate > executionDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp,
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY * 3, // fixingDate > executionDate
      rateStatus: couponRateStatus,
    };

    await expect(asset.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(asset, "WrongDates");
  });

  it("GIVEN fixingDate in the past WHEN setCoupon THEN transaction fails with WrongTimestamp", async () => {
    await asset.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp - TIME_PERIODS_S.DAY * 3,
      endDate: currentTimestamp + TIME_PERIODS_S.DAY * 3,
      fixingDate: currentTimestamp - TIME_PERIODS_S.DAY, // fixingDate in the past
      rateStatus: couponRateStatus,
    };

    await expect(asset.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
      asset,
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
    const couponKpiLinkedRateFacet = await ethers.getContractAt(
      "CouponKpiLinkedRateFacetTimeTravel",
      kpiDiamond.target,
      signer_A,
    );
    const accessControlKpi = await ethers.getContractAt("AccessControl", kpiDiamond.target, signer_A);
    const scheduledTasksKpi = await ethers.getContractAt("ScheduledCrossOrderedTasks", kpiDiamond.target, signer_A);
    const timeTravelKpi = await ethers.getContractAt("TimeTravelFacet", kpiDiamond.target, signer_A);

    await accessControlKpi.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

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

    await expect(couponKpiLinkedRateFacet.connect(signer_A).setCoupon(coupon1)).to.emit(
      couponKpiLinkedRateFacet,
      "CouponSet",
    );

    await expect(await couponKpiLinkedRateFacet.connect(signer_A).setCoupon(coupon2)).to.emit(
      couponKpiLinkedRateFacet,
      "CouponSet",
    );

    let orderedList = await couponKpiLinkedRateFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(0);

    await timeTravelKpi.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);

    await scheduledTasksKpi.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    orderedList = await couponKpiLinkedRateFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(1);
    expect(orderedList[0]).to.equal(1); // couponId 1

    await timeTravelKpi.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY * 2 + 1);

    await scheduledTasksKpi.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    orderedList = await couponKpiLinkedRateFacet.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(2);
    expect(orderedList[0]).to.equal(1); // couponId 1
    expect(orderedList[1]).to.equal(2); // couponId 2

    // Verify getCouponFromOrderedListAt works correctly
    const couponIdAtPos0 = await couponKpiLinkedRateFacet.getCouponFromOrderedListAt(0);
    const couponIdAtPos1 = await couponKpiLinkedRateFacet.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos0).to.equal(1);
    expect(couponIdAtPos1).to.equal(2);

    // Verify getCouponsOrderedListTotal
    const totalCouponsInOrderedList = await couponKpiLinkedRateFacet.getCouponsOrderedListTotal();
    expect(totalCouponsInOrderedList).to.equal(2);
  });

  it("GIVEN deprecated coupons in bond storage AND new coupons in coupon storage WHEN getCouponFromOrderedListAt is called THEN it correctly routes to both storages with offset", async () => {
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
    const couponKpiLinkedRateFacet = await ethers.getContractAt(
      "CouponKpiLinkedRateFacetTimeTravel",
      kpiDiamond.target,
      signer_A,
    );
    const accessControlKpi = await ethers.getContractAt("AccessControl", kpiDiamond.target, signer_A);
    const scheduledTasksKpi = await ethers.getContractAt("ScheduledCrossOrderedTasks", kpiDiamond.target, signer_A);
    const timeTravelKpi = await ethers.getContractAt("TimeTravelFacet", kpiDiamond.target, signer_A);

    await accessControlKpi.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

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

    await expect(couponKpiLinkedRateFacet.connect(signer_A).setCoupon(coupon1)).to.emit(
      couponKpiLinkedRateFacet,
      "CouponSet",
    );

    // Trigger scheduled tasks to move coupon1 to ordered list
    await timeTravelKpi.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);
    await scheduledTasksKpi.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    // Add deprecated coupons to bond storage (simulating legacy data from before refactor)
    // This must be done AFTER triggers complete to avoid errors when triggers try to process fake IDs
    await timeTravelKpi.testOnlyAddDeprecatedCoupon(100);

    // 1 deprecated (in bond storage) + 1 new (in coupon storage)
    const totalCoupons = await couponKpiLinkedRateFacet.getCouponsOrderedListTotal();
    expect(totalCoupons).to.equal(2);

    const pos0 = await couponKpiLinkedRateFacet.getCouponFromOrderedListAt(0);
    expect(pos0).to.equal(100); // from deprecated bond storage

    const pos3 = await couponKpiLinkedRateFacet.getCouponFromOrderedListAt(1);
    expect(pos3).to.equal(1); // first new coupon

    const fullList = await couponKpiLinkedRateFacet.getCouponsOrderedList(0, 10);
    expect(fullList).to.have.lengthOf(2);
    expect(fullList[0]).to.equal(100); // deprecated
    expect(fullList[1]).to.equal(1); // new storage
  });

  it("GIVEN empty ordered list WHEN getCouponFromOrderedListAt with _pos >= getCouponsOrderedListTotalAdjustedAt THEN returns 0", async () => {
    const couponIdAtPos0 = await asset.getCouponFromOrderedListAt(0);
    expect(couponIdAtPos0).to.equal(0);

    // Test position 1 - should return 0 because list is empty
    const couponIdAtPos1 = await asset.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos1).to.equal(0);

    // Test position 100 - should return 0 because list is empty
    const couponIdAtPos100 = await asset.getCouponFromOrderedListAt(100);
    expect(couponIdAtPos100).to.equal(0);
  });
});
