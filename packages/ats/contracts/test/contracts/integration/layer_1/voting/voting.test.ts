// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type AccessControl,
  type Pause,
  Lock,
  type IERC1410,
  Kyc,
  SsiManagement,
  TimeTravelFacet,
  type VotingFacetTimeTravel,
} from "@contract-types";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, ATS_ROLES } from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

let votingRecordDateInSeconds = 0;

const voteData = "0x";
let votingData = {
  recordDate: votingRecordDateInSeconds.toString(),
  data: voteData,
};
const number_Of_Shares = 100000n;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Voting Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let votingFacet: VotingFacetTimeTravel;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;
  let lockFacet: Lock;
  let erc1410Facet: IERC1410;
  let timeTravelFacet: TimeTravelFacet;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    lockFacet = await ethers.getContractAt("Lock", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    votingFacet = await ethers.getContractAt("VotingFacetTimeTravel", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);

    const currentTimestamp = await timeTravelFacet.blockTimestamp();
    const ONE_DAY = 86400n;

    votingRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);

    votingData = {
      recordDate: votingRecordDateInSeconds.toString(),
      data: voteData,
    };
  });

  describe("Voting rights", () => {
    it("GIVEN voting with executed snapshot WHEN getting voting holders THEN returns holders from snapshot", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const [voting] = await votingFacet.getVoting(1);
      expect(voting.snapshotId).to.not.equal(0);

      const votingHolders = await votingFacet.getVotingHolders(1, 0, 99);
      expect([...votingHolders]).to.have.members([signer_A.address]);

      const totalHolders = await votingFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      expect(votingFor.tokenBalance).to.equal(1000n);
      expect(votingFor.recordDateReached).to.equal(true);
    });

    it("GIVEN voting without executed snapshot WHEN getting total voting holders THEN returns current total holders", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      const [voting] = await votingFacet.getVoting(1);
      expect(voting.snapshotId).to.equal(0);

      const totalHolders = await votingFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const holders = await votingFacet.getVotingHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      await expect(votingFacet.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      await expect(votingFacet.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidVotingData = {
        recordDate: (currentTimestamp - 100n).toString(),
        data: voteData,
      };

      await expect(votingFacet.connect(signer_C).setVoting(invalidVotingData)).to.be.revertedWithCustomError(
        votingFacet,
        "WrongTimestamp",
      );
    });

    it("GIVEN voting created WHEN trying to get voting with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      const ONE_DAY = 86400n;
      const dividendFacet = await ethers.getContractAt("DividendFacetTimeTravel", diamond.target, signer_A);
      await dividendFacet.connect(signer_C).setDividend({
        recordDate: (currentTimestamp + ONE_DAY).toString(),
        executionDate: (currentTimestamp + ONE_DAY + 1000n).toString(),
        amount: 10,
        amountDecimals: 1,
      });

      await expect(votingFacet.getVoting(2)).to.be.revertedWithCustomError(votingFacet, "WrongIndexForAction");

      await expect(votingFacet.getVotingFor(2, signer_A.address)).to.be.revertedWithCustomError(
        votingFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      const listCount = await votingFacet.getVotingCount();
      const [voting] = await votingFacet.getVoting(1);
      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await votingFacet.getTotalVotingHolders(1);
      const votingHolders = await votingFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(listCount).to.equal(1);
      expect(voting.snapshotId).to.equal(0);
      expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds);
      expect(voting.voting.data).to.equal(voteData);
      expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
      expect(votingFor.data).to.equal(voteData);
      expect(votingFor.tokenBalance).to.equal(0);
      expect(votingFor.recordDateReached).to.equal(false);
      expect(votingTotalHolder).to.equal(0);
      expect(votingHolders.length).to.equal(votingTotalHolder);
    });

    it("GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });
      await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);
      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await votingFacet.getTotalVotingHolders(1);
      const votingHolders = await votingFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(votingFor.tokenBalance).to.equal(TotalAmount);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingTotalHolder).to.equal(1);
      expect(votingHolders.length).to.equal(votingTotalHolder);
      expect([...votingHolders]).to.have.members([signer_A.address]);
    });
  });

  describe("Cancel Voting", () => {
    it("GIVEN an account without corporateActions role WHEN cancelVoting THEN transaction fails with AccountHasNoRole", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await votingFacet.connect(signer_B).setVoting(votingData);
      await expect(votingFacet.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN cancelVoting THEN transaction fails with TokenIsPaused", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await votingFacet.connect(signer_B).setVoting(votingData);
      await pauseFacet.connect(signer_B).pause();

      await expect(votingFacet.connect(signer_B).cancelVoting(1)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN a voting already recorded WHEN cancelVoting THEN transaction fails with VotingAlreadyRecorded", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      await expect(votingFacet.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
        votingFacet,
        "VotingAlreadyRecorded",
      );
    });

    it("GIVEN a voting not yet recorded WHEN cancelVoting THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      await expect(votingFacet.connect(signer_C).cancelVoting(1))
        .to.emit(votingFacet, "VotingCancelled")
        .withArgs(1, signer_C.address);
      const [, isDisabled] = await votingFacet.getVoting(1);
      expect(isDisabled).to.equal(true);
      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
    });

    it("GIVEN a non-existent voting WHEN cancelVoting THEN transaction fails", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(votingFacet.connect(signer_C).cancelVoting(999)).to.be.reverted;
    });

    it("GIVEN multiple votings WHEN cancelVoting on one THEN only that voting is cancelled", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      const secondVotingData = {
        recordDate: (votingRecordDateInSeconds + 10000).toString(),
        data: "0xAABBCC",
      };
      await votingFacet.connect(signer_C).setVoting(secondVotingData);

      await expect(votingFacet.connect(signer_C).cancelVoting(1))
        .to.emit(votingFacet, "VotingCancelled")
        .withArgs(1, signer_C.address);

      const [, isDisabled1] = await votingFacet.getVoting(1);
      expect(isDisabled1).to.equal(true);

      const [voting2, isDisabled2] = await votingFacet.getVoting(2);
      expect(isDisabled2).to.equal(false);
      expect(voting2.voting.recordDate).to.equal(votingRecordDateInSeconds + 10000);
    });
  });
});
