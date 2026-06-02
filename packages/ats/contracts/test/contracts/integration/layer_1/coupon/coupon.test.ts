// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import {
  DEFAULT_PARTITION,
  ATS_ROLES,
  TIME_PERIODS_S,
  ADDRESS_ZERO,
  ZERO,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
  BOND_FIXED_RATE_CONFIG_ID,
  RESOLVER_KEY_COUPON,
} from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  getDltTimestamp,
  grantRoleAndPauseToken,
  deployBondTokenFixture,
  deployBondFixedRateTokenFixture,
  executeRbac,
  MAX_UINT256,
  EVENT_NAMES,
  TEST_COUPON,
  TEST_BOND_FIXED_RATE,
  expectExactlyOneEvent,
} from "@test";

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
  let mockDiamondCut: MockDiamondCut;

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
        role: ATS_ROLES.ROLE_FREEZE_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_MATURITY_REDEEMER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CONTROL_LIST,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.ROLE_CLEARING,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_AGENT,
        members: [signer_A.address],
      },
    ]);

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
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
  });

  it("GIVEN an account without corporateActions role WHEN setCoupon THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(signer_C).setCoupon(couponData)).to.be.revertedWithCustomError(
      asset,
      "AccountHasNoRole",
    );
  });

  it("GIVEN a paused Token WHEN setCoupon THEN transaction fails with IsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A, signer_B, signer_C.address);

    await expect(asset.connect(signer_C).setCoupon(couponData)).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon with wrong dates THEN transaction fails", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
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
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
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
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

    const tx = await asset.connect(signer_C).setCoupon(couponData);
    await expect(tx)
      .to.emit(asset, EVENT_NAMES.COUPON_SET)
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
    const receipt = await tx.wait();
    expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.COUPON_SET);

    const listCount = await asset.getCouponCount();
    const [coupon, isDisabled] = await asset.getCoupon(1);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
    const couponTotalHolders = await asset.getTotalCouponHolders(1);
    const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);

    const [couponsFor, accounts] = await asset.getCouponsFor(1, 0, 10);

    const couponsOrderedListTotal = await asset.getCouponsOrderedListTotal(false);

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
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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

    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await asset.connect(signer_A).revokeRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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
    const balanceNominalScaled = (couponFor.tokenBalance * nominalValue) / 10n ** nominalValueDecimals;
    expect(couponAmountFor.numerator).to.equal(balanceNominalScaled * couponFor.coupon.rate * period);
    expect(couponAmountFor.denominator).to.equal(
      10n ** (couponFor.decimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN an account with corporateActions role WHEN setCoupon and hold THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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

    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await asset.connect(signer_A).revokeRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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
    const balanceNominalScaled = (couponFor.tokenBalance * nominalValue) / 10n ** nominalValueDecimals;
    expect(couponAmountFor.numerator).to.equal(balanceNominalScaled * couponFor.coupon.rate * period);
    expect(couponAmountFor.denominator).to.equal(
      10n ** (couponFor.decimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("Given a coupon and account with normal, cleared, held, locked and frozen balance WHEN  getCouponFor THEN sum of balances is correct", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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

    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await asset.revokeRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

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
    const balanceNominalScaled =
      (couponFor.tokenBalance * bondDetails.nominalValue) / 10n ** bondDetails.nominalValueDecimals;
    expect(couponAmountForAfter.numerator).to.equal(balanceNominalScaled * couponFor.coupon.rate * period);
    expect(couponAmountForAfter.denominator).to.equal(
      10n ** (couponFor.decimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN an account with corporateActions role WHEN cancelling a coupon THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

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
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await asset.changeSystemTimestamp(couponExecutionDateInSeconds + 1);

    await expect(asset.connect(signer_C).cancelCoupon(1)).to.be.revertedWithCustomError(asset, "CouponAlreadyExecuted");
  });

  it("GIVEN a coupon after record date but before execution date WHEN cancelCoupon THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    const tx = await asset.connect(signer_C).cancelCoupon(1);
    await expect(tx).to.emit(asset, EVENT_NAMES.COUPON_CANCELLED).withArgs(1, signer_C.address);
    const receipt = await tx.wait();
    expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.COUPON_CANCELLED);
  });

  it("GIVEN an account without corporateActions role WHEN cancelCoupon THEN transaction fails with AccountHasNoRole", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await expect(asset.connect(signer_D).cancelCoupon(1)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN cancelCoupon THEN transaction fails with IsPaused", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

    await asset.connect(signer_C).setCoupon(couponData);

    await asset.connect(signer_B).pause();

    await expect(asset.connect(signer_C).cancelCoupon(1)).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN no existing coupon WHEN cancelCoupon with invalid ID THEN transaction fails", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

    await expect(asset.connect(signer_C).cancelCoupon(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
  });

  describe("Force Cancel Coupon", () => {
    it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelCoupon before execution date THEN transaction succeeds and isDisabled is true", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C);

      await asset.connect(signer_C).setCoupon(couponData);

      await expect(asset.connect(signer_C).forceCancelCoupon(1))
        .to.emit(asset, "CouponForceCancelled")
        .withArgs(1, signer_C.address);
      const isDisabled = (await asset.getCoupon(1)).isDisabled_;
      expect(isDisabled).to.equal(true);
    });

    it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelCoupon after execution date THEN transaction succeeds bypassing date guard", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C);

      await asset.connect(signer_C).setCoupon(couponData);

      await asset.changeSystemTimestamp(couponExecutionDateInSeconds + 1);

      await expect(asset.connect(signer_C).forceCancelCoupon(1))
        .to.emit(asset, "CouponForceCancelled")
        .withArgs(1, signer_C.address);
      const isDisabled = (await asset.getCoupon(1)).isDisabled_;
      expect(isDisabled).to.equal(true);
    });

    it("GIVEN account without ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelCoupon THEN transaction fails with AccountHasNoRole", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);

      await asset.connect(signer_C).setCoupon(couponData);

      await expect(asset.connect(signer_D).forceCancelCoupon(1)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN paused token WHEN forceCancelCoupon THEN transaction fails with IsPaused", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C);

      await asset.connect(signer_C).setCoupon(couponData);

      await asset.connect(signer_B).pause();

      await expect(asset.connect(signer_C).forceCancelCoupon(1)).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN no existing coupon WHEN forceCancelCoupon with invalid ID THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C);

      await expect(asset.connect(signer_C).forceCancelCoupon(999)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });
  });

  it("GIVEN a coupon without snapshot WHEN getCouponFor is called after record date THEN uses balance at record date", async () => {
    const TotalAmount = 1000;
    const Decimals = await asset.decimals();
    const NominalValue = 2;
    const NominalValueDecimals = 3;

    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

    await asset.connect(signer_A).setNominalValue(NominalValue, NominalValueDecimals);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 10000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 20000;

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
    const balanceAdjustmentData = {
      executionDate: BigInt(couponData.recordDate) + 1n,
      factor: 20,
      decimals: 1,
    };

    await asset.connect(signer_A).setCoupon(couponData);
    await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData);

    // Time travel past record date but DON'T trigger snapshot
    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 2);

    // Query couponFor without triggering snapshot - should use current balance path
    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const coupon = (await asset.getCoupon(1)).registeredCoupon_;

    expect(coupon.snapshotId).to.equal(0); // No snapshot taken
    expect(couponFor.recordDateReached).to.be.true;
    expect(couponFor.tokenBalance).to.equal(TotalAmount);
    expect(couponFor.decimals).to.equal(Decimals);
    expect(couponFor.nominalValue).to.equal(NominalValue);
    expect(couponFor.nominalValueDecimals).to.equal(NominalValueDecimals);
    expect(couponFor.isDisabled).to.be.false;

    await asset.connect(signer_A).setNominalValue(NominalValue + 1, NominalValueDecimals + 1);

    const couponFor_2 = await asset.getCouponFor(1, signer_A.address);
    expect(couponFor_2.nominalValue).to.equal(NominalValue);
    expect(couponFor_2.nominalValueDecimals).to.equal(NominalValueDecimals);
  });

  it("GIVEN a coupon with a snapshot WHEN nominalValue changes after the snapshot THEN couponAmount uses snapshot-scale values", async () => {
    const TotalAmount = 1000;
    const NominalValue = 2;
    const NominalValueDecimals = 3;

    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

    await asset.connect(signer_A).setNominalValue(NominalValue, NominalValueDecimals);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: TotalAmount,
      data: "0x",
    });

    couponRecordDateInSeconds = (await getDltTimestamp()) + 10000;
    couponExecutionDateInSeconds = (await getDltTimestamp()) + 20000;

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

    await asset.connect(signer_A).setCoupon(localCouponData);

    // Cross record date and process scheduled tasks to take the snapshot bound to the coupon.
    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
    await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    const registered = (await asset.getCoupon(1)).registeredCoupon_;
    expect(registered.snapshotId).to.be.greaterThan(0);

    // Change nominal value AFTER the snapshot — current scale now diverges from snapshot scale.
    await asset.connect(signer_A).setNominalValue(NominalValue + 5, NominalValueDecimals + 2);

    const couponFor = await asset.getCouponFor(1, signer_A.address);
    const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
    const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

    // Snapshot-scale metadata is preserved on the struct.
    expect(couponFor.recordDateReached).to.equal(true);
    expect(couponFor.nominalValue).to.equal(NominalValue);
    expect(couponFor.nominalValueDecimals).to.equal(NominalValueDecimals);

    // Numerator and denominator must use the snapshot-scale values returned in couponFor
    // (NominalValue, NominalValueDecimals), not the current values just written above.
    expect(couponAmountFor.recordDateReached).to.equal(true);
    const balanceNominalScaled =
      (couponFor.tokenBalance * couponFor.nominalValue) / 10n ** BigInt(NominalValueDecimals);
    expect(couponAmountFor.numerator).to.equal(balanceNominalScaled * couponFor.coupon.rate * period);
    expect(couponAmountFor.denominator).to.equal(
      10n ** (couponFor.decimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS),
    );
  });

  it("GIVEN a coupon WHEN getCoupon is called THEN decodes coupon data", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
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
  });

  it("GIVEN invalid startDate > endDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
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
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
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

  it("GIVEN endDate > maturityDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const invalidCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp,
      endDate: maturityDate + 1,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };
    await expect(asset.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(asset, "WrongDates");
  });

  it("GIVEN endDate == maturityDate WHEN setCoupon THEN transaction succeeds", async () => {
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const validCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp,
      endDate: maturityDate,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };
    await expect(asset.connect(signer_C).setCoupon(validCoupon)).not.to.be.reverted;
  });

  it("GIVEN endDate < maturityDate WHEN setCoupon THEN transaction succeeds", async () => {
    await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
    const currentTimestamp = await getDltTimestamp();
    const validCoupon = {
      recordDate: currentTimestamp + TIME_PERIODS_S.DAY,
      executionDate: currentTimestamp + TIME_PERIODS_S.DAY * 2,
      rate: couponRate,
      rateDecimals: couponRateDecimals,
      startDate: currentTimestamp,
      endDate: maturityDate - TIME_PERIODS_S.DAY,
      fixingDate: currentTimestamp + TIME_PERIODS_S.DAY,
      rateStatus: couponRateStatus,
    };
    await expect(asset.connect(signer_C).setCoupon(validCoupon)).not.to.be.reverted;
  });

  describe("overflow safety and precision invariants", () => {
    it("GIVEN a coupon configuration WHEN getCouponAmountFor THEN the returned fraction equals the canonical balance·nominal·rate·period / (10^(d+nd+rd) · year) ratio", async () => {
      // Ratio equivalence proof. The new (numerator, denominator) decomposition
      // changes shape relative to  form, but the represented ratio must
      // remain identical. Verified by BigInt cross-multiplication (a/b == c/d iff a·d == b·c).
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: numberOfUnits,
        data: "0x",
      });

      await asset.connect(signer_A).setCoupon(couponData);
      await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);

      const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
      const couponFor = await asset.getCouponFor(1, signer_A.address);
      const nominalValue = await asset.getNominalValue();
      const nominalValueDecimals = await asset.getNominalValueDecimals();
      const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

      const canonicalNumerator = couponFor.tokenBalance * nominalValue * couponFor.coupon.rate * period;
      const canonicalDenominator =
        10n ** (couponFor.decimals + nominalValueDecimals + couponFor.coupon.rateDecimals) * BigInt(YEAR_SECONDS);

      expect(couponAmountFor.numerator * canonicalDenominator).to.equal(
        canonicalNumerator * couponAmountFor.denominator,
      );
    });

    it("GIVEN a high-precision configuration that overflows the pre-fix balance·nominal·rate·period four-way product WHEN getCouponAmountFor THEN does not revert", async () => {
      // Regression for the audit's overflow scenario. With high nominal and rate
      // decimals the pre-fix four-way product exceeds uint256's ceiling (~1.16·10^77).
      // The new path stages the multiplication through 512-bit mulDiv so the operation
      // completes and returns a well-formed fraction.
      const HIGH_NOMINAL_DECIMALS = 35;
      const HIGH_RATE_DECIMALS = 35;
      const NOMINAL = 10n ** BigInt(HIGH_NOMINAL_DECIMALS); // nominal_real = 1
      const RATE = 5n * 10n ** BigInt(HIGH_RATE_DECIMALS - 2); // rate_real = 0.05 (5%)
      const HOLDING = 10n ** 15n; // 10^15 raw — well within uint256

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.connect(signer_A).setNominalValue(NOMINAL, HIGH_NOMINAL_DECIMALS);
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: HOLDING,
        data: "0x",
      });

      const localCouponData = {
        ...couponData,
        rate: RATE,
        rateDecimals: HIGH_RATE_DECIMALS,
      };
      await asset.connect(signer_A).setCoupon(localCouponData);
      await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);

      const couponFor = await asset.getCouponFor(1, signer_A.address);
      const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

      // Self-document the overflow: prove the pre-fix four-way product would not fit in uint256.
      const preFixProduct = couponFor.tokenBalance * NOMINAL * RATE * period;
      expect(preFixProduct).to.be.greaterThan(2n ** 256n - 1n);

      // Must not revert.
      const couponAmountFor = await asset.getCouponAmountFor(1, signer_A.address);
      expect(couponAmountFor.recordDateReached).to.equal(true);

      // And the ratio must still equal the canonical formula (exact BigInt cross-multiplication).
      const canonicalDenominator =
        10n ** (couponFor.decimals + BigInt(HIGH_NOMINAL_DECIMALS) + BigInt(HIGH_RATE_DECIMALS)) * BigInt(YEAR_SECONDS);
      expect(couponAmountFor.numerator * canonicalDenominator).to.equal(preFixProduct * couponAmountFor.denominator);
    });

    it("GIVEN decimals + rateDecimals >= 78 WHEN getCouponAmountFor after record date THEN reverts with ExponentOverflow", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      // default token decimals = 6; rateDecimals = 72 → totalDecimals = 78 == MAX_DECIMALS; 10^78 overflows uint256
      await asset.connect(signer_A).setCoupon({ ...couponData, rateDecimals: 72 });
      await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
      await expect(asset.getCouponAmountFor(1, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "ExponentOverflow",
      );
    });

    it("GIVEN decimals + rateDecimals in [70, 77] WHEN getCouponAmountFor after record date THEN reverts with GreaterThanMaxUint256", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      // default token decimals = 6; rateDecimals = 64 → totalDecimals = 70;
      // pow10(70) × 365 days ≈ 3.15 × 10^77 > MAX_UINT256 ≈ 1.16 × 10^77:
      // denominator multiplication overflows before ExponentOverflow (threshold 78) fires
      await asset.connect(signer_A).setCoupon({ ...couponData, rateDecimals: 64 });
      await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);
      await expect(asset.getCouponAmountFor(1, signer_A.address))
        .to.be.revertedWithCustomError(asset, "GreaterThanMaxUint256")
        .withArgs(BigInt(YEAR_SECONDS), 70);
    });
  });
  describe("initializeCoupon", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCoupon is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeCoupon())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCoupon is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCoupon())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_COUPON, 1);
    });
  });

  describe("initializeCoupon event", () => {
    it("GIVEN a fresh deployment WHEN initializeCoupon is called THEN emits CouponInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_COUPON);
      await expect(asset.initializeCoupon()).to.emit(asset, "CouponInitialized");
    });
  });
});

