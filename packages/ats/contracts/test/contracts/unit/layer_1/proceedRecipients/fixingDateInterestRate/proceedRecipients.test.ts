// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  ProceedRecipientsKpiLinkedRateFacetTimeTravel,
  ResolverProxy,
  AccessControl,
  BondUSAKpiLinkedRateFacetTimeTravel,
  ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel,
  TimeTravelFacet,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondKpiLinkedRateTokenFixture } from "@test";

const PROCEED_RECIPIENT_1 = "0x1234567890123456789012345678901234567890";
const PROCEED_RECIPIENT_1_DATA = "0xabcdef";
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);

describe("Proceed Recipients fixing Date Interest RateTests", () => {
  let signer_A: HardhatEthersSigner;

  let diamond: ResolverProxy;
  let proceedRecipientsFacet: ProceedRecipientsKpiLinkedRateFacetTimeTravel;
  let accessControlFacet: AccessControl;
  let bondKpiLinkedRateFacet: BondUSAKpiLinkedRateFacetTimeTravel;
  let scheduledTasksFacet: ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel;
  let timeTravelFacet: TimeTravelFacet;

  let couponData = {
    startDate: referenceDate.toString(),
    endDate: (referenceDate + 100).toString(),
    fixingDate: (referenceDate + 200).toString(),
    recordDate: (referenceDate + 300).toString(),
    executionDate: (referenceDate + 400).toString(),
    rate: 0,
    rateDecimals: 0,
    rateStatus: 0,
  };

  async function deploySecurityFixtureR() {
    const base = await deployBondKpiLinkedRateTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;

    proceedRecipientsFacet = await ethers.getContractAt(
      "ProceedRecipientsKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.address, signer_A);
    bondKpiLinkedRateFacet = await ethers.getContractAt(
      "BondUSAKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    scheduledTasksFacet = await ethers.getContractAt(
      "ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);

    await accessControlFacet.grantRole(ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE, signer_A.address);
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureR);
  });

  describe("Add Tests", () => {
    it("GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and pending tasks triggered", async () => {
      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);
      const tasks_count_Before = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      await timeTravelFacet.changeSystemTimestamp(couponData.fixingDate + 1);

      await proceedRecipientsFacet.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

      const tasks_count_After = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      expect(tasks_count_Before).to.equal(2);
      expect(tasks_count_After).to.equal(0);
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and pending tasks triggered", async () => {
      await proceedRecipientsFacet.addProceedRecipient(PROCEED_RECIPIENT_1, PROCEED_RECIPIENT_1_DATA);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);
      const tasks_count_Before = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      await timeTravelFacet.changeSystemTimestamp(couponData.fixingDate + 1);

      await proceedRecipientsFacet.removeProceedRecipient(PROCEED_RECIPIENT_1);

      const tasks_count_After = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      expect(tasks_count_Before).to.equal(2);
      expect(tasks_count_After).to.equal(0);
    });
  });
});
