import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  type ResolverProxy,
  type LockFacet,
  type IERC1410,
  PauseFacet,
  KycFacet,
  SsiManagementFacet,
  AdjustBalancesFacet,
  AccessControl,
  Cap,
  Equity,
  TimeTravelFacet,
  SnapshotsFacet,
} from "@contract-types";

import { deployEquityTokenFixture } from "@test";

import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO, dateToUnixTimestamp } from "@scripts";
import { Rbac } from "@scripts/domain";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const maxSupply_Original = 1000000 * _AMOUNT;
const maxSupply_Partition_1_Original = 50000 * _AMOUNT;
const maxSupply_Partition_2_Original = 0;
const ONE_SECOND = 1;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_A_Original = [10 * _AMOUNT, 100 * _AMOUNT];
const balanceOf_B_Original = [20 * _AMOUNT, 200 * _AMOUNT];
const adjustFactor = 253;
const adjustDecimals = 2;

describe("Lock Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let lockFacet: LockFacet;
  let pauseFacet: PauseFacet;
  let erc1410Facet: IERC1410;
  let snapshotFacet: SnapshotsFacet;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;
  let adjustBalancesFacet: AdjustBalancesFacet;
  let accessControlFacet: AccessControl;
  let capFacet: Cap;
  let equityFacet: Equity;
  let timeTravelFacet: TimeTravelFacet;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  function set_initRbacs(): Rbac[] {
    const rbacIssuer: Rbac = {
      role: ATS_ROLES._ISSUER_ROLE,
      members: [signer_B.address],
    };
    const rbacLocker: Rbac = {
      role: ATS_ROLES._LOCKER_ROLE,
      members: [signer_C.address],
    };
    const rbacPausable: Rbac = {
      role: ATS_ROLES._PAUSER_ROLE,
      members: [signer_D.address],
    };
    const rbacKYC: Rbac = {
      role: ATS_ROLES._KYC_ROLE,
      members: [signer_B.address],
    };
    const rbacSSI: Rbac = {
      role: ATS_ROLES._SSI_MANAGER_ROLE,
      members: [signer_A.address],
    };
    const rbacCorporateAction: Rbac = {
      role: ATS_ROLES._CORPORATE_ACTION_ROLE,
      members: [signer_B.address],
    };
    return [rbacIssuer, rbacLocker, rbacPausable, rbacKYC, rbacSSI, rbacCorporateAction];
  }

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    lockFacet = await ethers.getContractAt("LockFacet", diamond.target, signer_C);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_D);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_B);
    kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("Equity", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    adjustBalancesFacet = await ethers.getContractAt("AdjustBalancesFacet", diamond.target, signer_A);
    capFacet = await ethers.getContractAt("Cap", diamond.target, signer_A);
    snapshotFacet = await ethers.getContractAt("SnapshotsFacet", diamond.target);

    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    await executeRbac(base.accessControlFacet, set_initRbacs());

    await setFacets({ diamond });
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    await executeRbac(base.accessControlFacet, set_initRbacs());

    await setFacets({ diamond });
  }

  beforeEach(async () => {
    currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
  });

  describe("Multi-partition enabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
        await pauseFacet.pause();
      });

      it("GIVEN a paused Token WHEN lockByPartition THEN transaction fails with TokenIsPaused", async () => {
        // lockByPartition with data fails
        await expect(
          lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, currentTimestamp),
        ).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN releaseByPartition THEN transaction fails with TokenIsPaused", async () => {
        // transfer from with data fails
        await expect(lockFacet.releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address)).to.be.rejectedWith(
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN lock THEN transaction fails with TokenIsPaused", async () => {
        // lockByPartition with data fails
        await expect(lockFacet.lock(_AMOUNT, signer_A.address, currentTimestamp)).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN release THEN transaction fails with TokenIsPaused", async () => {
        // transfer from with data fails
        await expect(lockFacet.release(1, signer_A.address)).to.be.rejectedWith("TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without LOCKER role WHEN lockByPartition THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(
          lockFacet
            .connect(signer_D)
            .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, currentTimestamp),
        ).to.be.rejectedWith("AccountHasNoRole");
      });

      it("GIVEN an account without LOCKER role WHEN lock THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(lockFacet.connect(signer_D).lock(_AMOUNT, signer_A.address, currentTimestamp)).to.be.rejectedWith(
          "AccountHasNoRole",
        );
      });
    });

    describe("multi-partition transactions are enabled", () => {
      it("GIVEN a token with multi-partition enabled GIVEN lock THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(lockFacet.lock(_AMOUNT, signer_A.address, currentTimestamp)).to.be.revertedWithCustomError(
          lockFacet,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN a token with multi-partition enabled GIVEN release THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(lockFacet.release(1, signer_A.address)).to.be.revertedWithCustomError(
          lockFacet,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("lockByPartition", () => {
      it("GIVEN a expiration timestamp in past WHEN lockByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          lockFacet.lockByPartition(
            _NON_DEFAULT_PARTITION,
            _AMOUNT,
            signer_A.address,
            currentTimestamp - ONE_YEAR_IN_SECONDS,
          ),
        ).to.be.revertedWithCustomError(lockFacet, "WrongExpirationTimestamp");
      });

      it("GIVEN a non valid partition WHEN lockByPartition THEN transaction fails with InvalidPartition", async () => {
        await expect(lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp))
          .to.be.revertedWithCustomError(lockFacet, "InvalidPartition")
          .withArgs(signer_A.address, _NON_DEFAULT_PARTITION);
      });

      it("GIVEN a valid partition WHEN lockByPartition with insufficient balance THEN transaction fails with InsufficientBalance", async () => {
        await erc1410Facet.issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT - 1,
          data: "0x",
        });

        await expect(lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp))
          .to.be.revertedWithCustomError(lockFacet, "InsufficientBalance")
          .withArgs(signer_A.address, _AMOUNT - 1, _AMOUNT, _NON_DEFAULT_PARTITION);
      });

      it("GIVEN a valid partition WHEN lockByPartition with enough balance THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp))
          .to.emit(lockFacet, "LockedByPartition")
          .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1, _AMOUNT, expirationTimestamp);

        expect(await lockFacet.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(
          _AMOUNT,
        );
        expect(await lockFacet.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
          1n,
        ]);
        expect(await lockFacet.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });

    describe("Release by partition", () => {
      it("GIVEN a non valid lockId WHEN releaseByPartition THEN transaction fails with InvalidLockId", async () => {
        await expect(
          lockFacet.releaseByPartition(_NON_DEFAULT_PARTITION, 10, signer_A.address),
        ).to.be.revertedWithCustomError(lockFacet, "WrongLockId");
      });

      it("GIVEN a valid lockId but timestamp is not reached WHEN releaseByPartition THEN transaction fails with LockExpirationNotReached", async () => {
        await erc1410Facet.issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

        await expect(
          lockFacet.releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(lockFacet, "LockExpirationNotReached");
      });

      it("GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

        await timeTravelFacet.changeSystemTimestamp(expirationTimestamp + 1);
        await expect(lockFacet.releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1);

        expect(await lockFacet.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal(
          [],
        );
        expect(await lockFacet.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          0, 0,
        ]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT);
      });
    });

    describe("Adjust Balances", () => {
      async function setPreBalanceAdjustment() {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A);
        await accessControlFacet.grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet.grantRole(ATS_ROLES._CAP_ROLE, signer_A.address);
        await accessControlFacet.grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);

        // Using account C (with role)
        adjustBalancesFacet = adjustBalancesFacet.connect(signer_C);
        erc1410Facet = erc1410Facet.connect(signer_A);
        capFacet = capFacet.connect(signer_A);

        await capFacet.setMaxSupply(maxSupply_Original);
        await capFacet.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);
        await capFacet.setMaxSupplyByPartition(_PARTITION_ID_2, maxSupply_Partition_2_Original);

        await erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          value: balanceOf_A_Original[0],
          data: "0x",
        });
        await erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_2,
          tokenHolder: signer_A.address,
          value: balanceOf_A_Original[1],
          data: "0x",
        });
        await erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_B.address,
          value: balanceOf_B_Original[0],
          data: "0x",
        });
        await erc1410Facet.issueByPartition({
          partition: _PARTITION_ID_2,
          tokenHolder: signer_B.address,
          value: balanceOf_B_Original[1],
          data: "0x",
        });
      }

      it("GIVEN a lock WHEN adjustBalances THEN lock amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // LOCK
        await lockFacet
          .connect(signer_A)
          .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, dateToUnixTimestamp("2030-01-01T00:00:01Z"));

        const lock_TotalAmount_Before = await lockFacet.getLockedAmountFor(signer_A.address);
        const lock_TotalAmount_Before_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const lock_Before = await lockFacet.getLockForByPartition(_PARTITION_ID_1, signer_A.address, 1);

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // scheduled two balance updates
        const balanceAdjustmentData = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:00:02Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };

        const balanceAdjustmentData_2 = {
          executionDate: dateToUnixTimestamp("2030-01-01T00:16:40Z").toString(),
          factor: adjustFactor,
          decimals: adjustDecimals,
        };
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

        const lock_TotalAmount_After = await lockFacet.getLockedAmountFor(signer_A.address);
        const lock_TotalAmount_After_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const lock_After = await lockFacet.getLockForByPartition(_PARTITION_ID_1, signer_A.address, 1);
        const balance_After = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        expect(lock_TotalAmount_After).to.be.equal(lock_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
        expect(lock_TotalAmount_After_Partition_1).to.be.equal(
          lock_TotalAmount_Before_Partition_1 * BigInt(adjustFactor * adjustFactor),
        );
        expect(balance_After).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor));
        expect(lock_TotalAmount_After).to.be.equal(lock_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
        expect(balance_After_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor),
        );
        expect(lock_After.amount_).to.be.equal(lock_Before.amount_ * BigInt(adjustFactor * adjustFactor));
      });

      it("GIVEN a lock WHEN adjustBalances THEN release succeeds", async () => {
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // LOCK TWICE
        const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

        await lockFacet
          .connect(signer_A)
          .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + ONE_SECOND);
        await lockFacet
          .connect(signer_A)
          .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

        const locked_Amount_Before = await lockFacet.getLockedAmountFor(signer_A.address);
        const locked_Amount_Before_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // RELEASE LOCK
        await timeTravelFacet.changeSystemTimestamp(
          (await ethers.provider.getBlock("latest"))!.timestamp + 2 * ONE_SECOND,
        );
        await lockFacet.connect(signer_A).releaseByPartition(_PARTITION_ID_1, 1, signer_A.address);

        const balance_After_Release = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Release_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const locked_Amount_After = await lockFacet.getLockedAmountFor(signer_A.address);
        const locked_Amount_After_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Release).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
        expect(balance_After_Release_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
        );
        expect(locked_Amount_After).to.be.equal((locked_Amount_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
        expect(locked_Amount_After_Partition_1).to.be.equal(
          (locked_Amount_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
        );
        expect(balance_After_Release + locked_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
        expect(balance_After_Release_Partition_1 + locked_Amount_After_Partition_1).to.be.equal(
          balance_Before_Partition_1 * BigInt(adjustFactor),
        );
      });

      it("GIVEN a lock WHEN adjustBalances THEN lock succeeds", async () => {
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // LOCK BEFORE BALANCE ADJUSTMENT
        const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

        await lockFacet
          .connect(signer_A)
          .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

        const locked_Amount_Before = await lockFacet.getLockedAmountFor(signer_A.address);
        const locked_Amount_Before_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.adjustBalances(adjustFactor, adjustDecimals);

        // LOCK AFTER BALANCE ADJUSTMENT
        await lockFacet
          .connect(signer_A)
          .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

        const balance_After_Lock = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Lock_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const locked_Amount_After = await lockFacet.getLockedAmountFor(signer_A.address);
        const locked_Amount_After_Partition_1 = await lockFacet.getLockedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Lock).to.be.equal(
          (balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
        );
        expect(balance_After_Lock_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
        );
        expect(locked_Amount_After).to.be.equal(locked_Amount_Before * BigInt(adjustFactor) + BigInt(_AMOUNT));
        expect(locked_Amount_After_Partition_1).to.be.equal(
          locked_Amount_Before_Partition_1 * BigInt(adjustFactor) + BigInt(_AMOUNT),
        );
        expect(balance_After_Lock + locked_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
        expect(balance_After_Lock_Partition_1 + locked_Amount_After_Partition_1).to.be.equal(
          balance_Before_Partition_1 * BigInt(adjustFactor),
        );
      });
    });
  });

  describe("Multi-partition disabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("multi-partition transactions arent enabled", () => {
      it("GIVEN a token with multi-partition enabled GIVEN lockByPartition THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(lockFacet.lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, currentTimestamp))
          .to.be.revertedWithCustomError(lockFacet, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(_NON_DEFAULT_PARTITION);
      });

      it("GIVEN a token with multi-partition enabled GIVEN releaseByPartition THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(lockFacet.releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
          .to.be.revertedWithCustomError(lockFacet, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(_NON_DEFAULT_PARTITION);
      });
    });

    describe("snapshot", () => {
      it("GIVEN an account with snapshot role WHEN takeSnapshot and Lock THEN transaction succeeds", async () => {
        const AMOUNT = 10;
        const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);

        await erc1410Facet.connect(signer_A).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: AMOUNT,
          data: "0x",
        });

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        await lockFacet
          .connect(signer_A)
          .lockByPartition(_DEFAULT_PARTITION, 1, signer_A.address, EXPIRATION_TIMESTAMP);
        await lockFacet
          .connect(signer_A)
          .lockByPartition(_DEFAULT_PARTITION, 1, signer_A.address, EXPIRATION_TIMESTAMP);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        await timeTravelFacet.changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);
        await lockFacet.connect(signer_A).releaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // checks
        const snapshot_Balance_Of_A_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_A.address);
        const snapshot_LockedBalance_Of_A_1 = await snapshotFacet.lockedBalanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Total_Supply_1 = await snapshotFacet.totalSupplyAtSnapshot(1);

        expect(snapshot_Balance_Of_A_1).to.equal(AMOUNT);
        expect(snapshot_LockedBalance_Of_A_1).to.equal(0);
        expect(snapshot_Total_Supply_1).to.equal(AMOUNT);

        const snapshot_Balance_Of_A_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_A.address);
        const snapshot_LockedBalance_Of_A_2 = await snapshotFacet.lockedBalanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Total_Supply_2 = await snapshotFacet.totalSupplyAtSnapshot(2);

        expect(snapshot_Balance_Of_A_2).to.equal(AMOUNT - 2);
        expect(snapshot_LockedBalance_Of_A_2).to.equal(2);
        expect(snapshot_Total_Supply_2).to.equal(AMOUNT);

        const snapshot_Balance_Of_A_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_A.address);
        const snapshot_LockedBalance_Of_A_3 = await snapshotFacet.lockedBalanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Total_Supply_3 = await snapshotFacet.totalSupplyAtSnapshot(3);

        expect(snapshot_Balance_Of_A_3).to.equal(AMOUNT - 1);
        expect(snapshot_LockedBalance_Of_A_3).to.equal(1);
        expect(snapshot_Total_Supply_3).to.equal(AMOUNT);
      });
    });

    describe("lock", () => {
      it("GIVEN a valid partition WHEN lockByPartition with enough balance THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(lockFacet.lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp))
          .to.emit(lockFacet, "LockedByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, expirationTimestamp);

        expect(await lockFacet.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await lockFacet.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
          1n,
        ]);
        expect(await lockFacet.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(_AMOUNT);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([1n]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([_AMOUNT, expirationTimestamp]);

        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });

      it("GIVEN a expiration timestamp in past WHEN lock THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          lockFacet.lock(_AMOUNT, signer_A.address, currentTimestamp - ONE_YEAR_IN_SECONDS),
        ).to.be.revertedWithCustomError(lockFacet, "WrongExpirationTimestamp");
      });

      it("GIVEN a valid partition WHEN lock with enough balance THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(lockFacet.lock(_AMOUNT, signer_A.address, expirationTimestamp))
          .to.emit(lockFacet, "LockedByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, expirationTimestamp);

        expect(await lockFacet.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await lockFacet.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
          1n,
        ]);
        expect(await lockFacet.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(_AMOUNT);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([1n]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([_AMOUNT, expirationTimestamp]);

        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });

    describe("release", () => {
      it("GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await lockFacet.lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

        await timeTravelFacet.changeSystemTimestamp(expirationTimestamp + 1);
        await expect(lockFacet.releaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1);

        expect(await lockFacet.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT);
      });

      it("GIVEN a non valid lockId WHEN release THEN transaction fails with InvalidLockId", async () => {
        await expect(lockFacet.release(10, signer_A.address)).to.be.revertedWithCustomError(lockFacet, "WrongLockId");
      });

      it("GIVEN a valid lockId but timestamp is not reached WHEN release THEN transaction fails with LockExpirationNotReached", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await lockFacet.lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

        await expect(lockFacet.release(1, signer_A.address)).to.be.revertedWithCustomError(
          lockFacet,
          "LockExpirationNotReached",
        );
      });

      it("GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await expect(lockFacet.lock(_AMOUNT - 1, signer_A.address, expirationTimestamp))
          .to.emit(lockFacet, "LockedByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT - 1, expirationTimestamp);
        await expect(lockFacet.lock(1, signer_A.address, expirationTimestamp))
          .to.emit(lockFacet, "LockedByPartition")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 2, 1, expirationTimestamp);

        await timeTravelFacet.changeSystemTimestamp(expirationTimestamp + 1);
        await expect(lockFacet.release(1, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1);
        await expect(lockFacet.release(2, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 2);

        expect(await lockFacet.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await lockFacet.getLockedAmountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_A.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT);
      });
    });
  });
});
