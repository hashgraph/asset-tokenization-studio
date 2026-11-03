// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  AccessControl,
  AccessControlFacet__factory,
  BusinessLogicResolver,
  IOwnership,
  IOwnership__factory,
  Pause,
  Pause__factory,
} from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { deployAtsInfrastructureFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

// ERC-7201-derived slot for OwnershipStorage. Kept in lock-step with
// `STORAGE_LOCATION_OWNERSHIP` in contracts/infrastructure/diamond/OwnershipWrapper.sol.
const OWNERSHIP_STORAGE_SLOT = "0x0c49888622360137ef830a76ef93872bc0aefaf60fb012c3941df4da0397c000";

const CONFIG_ID_A = "0x000000000000000000000000000000000000000000000000000000000be11a01";
const CONFIG_ID_B = "0x000000000000000000000000000000000000000000000000000000000be11a02";
const CONFIG_ID_UNSET = "0x000000000000000000000000000000000000000000000000000000000be11a03";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Ownership", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_Pauser: HardhatEthersSigner;

  let blr: BusinessLogicResolver;
  let ownership: IOwnership;
  let pause: Pause;
  let accessControl: AccessControl;

  // Storage slot helpers. The OwnershipStorage struct is anchored at
  // OWNERSHIP_STORAGE_SLOT; `configOwners` is field 0 and
  // `configPendingOwners` is field 1, so the per-key slots are
  // keccak256(abi.encode(configId, base + offset)).
  function ownerSlot(configId: string): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "uint256"], [configId, BigInt(OWNERSHIP_STORAGE_SLOT)]),
    );
  }

  async function seedOwner(configId: string, owner: string) {
    await ethers.provider.send("hardhat_setStorageAt", [
      await blr.getAddress(),
      ownerSlot(configId),
      ethers.zeroPadValue(owner, 32),
    ]);
  }

  beforeEach(async () => {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

    blr = infrastructure.blr;
    signer_A = infrastructure.deployer;
    signer_B = infrastructure.user1;
    signer_C = infrastructure.user2;
    signer_Pauser = infrastructure.user3;

    accessControl = AccessControlFacet__factory.connect(blr.target.toString(), signer_A);
    await accessControl.grantRole(ATS_ROLES.ROLE_PAUSER, signer_Pauser.address);

    pause = Pause__factory.connect(blr.target.toString(), signer_A);
    ownership = IOwnership__factory.connect(blr.target.toString(), signer_A);
  });

  afterEach(async () => {
    if (await pause.paused()) {
      await pause.connect(signer_Pauser).unpause();
    }
  });

  describe("getOwner", () => {
    it("GIVEN a configId with no owner WHEN reading getOwner THEN returns the zero address", async () => {
      expect(await ownership.getOwner(CONFIG_ID_UNSET)).to.equal(ZERO_ADDRESS);
    });

    it("GIVEN a configId with a seeded owner WHEN reading getOwner THEN returns that owner", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      expect(await ownership.getOwner(CONFIG_ID_A)).to.equal(signer_B.address);
    });

    it("GIVEN owners on two distinct configIds WHEN reading getOwner THEN they are independent", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await seedOwner(CONFIG_ID_B, signer_C.address);

      expect(await ownership.getOwner(CONFIG_ID_A)).to.equal(signer_B.address);
      expect(await ownership.getOwner(CONFIG_ID_B)).to.equal(signer_C.address);
    });
  });

  describe("getPendingOwner", () => {
    it("GIVEN a configId with no pending owner WHEN reading getPendingOwner THEN returns the zero address", async () => {
      expect(await ownership.getPendingOwner(CONFIG_ID_UNSET)).to.equal(ZERO_ADDRESS);
    });

    it("GIVEN a transfer initiated WHEN reading getPendingOwner THEN returns the nominated address", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address);

      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(signer_C.address);
    });

    it("GIVEN the pending owner has accepted WHEN reading getPendingOwner THEN returns the zero address", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address);
      await ownership.connect(signer_C).acceptOwnership(CONFIG_ID_A);

      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(ZERO_ADDRESS);
    });
  });

  describe("transferOwnership", () => {
    it("GIVEN the current owner WHEN calling transferOwnership THEN records the nominee, keeps the owner and emits OwnershipTransfered", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);

      await expect(ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address))
        .to.emit(ownership, "OwnershipTransfered")
        .withArgs(CONFIG_ID_A, signer_B.address, signer_C.address);

      expect(await ownership.getOwner(CONFIG_ID_A)).to.equal(signer_B.address);
      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(signer_C.address);
    });

    it("GIVEN an existing nomination WHEN the owner re-nominates THEN the pending owner is overwritten", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address);

      await expect(ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_A.address))
        .to.emit(ownership, "OwnershipTransfered")
        .withArgs(CONFIG_ID_A, signer_B.address, signer_A.address);

      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(signer_A.address);
    });

    it("GIVEN the current owner WHEN nominating the zero address THEN the nomination is recorded without validation", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);

      await expect(ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, ZERO_ADDRESS))
        .to.emit(ownership, "OwnershipTransfered")
        .withArgs(CONFIG_ID_A, signer_B.address, ZERO_ADDRESS);

      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(ZERO_ADDRESS);
    });

    it("GIVEN a configId with no owner WHEN any caller invokes transferOwnership THEN reverts with NotOwner against the zero address", async () => {
      await expect(ownership.connect(signer_B).transferOwnership(CONFIG_ID_UNSET, signer_C.address))
        .to.be.revertedWithCustomError(ownership, "NotOwner")
        .withArgs(CONFIG_ID_UNSET, signer_B.address, ZERO_ADDRESS);
    });

    it("GIVEN a paused resolver WHEN the owner calls transferOwnership THEN reverts with IsPaused", async () => {
      await pause.connect(signer_Pauser).pause();

      await expect(
        ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address),
      ).to.be.revertedWithCustomError(pause, "IsPaused");
    });
  });

  describe("acceptOwnership", () => {
    it("GIVEN a nominated pending owner WHEN they call acceptOwnership THEN promotes them, clears the pending slot and emits OwnershipAccepted", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address);

      await expect(ownership.connect(signer_C).acceptOwnership(CONFIG_ID_A))
        .to.emit(ownership, "OwnershipAccepted")
        .withArgs(CONFIG_ID_A, signer_B.address, signer_C.address);

      expect(await ownership.getOwner(CONFIG_ID_A)).to.equal(signer_C.address);
      expect(await ownership.getPendingOwner(CONFIG_ID_A)).to.equal(ZERO_ADDRESS);
    });

    it("GIVEN no transfer in flight WHEN any caller invokes acceptOwnership THEN reverts with NotPendingOwner against the zero address", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);

      await expect(ownership.connect(signer_B).acceptOwnership(CONFIG_ID_A))
        .to.be.revertedWithCustomError(ownership, "NotPendingOwner")
        .withArgs(CONFIG_ID_A, signer_B.address, ZERO_ADDRESS);
    });

    it("GIVEN a paused resolver WHEN the pending owner calls acceptOwnership THEN reverts with IsPaused", async () => {
      await seedOwner(CONFIG_ID_A, signer_B.address);
      await ownership.connect(signer_B).transferOwnership(CONFIG_ID_A, signer_C.address);
      await pause.connect(signer_Pauser).pause();

      await expect(ownership.connect(signer_C).acceptOwnership(CONFIG_ID_A)).to.be.revertedWithCustomError(
        pause,
        "IsPaused",
      );
    });
  });
});
