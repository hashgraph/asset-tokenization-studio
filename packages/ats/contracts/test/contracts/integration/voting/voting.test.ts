import { IAssetMock } from "@contract-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ATS_ROLES, DEFAULT_PARTITION, RESOLVER_KEYS } from "@scripts";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";
import { executeRbac, grantKycToHolders, grantRoleAndPauseToken } from "@test";
import { expect } from "chai";
import type { AssetMockCtx } from "@test";

const voteData = "0x";
let votingRecordDateInSeconds = 0n;

let votingData = {
  recordDate: votingRecordDateInSeconds.toString(),
  data: voteData,
};
let dividendData = {
  recordDate: "0",
  executionDate: "0",
  amount: 10,
  amountDecimals: 1,
};

export function votingTests(getCtx: () => AssetMockCtx): void {
  describe("Voting rights", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_B, [signer_A], signer_A.address);

      const blockTimestamp = await asset.blockTimestamp();
      votingRecordDateInSeconds = blockTimestamp + 1000n;
      votingData = { recordDate: votingRecordDateInSeconds.toString(), data: voteData };
      dividendData = {
        recordDate: (blockTimestamp + 2000n).toString(),
        executionDate: (blockTimestamp + 3000n).toString(),
        amount: 10,
        amountDecimals: 1,
      };
    });

    describe("initializeVoting", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeVoting is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeVoting()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
      it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
        // set voting fails
        await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with IsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A, signer_B, signer_C.address);

      // set voting fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setVoting with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await asset.blockTimestamp();
      await asset.changeSystemTimestamp(currentTimestamp + 100n);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      const invalidVotingData = {
        recordDate: (currentTimestamp - 100n).toString(), // Past timestamp
        data: voteData,
      };

      await expect(asset.connect(signer_C).setVoting(invalidVotingData)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN voting created WHEN trying to get voting with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      // Create a voting
      await asset.connect(signer_C).setVoting(votingData);

      // Create a dividend to have different action types
      await asset.connect(signer_C).setDividend(dividendData);

      // Try to access voting with dividend ID (should fail)
      await expect(asset.getVoting(2)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

      // Try to access voting details with wrong ID (getVotingFor has the modifier)
      await expect(asset.getVotingFor(2, signer_A.address)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

      // Note: getVotingHolders and getTotalVotingHolders don't have onlyMatchingActionType modifier
    });

    it("GIVEN dividends created WHEN trying to get dividend with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      // Create a dividend
      await asset.connect(signer_C).setDividend(dividendData);

      // Create a voting to have different action types
      await asset.connect(signer_C).setVoting(votingData);

      // Try to access dividend with voting ID (should fail)
      await expect(asset.getDividend(2)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      await expect(asset.getDividendFor(2, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
      await expect(asset.getDividendAmountFor(2, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });
    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with IsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A, signer_B, signer_C.address);

      // set dividend fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN a duplicate voting WHEN setVoting THEN transaction fails with VotingRightsCreationFailed", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      await asset.connect(signer_C).setVoting(votingData);

      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        asset,
        "VotingRightsCreationFailed",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      // set dividend
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // check list members
      // await expect(asset.getVoting(1000)).to.be.revertedWithCustomError(asset,
      //     'WrongIndexForAction'
      // )

      const listCount = await asset.getVotingCount();
      const [voting, isDisabled] = await asset.getVoting(1);
      const votingFor = await asset.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await asset.getTotalVotingHolders(1);
      const votingHolders = await asset.getVotingHolders(1, 0, votingTotalHolder);

      expect(listCount).to.equal(1);
      expect(voting.snapshotId).to.equal(0);
      expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds);
      expect(voting.voting.data).to.equal(voteData);
      expect(isDisabled).to.equal(false);
      expect(votingFor.tokenBalance).to.equal(0);
      expect(votingFor.recordDateReached).to.equal(false);
      expect(votingFor.isDisabled).to.be.false;
      expect(votingTotalHolder).to.equal(0);
      expect(votingHolders.length).to.equal(votingTotalHolder);
    });

    it("GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

      // issue and lock
      const TotalAmount = 100000n;
      const LockedAmount = TotalAmount - 5n;

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });
      await asset.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      // set dividend
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1n);
      const votingFor = await asset.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await asset.getTotalVotingHolders(1);
      const votingHolders = await asset.getVotingHolders(1, 0, votingTotalHolder);

      expect(votingFor.tokenBalance).to.equal(TotalAmount);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingFor.isDisabled).to.be.false;
      expect(votingTotalHolder).to.equal(1);
      expect(votingHolders.length).to.equal(votingTotalHolder);
      expect([...votingHolders]).to.have.members([signer_A.address]);
    });

    describe("Cancel Voting", () => {
      it("GIVEN an account without corporateActions role WHEN cancelVoting THEN transaction fails with AccountHasNoRole", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_B.address);
        await asset.connect(signer_B).setVoting(votingData);
        await expect(asset.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN a paused Token WHEN cancelVoting THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_B.address);
        await asset.connect(signer_B).setVoting(votingData);
        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).cancelVoting(1)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a voting already recorded WHEN cancelVoting THEN transaction fails with VotingAlreadyRecorded", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1n);

        await expect(asset.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
          asset,
          "VotingAlreadyRecorded",
        );
      });

      it("GIVEN a voting not yet recorded WHEN cancelVoting THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await expect(asset.connect(signer_C).cancelVoting(1))
          .to.emit(asset, "VotingCancelled")
          .withArgs(1, signer_C.address);
        expect((await asset.getVoting(1)).isDisabled_).to.equal(true);
        const votingFor = await asset.getVotingFor(1, signer_A.address);
        expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
        expect(votingFor.isDisabled).to.be.true;
      });

      it("GIVEN a non-existent voting WHEN cancelVoting THEN transaction fails", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        await expect(asset.connect(signer_C).cancelVoting(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN multiple votings WHEN cancelVoting on one THEN only that voting is cancelled", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        const secondVotingData = {
          recordDate: (votingRecordDateInSeconds + 10000n).toString(),
          data: "0xAABBCC",
        };
        await asset.connect(signer_C).setVoting(secondVotingData);

        await expect(asset.connect(signer_C).cancelVoting(1))
          .to.emit(asset, "VotingCancelled")
          .withArgs(1, signer_C.address);

        const [, isDisabled1] = await asset.getVoting(1);
        expect(isDisabled1).to.equal(true);

        const [voting2, isDisabled2] = await asset.getVoting(2);
        expect(isDisabled2).to.equal(false);
        expect(voting2.voting.recordDate).to.equal(votingRecordDateInSeconds + 10000n);
      });
    });

    describe("Force Cancel Voting", () => {
      it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelVoting before record date THEN transaction succeeds and isDisabled is true", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await expect(asset.connect(signer_C).forceCancelVoting(1))
          .to.emit(asset, "VotingForceCancelled")
          .withArgs(1, signer_C.address);
        expect((await asset.getVoting(1)).isDisabled_).to.equal(true);
      });

      it("GIVEN account with ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelVoting after record date THEN transaction succeeds bypassing date guard", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1n);

        await expect(asset.connect(signer_C).forceCancelVoting(1))
          .to.emit(asset, "VotingForceCancelled")
          .withArgs(1, signer_C.address);
        expect((await asset.getVoting(1)).isDisabled_).to.equal(true);
      });

      it("GIVEN account without ROLE_CORPORATE_ACTION_FORCE_CANCEL WHEN forceCancelVoting THEN transaction fails with AccountHasNoRole", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_B.address);

        await asset.connect(signer_B).setVoting(votingData);

        await expect(asset.connect(signer_C).forceCancelVoting(1)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN paused token WHEN forceCancelVoting THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_B.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_B.address);

        await asset.connect(signer_B).setVoting(votingData);

        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).forceCancelVoting(1)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN no existing voting WHEN forceCancelVoting with invalid ID THEN transaction fails with WrongIndexForAction", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION_FORCE_CANCEL, signer_C.address);

        await expect(asset.connect(signer_C).forceCancelVoting(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });
    });

    describe("initializeVoting", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeVoting is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeVoting())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeVoting is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeVoting())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.voting, 1);
      });
    });

    describe("initializeVoting event", () => {
      it("GIVEN a fresh deployment WHEN initializeVoting is called THEN emits VotingInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.voting);
        await expect(asset.initializeVoting()).to.emit(asset, "VotingInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN setVoting is called THEN AssetNotOperational", async () => {
        await expect(asset.setVoting(votingData))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN cancelVoting is called THEN AssetNotOperational", async () => {
        await expect(asset.cancelVoting(1n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN forceCancelVoting is called THEN AssetNotOperational", async () => {
        await expect(asset.forceCancelVoting(1n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setVoting THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).setVoting({ recordDate: 0, data: "0x" })).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN cancelVoting THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).cancelVoting(0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN forceCancelVoting THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).forceCancelVoting(0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });
  });
}
