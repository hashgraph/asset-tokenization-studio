// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockedExternalKycList } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@lib";

export function externalKycListTests(getCtx: () => AssetMockCtx): void {
  describe("ExternalKycList Management Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;
    let initMock1: MockedExternalKycList;
    let initMock2: MockedExternalKycList;
    let externalKycListMock1: MockedExternalKycList;
    let externalKycListMock2: MockedExternalKycList;
    let externalKycListMock3: MockedExternalKycList;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;

      initMock1 = ctx.externalMocks.kyc[0];
      initMock2 = ctx.externalMocks.kyc[1];
      externalKycListMock1 = ctx.externalMocks.kyc[2];
      externalKycListMock2 = ctx.externalMocks.kyc[3];
      externalKycListMock3 = ctx.externalMocks.kyc[4];

      asset = ctx.asset;
      await asset.setMultiPartition(true);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_KYC_MANAGER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);

      await asset.connect(signer_A).addExternalKycList(initMock1.target as string);
      await asset.connect(signer_A).addExternalKycList(initMock2.target as string);
      await asset.connect(signer_A).addExternalKycList(externalKycListMock1.target as string);
      await asset.connect(signer_A).addExternalKycList(externalKycListMock2.target as string);
    });

    describe("Add Tests", () => {
      it("GIVEN an unlisted external kyc list WHEN added THEN it is listed and event is emitted", async () => {
        const newKycList = externalKycListMock3.target as string;
        expect(await asset.isExternalKycList(newKycList)).to.be.false;
        const initialCount = await asset.getExternalKycListsCount();
        expect(initialCount).to.equal(4);
        await expect(asset.connect(signer_A).addExternalKycList(newKycList))
          .to.emit(asset, "AddedToExternalKycLists")
          .withArgs(signer_A.address, newKycList);
        expect(await asset.isExternalKycList(newKycList)).to.be.true;
        expect(await asset.getExternalKycListsCount()).to.equal(5);
      });

      it("GIVEN a listed external kyc WHEN adding it again THEN it reverts with ListedKycList", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        await expect(
          asset.connect(signer_A).addExternalKycList(externalKycListMock1.target as string),
        ).to.be.revertedWithCustomError(asset, "ListedKycList");
      });

      it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });
    });

    describe("Remove Tests", () => {
      it("GIVEN a listed external kyc WHEN removed THEN it is unlisted and event is emitted", async () => {
        const kycListToRemove = externalKycListMock1.target as string;
        expect(await asset.isExternalKycList(kycListToRemove)).to.be.true;
        const initialCount = await asset.getExternalKycListsCount();
        expect(initialCount).to.equal(4);
        await expect(asset.connect(signer_A).removeExternalKycList(kycListToRemove))
          .to.emit(asset, "RemovedFromExternalKycLists")
          .withArgs(signer_A.address, kycListToRemove);
        expect(await asset.isExternalKycList(kycListToRemove)).to.be.false;
        expect(await asset.getExternalKycListsCount()).to.equal(3);
      });

      it("GIVEN an unlisted external kyc WHEN removing THEN it reverts with UnlistedKycList", async () => {
        const randomAddress = ethers.Wallet.createRandom().address;
        expect(await asset.isExternalKycList(randomAddress)).to.be.false;
        await expect(asset.connect(signer_A).removeExternalKycList(randomAddress)).to.be.revertedWithCustomError(
          asset,
          "UnlistedKycList",
        );
      });
    });

    describe("Update Tests", () => {
      it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
        const kycListsToUpdate = [ADDRESS_ZERO];
        const actives = [true];

        await expect(
          asset.connect(signer_A).updateExternalKycLists(kycListsToUpdate, actives),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN multiple external kyc WHEN updated THEN their statuses are updated and event is emitted", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        expect(await asset.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
        expect(await asset.isExternalKycList(externalKycListMock3.target as string)).to.be.false;
        const initialCount = await asset.getExternalKycListsCount();
        expect(initialCount).to.equal(4);

        const kycListsToUpdate = [externalKycListMock2.target as string, externalKycListMock3.target as string];
        const activesToUpdate = [false, true];

        await expect(asset.connect(signer_A).updateExternalKycLists(kycListsToUpdate, activesToUpdate))
          .to.emit(asset, "ExternalKycListsUpdated")
          .withArgs(signer_A.address, kycListsToUpdate, activesToUpdate);

        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        expect(await asset.isExternalKycList(externalKycListMock2.target as string)).to.be.false;
        expect(await asset.isExternalKycList(externalKycListMock3.target as string)).to.be.true;
        expect(await asset.getExternalKycListsCount()).to.equal(4);
      });

      it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
        const duplicateKycList = externalKycListMock3.target as string;
        expect(await asset.isExternalKycList(duplicateKycList)).to.be.false;

        const kycLists = [duplicateKycList, duplicateKycList];
        const actives = [true, false];

        await expect(asset.connect(signer_A).updateExternalKycLists(kycLists, actives)).to.be.revertedWithCustomError(
          asset,
          "ContradictoryValuesInArray",
        );
      });

      it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
        const duplicateKycList = externalKycListMock1.target as string;
        expect(await asset.isExternalKycList(duplicateKycList)).to.be.true;

        const kycLists = [duplicateKycList, duplicateKycList];
        const actives = [false, true];

        await expect(asset.connect(signer_A).updateExternalKycLists(kycLists, actives)).to.be.revertedWithCustomError(
          asset,
          "ContradictoryValuesInArray",
        );
      });

      it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
        const initialCount = await asset.getExternalKycListsCount();
        const kycLists: string[] = [];
        const actives: boolean[] = [];
        await expect(asset.connect(signer_A).updateExternalKycLists(kycLists, actives))
          .to.emit(asset, "ExternalKycListsUpdated")
          .withArgs(signer_A.address, kycLists, actives);
        expect(await asset.getExternalKycListsCount()).to.equal(initialCount);
      });
    });

    describe("View/Getter Functions", () => {
      it("GIVEN listed and unlisted addresses WHEN isExternalKycList is called THEN it returns the correct status", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        expect(await asset.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
        const randomAddress = ethers.Wallet.createRandom().address;
        expect(await asset.isExternalKycList(randomAddress)).to.be.false;
        await asset.connect(signer_A).addExternalKycList(externalKycListMock3.target as string);
        expect(await asset.isExternalKycList(externalKycListMock3.target as string)).to.be.true;
      });

      it("GIVEN granted and revoked addresses WHEN isExternallyGranted is called THEN it returns the correct status", async () => {
        const randomAddress = ethers.Wallet.createRandom().address;
        expect(await asset.getExternalKycListsCount()).to.equal(4);
        expect(await asset.isExternallyGranted(randomAddress, 1)).to.be.false;

        await initMock1.grantKyc(randomAddress);
        await initMock2.grantKyc(randomAddress);
        await externalKycListMock1.grantKyc(randomAddress);
        await externalKycListMock2.grantKyc(randomAddress);

        expect(await asset.isExternallyGranted(randomAddress, 1)).to.be.true;

        await initMock1.revokeKyc(randomAddress);
        await initMock2.revokeKyc(randomAddress);
        await externalKycListMock1.revokeKyc(randomAddress);
        await externalKycListMock2.revokeKyc(randomAddress);

        expect(await asset.isExternallyGranted(randomAddress, 0)).to.be.true;
      });

      it("GIVEN external kyc lists WHEN getExternalKycListsCount is called THEN it returns the current count", async () => {
        const initialCount = await asset.getExternalKycListsCount();
        expect(initialCount).to.equal(4);
        await asset.connect(signer_A).addExternalKycList(externalKycListMock3.target as string);
        expect(await asset.getExternalKycListsCount()).to.equal(5);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock1.target as string);
        expect(await asset.getExternalKycListsCount()).to.equal(4);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock2.target as string);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock3.target as string);
        expect(await asset.getExternalKycListsCount()).to.equal(2);
      });

      it("GIVEN external kyc lists WHEN getExternalKycListsMembers is called THEN it returns paginated members", async () => {
        expect(await asset.getExternalKycListsCount()).to.equal(4);
        let membersPage = await asset.getExternalKycListsMembers(0, 1);
        expect(membersPage).to.have.lengthOf(1);
        expect([
          initMock1.target as string,
          initMock2.target as string,
          externalKycListMock1.target as string,
          externalKycListMock2.target as string,
        ]).to.include(membersPage[0]);
        membersPage = await asset.getExternalKycListsMembers(1, 1);
        expect(membersPage).to.have.lengthOf(1);
        expect([
          initMock1.target as string,
          initMock2.target as string,
          externalKycListMock1.target as string,
          externalKycListMock2.target as string,
        ]).to.include(membersPage[0]);
        expect(membersPage[0]).to.not.equal((await asset.getExternalKycListsMembers(0, 1))[0]);
        let allMembers = await asset.getExternalKycListsMembers(0, 4);
        expect(allMembers).to.have.lengthOf(4);
        expect(allMembers).to.contain(initMock1.target as string);
        expect(allMembers).to.contain(initMock2.target as string);
        expect(allMembers).to.contain(externalKycListMock1.target as string);
        expect(allMembers).to.contain(externalKycListMock2.target as string);
        await asset.connect(signer_A).addExternalKycList(externalKycListMock3.target as string);
        allMembers = await asset.getExternalKycListsMembers(0, 5);
        expect(allMembers).to.have.lengthOf(5);
        expect(allMembers).to.contain(initMock1.target as string);
        expect(allMembers).to.contain(initMock2.target as string);
        expect(allMembers).to.contain(externalKycListMock1.target as string);
        expect(allMembers).to.contain(externalKycListMock2.target as string);
        expect(allMembers).to.contain(externalKycListMock3.target as string);
        membersPage = await asset.getExternalKycListsMembers(1, 3);
        expect(membersPage).to.have.lengthOf(2);
        membersPage = await asset.getExternalKycListsMembers(5, 1);
        expect(membersPage).to.have.lengthOf(0);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock1.target as string);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock2.target as string);
        await asset.connect(signer_A).removeExternalKycList(externalKycListMock3.target as string);
        allMembers = await asset.getExternalKycListsMembers(0, 5);
        expect(allMembers).to.have.lengthOf(2);
      });
    });

    describe("Access Control Tests", () => {
      it("GIVEN an account without ATS_ROLES.ROLE_KYC_MANAGER WHEN adding an external kyc list THEN it reverts with AccessControl", async () => {
        const newKycList = externalKycListMock3.target as string;
        await expect(asset.connect(signer_B).addExternalKycList(newKycList)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_KYC_MANAGER WHEN adding an external kyc list THEN it succeeds", async () => {
        const newKycList = externalKycListMock3.target as string;
        expect(await asset.isExternalKycList(newKycList)).to.be.false;
        await expect(asset.connect(signer_A).addExternalKycList(newKycList))
          .to.emit(asset, "AddedToExternalKycLists")
          .withArgs(signer_A.address, newKycList);
        expect(await asset.isExternalKycList(newKycList)).to.be.true;
      });

      it("GIVEN an account without ATS_ROLES.ROLE_KYC_MANAGER WHEN removing an external kyc list THEN it reverts with AccessControl", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        await expect(
          asset.connect(signer_B).removeExternalKycList(externalKycListMock1.target as string),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an account with ATS_ROLES.ROLE_KYC_MANAGER WHEN removing an external kyc list THEN it succeeds", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        await expect(asset.connect(signer_A).removeExternalKycList(externalKycListMock1.target as string))
          .to.emit(asset, "RemovedFromExternalKycLists")
          .withArgs(signer_A.address, externalKycListMock1.target as string);
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.false;
      });

      it("GIVEN an account without ATS_ROLES.ROLE_KYC_MANAGER WHEN updating external kyc lists THEN it reverts with AccessControl", async () => {
        const kycLists = [externalKycListMock1.target as string];
        const actives = [false];
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        await expect(asset.connect(signer_B).updateExternalKycLists(kycLists, actives)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account with ATS_ROLES.ROLE_KYC_MANAGER WHEN updating external kyc lists THEN it succeeds", async () => {
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
        expect(await asset.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
        const kycLists = [externalKycListMock1.target as string, externalKycListMock2.target as string];
        const actives = [false, true];
        await expect(asset.connect(signer_A).updateExternalKycLists(kycLists, actives))
          .to.emit(asset, "ExternalKycListsUpdated")
          .withArgs(signer_A.address, kycLists, actives);
        expect(await asset.isExternalKycList(externalKycListMock1.target as string)).to.be.false;
        expect(await asset.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
      });
    });

    describe("Pause Tests", () => {
      it("GIVEN a paused token WHEN addExternalKycList THEN it reverts with IsPaused", async () => {
        await asset.connect(signer_A).pause();
        const newKycList = externalKycListMock3.target as string;
        await expect(asset.connect(signer_A).addExternalKycList(newKycList)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN a paused token WHEN removeExternalKycList THEN it reverts with IsPaused", async () => {
        await asset.connect(signer_A).pause();
        await expect(
          asset.connect(signer_A).removeExternalKycList(externalKycListMock1.target as string),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a paused token WHEN updateExternalKycLists THEN it reverts with IsPaused", async () => {
        await asset.connect(signer_A).pause();
        const kycLists = [externalKycListMock1.target as string];
        const actives = [false];
        await expect(asset.connect(signer_A).updateExternalKycLists(kycLists, actives)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("Initialize Tests", () => {
      it("GIVEN an already initialized contract WHEN initializeExternalKycLists is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        const newKycLists = [externalKycListMock3.target as string];
        await expect(asset.connect(signer_A).initializeExternalKycLists(newKycLists)).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });

      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeExternalKycLists is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_D).initializeExternalKycLists([initMock1.target as string]),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("initializeExternalKycLists event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeExternalKycLists is called THEN it emits ExternalKycListInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalKycListManagement);
        await expect(asset.initializeExternalKycLists([initMock1.target as string])).to.emit(
          asset,
          "ExternalKycListInitialized",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN addExternalKycList THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN updateExternalKycLists THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).updateExternalKycLists([], [])).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN removeExternalKycList THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).removeExternalKycList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN addExternalKycList THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.addExternalKycList("0x0000000000000000000000000000000000000001"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN removeExternalKycList THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.removeExternalKycList("0x0000000000000000000000000000000000000001"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN updateExternalKycLists THEN reverts with AssetNotOperational", async () => {
        await expect(asset.updateExternalKycLists([], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
