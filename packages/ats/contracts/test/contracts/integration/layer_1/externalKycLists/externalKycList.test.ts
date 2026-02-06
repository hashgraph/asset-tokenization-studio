// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ADDRESS_ZERO, ATS_ROLES, GAS_LIMIT } from "@scripts";
import { deployEquityTokenFixture } from "@test";

import { ResolverProxy, ExternalKycListManagementFacet, MockedExternalKycList, Pause } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ExternalKycList Management Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let externalKycListManagement: ExternalKycListManagementFacet;
  let pauseFacet: Pause;
  let initMock1: MockedExternalKycList;
  let initMock2: MockedExternalKycList;
  let externalKycListMock1: MockedExternalKycList;
  let externalKycListMock2: MockedExternalKycList;
  let externalKycListMock3: MockedExternalKycList;

  async function deployExternalKycSecurityFixture() {
    const [deployer] = await ethers.getSigners();
    initMock1 = await (await ethers.getContractFactory("MockedExternalKycList", deployer)).deploy();
    await initMock1.waitForDeployment();
    initMock2 = await (await ethers.getContractFactory("MockedExternalKycList", deployer)).deploy();
    await initMock2.waitForDeployment();

    const base = await deployEquityTokenFixture({
      useLoadFixture: false,
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          externalKycLists: [initMock1.target as string, initMock2.target as string],
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    externalKycListManagement = await ethers.getContractAt("ExternalKycListManagementFacet", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    await base.accessControlFacet.grantRole(ATS_ROLES._KYC_MANAGER_ROLE, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);

    externalKycListMock1 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock1.waitForDeployment();

    externalKycListMock2 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock2.waitForDeployment();

    externalKycListMock3 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock3.waitForDeployment();
    // Now we have 2 from initialization + 2 added here = 4 total
    await externalKycListManagement.addExternalKycList(externalKycListMock1.target as string, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalKycListManagement.addExternalKycList(externalKycListMock2.target as string, {
      gasLimit: GAS_LIMIT.default,
    });
  }

  beforeEach(async () => {
    await loadFixture(deployExternalKycSecurityFixture);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external kyc list WHEN added THEN it is listed and event is emitted", async () => {
      const newKycList = externalKycListMock3.target as string;
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.false;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        externalKycListManagement.addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "AddedToExternalKycLists")
        .withArgs(signer_A.address, newKycList);
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.true;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(5);
    });

    it("GIVEN a listed external kyc WHEN adding it again THEN it reverts with ListedKycList", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      await expect(
        externalKycListManagement.addExternalKycList(externalKycListMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "ListedKycList");
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        externalKycListManagement.addExternalKycList(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed external kyc WHEN removed THEN it is unlisted and event is emitted", async () => {
      const kycListToRemove = externalKycListMock1.target as string;
      expect(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.true;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        externalKycListManagement.removeExternalKycList(kycListToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "RemovedFromExternalKycLists")
        .withArgs(signer_A.address, kycListToRemove);
      expect(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.false;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(3);
    });

    it("GIVEN an unlisted external kyc WHEN removing THEN it reverts with UnlistedKycList", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalKycListManagement.isExternalKycList(randomAddress)).to.be.false;
      await expect(
        externalKycListManagement.removeExternalKycList(randomAddress, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "UnlistedKycList");
    });
  });

  describe("Update Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      const kycListsToUpdate = [ADDRESS_ZERO];
      const actives = [true];

      await expect(
        externalKycListManagement.updateExternalKycLists(kycListsToUpdate, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "ZeroAddressNotAllowed");
    });

    it("GIVEN multiple external kyc WHEN updated THEN their statuses are updated and event is emitted", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.target as string)).to.be.false;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture

      const kycListsToUpdate = [externalKycListMock2.target as string, externalKycListMock3.target as string];
      const activesToUpdate = [false, true];

      await expect(
        externalKycListManagement.updateExternalKycLists(kycListsToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalKycListManagement, "ExternalKycListsUpdated")
        .withArgs(signer_A.address, kycListsToUpdate, activesToUpdate);

      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.target as string)).to.be.false;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.target as string)).to.be.true;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(4); // Still 4: removed 1, added 1
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateKycList = externalKycListMock3.target as string;
      expect(await externalKycListManagement.isExternalKycList(duplicateKycList)).to.be.false;

      const kycLists = [duplicateKycList, duplicateKycList];
      const actives = [true, false];

      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateKycList = externalKycListMock1.target as string;
      expect(await externalKycListManagement.isExternalKycList(duplicateKycList)).to.be.true;

      const kycLists = [duplicateKycList, duplicateKycList];
      const actives = [false, true];

      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      const kycLists: string[] = [];
      const actives: boolean[] = [];
      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalKycListManagement, "ExternalKycListsUpdated")
        .withArgs(signer_A.address, kycLists, actives);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount);
    });
  });

  describe("View/Getter Functions", () => {
    it("GIVEN listed and unlisted addresses WHEN isExternalKycList is called THEN it returns the correct status", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalKycListManagement.isExternalKycList(randomAddress)).to.be.false;
      await externalKycListManagement.addExternalKycList(externalKycListMock3.target as string);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.target as string)).to.be.true;
    });

    it("GIVEN granted and revoked addresses WHEN isExternallyGranted is called THEN it returns the correct status", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      // isExternallyGranted returns true only if ALL active external kyc lists have the same status
      // So we need to grant KYC in all 4 active lists (2 from init + 2 from fixture)
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(4);
      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.false;

      // Grant KYC in all 4 active lists
      await initMock1.grantKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await initMock2.grantKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await externalKycListMock1.grantKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await externalKycListMock2.grantKyc(randomAddress, { gasLimit: GAS_LIMIT.default });

      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.true;

      // Revoke KYC in all 4 lists
      await initMock1.revokeKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await initMock2.revokeKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await externalKycListMock1.revokeKyc(randomAddress, { gasLimit: GAS_LIMIT.default });
      await externalKycListMock2.revokeKyc(randomAddress, { gasLimit: GAS_LIMIT.default });

      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 0)).to.be.true; // All have NOT_GRANTED status
    });

    it("GIVEN external kyc lists WHEN getExternalKycListsCount is called THEN it returns the current count", async () => {
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await externalKycListManagement.addExternalKycList(externalKycListMock3.target as string);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(5);
      await externalKycListManagement.removeExternalKycList(externalKycListMock1.target as string);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(4);
      await externalKycListManagement.removeExternalKycList(externalKycListMock2.target as string);
      await externalKycListManagement.removeExternalKycList(externalKycListMock3.target as string);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(2); // 2 from init remain
    });

    it("GIVEN external kyc lists WHEN getExternalKycListsMembers is called THEN it returns paginated members", async () => {
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(4); // 2 from init + 2 from fixture
      let membersPage = await externalKycListManagement.getExternalKycListsMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.target as string,
        initMock2.target as string,
        externalKycListMock1.target as string,
        externalKycListMock2.target as string,
      ]).to.include(membersPage[0]);
      membersPage = await externalKycListManagement.getExternalKycListsMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.target as string,
        initMock2.target as string,
        externalKycListMock1.target as string,
        externalKycListMock2.target as string,
      ]).to.include(membersPage[0]);
      expect(membersPage[0]).to.not.equal((await externalKycListManagement.getExternalKycListsMembers(0, 1))[0]);
      let allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 4);
      expect(allMembers).to.have.lengthOf(4);
      expect(allMembers).to.contain(initMock1.target as string);
      expect(allMembers).to.contain(initMock2.target as string);
      expect(allMembers).to.contain(externalKycListMock1.target as string);
      expect(allMembers).to.contain(externalKycListMock2.target as string);
      await externalKycListManagement.addExternalKycList(externalKycListMock3.target as string);
      allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(5);
      expect(allMembers).to.contain(initMock1.target as string);
      expect(allMembers).to.contain(initMock2.target as string);
      expect(allMembers).to.contain(externalKycListMock1.target as string);
      expect(allMembers).to.contain(externalKycListMock2.target as string);
      expect(allMembers).to.contain(externalKycListMock3.target as string);
      membersPage = await externalKycListManagement.getExternalKycListsMembers(1, 3);
      expect(membersPage).to.have.lengthOf(2); // Page 1 with length 3 returns elements 3-4 (2 elements)
      membersPage = await externalKycListManagement.getExternalKycListsMembers(5, 1);
      expect(membersPage).to.have.lengthOf(0); // Beyond available elements
      await externalKycListManagement.removeExternalKycList(externalKycListMock1.target as string);
      await externalKycListManagement.removeExternalKycList(externalKycListMock2.target as string);
      await externalKycListManagement.removeExternalKycList(externalKycListMock3.target as string);
      allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(2); // 2 from init remain
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without ATS_ROLES._KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it reverts with AccessControl", async () => {
      const newKycList = externalKycListMock3.target as string;
      await expect(
        externalKycListManagement.connect(signer_B).addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it succeeds", async () => {
      const newKycList = externalKycListMock3.target as string;
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.false;
      await expect(
        externalKycListManagement.addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "AddedToExternalKycLists")
        .withArgs(signer_A.address, newKycList);
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.true;
    });

    it("GIVEN an account without ATS_ROLES._KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it reverts with AccessControl", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      await expect(
        externalKycListManagement.connect(signer_B).removeExternalKycList(externalKycListMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it succeeds", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      await expect(
        externalKycListManagement.removeExternalKycList(externalKycListMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "RemovedFromExternalKycLists")
        .withArgs(signer_A.address, externalKycListMock1.target as string);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.false;
    });

    it("GIVEN an account without ATS_ROLES._KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it reverts with AccessControl", async () => {
      const kycLists = [externalKycListMock1.target as string];
      const actives = [false];
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      await expect(
        externalKycListManagement.connect(signer_B).updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it succeeds", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
      const kycLists = [externalKycListMock1.target as string, externalKycListMock2.target as string];
      const actives = [false, true];
      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalKycListManagement, "ExternalKycListsUpdated")
        .withArgs(signer_A.address, kycLists, actives);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.target as string)).to.be.false;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.target as string)).to.be.true;
    });
  });

  describe("Pause Tests", () => {
    it("GIVEN a paused token WHEN addExternalKycList THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      const newKycList = externalKycListMock3.target as string;
      await expect(
        externalKycListManagement.addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN removeExternalKycList THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      await expect(
        externalKycListManagement.removeExternalKycList(externalKycListMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN updateExternalKycLists THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      const kycLists = [externalKycListMock1.target as string];
      const actives = [false];
      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalKycListManagement, "TokenIsPaused");
    });
  });

  describe("Initialize Tests", () => {
    it("GIVEN an already initialized contract WHEN initialize_ExternalKycLists is called again THEN it reverts with ContractAlreadyInitialized", async () => {
      const newKycLists = [externalKycListMock3.target as string];
      await expect(externalKycListManagement.initialize_ExternalKycLists(newKycLists)).to.be.revertedWithCustomError(
        externalKycListManagement,
        "AlreadyInitialized",
      );
    });
  });
});
