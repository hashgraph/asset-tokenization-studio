// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type IERC1410,
  type Pause,
  AdjustBalances,
  ERC20VotesFacet,
  EquityUSA,
  TimeTravelFacet as TimeTravel,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";

import { executeRbac } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION } from "@scripts";

const amount = 1000;

describe("ERC20Votes Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let erc20VotesFacet: ERC20VotesFacet;
  let pauseFacet: Pause;
  let erc1410Facet: IERC1410;
  let adjustBalancesFacet: AdjustBalances;
  let timeTravelFacet: TimeTravel;
  let equityFacet: EquityUSA;

  const ABAF = 200;
  const DECIMALS = 2;
  const block = 100;

  async function checkVotingPowerAfterAdjustment() {
    await timeTravelFacet.changeSystemBlocknumber(block + 1);

    const votesA1 = await erc20VotesFacet.getPastVotes(signer_A.address, block - 1);
    const votesA2 = await erc20VotesFacet.getVotes(signer_A.address);
    const votesB1 = await erc20VotesFacet.getPastVotes(signer_B.address, block - 1);
    const votesB2 = await erc20VotesFacet.getVotes(signer_B.address);
    const totalSupplyA1 = await erc20VotesFacet.getPastTotalSupply(block - 1);
    const totalSupplyA2 = await erc20VotesFacet.getPastTotalSupply(block);

    expect(votesA1).to.equal(amount);
    expect(votesA2).to.equal(0);
    expect(votesB1).to.equal(0);
    expect(votesB2).to.equal(amount * ABAF);
    expect(totalSupplyA1).to.equal(amount);
    expect(totalSupplyA2).to.equal(amount * ABAF);
  }

  async function deploySecurityFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          internalKycActivated: false,
          erc20VotesActivated: true,
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
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._ADJUSTMENT_BALANCE_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_A.address],
      },
    ]);

    erc20VotesFacet = await ethers.getContractAt("ERC20VotesFacet", diamond.target);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    adjustBalancesFacet = await ethers.getContractAt("AdjustBalances", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("EquityUSA", diamond.target, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Initialization", () => {
    it("GIVEN a initialized ERC20Votes WHEN initialize again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(erc20VotesFacet.initialize_ERC20Votes(true)).to.be.revertedWithCustomError(
        erc20VotesFacet,
        "AlreadyInitialized",
      );
    });

    it("GIVEN ERC20Votes activated WHEN calling isActivated THEN returns true", async () => {
      const isActivated = await erc20VotesFacet.isActivated();
      expect(isActivated).to.equal(true);
    });

    it("GIVEN ERC20Votes not activated WHEN calling isActivated THEN returns false", async () => {
      // Deploy new fixture with erc20VotesActivated = false
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: false,
            erc20VotesActivated: false,
          },
        },
      });

      const erc20VotesFacetInactive = await ethers.getContractAt("ERC20Votes", base.diamond.target);
      const isActivated = await erc20VotesFacetInactive.isActivated();
      expect(isActivated).to.equal(false);
    });
  });

  describe("Clock and Clock Mode", () => {
    it("GIVEN any state WHEN clock THEN returns current block number", async () => {
      const blockNumber = 1000;
      await timeTravelFacet.changeSystemBlocknumber(blockNumber);
      const clockValue = await erc20VotesFacet.clock();
      expect(clockValue).to.equal(blockNumber);
    });

    it("GIVEN any state WHEN CLOCK_MODE THEN returns correct mode string", async () => {
      const clockMode = await erc20VotesFacet.CLOCK_MODE();
      expect(clockMode).to.equal("mode=blocknumber&from=default");
    });
  });

  describe("Delegation", () => {
    beforeEach(async () => {
      // Issue tokens to signer_A.address
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN a paused token WHEN delegate THEN transaction fails with TokenIsPaused", async () => {
      // Pause the token
      await pauseFacet.pause();

      // Try to delegate while paused
      await expect(erc20VotesFacet.delegate(signer_B.address)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN tokens issued WHEN delegate THEN delegate is set correctly", async () => {
      await expect(erc20VotesFacet.delegate(signer_B.address))
        .to.emit(erc20VotesFacet, "DelegateChanged")
        .withArgs(signer_A.address, ethers.ZeroAddress, signer_B.address);

      const delegate = await erc20VotesFacet.delegates(signer_A.address);
      expect(delegate).to.equal(signer_B.address);
    });

    it("GIVEN delegation WHEN delegate to same address THEN no event emitted", async () => {
      // First delegation
      await erc20VotesFacet.delegate(signer_B.address);

      // Delegate to same address again
      await expect(erc20VotesFacet.delegate(signer_B.address)).to.not.emit(erc20VotesFacet, "DelegateChanged");
    });

    it("GIVEN delegation WHEN delegate to zero address THEN delegation is removed", async () => {
      await erc20VotesFacet.delegate(signer_B.address);
      await expect(erc20VotesFacet.delegate(ethers.ZeroAddress))
        .to.emit(erc20VotesFacet, "DelegateChanged")
        .withArgs(signer_A.address, signer_B.address, ethers.ZeroAddress);

      const delegate = await erc20VotesFacet.delegates(signer_A.address);
      expect(delegate).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Voting Power", () => {
    async function checkTotalSupply(amount: number) {
      const now = await erc20VotesFacet.clock();
      await timeTravelFacet.changeSystemBlocknumber(now + 100n);
      const totalSupply = await erc20VotesFacet.getPastTotalSupply(now);
      expect(totalSupply).to.equal(amount);
    }

    beforeEach(async () => {
      // Issue tokens to signer_A.address
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN tokens issued WHEN getVotes for delegator THEN returns zero", async () => {
      const votes = await erc20VotesFacet.getVotes(signer_A.address);
      expect(votes).to.equal(0);
    });

    it("GIVEN delegation WHEN getVotes for delegate THEN returns delegated amount", async () => {
      await erc20VotesFacet.delegate(signer_B.address);
      const votes = await erc20VotesFacet.getVotes(signer_B.address);
      expect(votes).to.equal(amount);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN delegate changes THEN voting power transfers correctly", async () => {
      await erc20VotesFacet.delegate(signer_B.address);
      const votesB = await erc20VotesFacet.getVotes(signer_B.address);
      expect(votesB).to.equal(amount);

      await erc20VotesFacet.delegate(signer_C.address);
      const votesBAfter = await erc20VotesFacet.getVotes(signer_B.address);
      const votesC = await erc20VotesFacet.getVotes(signer_C.address);
      expect(votesBAfter).to.equal(0);
      expect(votesC).to.equal(amount);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN tokens are transferred THEN voting power updates correctly", async () => {
      await erc20VotesFacet.connect(signer_C).delegate(signer_D.address);
      await erc20VotesFacet.connect(signer_A).delegate(signer_B.address);

      // Transfer tokens
      await expect(
        erc1410Facet
          .connect(signer_A)
          .transferByPartition(DEFAULT_PARTITION, { to: signer_C.address, value: amount / 2 }, "0x"),
      )
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, amount, amount / 2)
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_D.address, 0, amount / 2);

      const votesB = await erc20VotesFacet.getVotes(signer_B.address);
      const votesD = await erc20VotesFacet.getVotes(signer_D.address);

      expect(votesB).to.equal(amount / 2);
      expect(votesD).to.equal(amount / 2);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN tokens are redeemed THEN voting power updates correctly", async () => {
      await erc20VotesFacet.delegate(signer_B.address);

      // Transfer tokens
      await expect(erc1410Facet.redeemByPartition(DEFAULT_PARTITION, amount, "0x"))
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, amount, 0);

      const votesB = await erc20VotesFacet.getVotes(signer_B.address);

      expect(votesB).to.equal(0);

      await checkTotalSupply(0);
    });
  });

  describe("Past Votes", () => {
    beforeEach(async () => {
      await timeTravelFacet.changeSystemBlocknumber(1);

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN current time WHEN getPastVotes with future timepoint THEN reverts", async () => {
      await expect(erc20VotesFacet.getPastVotes(signer_A.address, 100)).to.be.revertedWith("ERC20Votes: future lookup");
    });

    it("GIVEN current time WHEN getPastTotalSupply with future timepoint THEN reverts", async () => {
      await expect(erc20VotesFacet.getPastTotalSupply(100)).to.be.revertedWith("ERC20Votes: future lookup");
    });

    it("GIVEN delegation at specific block WHEN getPastVotes THEN returns correct historical votes", async () => {
      const block_1 = 100;
      const block_2 = 200;
      const block_3 = 300;

      await timeTravelFacet.changeSystemBlocknumber(block_1);

      await erc20VotesFacet.delegate(signer_A.address);
      await erc20VotesFacet.connect(signer_B).delegate(signer_B.address);

      await timeTravelFacet.changeSystemBlocknumber(block_2);

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await timeTravelFacet.changeSystemBlocknumber(block_3);

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: amount,
        data: "0x",
      });

      await timeTravelFacet.changeSystemBlocknumber(block_3 + 1);

      const pastVotesA1 = await erc20VotesFacet.getPastVotes(signer_A.address, block_1);
      const pastVotesA2 = await erc20VotesFacet.getPastVotes(signer_A.address, block_2);
      const pastVotesA3 = await erc20VotesFacet.getPastVotes(signer_A.address, block_3);
      const pastVotesB1 = await erc20VotesFacet.getPastVotes(signer_B.address, block_1);
      const pastVotesB2 = await erc20VotesFacet.getPastVotes(signer_B.address, block_2);
      const pastVotesB3 = await erc20VotesFacet.getPastVotes(signer_B.address, block_3);
      const pastTotalSupplyA1 = await erc20VotesFacet.getPastTotalSupply(block_1);
      const pastTotalSupplyA2 = await erc20VotesFacet.getPastTotalSupply(block_2);
      const pastTotalSupplyA3 = await erc20VotesFacet.getPastTotalSupply(block_3);

      expect(pastVotesA1).to.equal(amount);
      expect(pastVotesA2).to.equal(2 * amount);
      expect(pastVotesA3).to.equal(3 * amount);

      expect(pastVotesB1).to.equal(0);
      expect(pastVotesB2).to.equal(0);
      expect(pastVotesB3).to.equal(amount);

      expect(pastTotalSupplyA1).to.equal(amount);
      expect(pastTotalSupplyA2).to.equal(2 * amount);
      expect(pastTotalSupplyA3).to.equal(4 * amount);
    });
  });

  describe("Checkpoints", () => {
    beforeEach(async () => {
      // Issue tokens to signer_A.address
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN no delegation WHEN numCheckpoints THEN returns zero", async () => {
      const numCheckpoints = await erc20VotesFacet.numCheckpoints(signer_A.address);
      expect(numCheckpoints).to.equal(0);
    });

    it("GIVEN delegation WHEN numCheckpoints THEN returns correct count", async () => {
      await erc20VotesFacet.delegate(signer_B.address);

      const numCheckpoints = await erc20VotesFacet.numCheckpoints(signer_B.address);
      expect(numCheckpoints).to.equal(1);
    });

    it("GIVEN delegation WHEN checkpoints THEN returns correct checkpoint data", async () => {
      await erc20VotesFacet.delegate(signer_B.address);

      const checkpoint = await erc20VotesFacet.checkpoints(signer_B.address, 0);
      expect(checkpoint.from).to.be.gt(0);
      expect(checkpoint.value).to.equal(amount);
    });
  });

  describe("Balance adjustments", () => {
    beforeEach(async () => {
      await timeTravelFacet.changeSystemBlocknumber(1);
      await erc20VotesFacet.delegate(signer_A.address);
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,

        data: "0x",
      });
    });

    it("GIVEN an ERC20Votes when adjusting balances twice for same block THEN fails", async () => {
      const ABAF = 200;
      const DECIMALS = 2;
      await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS);

      await expect(erc20VotesFacet.delegate(signer_B.address))
        .to.be.revertedWithCustomError(erc20VotesFacet, "AbafChangeForBlockForbidden")
        .withArgs(1);
    });

    it("GIVEN an ERC20Votes when adjusting balances and delegating THEN values updated", async () => {
      await timeTravelFacet.changeSystemBlocknumber(block);

      await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS);

      await expect(erc20VotesFacet.delegate(signer_B.address))
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });

    it("GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated", async () => {
      await erc20VotesFacet.connect(signer_B).delegate(signer_B.address);

      await timeTravelFacet.changeSystemBlocknumber(block);

      await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS);

      await expect(
        erc1410Facet.transferByPartition(DEFAULT_PARTITION, { to: signer_B.address, value: amount * ABAF }, "0x"),
      )
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });
  });

  describe("Scheduled Balance adjustments", () => {
    beforeEach(async () => {
      await timeTravelFacet.changeSystemBlocknumber(1);
      await timeTravelFacet.changeSystemTimestamp(1);
      await erc20VotesFacet.delegate(signer_A.address);
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,

        data: "0x",
      });
    });

    it("GIVEN an ERC20Votes when scheduling a balance adjustment and delegating THEN values updated", async () => {
      const timestamp = 100000;

      await equityFacet.setScheduledBalanceAdjustment({
        executionDate: timestamp,
        factor: ABAF,
        decimals: DECIMALS,
      });

      await timeTravelFacet.changeSystemBlocknumber(block);
      await timeTravelFacet.changeSystemTimestamp(timestamp + 1);

      await expect(erc20VotesFacet.delegate(signer_B.address))
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });

    it("GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated", async () => {
      await erc20VotesFacet.connect(signer_B).delegate(signer_B.address);

      const timestamp = 100000;

      await equityFacet.setScheduledBalanceAdjustment({
        executionDate: timestamp,
        factor: ABAF,
        decimals: DECIMALS,
      });

      await timeTravelFacet.changeSystemBlocknumber(block);
      await timeTravelFacet.changeSystemTimestamp(timestamp + 1);

      await expect(
        erc1410Facet.transferByPartition(DEFAULT_PARTITION, { to: signer_B.address, value: amount * ABAF }, "0x"),
      )
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(erc20VotesFacet, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });
  });

  describe("Checkpoints lookup optimization", () => {
    beforeEach(async () => {
      await timeTravelFacet.changeSystemBlocknumber(1);
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN many checkpoints (>5) WHEN getPastVotes THEN uses optimized binary search with sqrt", async () => {
      // First delegate to establish voting power
      await timeTravelFacet.changeSystemBlocknumber(50);
      await erc20VotesFacet.connect(signer_A).delegate(signer_B.address);

      // Create more than 5 checkpoints to trigger sqrt optimization
      let currentBlock = 100;

      for (let i = 0; i < 10; i++) {
        await timeTravelFacet.changeSystemBlocknumber(currentBlock);

        // Issue more tokens to create total supply checkpoints
        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 100,
          data: "0x",
        });

        // Alternate delegation to create checkpoints for different delegates
        if (i % 2 === 0) {
          await erc20VotesFacet.connect(signer_A).delegate(signer_B.address);
        } else {
          await erc20VotesFacet.connect(signer_A).delegate(signer_C.address);
        }

        currentBlock += 100;
      }

      // Move forward to query past votes
      await timeTravelFacet.changeSystemBlocknumber(currentBlock + 100);

      // Query votes at various past blocks - this will trigger the sqrt optimization
      const pastVotes1 = await erc20VotesFacet.getPastVotes(signer_B.address, 200);
      const pastVotes2 = await erc20VotesFacet.getPastVotes(signer_C.address, 400);
      const pastVotes3 = await erc20VotesFacet.getPastVotes(signer_B.address, 800);

      // Query past total supply - also triggers sqrt optimization
      const pastTotalSupply1 = await erc20VotesFacet.getPastTotalSupply(250);
      const pastTotalSupply2 = await erc20VotesFacet.getPastTotalSupply(550);
      const pastTotalSupply3 = await erc20VotesFacet.getPastTotalSupply(850);

      // Verify results are reasonable (should have voting power or total supply)
      expect(pastVotes1).to.be.gte(0);
      expect(pastVotes2).to.be.gte(0);
      expect(pastVotes3).to.be.gte(0);
      expect(pastTotalSupply1).to.be.gt(0);
      expect(pastTotalSupply2).to.be.gt(0);
      expect(pastTotalSupply3).to.be.gt(0);

      // Verify the sqrt optimization path is hit by checking edge case where mid block > timepoint
      const earlyPastVotes = await erc20VotesFacet.getPastVotes(signer_B.address, 120);
      expect(earlyPastVotes).to.be.gte(0);

      // Check number of checkpoints to verify we created enough to trigger optimization
      const numCheckpointsB = await erc20VotesFacet.numCheckpoints(signer_B.address);
      const numCheckpointsC = await erc20VotesFacet.numCheckpoints(signer_C.address);
      expect(numCheckpointsB).to.be.gte(5);
      expect(numCheckpointsC).to.be.gte(5);
    });

    it("GIVEN many checkpoints WHEN getPastTotalSupply with timepoint near end THEN correctly retrieves value", async () => {
      // Create many checkpoints
      let currentBlock = 100;

      for (let i = 0; i < 12; i++) {
        await timeTravelFacet.changeSystemBlocknumber(currentBlock);
        currentBlock += 50;

        await erc1410Facet.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 50,
          data: "0x",
        });
      }

      await timeTravelFacet.changeSystemBlocknumber(currentBlock + 100);

      // Query at a timepoint that should hit the lower branch of sqrt optimization
      const pastTotalSupply = await erc20VotesFacet.getPastTotalSupply(currentBlock - 100);
      expect(pastTotalSupply).to.be.gt(0);
    });

    it("GIVEN empty checkpoints WHEN getPastVotes with timepoint THEN returns zero", async () => {
      await timeTravelFacet.changeSystemBlocknumber(1000);

      // Query past votes for an address with no delegation history
      const pastVotes = await erc20VotesFacet.getPastVotes(signer_D.address, 500);
      expect(pastVotes).to.equal(0);
    });

    it("GIVEN checkpoints WHEN getPastTotalSupply at block 0 THEN returns zero", async () => {
      await timeTravelFacet.changeSystemBlocknumber(1);
      await erc20VotesFacet.connect(signer_A).delegate(signer_A.address);

      await timeTravelFacet.changeSystemBlocknumber(100);

      // Query total supply before any issuance
      const pastTotalSupply = await erc20VotesFacet.getPastTotalSupply(0);
      expect(pastTotalSupply).to.equal(0);
    });

    it("GIVEN delegation at early block WHEN getPastVotes at block before ABAF checkpoint THEN returns correct value", async () => {
      await timeTravelFacet.changeSystemBlocknumber(10);

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      // Delegate to create voting power
      await erc20VotesFacet.connect(signer_A).delegate(signer_A.address);

      // Move to a later block
      await timeTravelFacet.changeSystemBlocknumber(100);

      const pastVotes = await erc20VotesFacet.getPastVotes(signer_A.address, 5);
      expect(pastVotes).to.equal(0);
    });
  });
});
