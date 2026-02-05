import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAFacet,
  AccessControl,
  Pause,
  Lock,
  type IERC1410,
  Kyc,
  SsiManagement,
  IHold,
  ControlList,
  ClearingActionsFacet,
  FreezeFacet,
  ClearingTransferFacet,
  BondUSAReadFacet,
  TimeTravelFacet as TimeTravel,
  IERC3643,
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
import { getBondDetails, getDltTimestamp, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";

const numberOfUnits = 1000;
let startingDate = 0;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = 0;
const amount = numberOfUnits;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

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
const DECIMALS = 6;
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

describe("Bond Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let bondFacet: BondUSAFacet;
  let bondReadFacet: BondUSAReadFacet;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;
  let lockFacet: Lock;
  let holdFacet: IHold;
  let erc1410Facet: IERC1410;
  let timeTravelFacet: TimeTravel;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let controlListFacet: ControlList;
  let clearingActionsFacet: ClearingActionsFacet;
  let freezeFacet: FreezeFacet;
  let clearingTransferFacet: ClearingTransferFacet;
  let erc3643Facet: IERC3643;

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

    bondFacet = await ethers.getContractAt("BondUSAFacetTimeTravel", diamond.target, signer_A);
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacetTimeTravel", diamond.target, signer_A);

    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    lockFacet = await ethers.getContractAt("Lock", diamond.target, signer_A);
    holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);

    controlListFacet = await ethers.getContractAt("ControlList", diamond.target, signer_D);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);

    freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target, signer_A);
    clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);

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

  describe("Initialization", () => {
    it("GIVEN an initialized bond WHEN trying to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const regulationData = {
        regulationType: 1, // REG_S
        regulationSubType: 0, // NONE
        dealSize: 0,
        accreditedInvestors: 1, // ACCREDITATION_REQUIRED
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification: 1, // VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED
        internationalInvestors: 1, // ALLOWED
        resaleHoldPeriod: 0, // NOT_APPLICABLE
      };

      const additionalSecurityData = {
        countriesControlListType: false,
        listOfCountries: "",
        info: "",
      };
      await expect(
        bondFacet._initialize_bondUSA(await getBondDetails(), regulationData, additionalSecurityData),
      ).to.be.rejectedWith("AlreadyInitialized");
    });
  });

  describe("Single Partition", () => {
    it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await bondReadFacet.getPrincipalFor(signer_A.address);
      const bondDetails = await bondReadFacet.getBondDetails();

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount));
      expect(principalFor.denominator).to.equal(10 ** (bondDetails.nominalValueDecimals + DECIMALS));
    });

    describe("Redeem At Maturity", () => {
      it("GIVEN a zero address as token holder WHEN redeeming at maturity THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(ADDRESS_ZERO, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "ZeroAddressNotAllowed");

        await expect(bondFacet.fullRedeemAtMaturity(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          bondFacet,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN single partition mode WHEN redeeming from a non-default partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, _PARTITION_ID, amount),
        ).to.be.revertedWithCustomError(bondFacet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN the token holder account is blocked WHEN redeeming at maturity THEN transaction fails with AccountIsBlocked", async () => {
        await controlListFacet.addToControlList(signer_B.address);

        await expect(
          bondFacet.connect(signer_A).redeemAtMaturityByPartition(signer_B.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "AccountIsBlocked");

        await expect(bondFacet.connect(signer_A).fullRedeemAtMaturity(signer_B.address)).to.be.revertedWithCustomError(
          bondFacet,
          "AccountIsBlocked",
        );
      });

      it("GIVEN the caller lacks the Maturity Redeemer role WHEN redeeming at maturity THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          bondFacet.connect(signer_B).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "AccountHasNoRole");

        await expect(bondFacet.connect(signer_B).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "AccountHasNoRole",
        );
      });
      it("GIVEN clearing is activated WHEN redeeming at maturity THEN transaction fails with ClearingIsActivated", async () => {
        await clearingActionsFacet.activateClearing();

        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "ClearingIsActivated");

        await expect(bondFacet.fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "ClearingIsActivated",
        );
      });

      it("GIVEN the token is paused WHEN redeeming at maturity THEN transaction fails with TokenIsPaused", async () => {
        await grantRoleAndPauseToken(
          accessControlFacet,
          pauseFacet,
          ATS_ROLES._CORPORATE_ACTION_ROLE,
          signer_A,
          signer_B,
          signer_C.address,
        );

        await expect(
          bondFacet.connect(signer_C).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "TokenIsPaused");

        await expect(bondFacet.connect(signer_C).fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN the token holder lacks valid KYC status WHEN redeeming at maturity THEN transaction fails with InvalidKycStatus", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "InvalidKycStatus");

        await expect(bondFacet.fullRedeemAtMaturity(signer_C.address)).to.be.revertedWithCustomError(
          bondFacet,
          "InvalidKycStatus",
        );
      });

      it("GIVEN the current date is before maturity WHEN redeeming at maturity THEN transaction fails with BondMaturityDateWrong", async () => {
        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "BondMaturityDateWrong");

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          bondFacet,
          "BondMaturityDateWrong",
        );
      });

      it("GIVEN a recovered wallet WHEN redeeming at maturity THEN transaction fails with WalletRecovered", async () => {
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(bondFacet, "WalletRecovered");

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address)).to.be.revertedWithCustomError(
          bondFacet,
          "WalletRecovered",
        );
      });

      it("GIVEN all conditions are met WHEN redeeming at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN all conditions are met WHEN redeeming all at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

        await expect(bondFacet.fullRedeemAtMaturity(signer_A.address))
          .to.emit(bondFacet, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
      });
    });

    describe("Coupons", () => {
      it("GIVEN an account without corporateActions role WHEN setCoupon THEN transaction fails with AccountHasNoRole", async () => {
        // set coupon fails
        await expect(bondFacet.connect(signer_C).setCoupon(couponData)).to.be.rejectedWith("AccountHasNoRole");
      });

      it("GIVEN a paused Token WHEN setCoupon THEN transaction fails with TokenIsPaused", async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
          accessControlFacet,
          pauseFacet,
          ATS_ROLES._CORPORATE_ACTION_ROLE,
          signer_A,
          signer_B,
          signer_C.address,
        );

        // set coupon fails
        await expect(bondFacet.connect(signer_C).setCoupon(couponData)).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN an account with corporateActions role WHEN setCoupon with wrong dates THEN transaction fails", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
        // set coupon
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

        await expect(bondFacet.connect(signer_C).setCoupon(wrongcouponData_1)).to.be.revertedWithCustomError(
          bondFacet,
          "WrongDates",
        );

        const wrongcouponData_2 = {
          recordDate: ((await ethers.provider.getBlock("latest")).timestamp - 1).toString(),
          executionDate: couponExecutionDateInSeconds.toString(),
          rate: couponRate,
          rateDecimals: couponRateDecimals,
          startDate: couponStartDateInSeconds.toString(),
          endDate: couponEndDateInSeconds.toString(),
          fixingDate: couponFixingDateInSeconds.toString(),
          rateStatus: couponRateStatus,
        };

        await expect(bondFacet.connect(signer_C).setCoupon(wrongcouponData_2)).to.be.revertedWithCustomError(
          bondFacet,
          "WrongTimestamp",
        );
      });

      it("GIVEN an account with corporateActions role WHEN setCoupon with period THEN period is stored correctly", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        // Create coupon with specific period
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

        // Set coupon and verify event includes period
        await expect(bondFacet.connect(signer_C).setCoupon(customCouponData))
          .to.emit(bondFacet, "CouponSet")
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

        // Verify coupon data includes period
        const registeredCoupon = await bondReadFacet.getCoupon(1);
        expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
        expect(registeredCoupon.coupon.startDate).to.equal(customStartDate);

        // Verify couponFor data includes period
        const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
        expect(couponFor.coupon.endDate).to.equal(couponEndDateInSeconds);
        expect(couponFor.coupon.startDate).to.equal(customStartDate);
      });

      it("GIVEN an account with corporateActions role WHEN setCoupon with period 0 THEN transaction succeeds", async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A);
        await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
        // Using account C (with role)
        bondFacet = bondFacet.connect(signer_C);

        // Test minimum valid period (exactly 1 day)
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

        await expect(bondFacet.setCoupon(minValidPeriodCouponData))
          .to.emit(bondFacet, "CouponSet")
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
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        // set coupon
        await expect(bondFacet.connect(signer_C).setCoupon(couponData))
          .to.emit(bondFacet, "CouponSet")
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

        // check list members
        await expect(bondReadFacet.getCoupon(1000)).to.be.rejectedWith("WrongIndexForAction");

        const listCount = await bondReadFacet.getCouponCount();
        const coupon = await bondReadFacet.getCoupon(1);
        const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
        const couponAmountFor = await bondReadFacet.getCouponAmountFor(1, signer_A.address);
        const couponTotalHolders = await bondReadFacet.getTotalCouponHolders(1);
        const couponHolders = await bondReadFacet.getCouponHolders(1, 0, couponTotalHolders);

        expect(listCount).to.equal(1);
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
        expect(couponTotalHolders).to.equal(0);
        expect(couponHolders.length).to.equal(couponTotalHolders);
        expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
        expect(couponAmountFor.numerator).to.equal(0);
        expect(couponAmountFor.denominator).to.equal(0);
      });

      it("GIVEN an account with corporateActions role WHEN setCoupon and lock THEN transaction succeeds", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        // issue and lock
        const TotalAmount = numberOfUnits;
        const LockedAmount = TotalAmount - 5;

        await erc1410Facet.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: TotalAmount,
          data: "0x",
        });

        await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, MAX_UINT256);

        // set coupon
        await expect(bondFacet.connect(signer_C).setCoupon(couponData))
          .to.emit(bondFacet, "CouponSet")
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

        // check list members
        await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
        await accessControlFacet.connect(signer_A).revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
        const couponAmountFor = await bondReadFacet.getCouponAmountFor(1, signer_A.address);
        const bondDetails = await bondReadFacet.getBondDetails();
        const couponTotalHolders = await bondReadFacet.getTotalCouponHolders(1);
        const couponHolders = await bondReadFacet.getCouponHolders(1, 0, couponTotalHolders);
        const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        expect(couponFor.tokenBalance).to.equal(TotalAmount);
        expect(couponFor.recordDateReached).to.equal(true);
        expect(couponTotalHolders).to.equal(1);
        expect(couponHolders.length).to.equal(couponTotalHolders);
        expect(couponHolders).to.have.members([signer_A.address]);
        expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
        expect(couponAmountFor.numerator).to.equal(
          couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period,
        );
        expect(couponAmountFor.denominator).to.equal(
          BigInt(10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals)) *
            BigInt(YEAR_SECONDS),
        );
      });

      it("GIVEN an account with corporateActions role WHEN setCoupon and hold THEN transaction succeeds", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        // issue and hold
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

        // set coupon
        await expect(bondFacet.connect(signer_C).setCoupon(couponData))
          .to.emit(bondFacet, "CouponSet")
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

        // check list members
        await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
        await accessControlFacet.connect(signer_A).revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
        const couponAmountFor = await bondReadFacet.getCouponAmountFor(1, signer_A.address);
        const bondDetails = await bondReadFacet.getBondDetails();
        const couponTotalHolders = await bondReadFacet.getTotalCouponHolders(1);
        const couponHolders = await bondReadFacet.getCouponHolders(1, 0, couponTotalHolders);
        const period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        expect(couponFor.tokenBalance).to.equal(TotalAmount);
        expect(couponFor.recordDateReached).to.equal(true);
        expect(couponTotalHolders).to.equal(1);
        expect(couponHolders.length).to.equal(couponTotalHolders);
        expect(couponHolders).to.have.members([signer_A.address]);
        expect(couponAmountFor.recordDateReached).to.equal(couponFor.recordDateReached);
        expect(couponAmountFor.numerator).to.equal(
          couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period,
        );
        expect(couponAmountFor.denominator).to.equal(
          BigInt(10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals)) *
            BigInt(YEAR_SECONDS),
        );
      });

      it("GIVEN an account with bondManager role WHEN setMaturityDate THEN transaction succeeds", async () => {
        // * Arrange
        // Granting Role to account C
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
        // Get maturity date
        const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
        // New maturity date
        const newMaturityDate = maturityDateBefore + 86400n;

        await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate))
          .to.emit(bondFacet, "MaturityDateUpdated")
          .withArgs(bondFacet.target, newMaturityDate, maturityDateBefore);
        // check date
        const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
        expect(maturityDateAfter).not.to.be.equal(maturityDateBefore);
        expect(maturityDateAfter).to.be.equal(newMaturityDate);
      });

      it("GIVEN an account with bondManager role WHEN setMaturityDate to earlier date THEN transaction fails", async () => {
        // * Arrange
        // Granting Role to account C
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._BOND_MANAGER_ROLE, signer_C.address);
        // Get maturity date
        const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
        // New maturity date (earlier than current)
        // New maturity date (earlier than current)
        const dayBeforeCurrentMaturity = maturityDateBefore - 86400n;

        // * Act & Assert
        // Set maturity date
        await expect(
          bondFacet.connect(signer_C).updateMaturityDate(dayBeforeCurrentMaturity),
        ).to.be.revertedWithCustomError(bondFacet, "BondMaturityDateWrong");
        // Ensure maturity date is not updated
        const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
        expect(maturityDateAfter).to.be.equal(maturityDateBefore);
      });

      it("GIVEN an account without bondManager role WHEN setMaturityDate THEN transaction fails with AccountHasNoRole", async () => {
        // * Arrange
        // Get maturity date
        const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
        // New maturity date
        const newMaturityDate = maturityDateBefore + 86400n;

        // * Act & Assert
        // Set maturity date
        await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
        // Ensure maturity date is not updated
        const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
        expect(maturityDateAfter).to.be.equal(maturityDateBefore);
      });

      it("GIVEN a paused Token WHEN setMaturityDate THEN transaction fails with TokenIsPaused", async () => {
        // * Arrange
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
          accessControlFacet,
          pauseFacet,
          ATS_ROLES._BOND_MANAGER_ROLE,
          signer_A,
          signer_B,
          signer_C.address,
        );
        // Get maturity date
        const maturityDateBefore = (await bondReadFacet.getBondDetails()).maturityDate;
        // New maturity date
        const newMaturityDate = maturityDateBefore + 86400n;

        // * Act & Assert
        // Set maturity date
        await expect(bondFacet.connect(signer_C).updateMaturityDate(newMaturityDate)).to.be.rejectedWith(
          "TokenIsPaused",
        );
        // Ensure maturity date is not updated
        const maturityDateAfter = (await bondReadFacet.getBondDetails()).maturityDate;
        expect(maturityDateAfter).to.be.equal(maturityDateBefore);
      });

      it("Given a coupon and account with normal, cleared, held, locked and frozen balance WHEN  getCouponFor THEN sum of balances is correct", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

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

        // set coupon
        await expect(bondFacet.connect(signer_C).setCoupon(couponData))
          .to.emit(bondFacet, "CouponSet")
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

        // --- Pre: before record date -> tokenBalance should be 0 and not reached
        const before = await bondReadFacet.getCouponFor(1, signer_A.address);
        const couponAmountForBefore = await bondReadFacet.getCouponAmountFor(1, signer_A.address);
        expect(before.recordDateReached).to.equal(false);
        expect(before.tokenBalance).to.equal(0);
        expect(couponAmountForBefore.recordDateReached).to.equal(before.recordDateReached);
        expect(couponAmountForBefore.numerator).to.equal(0);
        expect(couponAmountForBefore.denominator).to.equal(0);

        // Forward time to record date
        await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);
        await accessControlFacet.revokeRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

        // --- Post: after record date -> tokenBalance should be sum of balances
        const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
        const couponAmountForAfter = await bondReadFacet.getCouponAmountFor(1, signer_A.address);
        const bondDetails = await bondReadFacet.getBondDetails();
        const period = couponFor.coupon.endDate - couponFor.coupon.startDate;
        expect(couponFor.recordDateReached).to.equal(true);
        expect(couponFor.tokenBalance).to.equal(totalAmount); // normal+cleared+held+locked+frozen
        expect(couponAmountForAfter.recordDateReached).to.equal(couponFor.recordDateReached);
        expect(couponAmountForAfter.numerator).to.equal(
          couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period,
        );
        expect(couponAmountForAfter.denominator).to.equal(
          BigInt(10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals)) *
            BigInt(YEAR_SECONDS),
        );
      });
    });
  });
  describe("Multi Partition", () => {
    it("GIVEN token holder WHEN getting principal For THEN succeeds", async () => {
      await deploySecurityFixture(true);

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await bondReadFacet.getPrincipalFor(signer_A.address);
      const bondDetails = await bondReadFacet.getBondDetails();

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount) * 2n);
      expect(principalFor.denominator).to.equal(10 ** (bondDetails.nominalValueDecimals + DECIMALS));
    });

    it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
      await deploySecurityFixture(true);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

      await expect(bondFacet.redeemAtMaturityByPartition(signer_A.address, _PARTITION_ID, amount))
        .to.emit(bondFacet, "RedeemedByPartition")
        .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x");
    });

    it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
      await deploySecurityFixture(true);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await timeTravelFacet.changeSystemTimestamp(maturityDate + 1);

      await expect(bondFacet.fullRedeemAtMaturity(signer_A.address))
        .to.emit(bondFacet, "RedeemedByPartition")
        .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x")
        .to.emit(bondFacet, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
    });

    it("GIVEN a coupon with snapshot WHEN getCouponHolders is called THEN returns token holders from snapshot", async () => {
      await deploySecurityFixture(true);

      const TotalAmount = 1000;
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

      // Grant KYC to signer_B for issuing tokens later
      await kycFacet.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await erc1410Facet.connect(signer_A).issueByPartition({
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

      await bondFacet.connect(signer_A).setCoupon(couponData);

      // Time travel past record date
      await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

      // Trigger scheduled tasks by performing an action (issue more tokens to signer_B)
      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500,
        data: "0x",
      });

      const coupon = await bondReadFacet.getCoupon(1);
      const couponTotalHolders = await bondReadFacet.getTotalCouponHolders(1);
      const couponHolders = await bondReadFacet.getCouponHolders(1, 0, couponTotalHolders);

      expect(coupon.snapshotId).to.be.greaterThan(0); // Snapshot should have been taken
      expect(couponTotalHolders).to.equal(1);
      expect(couponHolders).to.have.members([signer_A.address]);
    });

    it("GIVEN a coupon without snapshot WHEN getCouponFor is called after record date THEN uses current balance", async () => {
      await deploySecurityFixture(true);

      const TotalAmount = 1000;
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);

      await erc1410Facet.connect(signer_A).issueByPartition({
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

      await bondFacet.connect(signer_A).setCoupon(couponData);

      // Time travel past record date but DON'T trigger snapshot
      await timeTravelFacet.changeSystemTimestamp(couponRecordDateInSeconds + 1);

      // Query couponFor without triggering snapshot - should use current balance path
      const couponFor = await bondReadFacet.getCouponFor(1, signer_A.address);
      const coupon = await bondReadFacet.getCoupon(1);

      expect(coupon.snapshotId).to.equal(0); // No snapshot taken
      expect(couponFor.recordDateReached).to.be.true;
      expect(couponFor.tokenBalance).to.equal(TotalAmount);
    });

    it("GIVEN a coupon WHEN getCoupon is called THEN decodes coupon data", async () => {
      await deploySecurityFixture(true);

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

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

      await bondFacet.connect(signer_A).setCoupon(couponData);

      const coupon = await bondReadFacet.getCoupon(1);

      expect(coupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
      expect(coupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
      expect(coupon.coupon.rate).to.equal(couponRate);
      expect(coupon.coupon.rateDecimals).to.equal(couponRateDecimals);
      expect(coupon.coupon.startDate).to.equal(couponStartDateInSeconds);
      expect(coupon.coupon.endDate).to.equal(couponEndDateInSeconds);
      expect(coupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
      expect(coupon.coupon.rateStatus).to.equal(couponRateStatus);
    });

    it("GIVEN a non-coupon corporate action WHEN getCouponFor is called THEN transaction fails with WrongActionType", async () => {
      await deploySecurityFixture(true);

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

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

      await bondFacet.connect(signer_A).setCoupon(couponData);

      // Try to access with invalid coupon ID (0 would be invalid or different action type)
      await expect(bondReadFacet.getCouponFor(999, signer_A.address)).to.be.revertedWithCustomError(
        bondReadFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN a non-coupon corporate action WHEN getCouponAmountFor is called THEN transaction fails with WrongActionType", async () => {
      await deploySecurityFixture(true);

      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

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

      await bondFacet.connect(signer_A).setCoupon(couponData);

      // Try to access with invalid coupon ID
      await expect(bondReadFacet.getCouponAmountFor(999, signer_A.address)).to.be.revertedWithCustomError(
        bondReadFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("Uncovered Branch Tests", () => {
    it("GIVEN a token holder with zero balance WHEN fullRedeemAtMaturity is called THEN succeeds without redeeming", async () => {
      // Create a new user with no tokens
      const signers = await ethers.getSigners();
      const newUser = signers[10]; // Use a signer that hasn't been used yet

      // Grant KYC to new user
      await kycFacet.grantKyc(newUser.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      // Move time past maturity
      await timeTravelFacet.changeSystemTimestamp(maturityDate + TIME_PERIODS_S.DAY);

      // Call fullRedeemAtMaturity on account with zero balance (signer_A has _MATURITY_REDEEMER_ROLE)
      await expect(bondFacet.connect(signer_A).fullRedeemAtMaturity(newUser.address)).to.not.be.reverted;
    });

    it("GIVEN invalid startDate > endDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
      // Grant corporate action role to signer_C
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

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

      await expect(bondFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
        bondFacet,
        "WrongDates",
      );
    });

    it("GIVEN invalid fixingDate > executionDate WHEN setCoupon THEN transaction fails with WrongDates", async () => {
      // Grant corporate action role to signer_C
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
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

      await expect(bondFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
        bondFacet,
        "WrongDates",
      );
    });

    it("GIVEN fixingDate in the past WHEN setCoupon THEN transaction fails with WrongTimestamp", async () => {
      // Grant corporate action role to signer_C
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
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

      await expect(bondFacet.connect(signer_C).setCoupon(invalidCoupon)).to.be.revertedWithCustomError(
        bondFacet,
        "WrongTimestamp",
      );
    });
  });
});
