// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import {
  type ResolverProxy,
  type Bond,
  type ScheduledCouponListing,
  type AccessControl,
  ScheduledCrossOrderedTasks,
  TimeTravel,
  BusinessLogicResolver,
  IFactory,
  AccessControl__factory,
  Bond__factory,
  ScheduledCrossOrderedTasks__factory,
  ScheduledCouponListing__factory,
  TimeTravel__factory,
} from "@typechain";
import {
  CORPORATE_ACTION_ROLE,
  PAUSER_ROLE,
  deployBondFromFactory,
  Rbac,
  RegulationSubType,
  RegulationType,
  deployAtsFullInfrastructure,
  DeployAtsFullInfrastructureCommand,
  dateToUnixTimestamp,
  TIME_PERIODS_S,
  InterestRateType,
} from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const numberOfUnits = 1000;
let startingDate = 9999999999;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = startingDate + numberOfCoupons * frequency;
const countriesControlListType = true;
const listOfCountries = "ES,FR,CH";
const info = "info";
const interestRateType = InterestRateType.KPI_BASED_PER_COUPON;

describe("Scheduled Coupon Listing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;

  let account_A: string;
  let account_B: string;
  let account_C: string;

  let factory: IFactory;
  let businessLogicResolver: BusinessLogicResolver;
  let bondFacet: Bond;
  let scheduledCouponListingFacet: ScheduledCouponListing;
  let scheduledTasksFacet: ScheduledCrossOrderedTasks;
  let accessControlFacet: AccessControl;
  let timeTravelFacet: TimeTravel;

  async function deploySecurityFixtureSinglePartition() {
    const init_rbacs: Rbac[] = set_initRbacs();

    diamond = await deployBondFromFactory({
      adminAccount: account_A,
      isWhiteList: false,
      isControllable: true,
      arePartitionsProtected: false,
      clearingActive: false,
      internalKycActivated: true,
      isMultiPartition: false,
      name: "TEST_AccessControl",
      symbol: "TAC",
      decimals: 6,
      isin: isinGenerator(),
      currency: "0x455552",
      numberOfUnits,
      nominalValue: 100,
      startingDate,
      maturityDate,
      regulationType: RegulationType.REG_S,
      regulationSubType: RegulationSubType.NONE,
      countriesControlListType,
      listOfCountries,
      info,
      init_rbacs,
      businessLogicResolver: businessLogicResolver.address,
      factory,
      interestRateType,
    });

    await setFacets(diamond);
  }

  async function setFacets(diamond: ResolverProxy) {
    accessControlFacet = AccessControl__factory.connect(diamond.address, signer_A);
    bondFacet = Bond__factory.connect(diamond.address, signer_A);
    scheduledCouponListingFacet = ScheduledCouponListing__factory.connect(diamond.address, signer_A);
    scheduledTasksFacet = ScheduledCrossOrderedTasks__factory.connect(diamond.address, signer_A);
    timeTravelFacet = TimeTravel__factory.connect(diamond.address, signer_A);
  }

  function set_initRbacs(): Rbac[] {
    const rbacPause: Rbac = {
      role: PAUSER_ROLE,
      members: [account_B],
    };
    return [rbacPause];
  }

  before(async () => {
    //mute | mock console.log
    console.log = () => {};
    [signer_A, signer_B, signer_C] = await ethers.getSigners();
    account_A = signer_A.address;
    account_B = signer_B.address;
    account_C = signer_C.address;

    const { ...deployedContracts } = await deployAtsFullInfrastructure(
      await DeployAtsFullInfrastructureCommand.newInstance({
        signer: signer_A,
        useDeployed: false,
        useEnvironment: true,
        timeTravelEnabled: true,
      }),
    );

    factory = deployedContracts.factory.contract;
    businessLogicResolver = deployedContracts.businessLogicResolver.contract;
  });

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  afterEach(async () => {
    timeTravelFacet.resetSystemTimestamp();
  });

  it("GIVEN a token WHEN triggerCouponListing THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(CORPORATE_ACTION_ROLE, account_C);

    // set coupons
    const couponsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const couponsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:01:00Z");
    const couponsStartDateInSeconds = dateToUnixTimestamp("2029-12-31T00:00:00Z");
    const couponsEndDateInSeconds = dateToUnixTimestamp("2029-12-31T00:10:00Z");
    const couponsFixingDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const couponsFixingDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:12Z");
    const couponsFixingDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:18Z");
    const couponsRate = 1;
    const couponRateDecimals = 0;

    const couponData_1 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_1.toString(),
      rateDecimals: couponRateDecimals,
    };
    const couponData_2 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_2.toString(),
      rateDecimals: couponRateDecimals,
    };
    const couponData_3 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_3.toString(),
      rateDecimals: couponRateDecimals,
    };
    await bondFacet.connect(signer_C).setCoupon(couponData_2);
    await bondFacet.connect(signer_C).setCoupon(couponData_3);
    await bondFacet.connect(signer_C).setCoupon(couponData_1);

    const coupon_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const coupon_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const coupon_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

    // check schedled CouponListing
    let scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    let scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(3);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(scheduledCouponListing[0].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);
    expect(scheduledCouponListing[1].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_2);
    expect(scheduledCouponListing[1].data).to.equal(coupon_2_Id);
    expect(scheduledCouponListing[2].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_1);
    expect(scheduledCouponListing[2].data).to.equal(coupon_1_Id);

    // AFTER FIRST SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_1 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(2);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(scheduledCouponListing[0].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);
    expect(scheduledCouponListing[1].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_2);
    expect(scheduledCouponListing[1].data).to.equal(coupon_2_Id);

    // AFTER SECOND SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_2 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(1);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(scheduledCouponListing[0].scheduledTimestamp.toNumber()).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);

    // AFTER SECOND SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_3 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(0);

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(0);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
  });
});
