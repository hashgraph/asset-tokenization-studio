import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type LockFacet,
  type PauseFacet,
  type IERC1410,
  type TransferAndLockFacet,
  type SsiManagementFacet,
  type KycFacet,
} from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Transfer and lock Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let lockFacet: LockFacet;
  let transferAndLockFacet: TransferAndLockFacet;
  let pauseFacet: PauseFacet;
  let erc1410Facet: IERC1410;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._LOCKER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ];
  }

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    lockFacet = await ethers.getContractAt("LockFacet", diamond.target, signer_C);
    transferAndLockFacet = await ethers.getContractAt("TransferAndLockFacet", diamond.target, signer_C);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_D);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target);
    kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target, signer_A);
    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
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
    signer_B = base.user2;
    signer_C = base.user3;
    signer_D = base.user4;

    await executeRbac(base.accessControlFacet, set_initRbacs());
    await setFacets({ diamond });
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;
    signer_D = base.user4;

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

      it("GIVEN a paused Token WHEN transferAndLockByPartition THEN transaction fails with TokenIsPaused", async () => {
        // lockByPartition with data fails
        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _NON_DEFAULT_PARTITION,
            signer_B.address,
            _AMOUNT,
            "0x",
            currentTimestamp,
          ),
        ).to.be.rejectedWith("TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN transferAndLock THEN transaction fails with TokenIsPaused", async () => {
        // transfer from with data fails
        await expect(
          transferAndLockFacet.transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.rejectedWith("TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without LOCKER role WHEN transferAndLockByPartition THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(
          transferAndLockFacet
            .connect(signer_D)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.rejectedWith("AccountHasNoRole");
      });

      it("GIVEN an account without LOCKER role WHEN transferAndLock THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(
          transferAndLockFacet.connect(signer_D).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.rejectedWith("AccountHasNoRole");
      });
    });

    describe("multi-partition transactions are enabled", () => {
      it("GIVEN a token with multi-partition enabled GIVEN transferAndLock THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          transferAndLockFacet.transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(lockFacet, "NotAllowedInMultiPartitionMode");
      });
    });

    describe("transferAndLockByPartition", () => {
      it("GIVEN a expiration timestamp in past WHEN transferAndLockByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _NON_DEFAULT_PARTITION,
            signer_B.address,
            _AMOUNT,
            "0x",
            currentTimestamp - ONE_YEAR_IN_SECONDS,
          ),
        ).to.be.rejectedWith("WrongExpirationTimestamp");
      });

      it("GIVEN a non valid partition WHEN transferAndLockByPartition THEN transaction fails with InvalidPartition", async () => {
        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _NON_DEFAULT_PARTITION,
            signer_B.address,
            _AMOUNT,
            "0x",
            expirationTimestamp,
          ),
        )
          .to.be.revertedWithCustomError(lockFacet, "InvalidPartition")
          .withArgs(signer_C.address, _NON_DEFAULT_PARTITION);
      });

      it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
        await erc1410Facet.connect(signer_B).issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _NON_DEFAULT_PARTITION,
            signer_A.address,
            _AMOUNT,
            "0x",
            expirationTimestamp,
          ),
        )
          .to.emit(transferAndLockFacet, "TransferByPartition")
          .withArgs(_NON_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(transferAndLockFacet, "PartitionTransferredAndLocked")
          .withArgs(_NON_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);

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

        expect(await lockFacet.getLockedAmountFor(signer_C.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_C.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_C.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_C.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_C.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await erc1410Facet.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });
  });

  describe("Multi-partition disabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("multi-partition transactions arent enabled", () => {
      it("GIVEN a token with multi-partition disabled GIVEN transferAndLockByPartition with non-default partition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _NON_DEFAULT_PARTITION,
            signer_A.address,
            _AMOUNT,
            "0x",
            currentTimestamp,
          ),
        )
          .to.be.revertedWithCustomError(transferAndLockFacet, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(_NON_DEFAULT_PARTITION);
      });
    });

    describe("transferAndLock", () => {
      it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
        await erc1410Facet.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          transferAndLockFacet.transferAndLockByPartition(
            _DEFAULT_PARTITION,
            signer_A.address,
            _AMOUNT,
            "0x",
            expirationTimestamp,
          ),
        )
          .to.emit(transferAndLockFacet, "TransferByPartition")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(transferAndLockFacet, "PartitionTransferredAndLocked")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);
      });

      it("GIVEN a expiration timestamp in past WHEN transferAndLock THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          transferAndLockFacet.transferAndLock(signer_A.address, _AMOUNT, "0x", currentTimestamp - ONE_YEAR_IN_SECONDS),
        ).to.be.rejectedWith("WrongExpirationTimestamp");
      });

      it("GIVEN a valid partition WHEN transferAndLock with enough balance THEN transaction success", async () => {
        await erc1410Facet.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(transferAndLockFacet.transferAndLock(signer_A.address, _AMOUNT, "0x", expirationTimestamp))
          .to.emit(transferAndLockFacet, "TransferByPartition")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(transferAndLockFacet, "PartitionTransferredAndLocked")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);

        expect(await lockFacet.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await lockFacet.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await lockFacet.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
          1n,
        ]);
        expect(await lockFacet.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await lockFacet.getLockedAmountFor(signer_C.address)).to.equal(0);
        expect(await lockFacet.getLockCountFor(signer_C.address)).to.equal(0);
        expect(await lockFacet.getLocksIdFor(signer_C.address, 0, 1)).to.deep.equal([]);
        expect(await lockFacet.getLockFor(signer_C.address, 1)).to.deep.equal([0, 0]);

        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_C.address)).to.equal(_AMOUNT);
        expect(await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await erc1410Facet.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });
  });
});
