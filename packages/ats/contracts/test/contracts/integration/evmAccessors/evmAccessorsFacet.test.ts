// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { EvmAccessorsFacet__factory } from "@contract-types";
import { deployEquityTokenFixture, executeRbac, EVENT_NAMES, MAX_UINT256, TEST_AMOUNTS, TEST_ADDRESSES } from "@test";
import { dateToUnixTimestamp, ATS_ROLES, ZERO, EMPTY_STRING, DEFAULT_PARTITION, TIME_PERIODS_S } from "@scripts";
import { Rbac } from "@scripts/domain";

/**
 * Behaviour tests for the test-only EvmAccessorsFacet.
 *
 * The facet is only registered on the diamond when the suite is compiled with
 * ATS_TEST_MODE=true (the default for the `test`/`coverage` Hardhat tasks). It
 * lets tests override the three deterministic native values — block.timestamp,
 * block.number, block.chainid — that the EvmAccessors library reads in test mode.
 *
 * Where the value is observable on-chain we assert the override actually takes
 * effect: `blockTimestamp()` reads back the timestamp, and `checkBlockChainId`
 * reverts/passes against the configured chain id. block.number has no read-back
 * entrypoint on the facet, so its writers are verified through their events and
 * zero-guard.
 */
describe("EvmAccessorsFacet (test-mode overrides)", () => {
  // A fixed far-future instant and a chain id distinct from any local network.
  const OVERRIDE_TIMESTAMP = dateToUnixTimestamp("2030-01-01T00:00:00Z");
  const OVERRIDE_BLOCK_NUMBER = 1_000_000n;
  const OVERRIDE_CHAIN_ID = 424242n;
  const UNSET_OVERRIDE = 0n;

  async function deployEvmAccessorsFixture() {
    const base = await deployEquityTokenFixture();
    const evmAccessors = EvmAccessorsFacet__factory.connect(base.diamond.target as string, base.deployer);
    const networkChainId = (await ethers.provider.getNetwork()).chainId;
    return { evmAccessors, networkChainId };
  }

  describe("block.timestamp override", () => {
    it("GIVEN a new system timestamp THEN it is emitted and read back", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemTimestamp(OVERRIDE_TIMESTAMP))
        .to.emit(evmAccessors, EVENT_NAMES.SYSTEM_TIMESTAMP_CHANGED)
        .withArgs(UNSET_OVERRIDE, OVERRIDE_TIMESTAMP);
      expect(await evmAccessors.blockTimestamp()).to.equal(OVERRIDE_TIMESTAMP);
    });

    it("GIVEN a zero timestamp THEN it reverts with InvalidTimestamp", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemTimestamp(0)).to.be.revertedWithCustomError(
        evmAccessors,
        "InvalidTimestamp",
      );
    });

    it("GIVEN a reset THEN it emits and falls back to the network timestamp", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);
      await evmAccessors.changeSystemTimestamp(OVERRIDE_TIMESTAMP);

      await expect(evmAccessors.resetSystemTimestamp()).to.emit(evmAccessors, EVENT_NAMES.SYSTEM_TIMESTAMP_RESET);

      const latestBlock = await ethers.provider.getBlock("latest");
      expect(await evmAccessors.blockTimestamp()).to.equal(latestBlock!.timestamp);
    });
  });

  describe("block.number override", () => {
    it("GIVEN a new system block number THEN it is emitted", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemBlockNumber(OVERRIDE_BLOCK_NUMBER))
        .to.emit(evmAccessors, EVENT_NAMES.SYSTEM_BLOCK_NUMBER_CHANGED)
        .withArgs(UNSET_OVERRIDE, OVERRIDE_BLOCK_NUMBER);
    });

    it("GIVEN a zero block number THEN it reverts with InvalidBlockNumber", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemBlockNumber(0))
        .to.be.revertedWithCustomError(evmAccessors, "InvalidBlockNumber")
        .withArgs(0);
    });

    it("GIVEN a reset THEN it emits SystemBlockNumberReset", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);
      await evmAccessors.changeSystemBlockNumber(OVERRIDE_BLOCK_NUMBER);

      await expect(evmAccessors.resetSystemBlockNumber()).to.emit(evmAccessors, EVENT_NAMES.SYSTEM_BLOCK_NUMBER_RESET);
    });
  });

  describe("block.chainid override", () => {
    it("GIVEN no override THEN checkBlockChainId matches the live network and rejects others", async () => {
      const { evmAccessors, networkChainId } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.checkBlockChainId(networkChainId)).to.not.be.reverted;
      await expect(evmAccessors.checkBlockChainId(networkChainId + 1n)).to.be.revertedWithCustomError(
        evmAccessors,
        "WrongChainId",
      );
    });

    it("GIVEN a new system chain id THEN it is emitted and observed by checkBlockChainId", async () => {
      const { evmAccessors, networkChainId } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemChainId(OVERRIDE_CHAIN_ID))
        .to.emit(evmAccessors, EVENT_NAMES.SYSTEM_CHAIN_ID_CHANGED)
        .withArgs(UNSET_OVERRIDE, OVERRIDE_CHAIN_ID);

      await expect(evmAccessors.checkBlockChainId(OVERRIDE_CHAIN_ID)).to.not.be.reverted;
      await expect(evmAccessors.checkBlockChainId(networkChainId)).to.be.revertedWithCustomError(
        evmAccessors,
        "WrongChainId",
      );
    });

    it("GIVEN a zero chain id THEN it reverts with InvalidChainId", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemChainId(0))
        .to.be.revertedWithCustomError(evmAccessors, "InvalidChainId")
        .withArgs(0);
    });

    it("GIVEN a reset THEN it emits and falls back to the live network chain id", async () => {
      const { evmAccessors, networkChainId } = await loadFixture(deployEvmAccessorsFixture);
      await evmAccessors.changeSystemChainId(OVERRIDE_CHAIN_ID);

      await expect(evmAccessors.resetSystemChainId()).to.emit(evmAccessors, EVENT_NAMES.SYSTEM_CHAIN_ID_RESET);
      await expect(evmAccessors.checkBlockChainId(networkChainId)).to.not.be.reverted;
    });
  });

  describe("msg.sender override", () => {
    const OVERRIDE_SENDER = TEST_ADDRESSES.VALID_0;

    it("GIVEN a new system sender THEN it is emitted", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemSender(OVERRIDE_SENDER))
        .to.emit(evmAccessors, EVENT_NAMES.SYSTEM_SENDER_CHANGED)
        .withArgs(ethers.ZeroAddress, OVERRIDE_SENDER);
    });

    it("GIVEN the zero address THEN it reverts with InvalidSender", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);

      await expect(evmAccessors.changeSystemSender(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(evmAccessors, "InvalidSender")
        .withArgs(ethers.ZeroAddress);
    });

    it("GIVEN a reset THEN it emits SystemSenderReset", async () => {
      const { evmAccessors } = await loadFixture(deployEvmAccessorsFixture);
      await evmAccessors.changeSystemSender(OVERRIDE_SENDER);

      await expect(evmAccessors.resetSystemSender()).to.emit(evmAccessors, EVENT_NAMES.SYSTEM_SENDER_RESET);
    });
  });

  describe("multiple overrides coexist independently (P2.4)", () => {
    it("GIVEN timestamp, block number, chain id and sender overrides THEN none clobbers another", async () => {
      const { evmAccessors, networkChainId } = await loadFixture(deployEvmAccessorsFixture);

      await evmAccessors.changeSystemTimestamp(OVERRIDE_TIMESTAMP);
      await evmAccessors.changeSystemBlockNumber(OVERRIDE_BLOCK_NUMBER);
      await evmAccessors.changeSystemChainId(OVERRIDE_CHAIN_ID);
      // The sender override is an address field (R2); writing it must not alias the
      // uint256 fields (R3) that hold timestamp/blockNumber/chainid.
      await evmAccessors.changeSystemSender(TEST_ADDRESSES.VALID_0);

      // All observable overrides still hold simultaneously.
      expect(await evmAccessors.blockTimestamp()).to.equal(OVERRIDE_TIMESTAMP);
      await expect(evmAccessors.checkBlockChainId(OVERRIDE_CHAIN_ID)).to.not.be.reverted;

      // Resetting one override leaves the others intact.
      await evmAccessors.resetSystemChainId();
      expect(await evmAccessors.blockTimestamp()).to.equal(OVERRIDE_TIMESTAMP);
      await expect(evmAccessors.checkBlockChainId(networkChainId)).to.not.be.reverted;
      await expect(evmAccessors.checkBlockChainId(OVERRIDE_CHAIN_ID)).to.be.revertedWithCustomError(
        evmAccessors,
        "WrongChainId",
      );
    });
  });

  describe("override observed by a real domain facet — Lock release gate (P1.1)", () => {
    // The migrated time-dependent suites (maturity, coupon, lock, …) already exercise
    // this link broadly; this is the explicit, named guard. It proves an override
    // written through EvmAccessorsFacet is read by a DIFFERENT facet: LockStorageWrapper
    // gates `release` on `expirationTimestamp <= getBlockTimestamp()`, so the override
    // flips release from revert to success with no real time passing.
    const LOCK_AMOUNT = TEST_AMOUNTS.MEDIUM;

    async function deployLockScenarioFixture() {
      const base = await deployEquityTokenFixture();
      const admin = base.deployer; // ROLE_SSI_MANAGER + DEFAULT_ADMIN + KYC'd holder
      const issuer = base.user1; // ROLE_ISSUER + ROLE_KYC
      const locker = base.user2; // ROLE_LOCKER

      const asset = await ethers.getContractAt("IAsset", base.diamond.target);
      const evmAccessors = EvmAccessorsFacet__factory.connect(base.diamond.target as string, admin);

      const rbac: Rbac[] = [
        { role: ATS_ROLES.ROLE_ISSUER, members: [issuer.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [locker.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [issuer.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [admin.address] },
      ];
      await executeRbac(asset, rbac);
      await asset.connect(admin).addIssuer(admin.address);
      await asset.connect(issuer).grantKyc(admin.address, EMPTY_STRING, ZERO, MAX_UINT256, admin.address);

      const now = (await ethers.provider.getBlock("latest"))!.timestamp;
      const expiration = now + TIME_PERIODS_S.YEAR;

      await asset.connect(issuer).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: admin.address,
        value: LOCK_AMOUNT,
        data: "0x",
      });
      await asset.connect(locker).lock(LOCK_AMOUNT, admin.address, expiration);

      return { asset, evmAccessors, locker, holder: admin, expiration };
    }

    it("GIVEN a live lock THEN release reverts; WHEN the timestamp override passes expiry THEN release succeeds", async () => {
      const { asset, evmAccessors, locker, holder, expiration } = await loadFixture(deployLockScenarioFixture);

      // Before the override the lock is live: the Lock facet reads getBlockTimestamp().
      await expect(asset.connect(locker).release(1, holder.address)).to.be.revertedWithCustomError(
        asset,
        "LockExpirationNotReached",
      );
      expect(await asset.getLockedAmountFor(holder.address)).to.equal(LOCK_AMOUNT);

      // Push only the EvmAccessors timestamp override past expiry — no real time passes.
      await evmAccessors.changeSystemTimestamp(expiration + 1);

      // The Lock facet now reads the override through EvmAccessors.getBlockTimestamp():
      // the same release succeeds and the locked balance is freed.
      await expect(asset.connect(locker).release(1, holder.address)).to.emit(asset, "LockByPartitionReleased");
      expect(await asset.getLockedAmountFor(holder.address)).to.equal(0n);
    });
  });

  describe("sender override observed by a real facet — AccessControl (M1)", () => {
    // Parallel to P1.1 but for msg.sender: AccessControl resolves the caller via
    // EvmAccessors.getMsgSender(), so overriding the sender to a role-less address makes
    // an admin-gated call fail AS that address — the revert names it, proving the override
    // flows through a DIFFERENT facet's getMsgSender() read (not just emitted by the facet).
    const ROLELESS_SENDER = ethers.getAddress(TEST_ADDRESSES.VALID_1);
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

    it("GIVEN a sender override THEN access control resolves the caller to the override", async () => {
      const base = await deployEquityTokenFixture();
      const asset = await ethers.getContractAt("IAsset", base.diamond.target);
      const evmAccessors = EvmAccessorsFacet__factory.connect(base.diamond.target as string, base.deployer);

      // The real deployer holds DEFAULT_ADMIN, so the admin-gated grantRole succeeds.
      await expect(asset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_PAUSER, base.user1.address)).to.not.be
        .reverted;

      // Override the resolved sender to an address that holds no roles.
      await evmAccessors.changeSystemSender(ROLELESS_SENDER);

      // The same call now resolves the caller via getMsgSender() = ROLELESS_SENDER, which lacks
      // DEFAULT_ADMIN_ROLE; access control rejects it and the revert names that address.
      await expect(asset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_PAUSER, base.user2.address))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(ROLELESS_SENDER, DEFAULT_ADMIN_ROLE);
    });
  });
});
