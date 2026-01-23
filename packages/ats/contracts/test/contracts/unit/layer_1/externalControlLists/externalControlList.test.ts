import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  MockedWhitelist,
  MockedBlacklist,
  ResolverProxy,
  Pause,
  ExternalControlListManagementFacet,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, GAS_LIMIT } from "@scripts";

describe("ExternalControlList Management Tests", () => {
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;

  let diamond: ResolverProxy;
  let externalControlListManagement: ExternalControlListManagementFacet;
  let pauseFacet: Pause;
  let initMock1: MockedWhitelist;
  let initMock2: MockedBlacklist;
  let externalWhitelistMock1: MockedWhitelist;
  let externalBlacklistMock1: MockedBlacklist;
  let externalWhitelistMock2: MockedWhitelist;

  async function deployExternalControlListTokenSecurity() {
    const [deployer] = await ethers.getSigners();
    initMock1 = await (await ethers.getContractFactory("MockedWhitelist", deployer)).deploy();
    await initMock1.deployed();
    initMock2 = await (await ethers.getContractFactory("MockedBlacklist", deployer)).deploy();
    await initMock2.deployed();

    const base = await deployEquityTokenFixture({
      useLoadFixture: false,
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          externalControlLists: [initMock1.address, initMock2.address],
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    externalControlListManagement = await ethers.getContractAt(
      "ExternalControlListManagementFacet",
      diamond.address,
      signer_A,
    );
    pauseFacet = await ethers.getContractAt("Pause", diamond.address, signer_A);

    await base.accessControlFacet.grantRole(ATS_ROLES._CONTROL_LIST_MANAGER_ROLE, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);

    externalWhitelistMock1 = await (await ethers.getContractFactory("MockedWhitelist", signer_A)).deploy();
    await externalWhitelistMock1.deployed();

    externalBlacklistMock1 = await (await ethers.getContractFactory("MockedBlacklist", signer_A)).deploy();
    await externalBlacklistMock1.deployed();

    externalWhitelistMock2 = await (await ethers.getContractFactory("MockedWhitelist", signer_A)).deploy();
    await externalWhitelistMock2.deployed();

    await externalControlListManagement.addExternalControlList(externalWhitelistMock1.address, {
      gasLimit: GAS_LIMIT.default,
    });
    await externalControlListManagement.addExternalControlList(externalBlacklistMock1.address, {
      gasLimit: GAS_LIMIT.default,
    });
  }

  beforeEach(async () => {
    await loadFixture(deployExternalControlListTokenSecurity);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external control list WHEN added THEN it is listed and event is emitted", async () => {
      const newControlList = externalWhitelistMock2.address;
      expect(await externalControlListManagement.isExternalControlList(newControlList)).to.be.false;
      const initialCount = await externalControlListManagement.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        externalControlListManagement.addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalControlListManagement, "AddedToExternalControlLists")
        .withArgs(signer_A.address, newControlList);
      expect(await externalControlListManagement.isExternalControlList(newControlList)).to.be.true;
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(5);
    });

    it("GIVEN a listed external control list WHEN adding it again THEN it reverts with ListedControlList", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      await expect(
        externalControlListManagement.addExternalControlList(externalWhitelistMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "ListedControlList");
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        externalControlListManagement.addExternalControlList(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed external control list WHEN removed THEN it is unlisted and event is emitted", async () => {
      const controlListToRemove = externalWhitelistMock1.address;
      expect(await externalControlListManagement.isExternalControlList(controlListToRemove)).to.be.true;
      const initialCount = await externalControlListManagement.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        externalControlListManagement.removeExternalControlList(controlListToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalControlListManagement, "RemovedFromExternalControlLists")
        .withArgs(signer_A.address, controlListToRemove);
      expect(await externalControlListManagement.isExternalControlList(controlListToRemove)).to.be.false;
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(3);
    });

    it("GIVEN an unlisted external control list WHEN removing THEN it reverts with UnlistedControlList", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalControlListManagement.isExternalControlList(randomAddress)).to.be.false;
      await expect(
        externalControlListManagement.removeExternalControlList(randomAddress, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "UnlistedControlList");
    });
  });

  describe("Update Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      const controlLists = [ADDRESS_ZERO];
      const actives = [true];

      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "ZeroAddressNotAllowed");
    });

    it("GIVEN multiple external control lists WHEN updated THEN their statuses are updated and event is emitted", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      expect(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.false;
      const initialCount = await externalControlListManagement.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture

      const controlListsToUpdate = [externalBlacklistMock1.address, externalWhitelistMock2.address];
      const activesToUpdate = [false, true];

      await expect(
        externalControlListManagement.updateExternalControlLists(controlListsToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalControlListManagement, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlListsToUpdate, activesToUpdate);

      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      expect(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.false;
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.true;
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(4); // Still 4: removed 1, added 1
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateControlList = externalWhitelistMock2.address;
      expect(await externalControlListManagement.isExternalControlList(duplicateControlList)).to.be.false;

      const controlLists = [duplicateControlList, duplicateControlList];
      const actives = [true, false];

      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateControlList = externalWhitelistMock1.address;
      expect(await externalControlListManagement.isExternalControlList(duplicateControlList)).to.be.true;

      const controlLists = [duplicateControlList, duplicateControlList];
      const actives = [false, true];

      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "ContradictoryValuesInArray");
    });

    it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
      const initialCount = await externalControlListManagement.getExternalControlListsCount();
      const controlLists: string[] = [];
      const actives: boolean[] = [];
      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalControlListManagement, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlLists, actives);
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(initialCount);
    });
  });

  describe("View/Getter Functions", () => {
    it("GIVEN listed and unlisted addresses WHEN isExternalControlList is called THEN it returns the correct status", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      expect(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await externalControlListManagement.isExternalControlList(randomAddress)).to.be.false;
      await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock2.address)).to.be.true;
    });

    it("GIVEN external control lists WHEN getExternalControlListsCount is called THEN it returns the current count", async () => {
      const initialCount = await externalControlListManagement.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(5);
      await externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address);
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(4);
      await externalControlListManagement.removeExternalControlList(externalBlacklistMock1.address);
      await externalControlListManagement.removeExternalControlList(externalWhitelistMock2.address);
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(2); // 2 from init remain
    });

    it("GIVEN external control lists WHEN getExternalControlListsMembers is called THEN it returns paginated members", async () => {
      expect(await externalControlListManagement.getExternalControlListsCount()).to.equal(4); // 2 from init + 2 from fixture
      let membersPage = await externalControlListManagement.getExternalControlListsMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.address,
        initMock2.address,
        externalWhitelistMock1.address,
        externalBlacklistMock1.address,
      ]).to.include(membersPage[0]);

      membersPage = await externalControlListManagement.getExternalControlListsMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.address,
        initMock2.address,
        externalWhitelistMock1.address,
        externalBlacklistMock1.address,
      ]).to.include(membersPage[0]);
      expect(membersPage[0]).to.not.equal(
        (await externalControlListManagement.getExternalControlListsMembers(0, 1))[0],
      );

      let allMembers = await externalControlListManagement.getExternalControlListsMembers(0, 4);
      expect(allMembers).to.have.lengthOf(4);
      expect(allMembers).to.contain(initMock1.address);
      expect(allMembers).to.contain(initMock2.address);
      expect(allMembers).to.contain(externalWhitelistMock1.address);
      expect(allMembers).to.contain(externalBlacklistMock1.address);

      await externalControlListManagement.addExternalControlList(externalWhitelistMock2.address);
      allMembers = await externalControlListManagement.getExternalControlListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(5);
      expect(allMembers).to.contain(initMock1.address);
      expect(allMembers).to.contain(initMock2.address);
      expect(allMembers).to.contain(externalWhitelistMock1.address);
      expect(allMembers).to.contain(externalBlacklistMock1.address);
      expect(allMembers).to.contain(externalWhitelistMock2.address);

      membersPage = await externalControlListManagement.getExternalControlListsMembers(1, 3);
      expect(membersPage).to.have.lengthOf(2);

      membersPage = await externalControlListManagement.getExternalControlListsMembers(5, 1);
      expect(membersPage).to.have.lengthOf(0);

      await externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address);
      await externalControlListManagement.removeExternalControlList(externalBlacklistMock1.address);
      await externalControlListManagement.removeExternalControlList(externalWhitelistMock2.address);
      allMembers = await externalControlListManagement.getExternalControlListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(2); // 2 from init remain
    });
  });

  describe("Pause Tests", () => {
    it("GIVEN a paused token WHEN addExternalControlList THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      const newControlList = externalWhitelistMock2.address;
      await expect(
        externalControlListManagement.addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN removeExternalControlList THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      await expect(
        externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN updateExternalControlLists THEN it reverts with TokenIsPaused", async () => {
      await pauseFacet.pause();
      const controlLists = [externalWhitelistMock1.address];
      const actives = [false];
      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(externalControlListManagement, "TokenIsPaused");
    });
  });

  describe("Initialize Tests", () => {
    it("GIVEN an already initialized contract WHEN initialize_ExternalControlLists is called again THEN it reverts with ContractAlreadyInitialized", async () => {
      const newControlLists = [externalWhitelistMock2.address];
      await expect(
        externalControlListManagement.initialize_ExternalControlLists(newControlLists),
      ).to.be.revertedWithCustomError(externalControlListManagement, "AlreadyInitialized");
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it reverts", async () => {
      const newControlList = externalWhitelistMock2.address;
      await expect(
        externalControlListManagement.connect(signer_B).addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it succeeds", async () => {
      const newControlList = externalWhitelistMock2.address;
      expect(await externalControlListManagement.isExternalControlList(newControlList)).to.be.false;
      await expect(
        externalControlListManagement.addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalControlListManagement, "AddedToExternalControlLists")
        .withArgs(signer_A.address, newControlList);
      expect(await externalControlListManagement.isExternalControlList(newControlList)).to.be.true;
    });

    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it reverts", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      await expect(
        externalControlListManagement.connect(signer_B).removeExternalControlList(externalWhitelistMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it succeeds", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      await expect(
        externalControlListManagement.removeExternalControlList(externalWhitelistMock1.address, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(externalControlListManagement, "RemovedFromExternalControlLists")
        .withArgs(signer_A.address, externalWhitelistMock1.address);
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.false;
    });

    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it reverts", async () => {
      const controlLists = [externalWhitelistMock1.address];
      const actives = [false];
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      await expect(
        externalControlListManagement.connect(signer_B).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it succeeds", async () => {
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.true;
      expect(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
      const controlLists = [externalWhitelistMock1.address, externalBlacklistMock1.address];
      const actives = [false, true]; // Remove whitelist1, keep blacklist1
      await expect(
        externalControlListManagement.updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(externalControlListManagement, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlLists, actives);
      expect(await externalControlListManagement.isExternalControlList(externalWhitelistMock1.address)).to.be.false;
      expect(await externalControlListManagement.isExternalControlList(externalBlacklistMock1.address)).to.be.true;
    });
  });
});
