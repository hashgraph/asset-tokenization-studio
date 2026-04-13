// SPDX-License-Identifier: Apache-2.0

/**
 * @file AmortizationFacet Integration Tests
 *
 * ⚠️  TEMPORARILY DISABLED - Awaiting PR-912
 *
 * This test file depends on deployLoanTokenFixture which will be added in PR-912
 * along with loan.fixture.ts and loanPortfolio.fixture.ts.
 *
 * Once PR-912 is merged:
 * 1. Uncomment the tests below
 * 2. Remove the skip from describe blocks
 * 3. Verify all tests pass
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES } from "@scripts";
// TODO: Uncomment after PR-912
// import { deployLoanTokenFixture, getDltTimestamp } from "@test";
import { DEFAULT_SECURITY_PARAMS } from "test/fixtures/tokens/common.fixture";

const TOTAL_UNITS = 1_000;
const TOKENS_TO_REDEEM = 500;
const RECORD_DATE_OFFSET = 400;
const EXECUTION_DATE_OFFSET = 1200;

// TODO: Remove .skip after PR-912
describe.skip("AmortizationFacet", () => {
  let asset: IAsset;
  let deployer: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  async function makeAmortizationData(recordOffset = RECORD_DATE_OFFSET, executionOffset = EXECUTION_DATE_OFFSET) {
    // TODO: Uncomment after PR-912
    // const now = await getDltTimestamp();
    const now = 0; // Placeholder
    return {
      recordDate: now + recordOffset,
      executionDate: now + executionOffset,
      tokensToRedeem: TOKENS_TO_REDEEM,
    };
  }

  // TODO: Uncomment after PR-912
  /*
  async function deployAmortizationLoanFixture() {
    const base = await deployLoanTokenFixture({ loanParams: { securityDataParams: { internalKycActivated: false } } });
    const { tokenAddress, deployer } = base;

    const asset = await ethers.getContractAt("IAsset", tokenAddress, deployer);

    const [, user1, user2, user3] = await ethers.getSigners();

    return {
      ...base,
      asset,
      deployer,
      user1,
      user2,
      user3,
    };
  }

  beforeEach(async () => {
    const fixture = await loadFixture(deployAmortizationLoanFixture);
    asset = fixture.asset;
    deployer = fixture.deployer;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
  });
  */

  describe("setAmortization", () => {
    // TODO: Uncomment all tests after PR-912

    it.skip("GIVEN account without CORPORATE_ACTION_ROLE WHEN setAmortization THEN reverts with AccountHasNoRole", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });

    it.skip("GIVEN valid amortization data WHEN setAmortization THEN creates amortization", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });

    it.skip("GIVEN amortization with past record date WHEN setAmortization THEN reverts with InvalidTimestamp", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });
  });

  describe("getAmortizationFor", () => {
    it.skip("GIVEN account with no holdings WHEN getAmortizationFor THEN returns zero amounts", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });

    it.skip("GIVEN account with holdings after record date WHEN getAmortizationFor THEN returns correct amounts", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });
  });

  describe("cancelAmortization", () => {
    it.skip("GIVEN amortization with active holds WHEN cancelAmortization THEN reverts with AmortizationHasActiveHolds", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });

    it.skip("GIVEN amortization before execution date WHEN cancelAmortization THEN cancels successfully", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });

    it.skip("GIVEN amortization after execution date WHEN cancelAmortization THEN reverts with AmortizationAlreadyExecuted", async () => {
      // Test implementation here
      expect(true).to.be.false; // Placeholder - remove after uncommenting
    });
  });
});

// TODO: After PR-912, restore full test file from:
// .patches/pr-912-amortization.patch (search for amortization.test.ts section)
// The full test file contains ~1335 lines with comprehensive test coverage
