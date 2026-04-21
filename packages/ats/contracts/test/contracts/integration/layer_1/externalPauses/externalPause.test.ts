// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ADDRESS_ZERO, ATS_ROLES, GAS_LIMIT } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { ResolverProxy, type IAsset, MockedExternalPause } from "@contract-types";

describe("ExternalPause Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;
  let externalPauseMock1: MockedExternalPause;
  let externalPauseMock2: MockedExternalPause;
  let externalPauseMock3: MockedExternalPause;

  async function deployExternalPauseSecurityFixture() {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

    const [tempSigner] = await ethers.getSigners();
    const initMock1 = await (await ethers.getContractFactory("MockedExternalPause", tempSigner)).deploy();
    await initMock1.waitForDeployment();

    const initMock2 = await (await ethers.getContractFactory("MockedExternalPause", tempSigner)).deploy();
    await initMock2.waitForDeployment();

    const base = await deployEquityTokenFixture({
      infrastructure,
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          externalPauses: [initMock1.target as string, initMock2.target as string], // These trigger the for loop in initialize_ExternalPauses
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);

    await base.accessControlFacet.grantRole(ATS_ROLES._PAUSE_MANAGER_ROLE, signer_A.address);

    externalPauseMock1 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock1.waitForDeployment();

    externalPauseMock2 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock2.waitForDeployment();

    externalPauseMock3 = await (await ethers.getContractFactory("MockedExternalPause", signer_A)).deploy();
    await externalPauseMock3.waitForDeployment();

    await externalPauseMock1.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalPauseMock2.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalPauseMock3.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });

    await asset.addExternalPause(externalPauseMock1.target as string, {
      gasLimit: GAS_LIMIT.default,
    });

    await asset.addExternalPause(externalPauseMock2.target as string, {
      gasLimit: GAS_LIMIT.default,
    });
  }

  beforeEach(async () => {
    await loadFixture(deployExternalPauseSecurityFixture);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external pause WHEN added THEN it is listed and event is emitted", async () => {
      const newPause = externalPauseMock3.target as string;
      expect(await asset.isExternalPause(newPause)).to.be.false;
      const initialCount = await asset.getExternalPausesCount();
      await expect(
        asset.addExternalPause(newPause, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "AddedToExternalPauses")
        .withArgs(signer_A.address, newPause);
      expect(await asset.isExternalPause(newPause)).to.be.true;
      expect(await asset.getExternalPausesCount()).to.equal(initialCount + 1n);
    });

    it("GIVEN a listed external pause WHEN adding it again THEN it reverts with ListedPause", async () => {
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      await expect(
        asset.addExternalPause(externalPauseMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ListedPause");
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        asset.addExternalPause(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed external pause WHEN removed THEN it is unlisted and event is emitted", async () => {
      const pauseToRemove = externalPauseMock1.target as string;
      expect(await asset.isExternalPause(pauseToRemove)).to.be.true;
      const initialCount = await asset.getExternalPausesCount();
      await expect(
        asset.removeExternalPause(pauseToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "RemovedFromExternalPauses")
        .withArgs(signer_A.address, pauseToRemove);
      expect(await asset.isExternalPause(pauseToRemove)).to.be.false;
      expect(await asset.getExternalPausesCount()).to.equal(initialCount - 1n);
    });

    it("GIVEN an unlisted external pause WHEN removing THEN it reverts with UnlistedPause", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await asset.isExternalPause(randomAddress)).to.be.false;
      await expect(
        asset.removeExternalPause(randomAddress, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "UnlistedPause");
    });
  });

  describe("Update Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      const pausesToUpdate = [ADDRESS_ZERO];
      const actives = [true];

      await expect(
        asset.updateExternalPauses(pausesToUpdate, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN multiple external pauses WHEN updated THEN their statuses are updated and event is emitted", async () => {
      // Initial state: mock1=true, mock2=true. Verify.
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
      expect(await asset.isExternalPause(externalPauseMock3.target as string)).to.be.false;
      const initialCount = await asset.getExternalPausesCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 added in fixture

      const pausesToUpdate = [externalPauseMock2.target as string, externalPauseMock3.target as string];
      const activesToUpdate = [false, true]; // Corresponds to removing mock2, adding mock3

      await expect(
        asset.updateExternalPauses(pausesToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pausesToUpdate, activesToUpdate);

      // Verify final state
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true; // mock1 untouched
      expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.false; // mock2 removed
      expect(await asset.isExternalPause(externalPauseMock3.target as string)).to.be.true; // mock3 added
      expect(await asset.getExternalPausesCount()).to.equal(initialCount - 1n + 1n); // 4 - 1 + 1 = 4
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicatePause = externalPauseMock3.target as string;
      expect(await asset.isExternalPause(duplicatePause)).to.be.false;

      const pauses = [duplicatePause, duplicatePause];
      const actives = [true, false];

      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray");
    });

    it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicatePause = externalPauseMock1.target as string;
      expect(await asset.isExternalPause(duplicatePause)).to.be.true;

      const pauses = [duplicatePause, duplicatePause];
      const actives = [false, true];

      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray");
    });

    it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
      const initialCount = await asset.getExternalPausesCount();
      const pauses: string[] = [];
      const actives: boolean[] = [];
      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pauses, actives);
      expect(await asset.getExternalPausesCount()).to.equal(initialCount);
    });
  });

  describe("View/Getter Functions", () => {
    it("GIVEN listed and unlisted addresses WHEN isExternalPause is called THEN it returns the correct status", async () => {
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await asset.isExternalPause(randomAddress)).to.be.false;
      await asset.addExternalPause(externalPauseMock3.target as string);
      expect(await asset.isExternalPause(externalPauseMock3.target as string)).to.be.true;
    });

    it("GIVEN external pauses WHEN getExternalPausesCount is called THEN it returns the current count", async () => {
      const initialCount = await asset.getExternalPausesCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from beforeEach
      await asset.addExternalPause(externalPauseMock3.target as string);
      expect(await asset.getExternalPausesCount()).to.equal(initialCount + 1n); // 5
      await asset.removeExternalPause(externalPauseMock1.target as string);
      expect(await asset.getExternalPausesCount()).to.equal(initialCount); // 4
      await asset.removeExternalPause(externalPauseMock2.target as string);
      await asset.removeExternalPause(externalPauseMock3.target as string);
      expect(await asset.getExternalPausesCount()).to.equal(2); // 2 from init remain
    });

    it("GIVEN external pauses WHEN getExternalPausesMembers is called THEN it returns paginated members", async () => {
      expect(await asset.getExternalPausesCount()).to.equal(4); // 2 from init + 2 from beforeEach

      // Test pagination - get first member
      let membersPage = await asset.getExternalPausesMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      const firstMember = membersPage[0];

      // Test pagination - get second member (should be different from first)
      membersPage = await asset.getExternalPausesMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect(membersPage[0]).to.not.equal(firstMember);

      // Get all 4 members
      let allMembers = await asset.getExternalPausesMembers(0, 4);
      expect(allMembers).to.have.lengthOf(4);
      expect(allMembers).to.contain(externalPauseMock1.target as string);
      expect(allMembers).to.contain(externalPauseMock2.target as string);
      await asset.addExternalPause(externalPauseMock3.target as string);
      allMembers = await asset.getExternalPausesMembers(0, 5);
      expect(allMembers).to.have.lengthOf(5);
      expect(allMembers).to.contain(externalPauseMock1.target as string);
      expect(allMembers).to.contain(externalPauseMock2.target as string);
      expect(allMembers).to.contain(externalPauseMock3.target as string);

      membersPage = await asset.getExternalPausesMembers(1, 3);
      expect(membersPage).to.have.lengthOf(2);

      membersPage = await asset.getExternalPausesMembers(5, 1);
      expect(membersPage).to.have.lengthOf(0);
      await asset.removeExternalPause(externalPauseMock1.target as string);
      await asset.removeExternalPause(externalPauseMock2.target as string);
      await asset.removeExternalPause(externalPauseMock3.target as string);
      allMembers = await asset.getExternalPausesMembers(0, 5);
      expect(allMembers).to.have.lengthOf(2); // 2 from init remain
    });
  });

  describe("Pause Modifier Tests (onlyUnpaused)", () => {
    it("GIVEN an external pause is paused WHEN calling a function with onlyUnpaused THEN it reverts with TokenIsPaused", async () => {
      await externalPauseMock1.setPaused(true, {
        gasLimit: GAS_LIMIT.default,
      });
      // Use asset instance for error checking as Common interface loading failed
      await expect(
        asset.addExternalPause(externalPauseMock3.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused"); // Assumes TokenIsPaused is inherited/available
      await expect(
        asset.removeExternalPause(externalPauseMock2.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      const pauses = [externalPauseMock2.target as string];
      const actives = [false];
      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN all external pauses are unpaused WHEN calling a function with onlyUnpaused THEN it succeeds", async () => {
      expect(await externalPauseMock1.isPaused()).to.be.false;
      expect(await externalPauseMock2.isPaused()).to.be.false;
      await expect(
        asset.addExternalPause(externalPauseMock3.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.not.be.reverted;
      await expect(
        asset.removeExternalPause(externalPauseMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.not.be.reverted;
      const pauses = [externalPauseMock2.target as string];
      const actives = [false];
      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.not.be.reverted;
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it reverts with AccessControl", async () => {
      const newPause = externalPauseMock3.target as string;
      await expect(
        asset.connect(signer_B).addExternalPause(newPause, { gasLimit: GAS_LIMIT.default }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN adding an external pause THEN it succeeds", async () => {
      const newPause = externalPauseMock3.target as string;
      expect(await asset.isExternalPause(newPause)).to.be.false;
      await expect(
        asset.addExternalPause(newPause, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "AddedToExternalPauses")
        .withArgs(signer_A.address, newPause);
      expect(await asset.isExternalPause(newPause)).to.be.true;
    });

    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it reverts with AccessControl", async () => {
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      // --- FIX: Check for custom error ---
      await expect(
        asset.connect(signer_B).removeExternalPause(externalPauseMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN removing an external pause THEN it succeeds", async () => {
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      await expect(
        asset.removeExternalPause(externalPauseMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "RemovedFromExternalPauses")
        .withArgs(signer_A.address, externalPauseMock1.target as string);
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.false;
    });

    it("GIVEN an account without ATS_ROLES._PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it reverts with AccessControl", async () => {
      const pauses = [externalPauseMock1.target as string];
      const actives = [false];
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      await expect(
        asset.connect(signer_B).updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._PAUSE_MANAGER_ROLE WHEN updating external pauses THEN it succeeds", async () => {
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
      expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
      const pauses = [externalPauseMock1.target as string, externalPauseMock2.target as string];
      const actives = [false, true]; // Remove mock1, keep mock2
      await expect(
        asset.updateExternalPauses(pauses, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalPausesUpdated")
        .withArgs(signer_A.address, pauses, actives);
      expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.false;
      expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
    });
  });

  describe("Initialize Tests", () => {
    it("GIVEN already initialized WHEN initialize_ExternalPauses is called again THEN it reverts with AlreadyInitialized", async () => {
      await expect(asset.initialize_ExternalPauses([])).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });
  });
});
