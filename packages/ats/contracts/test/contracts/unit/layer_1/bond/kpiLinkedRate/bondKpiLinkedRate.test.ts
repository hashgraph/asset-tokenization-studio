import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAKpiLinkedRateFacetTimeTravel,
  KpiLinkedRate,
  BondUSAReadFacet,
  TimeTravelFacet,
  ERC1594,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondKpiLinkedRateTokenFixture } from "@test";
import { executeRbac } from "@test";
import { Contract } from "ethers";

let couponRecordDateInSeconds = 0;
let couponExecutionDateInSeconds = 0;
const couponPeriod = TIME_PERIODS_S.WEEK;
let couponFixingDateInSeconds = 0;
let couponEndDateInSeconds = 0;
let couponStartDateInSeconds = 0;

let mockKpiOracle: Contract;
let timeTravelFacet: TimeTravelFacet;
let erc1594Facet: ERC1594;

let couponData = {
  recordDate: couponRecordDateInSeconds.toString(),
  executionDate: couponExecutionDateInSeconds.toString(),
  rate: 0,
  rateDecimals: 0,
  startDate: couponStartDateInSeconds.toString(),
  endDate: couponEndDateInSeconds.toString(),
  fixingDate: couponFixingDateInSeconds.toString(),
  rateStatus: 0,
};

describe("Bond KpiLinked Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;

  let bondKpiLinkedRateFacet: BondUSAKpiLinkedRateFacetTimeTravel;
  let bondReadFacet: BondUSAReadFacet;
  let kpiLinkedRateFacet: KpiLinkedRate;

  async function deploySecurityFixture() {
    const base = await deployBondKpiLinkedRateTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_A.address],
      },
    ]);

    bondKpiLinkedRateFacet = await ethers.getContractAt(
      "BondUSAKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacetTimeTravel", diamond.address, signer_A);
    kpiLinkedRateFacet = await ethers.getContractAt("KpiLinkedRate", diamond.address, signer_A);
    erc1594Facet = await ethers.getContractAt("ERC1594", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);

    const MockedKpiOracle = await ethers.getContractFactory("MockedKpiOracle");
    mockKpiOracle = await MockedKpiOracle.deploy();
  }

  beforeEach(async () => {
    couponRecordDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    couponExecutionDateInSeconds = dateToUnixTimestamp(`2030-05-01T00:10:00Z`);
    couponFixingDateInSeconds = dateToUnixTimestamp(`2030-03-01T00:10:00Z`);
    couponEndDateInSeconds = couponFixingDateInSeconds - 1;
    couponStartDateInSeconds = couponEndDateInSeconds - couponPeriod;
    couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: 0,
      rateDecimals: 0,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: 0,
    };
    await loadFixture(deploySecurityFixture);
  });

  it("GIVEN a kpiLinked rate bond WHEN setting a coupon with non pending status THEN transaction fails with InterestRateIsKpiLinked", async () => {
    couponData.rateStatus = 1;

    await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
  });

  it("GIVEN a kpiLinked rate bond WHEN setting a coupon with rate non 0 THEN transaction fails with InterestRateIsKpiLinked", async () => {
    couponData.rate = 1;

    await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
  });

  it("GIVEN a kpiLinked rate bond WHEN setting a coupon with rate decimals non 0 THEN transaction fails with InterestRateIsKpiLinked", async () => {
    couponData.rateDecimals = 1;

    await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
  });

  it("GIVEN a kpiLinked rate bond WHEN setting a coupon with pending status THEN transaction success", async () => {
    await expect(bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData))
      .to.emit(bondKpiLinkedRateFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_A.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        0,
        0,
        0,
      ]);

    const couponCount = await bondReadFacet.getCouponCount();
    expect(couponCount).to.equal(1);

    const registeredCoupon = await bondReadFacet.getCoupon(1);
    expect(registeredCoupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(registeredCoupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(registeredCoupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(registeredCoupon.coupon.rate).to.equal(0);
    expect(registeredCoupon.coupon.rateDecimals).to.equal(0);
    expect(registeredCoupon.coupon.rateStatus).to.equal(0);
  });

  it("GIVEN a kpiLinked rate bond WHEN setting a coupon with pending status THEN transaction success", async () => {
    const amount = 1000;
    await erc1594Facet.issue(signer_A.address, amount, "0x");

    const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    couponData = {
      startDate: referenceDate.toString(),
      endDate: (referenceDate + 100).toString(),
      fixingDate: (referenceDate + 200).toString(),
      recordDate: (referenceDate + 300).toString(),
      executionDate: (referenceDate + 400).toString(),
      rate: 0,
      rateDecimals: 0,
      rateStatus: 0,
    };

    const newInterestRate = {
      maxRate: 10000,
      baseRate: 7500,
      minRate: 5000,
      startPeriod: couponData.fixingDate + 10,
      startRate: 4000,
      missedPenalty: 100,
      reportPeriod: 5000,
      rateDecimals: 3,
    };
    const newImpactData = {
      maxDeviationCap: 200000,
      baseLine: 150000,
      maxDeviationFloor: 100000,
      impactDataDecimals: 2,
    };

    await kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate);
    await kpiLinkedRateFacet.connect(signer_A).setImpactData(newImpactData);
    await kpiLinkedRateFacet.connect(signer_A).setKpiOracle(mockKpiOracle.address);

    await mockKpiOracle.setKpiValue(100);
    await mockKpiOracle.setExists(true);

    await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

    const couponForPreFixingDate = await bondReadFacet.getCouponFor(1, signer_A.address);

    await timeTravelFacet.changeSystemTimestamp(couponData.fixingDate + 1);

    const registeredCouponPostFixingDate = await bondReadFacet.getCoupon(1);
    const couponForPostFixingDate = await bondReadFacet.getCouponFor(1, signer_A.address);

    expect(registeredCouponPostFixingDate.coupon.rate).to.equal(0);
    expect(registeredCouponPostFixingDate.coupon.rateDecimals).to.equal(0);
    expect(registeredCouponPostFixingDate.coupon.rateStatus).to.equal(0);

    expect(couponForPreFixingDate.coupon.rate).to.equal(0);
    expect(couponForPreFixingDate.coupon.rateDecimals).to.equal(0);
    expect(couponForPreFixingDate.coupon.rateStatus).to.equal(0);

    expect(couponForPostFixingDate.coupon.rate).to.equal(newInterestRate.startRate);
    expect(couponForPostFixingDate.coupon.rateDecimals).to.equal(newInterestRate.rateDecimals);
    expect(couponForPostFixingDate.coupon.rateStatus).to.equal(1);
  });
});
