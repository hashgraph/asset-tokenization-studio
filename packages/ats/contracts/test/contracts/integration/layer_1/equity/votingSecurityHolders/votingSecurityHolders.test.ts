// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO, EMPTY_STRING } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const voteData = "0x";
const EMPTY_VC_ID = EMPTY_STRING;

describe("VotingSecurityHoldersFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let votingRecordDateInSeconds = 0;
  let votingData = { recordDate: "0", data: voteData };

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);

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
});
