import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { ADDRESS_ZERO, ATS_ROLES, GAS_LIMIT } from "@scripts";
import { deployEquityTokenFixture } from "@test";
import { ResolverProxy, ExternalKycListManagement, MockedExternalKycList } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ExternalKycList Management Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;

  let externalKycListManagement: ExternalKycListManagement;
  let externalKycListMock1: MockedExternalKycList;
  let externalKycListMock2: MockedExternalKycList;
  let externalKycListMock3: MockedExternalKycList;
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

    externalKycListManagement = await ethers.getContractAt("ExternalKycListManagement", diamond.address, signer_A);
    await base.accessControlFacet.grantRole(ATS_ROLES._KYC_MANAGER_ROLE, signer_A.address);

    externalKycListMock1 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock1.deployed();

    externalKycListMock2 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock2.deployed();

    externalKycListMock3 = await (await ethers.getContractFactory("MockedExternalKycList", signer_A)).deploy();
    await externalKycListMock3.deployed();
    await externalKycListManagement.addExternalKycList(externalKycListMock1.address, { gasLimit: GAS_LIMIT.default });
    await externalKycListManagement.addExternalKycList(externalKycListMock2.address, { gasLimit: GAS_LIMIT.default });
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external kyc list WHEN added THEN it is listed and event is emitted", async () => {
      const newKycList = externalKycListMock3.address;
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.false;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      await expect(
        externalKycListManagement.addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "AddedToExternalKycLists")
        .withArgs(signer_A.address, newKycList);
      expect(await externalKycListManagement.isExternalKycList(newKycList)).to.be.true;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.add(1));
    });

    it("GIVEN a listed external kyc WHEN adding it again THEN it reverts with ListedKycList", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      await expect(
        externalKycListManagement.addExternalKycList(externalKycListMock1.address, { gasLimit: GAS_LIMIT.default }),
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
      const kycListToRemove = externalKycListMock1.address;
      expect(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.true;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      await expect(
        externalKycListManagement.removeExternalKycList(kycListToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalKycListManagement, "RemovedFromExternalKycLists")
        .withArgs(signer_A.address, kycListToRemove);
      expect(await externalKycListManagement.isExternalKycList(kycListToRemove)).to.be.false;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.sub(1));
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
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.false;
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(2);

      const kycListsToUpdate = [externalKycListMock2.address, externalKycListMock3.address];
      const activesToUpdate = [false, true];

      await expect(
        externalKycListManagement.updateExternalKycLists(kycListsToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalKycListManagement, "ExternalKycListsUpdated")
        .withArgs(signer_A.address, kycListsToUpdate, activesToUpdate);

      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.false;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.true;
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.sub(1).add(1));
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateKycList = externalKycListMock3.address;
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
      const duplicateKycList = externalKycListMock1.address;
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
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalKycListManagement.isExternalKycList(randomAddress)).to.be.false;
      await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock3.address)).to.be.true;
    });

    it("GIVEN granted and revoked addresses WHEN isExternallyGranted is called THEN it returns the correct status", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      await externalKycListManagement.removeExternalKycList(externalKycListMock2.address, {
        gasLimit: GAS_LIMIT.default,
      });
      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.false;

      await externalKycListMock1.grantKyc(randomAddress, {
        gasLimit: GAS_LIMIT.default,
      });

      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.true;

      await externalKycListMock1.revokeKyc(randomAddress, {
        gasLimit: GAS_LIMIT.default,
      });

      expect(await externalKycListManagement.isExternallyGranted(randomAddress, 1)).to.be.false;
    });

    it("GIVEN external kyc lists WHEN getExternalKycListsCount is called THEN it returns the current count", async () => {
      const initialCount = await externalKycListManagement.getExternalKycListsCount();
      expect(initialCount).to.equal(2);
      await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount.add(1));
      await externalKycListManagement.removeExternalKycList(externalKycListMock1.address);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(initialCount);
      await externalKycListManagement.removeExternalKycList(externalKycListMock2.address);
      await externalKycListManagement.removeExternalKycList(externalKycListMock3.address);
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(0);
    });

    it("GIVEN external kyc lists WHEN getExternalKycListsMembers is called THEN it returns paginated members", async () => {
      expect(await externalKycListManagement.getExternalKycListsCount()).to.equal(2);
      let membersPage = await externalKycListManagement.getExternalKycListsMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([externalKycListMock1.address, externalKycListMock2.address]).to.include(membersPage[0]);
      membersPage = await externalKycListManagement.getExternalKycListsMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([externalKycListMock1.address, externalKycListMock2.address]).to.include(membersPage[0]);
      expect(membersPage[0]).to.not.equal((await externalKycListManagement.getExternalKycListsMembers(0, 1))[0]);
      let allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 2);
      expect(allMembers).to.have.lengthOf(2);
      expect(allMembers).to.contain(externalKycListMock1.address);
      expect(allMembers).to.contain(externalKycListMock2.address);
      await externalKycListManagement.addExternalKycList(externalKycListMock3.address);
      allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 3);
      expect(allMembers).to.have.lengthOf(3);
      expect(allMembers).to.contain(externalKycListMock1.address);
      expect(allMembers).to.contain(externalKycListMock2.address);
      expect(allMembers).to.contain(externalKycListMock3.address);
      membersPage = await externalKycListManagement.getExternalKycListsMembers(1, 2);
      expect(membersPage).to.have.lengthOf(1);
      membersPage = await externalKycListManagement.getExternalKycListsMembers(3, 1);
      expect(membersPage).to.have.lengthOf(0);
      await externalKycListManagement.removeExternalKycList(externalKycListMock1.address);
      await externalKycListManagement.removeExternalKycList(externalKycListMock2.address);
      await externalKycListManagement.removeExternalKycList(externalKycListMock3.address);
      allMembers = await externalKycListManagement.getExternalKycListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(0);
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without ATS_ROLES._KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it reverts with AccessControl", async () => {
      const newKycList = externalKycListMock3.address;
      await expect(
        externalKycListManagement.connect(signer_B).addExternalKycList(newKycList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it succeeds", async () => {
      const newKycList = externalKycListMock3.address;
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
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      await expect(
        externalKycListManagement.connect(signer_B).removeExternalKycList(externalKycListMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it succeeds", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      await expect(
        externalKycListManagement.removeExternalKycList(externalKycListMock1.address, { gasLimit: GAS_LIMIT.default }),
      )
        .to.emit(externalKycListManagement, "RemovedFromExternalKycLists")
        .withArgs(signer_A.address, externalKycListMock1.address);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.false;
    });

    it("GIVEN an account without ATS_ROLES._KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it reverts with AccessControl", async () => {
      const kycLists = [externalKycListMock1.address];
      const actives = [false];
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      await expect(
        externalKycListManagement.connect(signer_B).updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with ATS_ROLES._KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it succeeds", async () => {
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.true;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
      const kycLists = [externalKycListMock1.address, externalKycListMock2.address];
      const actives = [false, true];
      await expect(
        externalKycListManagement.updateExternalKycLists(kycLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalKycListManagement, "ExternalKycListsUpdated")
        .withArgs(signer_A.address, kycLists, actives);
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock1.address)).to.be.false;
      expect(await externalKycListManagement.isExternalKycList(externalKycListMock2.address)).to.be.true;
    });
  });
});
