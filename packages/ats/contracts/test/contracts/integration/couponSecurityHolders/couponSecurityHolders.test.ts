// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import {
  DEFAULT_PARTITION,
  ATS_ROLES,
  TIME_PERIODS_S,
  ZERO,
  EMPTY_STRING,
  COUPON_SECURITY_HOLDERS_RESOLVER_KEY,
} from "@scripts";
import { getDltTimestamp, executeRbac, deployBondTokenFixture, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let startingDate = 0;
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

describe("CouponSecurityHolders Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deploySecurityFixture() {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        bondDetails: {
          startingDate: startingDate,
          maturityDate: maturityDate,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.AGENT_ROLE,
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
    await loadFixture(deploySecurityFixture);
  });

  it("GIVEN a coupon with snapshot WHEN getCouponHolders is called THEN returns token holders from snapshot", async () => {
    const TotalAmount = 1000;
    await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
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

    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);

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

  it("GIVEN no existing coupon WHEN holder view methods called with invalid ID THEN transaction fails with WrongIndexForAction", async () => {
    await expect(asset.getTotalCouponHolders(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    await expect(asset.getCouponHolders(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    await expect(asset.getCouponsFor(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
  });

  it("GIVEN a coupon before record date WHEN getTotalCouponHolders THEN returns zero", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: 1000,
      data: "0x",
    });

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

    const totalHolders = await asset.getTotalCouponHolders(1);
    const holders = await asset.getCouponHolders(1, 0, 10);
    const [couponsFor, accounts] = await asset.getCouponsFor(1, 0, 10);

    expect(totalHolders).to.equal(0);
    expect(holders.length).to.equal(0);
    expect(couponsFor.length).to.equal(0);
    expect(accounts.length).to.equal(0);
  });

  it("GIVEN a coupon after record date with holders WHEN getCouponsFor THEN returns correct data for each holder", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: 500,
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
    await asset.changeSystemTimestamp(couponRecordDateInSeconds + 1);

    // Trigger snapshot via a transfer
    await asset.connect(signer_A).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_B.address,
      value: 100,
      data: "0x",
    });

    const totalHolders = await asset.getTotalCouponHolders(1);
    const [couponsFor, accounts] = await asset.getCouponsFor(1, 0, totalHolders);

    expect(totalHolders).to.be.greaterThan(0);
    expect(couponsFor.length).to.equal(Number(totalHolders));
    expect(accounts.length).to.equal(Number(totalHolders));
    expect(couponsFor[0].recordDateReached).to.be.true;
    expect(accounts).to.include(signer_A.address);
  });

  describe("initializeCouponSecurityHolders", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCouponSecurityHolders is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).initializeCouponSecurityHolders())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCouponSecurityHolders is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCouponSecurityHolders())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(COUPON_SECURITY_HOLDERS_RESOLVER_KEY, 1);
    });
  });

  describe("initializeCouponSecurityHolders event", () => {
    it("GIVEN a fresh deployment WHEN initializeCouponSecurityHolders is called THEN emits CouponSecurityHoldersInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(COUPON_SECURITY_HOLDERS_RESOLVER_KEY);
      await expect(asset.initializeCouponSecurityHolders()).to.emit(asset, "CouponSecurityHoldersInitialized");
    });
  });
});
