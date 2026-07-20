// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockedExternalPause } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@lib";

export function externalPauseTests(getCtx: () => AssetMockCtx): void {
  describe("ExternalPause Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;
    let externalPauseMock1: MockedExternalPause;
    let externalPauseMock2: MockedExternalPause;
    let externalPauseMock3: MockedExternalPause;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;

      externalPauseMock1 = ctx.externalMocks.pause[2];
      externalPauseMock2 = ctx.externalMocks.pause[3];
      externalPauseMock3 = ctx.externalMocks.pause[4];

      asset = ctx.asset;
      await asset.setMultiPartition(true);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_PAUSE_MANAGER, signer_A.address);

      await asset.connect(signer_A).addExternalPause(ctx.externalMocks.pause[0].target as string);
      await asset.connect(signer_A).addExternalPause(ctx.externalMocks.pause[1].target as string);

      await externalPauseMock1.setPaused(false);
      await externalPauseMock2.setPaused(false);
      await externalPauseMock3.setPaused(false);

      await asset.addExternalPause(externalPauseMock1.target as string);
      await asset.addExternalPause(externalPauseMock2.target as string);
    });

    describe("Add Tests", () => {
      it("GIVEN an unlisted external pause WHEN added THEN it is listed and event is emitted", async () => {
        const newPause = externalPauseMock3.target as string;
        expect(await asset.isExternalPause(newPause)).to.be.false;
        const initialCount = await asset.getExternalPausesCount();
        await expect(asset.addExternalPause(newPause))
          .to.emit(asset, "AddedToExternalPauses")
          .withArgs(signer_A.address, newPause);
        expect(await asset.isExternalPause(newPause)).to.be.true;
        expect(await asset.getExternalPausesCount()).to.equal(initialCount + 1n);
      });

      it("GIVEN a listed external pause WHEN adding it again THEN it reverts with ListedPause", async () => {
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        await expect(asset.addExternalPause(externalPauseMock1.target as string)).to.be.revertedWithCustomError(
          asset,
          "ListedPause",
        );
      });

      it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
        await expect(asset.addExternalPause(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });
    });

    describe("Remove Tests", () => {
      it("GIVEN a listed external pause WHEN removed THEN it is unlisted and event is emitted", async () => {
        const pauseToRemove = externalPauseMock1.target as string;
        expect(await asset.isExternalPause(pauseToRemove)).to.be.true;
        const initialCount = await asset.getExternalPausesCount();
        await expect(asset.removeExternalPause(pauseToRemove))
          .to.emit(asset, "RemovedFromExternalPauses")
          .withArgs(signer_A.address, pauseToRemove);
        expect(await asset.isExternalPause(pauseToRemove)).to.be.false;
        expect(await asset.getExternalPausesCount()).to.equal(initialCount - 1n);
      });

      it("GIVEN an unlisted external pause WHEN removing THEN it reverts with UnlistedPause", async () => {
        const randomAddress = ethers.Wallet.createRandom().address;
        expect(await asset.isExternalPause(randomAddress)).to.be.false;
        await expect(asset.removeExternalPause(randomAddress)).to.be.revertedWithCustomError(asset, "UnlistedPause");
      });
    });

    describe("Update Tests", () => {
      it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
        const pausesToUpdate = [ADDRESS_ZERO];
        const actives = [true];

        await expect(asset.updateExternalPauses(pausesToUpdate, actives)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN multiple external pauses WHEN updated THEN their statuses are updated and event is emitted", async () => {
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
        expect(await asset.isExternalPause(externalPauseMock3.target as string)).to.be.false;
        const initialCount = await asset.getExternalPausesCount();
        expect(initialCount).to.equal(4);

        const pausesToUpdate = [externalPauseMock2.target as string, externalPauseMock3.target as string];
        const activesToUpdate = [false, true];

        await expect(asset.updateExternalPauses(pausesToUpdate, activesToUpdate))
          .to.emit(asset, "ExternalPausesUpdated")
          .withArgs(signer_A.address, pausesToUpdate, activesToUpdate);

        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.false;
        expect(await asset.isExternalPause(externalPauseMock3.target as string)).to.be.true;
        expect(await asset.getExternalPausesCount()).to.equal(initialCount - 1n + 1n);
      });

      it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
        const duplicatePause = externalPauseMock3.target as string;
        expect(await asset.isExternalPause(duplicatePause)).to.be.false;

        const pauses = [duplicatePause, duplicatePause];
        const actives = [true, false];

        await expect(asset.updateExternalPauses(pauses, actives)).to.be.revertedWithCustomError(
          asset,
          "ContradictoryValuesInArray",
        );
      });

      it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
        const duplicatePause = externalPauseMock1.target as string;
        expect(await asset.isExternalPause(duplicatePause)).to.be.true;

        const pauses = [duplicatePause, duplicatePause];
        const actives = [false, true];

        await expect(asset.updateExternalPauses(pauses, actives)).to.be.revertedWithCustomError(
          asset,
          "ContradictoryValuesInArray",
        );
      });

      it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
        const initialCount = await asset.getExternalPausesCount();
        const pauses: string[] = [];
        const actives: boolean[] = [];
        await expect(asset.updateExternalPauses(pauses, actives))
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
        expect(initialCount).to.equal(4);
        await asset.addExternalPause(externalPauseMock3.target as string);
        expect(await asset.getExternalPausesCount()).to.equal(initialCount + 1n);
        await asset.removeExternalPause(externalPauseMock1.target as string);
        expect(await asset.getExternalPausesCount()).to.equal(initialCount);
        await asset.removeExternalPause(externalPauseMock2.target as string);
        await asset.removeExternalPause(externalPauseMock3.target as string);
        expect(await asset.getExternalPausesCount()).to.equal(2);
      });

      it("GIVEN external pauses WHEN getExternalPausesMembers is called THEN it returns paginated members", async () => {
        expect(await asset.getExternalPausesCount()).to.equal(4);

        let membersPage = await asset.getExternalPausesMembers(0, 1);
        expect(membersPage).to.have.lengthOf(1);
        const firstMember = membersPage[0];

        membersPage = await asset.getExternalPausesMembers(1, 1);
        expect(membersPage).to.have.lengthOf(1);
        expect(membersPage[0]).to.not.equal(firstMember);

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
        expect(allMembers).to.have.lengthOf(2);
      });
    });

    describe("Pause Modifier Tests (onlyUnpaused)", () => {
      it("GIVEN an external pause is paused WHEN calling addExternalPause or updateExternalPauses THEN they revert with IsPaused", async () => {
        await externalPauseMock1.setPaused(true);
        await expect(asset.addExternalPause(externalPauseMock3.target as string)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
        const pauses = [externalPauseMock2.target as string];
        const actives = [false];
        await expect(asset.updateExternalPauses(pauses, actives)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN all external pauses are unpaused WHEN calling a function with onlyUnpaused THEN it succeeds", async () => {
        expect(await externalPauseMock1.isPaused()).to.be.false;
        expect(await externalPauseMock2.isPaused()).to.be.false;
        await expect(asset.addExternalPause(externalPauseMock3.target as string)).to.not.be.reverted;
        await expect(asset.removeExternalPause(externalPauseMock1.target as string)).to.not.be.reverted;
        const pauses = [externalPauseMock2.target as string];
        const actives = [false];
        await expect(asset.updateExternalPauses(pauses, actives)).to.not.be.reverted;
      });
    });

    describe("External Pause Removal Deadlock", () => {
      it("GIVEN a stuck external pause (always paused) AND internal flag is NOT set WHEN removeExternalPause THEN it succeeds", async () => {
        await externalPauseMock1.setPaused(true);
        await expect(asset.removeExternalPause(externalPauseMock1.target as string)).to.not.be.reverted;
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.false;
      });

      it("GIVEN the internal pause flag IS set WHEN removeExternalPause THEN it reverts with IsPaused", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
        await asset.pause();
        expect(await asset.paused()).to.be.true;
        await expect(asset.removeExternalPause(externalPauseMock1.target as string)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("Access Control Tests", () => {
      it("GIVEN an account without ATS_ROLES.ROLE_PAUSE_MANAGER WHEN adding an external pause THEN it reverts with AccessControl", async () => {
        const newPause = externalPauseMock3.target as string;
        await expect(asset.connect(signer_B).addExternalPause(newPause)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_PAUSE_MANAGER WHEN adding an external pause THEN it succeeds", async () => {
        const newPause = externalPauseMock3.target as string;
        expect(await asset.isExternalPause(newPause)).to.be.false;
        await expect(asset.addExternalPause(newPause))
          .to.emit(asset, "AddedToExternalPauses")
          .withArgs(signer_A.address, newPause);
        expect(await asset.isExternalPause(newPause)).to.be.true;
      });

      it("GIVEN an account without ATS_ROLES.ROLE_PAUSE_MANAGER WHEN removing an external pause THEN it reverts with AccessControl", async () => {
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        await expect(
          asset.connect(signer_B).removeExternalPause(externalPauseMock1.target as string),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an account with ATS_ROLES.ROLE_PAUSE_MANAGER WHEN removing an external pause THEN it succeeds", async () => {
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        await expect(asset.removeExternalPause(externalPauseMock1.target as string))
          .to.emit(asset, "RemovedFromExternalPauses")
          .withArgs(signer_A.address, externalPauseMock1.target as string);
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.false;
      });

      it("GIVEN an account without ATS_ROLES.ROLE_PAUSE_MANAGER WHEN updating external pauses THEN it reverts with AccessControl", async () => {
        const pauses = [externalPauseMock1.target as string];
        const actives = [false];
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        await expect(asset.connect(signer_B).updateExternalPauses(pauses, actives)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_PAUSE_MANAGER WHEN updating external pauses THEN it succeeds", async () => {
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.true;
        expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
        const pauses = [externalPauseMock1.target as string, externalPauseMock2.target as string];
        const actives = [false, true];
        await expect(asset.updateExternalPauses(pauses, actives))
          .to.emit(asset, "ExternalPausesUpdated")
          .withArgs(signer_A.address, pauses, actives);
        expect(await asset.isExternalPause(externalPauseMock1.target as string)).to.be.false;
        expect(await asset.isExternalPause(externalPauseMock2.target as string)).to.be.true;
      });
    });

    describe("Initialize Tests", () => {
      it("GIVEN already initialized WHEN initializeExternalPauses is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.initializeExternalPauses([])).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });

      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeExternalPauses is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeExternalPauses([])).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
    });

    describe("initializeExternalPauses event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeExternalPauses is called THEN it emits ExternalPauseInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalPauseManagement);
        await expect(asset.initializeExternalPauses([])).to.emit(asset, "ExternalPauseInitialized");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN addExternalPause THEN transaction fails with Deactivated", async () => {
        await expect(asset.addExternalPause(ADDRESS_ZERO)).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN updateExternalPauses THEN transaction fails with Deactivated", async () => {
        await expect(asset.updateExternalPauses([], [])).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN removeExternalPause THEN transaction fails with Deactivated", async () => {
        await expect(asset.removeExternalPause(ADDRESS_ZERO)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN addExternalPause THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.addExternalPause("0x0000000000000000000000000000000000000001"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN removeExternalPause THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.removeExternalPause("0x0000000000000000000000000000000000000001"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN updateExternalPauses THEN reverts with AssetNotOperational", async () => {
        await expect(asset.updateExternalPauses([], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
