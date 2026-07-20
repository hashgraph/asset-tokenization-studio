// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, TIME_PERIODS_S, ZERO, EMPTY_STRING, RESOLVER_KEYS } from "@lib";
import { getDltTimestamp, executeRbac, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

const couponRate = 50;
const couponRateDecimals = 1;
const couponPeriod = TIME_PERIODS_S.WEEK;
const EMPTY_VC_ID = EMPTY_STRING;
const couponRateStatus = 1;

export function couponSecurityHoldersTests(getCtx: () => AssetMockCtx): void {
  describe("CouponSecurityHolders Tests", () => {
    let asset: IAssetMock;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;

    let couponRecordDateInSeconds = 0;
    let couponExecutionDateInSeconds = 0;
    let couponFixingDateInSeconds = 0;
    let couponEndDateInSeconds = 0;
    let couponStartDateInSeconds = 0;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user1;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_MATURITY_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_A).activateInternalKyc();

      const futureDate = (await getDltTimestamp()) + TIME_PERIODS_S.YEAR;
      await asset.connect(signer_A).updateMaturityDate(futureDate);

      const currentTimestamp = await getDltTimestamp();
      couponRecordDateInSeconds = currentTimestamp + 400;
      couponExecutionDateInSeconds = currentTimestamp + 1200;
      couponFixingDateInSeconds = currentTimestamp + 1200;
      couponEndDateInSeconds = couponFixingDateInSeconds - 1;
      couponStartDateInSeconds = couponEndDateInSeconds - couponPeriod;
    });

    it("GIVEN a coupon with snapshot WHEN getCouponHolders is called THEN returns token holders from snapshot", async () => {
      const TotalAmount = 1000;
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
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

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500,
        data: "0x",
      });

      const coupon = (await asset.getCoupon(1)).registeredCoupon_;
      const couponTotalHolders = await asset.getTotalCouponHolders(1);
      const couponHolders = await asset.getCouponHolders(1, 0, couponTotalHolders);

      expect(coupon.snapshotId).to.be.greaterThan(0);
      expect(couponTotalHolders).to.equal(1);
      expect([...couponHolders]).to.have.members([signer_A.address]);
    });

    it("GIVEN no existing coupon WHEN holder view methods called with invalid ID THEN transaction fails with WrongIndexForAction", async () => {
      await expect(asset.getTotalCouponHolders(999)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      await expect(asset.getCouponHolders(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      await expect(asset.getCouponsFor(999, 0, 10)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });

    it("GIVEN a coupon before record date WHEN getTotalCouponHolders THEN returns zero", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

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
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
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
          .withArgs(RESOLVER_KEYS.couponSecurityHolders, 1);
      });
    });

    describe("initializeCouponSecurityHolders event", () => {
      it("GIVEN a fresh deployment WHEN initializeCouponSecurityHolders is called THEN emits CouponSecurityHoldersInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.couponSecurityHolders);
        await expect(asset.initializeCouponSecurityHolders()).to.emit(asset, "CouponSecurityHoldersInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN getCouponHolders THEN reverts with AssetNotOperational", async () => {
        await expect(asset.getCouponHolders(1, 0, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN getCouponsFor THEN reverts with AssetNotOperational", async () => {
        await expect(asset.getCouponsFor(1, 0, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
