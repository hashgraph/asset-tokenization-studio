import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ADDRESS_ZERO, ATS_ROLES, GAS_LIMIT } from "@scripts";
import { deployEquityTokenFixture } from "@test";
import { ResolverProxy, ExternalPauseManagement, MockedExternalPause } from "@contract-types";

describe("ExternalPause Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;

  let externalPauseManagement: ExternalPauseManagement;
  let externalPauseMock1: MockedExternalPause;
  let externalPauseMock2: MockedExternalPause;
  let externalPauseMock3: MockedExternalPause;

  async function deploySecurityFixture() {
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

    externalPauseManagement = await ethers.getContractAt("ExternalPauseManagement", diamond.address, signer_A);

    await base.accessControlFacet.grantRole(ATS_ROLES._PAUSE_MANAGER_ROLE, signer_A.address);

    externalPauseMock1 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock1.deployed();

    externalPauseMock2 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock2.deployed();

    externalPauseMock3 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock3.deployed();

    await externalPauseMock1.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalPauseMock2.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalPauseMock3.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });

    await externalPauseManagement.addExternalPause(externalPauseMock1.address, {
      gasLimit: GAS_LIMIT.default,
    });

    await externalPauseManagement.addExternalPause(externalPauseMock2.address, {
      gasLimit: GAS_LIMIT.default,
    });
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external pause WHEN added THEN it is listed and event is emitted", async () => {
      const newPause = externalPauseMock3.address;
      expect(await externalPauseManagement.isExternalPause(newPause)).to.be.false;
      const initialCount = await externalPauseManagement.getExternalPausesCount();
      await expect(
        externalPauseManagement.addExternalPause(newPause, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalPauseManagement, "AddedToExternalPauses")
        .withArgs(signer_A.address, newPause);
      expect(await externalPauseManagement.isExternalPause(newPause)).to.be.true;
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.add(1));
    });

    it("GIVEN a listed external pause WHEN adding it again THEN it reverts with ListedPause", async () => {
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      await expect(
        externalPauseManagement.addExternalPause(externalPauseMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "ListedPause");
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        externalPauseManagement.addExternalPause(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed external pause WHEN removed THEN it is unlisted and event is emitted", async () => {
      const pauseToRemove = externalPauseMock1.address;
      expect(await externalPauseManagement.isExternalPause(pauseToRemove)).to.be.true;
      const initialCount = await externalPauseManagement.getExternalPausesCount();
      await expect(
        externalPauseManagement.removeExternalPause(pauseToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalPauseManagement, "RemovedFromExternalPauses")
        .withArgs(signer_A.address, pauseToRemove);
      expect(await externalPauseManagement.isExternalPause(pauseToRemove)).to.be.false;
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.sub(1));
    });

    it("GIVEN an unlisted external pause WHEN removing THEN it reverts with UnlistedPause", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalPauseManagement.isExternalPause(randomAddress)).to.be.false;
      await expect(
        externalPauseManagement.removeExternalPause(randomAddress, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "UnlistedPause");
    });
  });

  describe("Update Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      const pausesToUpdate = [ADDRESS_ZERO];
      const actives = [true];

      await expect(
        externalPauseManagement.updateExternalPauses(pausesToUpdate, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "ZeroAddressNotAllowed");
    });

    it("GIVEN multiple external pauses WHEN updated THEN their statuses are updated and event is emitted", async () => {
      // Initial state: mock1=true, mock2=true. Verify.
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      expect(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
      expect(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.false;
      const initialCount = await externalPauseManagement.getExternalPausesCount();
      expect(initialCount).to.equal(2);

      const pausesToUpdate = [externalPauseMock2.address, externalPauseMock3.address];
      const activesToUpdate = [false, true]; // Corresponds to removing mock2, adding mock3

      await expect(
        externalPauseManagement.updateExternalPauses(pausesToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalPauseManagement, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pausesToUpdate, activesToUpdate);

      // Verify final state
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true; // mock1 untouched
      expect(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.false; // mock2 removed
      expect(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.true; // mock3 added
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.sub(1).add(1)); // 2 - 1 + 1 = 2
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicatePause = externalPauseMock3.address;
      expect(await externalPauseManagement.isExternalPause(duplicatePause)).to.be.false;

      const pauses = [duplicatePause, duplicatePause];
      const actives = [true, false];

      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicatePause = externalPauseMock1.address;
      expect(await externalPauseManagement.isExternalPause(duplicatePause)).to.be.true;

      const pauses = [duplicatePause, duplicatePause];
      const actives = [false, true];

      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
      const initialCount = await externalPauseManagement.getExternalPausesCount();
      const pauses: string[] = [];
      const actives: boolean[] = [];
      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalPauseManagement, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pauses, actives);
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount);
    });
  });

  describe("View/Getter Functions", () => {
    it("GIVEN listed and unlisted addresses WHEN isExternalPause is called THEN it returns the correct status", async () => {
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      expect(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalPauseManagement.isExternalPause(randomAddress)).to.be.false;
      await externalPauseManagement.addExternalPause(externalPauseMock3.address);
      expect(await externalPauseManagement.isExternalPause(externalPauseMock3.address)).to.be.true;
    });

    it("GIVEN external pauses WHEN getExternalPausesCount is called THEN it returns the current count", async () => {
      const initialCount = await externalPauseManagement.getExternalPausesCount();
      expect(initialCount).to.equal(2); // From beforeEach
      await externalPauseManagement.addExternalPause(externalPauseMock3.address);
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount.add(1)); // 3
      await externalPauseManagement.removeExternalPause(externalPauseMock1.address);
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(initialCount); // 2
      await externalPauseManagement.removeExternalPause(externalPauseMock2.address);
      await externalPauseManagement.removeExternalPause(externalPauseMock3.address);
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(0);
    });

    it("GIVEN external pauses WHEN getExternalPausesMembers is called THEN it returns paginated members", async () => {
      expect(await externalPauseManagement.getExternalPausesCount()).to.equal(2); // From beforeEach
      let membersPage = await externalPauseManagement.getExternalPausesMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([externalPauseMock1.address, externalPauseMock2.address]).to.include(membersPage[0]);
      membersPage = await externalPauseManagement.getExternalPausesMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([externalPauseMock1.address, externalPauseMock2.address]).to.include(membersPage[0]);
      expect(membersPage[0]).to.not.equal((await externalPauseManagement.getExternalPausesMembers(0, 1))[0]);
      let allMembers = await externalPauseManagement.getExternalPausesMembers(0, 2);
      expect(allMembers).to.have.lengthOf(2);
      expect(allMembers).to.contain(externalPauseMock1.address);
      expect(allMembers).to.contain(externalPauseMock2.address);
      await externalPauseManagement.addExternalPause(externalPauseMock3.address);
      allMembers = await externalPauseManagement.getExternalPausesMembers(0, 3);
      expect(allMembers).to.have.lengthOf(3);
      expect(allMembers).to.contain(externalPauseMock1.address);
      expect(allMembers).to.contain(externalPauseMock2.address);
      expect(allMembers).to.contain(externalPauseMock3.address);
      membersPage = await externalPauseManagement.getExternalPausesMembers(1, 2);
      expect(membersPage).to.have.lengthOf(1);
      membersPage = await externalPauseManagement.getExternalPausesMembers(3, 1);
      expect(membersPage).to.have.lengthOf(0);
      await externalPauseManagement.removeExternalPause(externalPauseMock1.address);
      await externalPauseManagement.removeExternalPause(externalPauseMock2.address);
      await externalPauseManagement.removeExternalPause(externalPauseMock3.address);
      allMembers = await externalPauseManagement.getExternalPausesMembers(0, 5);
      expect(allMembers).to.have.lengthOf(0);
    });
  });

  describe("Pause Modifier Tests (onlyUnpaused)", () => {
    it("GIVEN an external pause is paused WHEN calling a function with onlyUnpaused THEN it reverts with TokenIsPaused", async () => {
      await externalPauseMock1.setPaused(true, {
        gasLimit: GAS_LIMIT.default,
      });
      // Use externalPauseManagement instance for error checking as Common interface loading failed
      await expect(
        externalPauseManagement.addExternalPause(externalPauseMock3.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "TokenIsPaused"); // Assumes TokenIsPaused is inherited/available
      await expect(
        externalPauseManagement.removeExternalPause(externalPauseMock2.address, { gasLimit: GAS_LIMIT.default }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "TokenIsPaused");
      const pauses = [externalPauseMock2.address];
      const actives = [false];
      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalPauseManagement, "TokenIsPaused");
    });

    it("GIVEN all external pauses are unpaused WHEN calling a function with onlyUnpaused THEN it succeeds", async () => {
      expect(await externalPauseMock1.isPaused()).to.be.false;
      expect(await externalPauseMock2.isPaused()).to.be.false;
      await expect(
        externalPauseManagement.addExternalPause(externalPauseMock3.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.not.be.reverted;
      await expect(
        externalPauseManagement.removeExternalPause(externalPauseMock1.address, { gasLimit: GAS_LIMIT.default }),
      ).to.not.be.reverted;
      const pauses = [externalPauseMock2.address];
      const actives = [false];
      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.not.be.reverted;
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it reverts with AccessControl", async () => {
      const newPause = externalPauseMock3.address;
      await expect(
        externalPauseManagement.connect(signer_B).addExternalPause(newPause, { gasLimit: GAS_LIMIT.default }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it succeeds", async () => {
      const newPause = externalPauseMock3.address;
      expect(await externalPauseManagement.isExternalPause(newPause)).to.be.false;
      await expect(
        externalPauseManagement.addExternalPause(newPause, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalPauseManagement, "AddedToExternalPauses")
        .withArgs(signer_A.address, newPause);
      expect(await externalPauseManagement.isExternalPause(newPause)).to.be.true;
    });

    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it reverts with AccessControl", async () => {
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      // --- FIX: Check for custom error ---
      await expect(
        externalPauseManagement.connect(signer_B).removeExternalPause(externalPauseMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it succeeds", async () => {
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      await expect(
        externalPauseManagement.removeExternalPause(externalPauseMock1.address, { gasLimit: GAS_LIMIT.default }),
      )
        .to.emit(externalPauseManagement, "RemovedFromExternalPauses")
        .withArgs(signer_A.address, externalPauseMock1.address);
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.false;
    });

    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it reverts with AccessControl", async () => {
      const pauses = [externalPauseMock1.address];
      const actives = [false];
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      await expect(
        externalPauseManagement.connect(signer_B).updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it succeeds", async () => {
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.true;
      expect(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
      const pauses = [externalPauseMock1.address, externalPauseMock2.address];
      const actives = [false, true]; // Remove mock1, keep mock2
      await expect(
        externalPauseManagement.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalPauseManagement, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pauses, actives);
      expect(await externalPauseManagement.isExternalPause(externalPauseMock1.address)).to.be.false;
      expect(await externalPauseManagement.isExternalPause(externalPauseMock2.address)).to.be.true;
    });
  });
});
