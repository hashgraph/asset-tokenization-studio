// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, BondUSAFacet, FixedRateFacet, BondUSAReadFacet } from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S } from "@scripts";
import { SecurityType, BondRateType } from "@scripts/domain";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture } from "@test";
import { executeRbac } from "@test";

let couponRecordDateInSeconds = 0;
let couponExecutionDateInSeconds = 0;
const couponPeriod = TIME_PERIODS_S.WEEK;
let couponFixingDateInSeconds = 0;
let couponEndDateInSeconds = 0;
let couponStartDateInSeconds = 0;

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

describe("Bond Fixed Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;

  let bondFacet: BondUSAFacet;
  let bondReadFacet: BondUSAReadFacet;
  let fixedRateFacet: FixedRateFacet;

  async function deploySecurityFixture() {
    const base = await deployBondTokenFixture({
      rateType: BondRateType.Fixed,
      useLoadFixture: false,
    });

    diamond = base.diamond;
    signer_A = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_A.address],
      },
    ]);

    bondFacet = await ethers.getContractAt("BondUSAFacet", diamond.target, signer_A);
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacet", diamond.target, signer_A);
    fixedRateFacet = await ethers.getContractAt("FixedRateFacet", diamond.target, signer_A);
  }

  beforeEach(async () => {
    couponRecordDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    couponExecutionDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:10:00Z`);
    couponFixingDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:10:00Z`);
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

  it("GIVEN a fixed rate bond WHEN deployed THEN securityType is BOND", async () => {
    const erc20Facet = await ethers.getContractAt(
      "contracts/facets/features/interfaces/ERC1400/IERC20.sol:IERC20",
      diamond.target,
    );
    const metadata = await erc20Facet.getERC20Metadata();
    expect(metadata.securityType).to.be.equal(SecurityType.BOND);
  });

  it("GIVEN a fixed rate bond WHEN setting a coupon with non pending status THEN transaction fails with InterestRateIsFixed", async () => {
    couponData.rateStatus = 1;

    await expect(bondFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsFixed");
  });

  it("GIVEN a fixed rate bond WHEN setting a coupon with rate non 0 THEN transaction fails with InterestRateIsFixed", async () => {
    couponData.rate = 1;

    await expect(bondFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsFixed");
  });

  it("GIVEN a fixed rate bond WHEN setting a coupon with rate decimals non 0 THEN transaction fails with InterestRateIsFixed", async () => {
    couponData.rateDecimals = 1;

    await expect(bondFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsFixed");
  });

  it("GIVEN a fixed rate bond WHEN setting a coupon with pending status THEN transaction success", async () => {
    const fixedRate = await fixedRateFacet.getRate();

    await expect(bondFacet.connect(signer_A).setCoupon(couponData))
      .to.emit(bondFacet, "CouponSet")
      .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_A.address, [
        couponRecordDateInSeconds,
        couponExecutionDateInSeconds,
        couponStartDateInSeconds,
        couponEndDateInSeconds,
        couponFixingDateInSeconds,
        fixedRate.rate_,
        fixedRate.decimals_,
        1,
      ]);

    const couponCount = await bondReadFacet.getCouponCount();
    expect(couponCount).to.equal(1);

    const registeredCoupon = await bondReadFacet.getCoupon(1);
    expect(registeredCoupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
    expect(registeredCoupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
    expect(registeredCoupon.coupon.startDate).to.equal(couponStartDateInSeconds);
    expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
    expect(registeredCoupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
    expect(registeredCoupon.coupon.rate).to.equal(fixedRate[0]);
    expect(registeredCoupon.coupon.rateDecimals).to.equal(fixedRate[1]);
    expect(registeredCoupon.coupon.rateStatus).to.equal(1);
  });
});
