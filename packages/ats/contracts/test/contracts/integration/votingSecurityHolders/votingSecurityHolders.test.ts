// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO, EMPTY_STRING, RESOLVER_KEY_VOTING_SECURITY_HOLDERS } from "@scripts";
import { executeRbac, grantKycToHolders, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

const voteData = "0x";
const EMPTY_VC_ID = EMPTY_STRING;

export function votingSecurityHoldersTests(getCtx: () => AssetMockCtx): void {
  describe("VotingSecurityHoldersFacet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;
    let votingRecordDateInSeconds = 0;
    let votingData = { recordDate: "0", data: voteData };

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      unknownSigner = ctx.unknownSigner;

      asset = ctx.asset;
      await asset.setMultiPartition(true);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_B, [signer_A], signer_A.address);


      const currentTimestamp = await asset.blockTimestamp();
      const ONE_DAY = 86400n;
      votingRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);
      votingData = { recordDate: votingRecordDateInSeconds.toString(), data: voteData };
    });

    it("GIVEN voting with executed snapshot WHEN getting voting holders THEN returns holders from snapshot", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const [voting, isDisabled] = await asset.getVoting(1);
      expect(voting.snapshotId).to.not.equal(0);
      expect(isDisabled).to.equal(false);

      // Verify getVotingHolders returns holders from snapshot
      const votingHolders = await asset.getVotingHolders(1, 0, 99);
      expect([...votingHolders]).to.have.members([signer_A.address]);

      // Verify getTotalVotingHolders returns count from snapshot
      const totalHolders = await asset.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const votingFor = await asset.getVotingFor(1, signer_A.address);
      expect(votingFor.tokenBalance).to.equal(1000n);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingFor.isDisabled).to.be.false;
    });

    it("GIVEN voting without executed snapshot WHEN getting total voting holders THEN returns current total holders", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

      // Issue tokens before creating voting
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      // Create voting (schedules a snapshot for recordDate)
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // Travel to after recordDate BUT DON'T trigger any operation
      // This keeps snapshotId at 0
      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      // Verify snapshot was NOT executed (snapshotId == 0)
      const [voting, isDisabled] = await asset.getVoting(1);
      expect(voting.snapshotId).to.equal(0);
      expect(isDisabled).to.equal(false);

      // Get total voting holders using _getTotalTokenHolders
      const totalHolders = await asset.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      // Also verify getVotingHolders returns current holders
      const holders = await asset.getVotingHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    describe("initializeVotingSecurityHolders", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeVotingSecurityHolders THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeVotingSecurityHolders())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeVotingSecurityHolders THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeVotingSecurityHolders())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_VOTING_SECURITY_HOLDERS, 1);
      });
    });

    describe("initializeVotingSecurityHolders event", () => {
      it("GIVEN fresh facet WHEN initializeVotingSecurityHolders THEN emits VotingSecurityHoldersInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_VOTING_SECURITY_HOLDERS);
        await expect(asset.initializeVotingSecurityHolders()).to.emit(asset, "VotingSecurityHoldersInitialized");
      });
    });
  });
}
