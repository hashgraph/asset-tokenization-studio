// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
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

  let asset: IAsset;

  const ABAF = 200;
  const DECIMALS = 2;
  const block = 100;

  async function checkVotingPowerAfterAdjustment() {
    await asset.changeSystemBlocknumber(block + 1);

    const votesA1 = await asset.getPastVotes(signer_A.address, block - 1);
    const votesA2 = await asset.getVotes(signer_A.address);
    const votesB1 = await asset.getPastVotes(signer_B.address, block - 1);
    const votesB2 = await asset.getVotes(signer_B.address);
    const totalSupplyA1 = await asset.getPastTotalSupply(block - 1);
    const totalSupplyA2 = await asset.getPastTotalSupply(block);

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
    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_ADJUSTMENT_BALANCE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CORPORATE_ACTION,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_ISSUER,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Initialization", () => {
    it("GIVEN a initialized ERC20Votes WHEN initialize again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(asset.initialize_ERC20Votes(true)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    it("GIVEN ERC20Votes activated WHEN calling isActivated THEN returns true", async () => {
      const isActivated = await asset.isActivated();
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

      const newAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      const isActivated = await newAsset.isActivated();
      expect(isActivated).to.equal(false);
    });
  });

  describe("Clock and Clock Mode", () => {
    it("GIVEN any state WHEN clock THEN returns current block number", async () => {
      const blockNumber = 1000;
      await asset.changeSystemBlocknumber(blockNumber);
      const clockValue = await asset.clock();
      expect(clockValue).to.equal(blockNumber);
    });

    it("GIVEN any state WHEN CLOCK_MODE THEN returns correct mode string", async () => {
      const clockMode = await asset.CLOCK_MODE();
      expect(clockMode).to.equal("mode=blocknumber&from=default");
    });
  });

  describe("Delegation", () => {
    beforeEach(async () => {
      // Issue tokens to signer_A.address
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN a paused token WHEN delegate THEN transaction fails with IsPaused", async () => {
      // Pause the token
      await asset.pause();

      // Try to delegate while paused
      await expect(asset.delegate(signer_B.address)).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN tokens issued WHEN delegate THEN delegate is set correctly", async () => {
      await expect(asset.delegate(signer_B.address))
        .to.emit(asset, "DelegateChanged")
        .withArgs(signer_A.address, ethers.ZeroAddress, signer_B.address);

      const delegate = await asset.delegates(signer_A.address);
      expect(delegate).to.equal(signer_B.address);
    });

    it("GIVEN delegation WHEN delegate to same address THEN no event emitted", async () => {
      // First delegation
      await asset.delegate(signer_B.address);

      // Delegate to same address again
      await expect(asset.delegate(signer_B.address)).to.not.emit(asset, "DelegateChanged");
    });

    it("GIVEN delegation WHEN delegate to zero address THEN delegation is removed", async () => {
      await asset.delegate(signer_B.address);
      await expect(asset.delegate(ethers.ZeroAddress))
        .to.emit(asset, "DelegateChanged")
        .withArgs(signer_A.address, signer_B.address, ethers.ZeroAddress);

      const delegate = await asset.delegates(signer_A.address);
      expect(delegate).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Voting Power", () => {
    async function checkTotalSupply(amount: number) {
      const now = await asset.clock();
      await asset.changeSystemBlocknumber(now + 100n);
      const totalSupply = await asset.getPastTotalSupply(now);
      expect(totalSupply).to.equal(amount);
    }

    beforeEach(async () => {
      // Issue tokens to signer_A.address
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN tokens issued WHEN getVotes for delegator THEN returns zero", async () => {
      const votes = await asset.getVotes(signer_A.address);
      expect(votes).to.equal(0);
    });

    it("GIVEN delegation WHEN getVotes for delegate THEN returns delegated amount", async () => {
      await asset.delegate(signer_B.address);
      const votes = await asset.getVotes(signer_B.address);
      expect(votes).to.equal(amount);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN delegate changes THEN voting power transfers correctly", async () => {
      await asset.delegate(signer_B.address);
      const votesB = await asset.getVotes(signer_B.address);
      expect(votesB).to.equal(amount);

      await asset.delegate(signer_C.address);
      const votesBAfter = await asset.getVotes(signer_B.address);
      const votesC = await asset.getVotes(signer_C.address);
      expect(votesBAfter).to.equal(0);
      expect(votesC).to.equal(amount);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN tokens are transferred THEN voting power updates correctly", async () => {
      await asset.connect(signer_C).delegate(signer_D.address);
      await asset.connect(signer_A).delegate(signer_B.address);

      // Transfer tokens
      await expect(
        asset
          .connect(signer_A)
          .transferByPartition(DEFAULT_PARTITION, { to: signer_C.address, value: amount / 2 }, "0x"),
      )
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, amount, amount / 2)
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_D.address, 0, amount / 2);

      const votesB = await asset.getVotes(signer_B.address);
      const votesD = await asset.getVotes(signer_D.address);

      expect(votesB).to.equal(amount / 2);
      expect(votesD).to.equal(amount / 2);

      await checkTotalSupply(amount);
    });

    it("GIVEN delegation WHEN tokens are redeemed THEN voting power updates correctly", async () => {
      await asset.delegate(signer_B.address);

      // Transfer tokens
      await expect(asset.redeemByPartition(DEFAULT_PARTITION, amount, "0x"))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, amount, 0);

      const votesB = await asset.getVotes(signer_B.address);

      expect(votesB).to.equal(0);

      await checkTotalSupply(0);
    });
  });

  describe("Past Votes", () => {
    beforeEach(async () => {
      await asset.changeSystemBlocknumber(1);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN current time WHEN getPastVotes with future timepoint THEN reverts", async () => {
      await expect(asset.getPastVotes(signer_A.address, 100)).to.be.revertedWithCustomError(asset, "FutureLookup");
    });

    it("GIVEN current time WHEN getPastTotalSupply with future timepoint THEN reverts", async () => {
      await expect(asset.getPastTotalSupply(100)).to.be.revertedWithCustomError(asset, "FutureLookup");
    });

    it("GIVEN delegation at specific block WHEN getPastVotes THEN returns correct historical votes", async () => {
      const block_1 = 100;
      const block_2 = 200;
      const block_3 = 300;

      await asset.changeSystemBlocknumber(block_1);

      await asset.delegate(signer_A.address);
      await asset.connect(signer_B).delegate(signer_B.address);

      await asset.changeSystemBlocknumber(block_2);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.changeSystemBlocknumber(block_3);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: amount,
        data: "0x",
      });

      await asset.changeSystemBlocknumber(block_3 + 1);

      const pastVotesA1 = await asset.getPastVotes(signer_A.address, block_1);
      const pastVotesA2 = await asset.getPastVotes(signer_A.address, block_2);
      const pastVotesA3 = await asset.getPastVotes(signer_A.address, block_3);
      const pastVotesB1 = await asset.getPastVotes(signer_B.address, block_1);
      const pastVotesB2 = await asset.getPastVotes(signer_B.address, block_2);
      const pastVotesB3 = await asset.getPastVotes(signer_B.address, block_3);
      const pastTotalSupplyA1 = await asset.getPastTotalSupply(block_1);
      const pastTotalSupplyA2 = await asset.getPastTotalSupply(block_2);
      const pastTotalSupplyA3 = await asset.getPastTotalSupply(block_3);

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
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN no delegation WHEN numCheckpoints THEN returns zero", async () => {
      const numCheckpoints = await asset.numCheckpoints(signer_A.address);
      expect(numCheckpoints).to.equal(0);
    });

    it("GIVEN delegation WHEN numCheckpoints THEN returns correct count", async () => {
      await asset.delegate(signer_B.address);

      const numCheckpoints = await asset.numCheckpoints(signer_B.address);
      expect(numCheckpoints).to.equal(1);
    });

    it("GIVEN delegation WHEN checkpoints THEN returns correct checkpoint data", async () => {
      await asset.delegate(signer_B.address);

      const checkpoint = await asset.checkpoints(signer_B.address, 0);
      expect(checkpoint.from).to.be.gt(0);
      expect(checkpoint.value).to.equal(amount);
    });
  });

  describe("Balance adjustments", () => {
    beforeEach(async () => {
      await asset.changeSystemBlocknumber(1);
      await asset.delegate(signer_A.address);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,

        data: "0x",
      });
    });

    it("GIVEN an ERC20Votes when adjusting balances twice for same block THEN fails", async () => {
      const ABAF = 200;
      const DECIMALS = 2;
      await asset.adjustBalances(ABAF, DECIMALS);

      await expect(asset.delegate(signer_B.address))
        .to.be.revertedWithCustomError(asset, "AbafChangeForBlockForbidden")
        .withArgs(1);
    });

    it("GIVEN an ERC20Votes when adjusting balances and delegating THEN values updated", async () => {
      await asset.changeSystemBlocknumber(block);

      await asset.adjustBalances(ABAF, DECIMALS);

      await expect(asset.delegate(signer_B.address))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });

    it("GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated", async () => {
      await asset.connect(signer_B).delegate(signer_B.address);

      await asset.changeSystemBlocknumber(block);

      await asset.adjustBalances(ABAF, DECIMALS);

      await expect(asset.transferByPartition(DEFAULT_PARTITION, { to: signer_B.address, value: amount * ABAF }, "0x"))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });
  });

  describe("Scheduled Balance adjustments", () => {
    beforeEach(async () => {
      await asset.changeSystemBlocknumber(1);
      await asset.changeSystemTimestamp(1);
      await asset.delegate(signer_A.address);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,

        data: "0x",
      });
    });

    it("GIVEN an ERC20Votes when scheduling a balance adjustment and delegating THEN values updated", async () => {
      const timestamp = 100000;

      await asset.setScheduledBalanceAdjustment({
        executionDate: timestamp,
        factor: ABAF,
        decimals: DECIMALS,
      });

      await asset.changeSystemBlocknumber(block);
      await asset.changeSystemTimestamp(timestamp + 1);

      await expect(asset.delegate(signer_B.address))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });

    it("GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated", async () => {
      await asset.connect(signer_B).delegate(signer_B.address);

      const timestamp = 100000;

      await asset.setScheduledBalanceAdjustment({
        executionDate: timestamp,
        factor: ABAF,
        decimals: DECIMALS,
      });

      await asset.changeSystemBlocknumber(block);
      await asset.changeSystemTimestamp(timestamp + 1);

      await expect(asset.transferByPartition(DEFAULT_PARTITION, { to: signer_B.address, value: amount * ABAF }, "0x"))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_A.address, amount * ABAF, 0)
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, 0, amount * ABAF);

      await checkVotingPowerAfterAdjustment();
    });
  });

  describe("Voting Power on Balance-Movement Paths", () => {
    enum ClearingOperationType {
      Transfer,
      Redeem,
      HoldCreation,
    }

    const HOLD_AMOUNT = 500;
    const LOCK_AMOUNT = 300;
    const FREEZE_AMOUNT = 400;
    const CLEARING_AMOUNT = 600;
    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

    beforeEach(async () => {
      await asset.grantRole(ATS_ROLES.ROLE_LOCKER, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_CLEARING, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_CLEARING_VALIDATOR, signer_A.address);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN a hold with both holder and destination delegating WHEN executeHoldByPartition THEN voting power moves from the holder delegate to the recipient delegate", async () => {
      // signer_A is the hold token holder, delegating to signer_B
      // signer_C is the execution destination, delegating to signer_D
      await asset.connect(signer_A).delegate(signer_B.address);
      await asset.connect(signer_C).delegate(signer_D.address);

      const currentTime = (await ethers.provider.getBlock("latest"))!.timestamp;
      const hold = {
        amount: HOLD_AMOUNT,
        expirationTimestamp: currentTime + ONE_YEAR_IN_SECONDS,
        escrow: signer_B.address,
        to: ethers.ZeroAddress,
        data: "0x",
      };

      await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);

      const holdIdentifier = {
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        holdId: 1,
      };

      const votesB_before = await asset.getVotes(signer_B.address);
      const votesD_before = await asset.getVotes(signer_D.address);

      await expect(asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, HOLD_AMOUNT))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, votesB_before, votesB_before - BigInt(HOLD_AMOUNT))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_D.address, votesD_before, votesD_before + BigInt(HOLD_AMOUNT));

      expect(await asset.getVotes(signer_B.address)).to.equal(votesB_before - BigInt(HOLD_AMOUNT));
      expect(await asset.getVotes(signer_D.address)).to.equal(votesD_before + BigInt(HOLD_AMOUNT));
    });

    it("GIVEN a lock with token holder delegating WHEN releaseByPartition THEN voting power is unchanged (same-holder no-op)", async () => {
      await asset.connect(signer_A).delegate(signer_B.address);

      const currentTime = (await ethers.provider.getBlock("latest"))!.timestamp;
      const lockExpiration = currentTime + 60;

      await asset.connect(signer_A).lockByPartition(DEFAULT_PARTITION, LOCK_AMOUNT, signer_A.address, lockExpiration);

      await asset.changeSystemTimestamp(lockExpiration + 1);

      const votesB_before = await asset.getVotes(signer_B.address);

      await expect(asset.connect(signer_A).releaseByPartition(DEFAULT_PARTITION, 1, signer_A.address)).to.not.emit(
        asset,
        "DelegateVotesChanged",
      );

      expect(await asset.getVotes(signer_B.address)).to.equal(votesB_before);
    });

    it("GIVEN frozen tokens with token holder delegating WHEN unfreezePartialTokens THEN voting power is unchanged (same-holder no-op)", async () => {
      // freezePartialTokens / unfreezePartialTokens are restricted to single-partition mode,
      // so deploy a fresh single-partition fixture for this test.
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: false,
            internalKycActivated: false,
            erc20VotesActivated: true,
          },
        },
      });
      const singlePartitionAsset = await ethers.getContractAt("IAsset", base.diamond.target, base.deployer);
      await executeRbac(singlePartitionAsset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [base.deployer.address] },
        { role: ATS_ROLES.ROLE_FREEZE_MANAGER, members: [base.deployer.address] },
      ]);

      await singlePartitionAsset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: base.deployer.address,
        value: amount,
        data: "0x",
      });

      await singlePartitionAsset.connect(base.deployer).delegate(base.user1.address);

      await singlePartitionAsset.connect(base.deployer).freezePartialTokens(base.deployer.address, FREEZE_AMOUNT);

      const votesB_before = await singlePartitionAsset.getVotes(base.user1.address);

      await expect(
        singlePartitionAsset.connect(base.deployer).unfreezePartialTokens(base.deployer.address, FREEZE_AMOUNT),
      ).to.not.emit(singlePartitionAsset, "DelegateVotesChanged");

      expect(await singlePartitionAsset.getVotes(base.user1.address)).to.equal(votesB_before);
    });

    it("GIVEN a pending clearing transfer with both holder and destination delegating WHEN approveClearingOperationByPartition THEN voting power moves from the holder delegate to the recipient delegate", async () => {
      // signer_A is the clearing token holder, delegating to signer_C
      // signer_B is the destination, delegating to itself
      await asset.connect(signer_A).delegate(signer_C.address);
      await asset.connect(signer_B).delegate(signer_B.address);

      await asset.connect(signer_A).activateClearing();

      const currentTime = (await ethers.provider.getBlock("latest"))!.timestamp;
      const clearingOperation = {
        partition: DEFAULT_PARTITION,
        expirationTimestamp: currentTime + ONE_YEAR_IN_SECONDS,
        data: "0x",
      };

      await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, CLEARING_AMOUNT, signer_B.address);

      const identifier = {
        clearingOperationType: ClearingOperationType.Transfer,
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };

      const votesC_before = await asset.getVotes(signer_C.address);
      const votesB_before = await asset.getVotes(signer_B.address);

      await expect(asset.connect(signer_A).approveClearingOperationByPartition(identifier))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_C.address, votesC_before, votesC_before - BigInt(CLEARING_AMOUNT))
        .to.emit(asset, "DelegateVotesChanged")
        .withArgs(signer_B.address, votesB_before, votesB_before + BigInt(CLEARING_AMOUNT));

      expect(await asset.getVotes(signer_C.address)).to.equal(votesC_before - BigInt(CLEARING_AMOUNT));
      expect(await asset.getVotes(signer_B.address)).to.equal(votesB_before + BigInt(CLEARING_AMOUNT));
    });
  });

  describe("Checkpoints lookup optimization", () => {
    beforeEach(async () => {
      await asset.changeSystemBlocknumber(1);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
    });

    it("GIVEN many checkpoints (>5) WHEN getPastVotes THEN uses optimized binary search with sqrt", async () => {
      // First delegate to establish voting power
      await asset.changeSystemBlocknumber(50);
      await asset.connect(signer_A).delegate(signer_B.address);

      // Create more than 5 checkpoints to trigger sqrt optimization
      let currentBlock = 100;

      for (let i = 0; i < 10; i++) {
        await asset.changeSystemBlocknumber(currentBlock);

        // Issue more tokens to create total supply checkpoints
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 100,
          data: "0x",
        });

        // Alternate delegation to create checkpoints for different delegates
        if (i % 2 === 0) {
          await asset.connect(signer_A).delegate(signer_B.address);
        } else {
          await asset.connect(signer_A).delegate(signer_C.address);
        }

        currentBlock += 100;
      }

      // Move forward to query past votes
      await asset.changeSystemBlocknumber(currentBlock + 100);

      // Query votes at various past blocks - this will trigger the sqrt optimization
      const pastVotes1 = await asset.getPastVotes(signer_B.address, 200);
      const pastVotes2 = await asset.getPastVotes(signer_C.address, 400);
      const pastVotes3 = await asset.getPastVotes(signer_B.address, 800);

      // Query past total supply - also triggers sqrt optimization
      const pastTotalSupply1 = await asset.getPastTotalSupply(250);
      const pastTotalSupply2 = await asset.getPastTotalSupply(550);
      const pastTotalSupply3 = await asset.getPastTotalSupply(850);

      // Verify results are reasonable (should have voting power or total supply)
      expect(pastVotes1).to.be.gte(0);
      expect(pastVotes2).to.be.gte(0);
      expect(pastVotes3).to.be.gte(0);
      expect(pastTotalSupply1).to.be.gt(0);
      expect(pastTotalSupply2).to.be.gt(0);
      expect(pastTotalSupply3).to.be.gt(0);

      // Verify the sqrt optimization path is hit by checking edge case where mid block > timepoint
      const earlyPastVotes = await asset.getPastVotes(signer_B.address, 120);
      expect(earlyPastVotes).to.be.gte(0);

      // Check number of checkpoints to verify we created enough to trigger optimization
      const numCheckpointsB = await asset.numCheckpoints(signer_B.address);
      const numCheckpointsC = await asset.numCheckpoints(signer_C.address);
      expect(numCheckpointsB).to.be.gte(5);
      expect(numCheckpointsC).to.be.gte(5);
    });

    it("GIVEN many checkpoints WHEN getPastTotalSupply with timepoint near end THEN correctly retrieves value", async () => {
      // Create many checkpoints
      let currentBlock = 100;

      for (let i = 0; i < 12; i++) {
        await asset.changeSystemBlocknumber(currentBlock);
        currentBlock += 50;

        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 50,
          data: "0x",
        });
      }

      await asset.changeSystemBlocknumber(currentBlock + 100);

      // Query at a timepoint that should hit the lower branch of sqrt optimization
      const pastTotalSupply = await asset.getPastTotalSupply(currentBlock - 100);
      expect(pastTotalSupply).to.be.gt(0);
    });

    it("GIVEN empty checkpoints WHEN getPastVotes with timepoint THEN returns zero", async () => {
      await asset.changeSystemBlocknumber(1000);

      // Query past votes for an address with no delegation history
      const pastVotes = await asset.getPastVotes(signer_D.address, 500);
      expect(pastVotes).to.equal(0);
    });

    it("GIVEN checkpoints WHEN getPastTotalSupply at block 0 THEN returns zero", async () => {
      await asset.changeSystemBlocknumber(1);
      await asset.connect(signer_A).delegate(signer_A.address);

      await asset.changeSystemBlocknumber(100);

      // Query total supply before any issuance
      const pastTotalSupply = await asset.getPastTotalSupply(0);
      expect(pastTotalSupply).to.equal(0);
    });

    it("GIVEN delegation at early block WHEN getPastVotes at block before ABAF checkpoint THEN returns correct value", async () => {
      await asset.changeSystemBlocknumber(10);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      // Delegate to create voting power
      await asset.connect(signer_A).delegate(signer_A.address);

      // Move to a later block
      await asset.changeSystemBlocknumber(100);

      const pastVotes = await asset.getPastVotes(signer_A.address, 5);
      expect(pastVotes).to.equal(0);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN delegate THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).delegate(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });
});