describe("Coupon Fixed-Rate Variant Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployFixedRateFixture() {
    const base = await deployBondFixedRateTokenFixture({
      bondDataParams: {
        securityData: { isMultiPartition: false },
        bondDetails: { startingDate, maturityDate },
      },
      fixedRateParams: { rate: TEST_BOND_FIXED_RATE.RATE, rateDecimals: TEST_BOND_FIXED_RATE.RATE_DECIMALS },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
    ]);
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
  }

  beforeEach(async () => {
    const currentTimestamp = await getDltTimestamp();
    couponRecordDateInSeconds = currentTimestamp + TEST_COUPON.TIMING.RECORD_OFFSET_S;
    couponExecutionDateInSeconds = currentTimestamp + TEST_COUPON.TIMING.EXECUTION_OFFSET_S;
    couponFixingDateInSeconds = currentTimestamp + TEST_COUPON.TIMING.EXECUTION_OFFSET_S;
    couponEndDateInSeconds = couponFixingDateInSeconds - 1;
    couponStartDateInSeconds = couponEndDateInSeconds - couponPeriod;
    await loadFixture(deployFixedRateFixture);
  });

  it("GIVEN a fixed-rate bond WHEN setCoupon with PENDING rate THEN CouponSet emits with the resolved configured rate", async () => {
    const pendingCoupon = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: 0,
      rateDecimals: 0,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: TEST_COUPON.RATE_STATUS.PENDING,
    };

    const tx = await asset.connect(signer_C).setCoupon(pendingCoupon);
    await expect(tx)
      .to.emit(asset, EVENT_NAMES.COUPON_SET)
      .withArgs(TEST_COUPON.FIRST_CORPORATE_ACTION_ID, TEST_COUPON.FIRST_ID, signer_C.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        TEST_BOND_FIXED_RATE.RATE,
        TEST_BOND_FIXED_RATE.RATE_DECIMALS,
        TEST_COUPON.RATE_STATUS.SET,
      ]);
    const receipt = await tx.wait();
    expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.COUPON_SET);
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setCoupon THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setCoupon({
          recordDate: 0,
          executionDate: 0,
          startDate: 0,
          endDate: 0,
          fixingDate: 0,
          rate: 0,
          rateDecimals: 0,
          rateStatus: 0,
        }),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN cancelCoupon THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).cancelCoupon(0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setCoupon THEN reverts with AssetNotOperational", async () => {
      const minimalCoupon = {
        recordDate: 0,
        executionDate: 0,
        rate: 0,
        rateDecimals: 0,
        startDate: 0,
        endDate: 0,
        fixingDate: 0,
        rateStatus: 0,
      };
      await expect(asset.setCoupon(minimalCoupon)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });

    it("GIVEN non-operational WHEN cancelCoupon is called THEN AssetNotOperational", async () => {
      await expect(asset.cancelCoupon(0n))
        .to.be.revertedWithCustomError(asset, "AssetNotOperational")
        .withArgs(BOND_FIXED_RATE_CONFIG_ID, 1);
    });
  });
});
