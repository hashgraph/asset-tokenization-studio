// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { MockedWhitelist, MockedBlacklist, ResolverProxy, IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, DEFAULT_PARTITION, GAS_LIMIT } from "@scripts";

describe("ExternalControlList Management Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let diamond: ResolverProxy;
  let asset: IAsset;
  let initMock1: MockedWhitelist;
  let initMock2: MockedBlacklist;
  let externalWhitelistMock1: MockedWhitelist;
  let externalBlacklistMock1: MockedBlacklist;
  let externalWhitelistMock2: MockedWhitelist;

  async function deployExternalControlListTokenSecurity() {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

    const [deployer] = await ethers.getSigners();
    initMock1 = await (await ethers.getContractFactory("MockedWhitelist", deployer)).deploy();
    await initMock1.waitForDeployment();
    initMock2 = await (await ethers.getContractFactory("MockedBlacklist", deployer)).deploy();
    await initMock2.waitForDeployment();

    const base = await deployEquityTokenFixture({
      infrastructure,
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          externalControlLists: [initMock1.target as string, initMock2.target as string],
          internalKycActivated: false,
          externalKycLists: [],
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await base.accessControlFacet.grantRole(ATS_ROLES.CONTROL_LIST_MANAGER_ROLE, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES.PAUSER_ROLE, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    externalWhitelistMock1 = await (await ethers.getContractFactory("MockedWhitelist", signer_A)).deploy();
    await externalWhitelistMock1.waitForDeployment();

    externalBlacklistMock1 = await (await ethers.getContractFactory("MockedBlacklist", signer_A)).deploy();
    await externalBlacklistMock1.waitForDeployment();

    externalWhitelistMock2 = await (await ethers.getContractFactory("MockedWhitelist", signer_A)).deploy();
    await externalWhitelistMock2.waitForDeployment();

    await asset.connect(signer_A).addExternalControlList(externalWhitelistMock1.target as string, {
      gasLimit: GAS_LIMIT.default,
    });
    await asset.connect(signer_A).addExternalControlList(externalBlacklistMock1.target as string, {
      gasLimit: GAS_LIMIT.default,
    });
  }

  beforeEach(async () => {
    await loadFixture(deployExternalControlListTokenSecurity);
  });

  describe("Add Tests", () => {
    it("GIVEN an unlisted external control list WHEN added THEN it is listed and event is emitted", async () => {
      const newControlList = externalWhitelistMock2.target as string;
      expect(await asset.isExternalControlList(newControlList)).to.be.false;
      const initialCount = await asset.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        asset.connect(signer_A).addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "AddedToExternalControlLists")
        .withArgs(signer_A.address, newControlList);
      expect(await asset.isExternalControlList(newControlList)).to.be.true;
      expect(await asset.getExternalControlListsCount()).to.equal(5);
    });

    it("GIVEN a listed external control list WHEN adding it again THEN it reverts with ListedControlList", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      await expect(
        asset.connect(signer_A).addExternalControlList(externalWhitelistMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ListedControlList");
    });

    it("GIVEN an invalid address WHEN adding it THEN it reverts with ZeroAddressNotAllowed", async () => {
      await expect(
        asset.connect(signer_A).addExternalControlList(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });
  });

  describe("Remove Tests", () => {
    it("GIVEN a listed external control list WHEN removed THEN it is unlisted and event is emitted", async () => {
      const controlListToRemove = externalWhitelistMock1.target as string;
      expect(await asset.isExternalControlList(controlListToRemove)).to.be.true;
      const initialCount = await asset.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await expect(
        asset.connect(signer_A).removeExternalControlList(controlListToRemove, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "RemovedFromExternalControlLists")
        .withArgs(signer_A.address, controlListToRemove);
      expect(await asset.isExternalControlList(controlListToRemove)).to.be.false;
      expect(await asset.getExternalControlListsCount()).to.equal(3);
    });

    it("GIVEN an unlisted external control list WHEN removing THEN it reverts with UnlistedControlList", async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await asset.isExternalControlList(randomAddress)).to.be.false;
      await expect(
        asset.connect(signer_A).removeExternalControlList(randomAddress, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "UnlistedControlList");
    });
  });

  describe("Update Tests", () => {
    it("GIVEN invalid address WHEN updated THEN it reverts with ZeroAddressNotAllowed", async () => {
      const controlLists = [ADDRESS_ZERO];
      const actives = [true];

      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN multiple external control lists WHEN updated THEN their statuses are updated and event is emitted", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      expect(await asset.isExternalControlList(externalBlacklistMock1.target as string)).to.be.true;
      expect(await asset.isExternalControlList(externalWhitelistMock2.target as string)).to.be.false;
      const initialCount = await asset.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture

      const controlListsToUpdate = [externalBlacklistMock1.target as string, externalWhitelistMock2.target as string];
      const activesToUpdate = [false, true];

      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlListsToUpdate, activesToUpdate, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlListsToUpdate, activesToUpdate);

      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      expect(await asset.isExternalControlList(externalBlacklistMock1.target as string)).to.be.false;
      expect(await asset.isExternalControlList(externalWhitelistMock2.target as string)).to.be.true;
      expect(await asset.getExternalControlListsCount()).to.equal(4); // Still 4: removed 1, added 1
    });

    it("GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateControlList = externalWhitelistMock2.target as string;
      expect(await asset.isExternalControlList(duplicateControlList)).to.be.false;

      const controlLists = [duplicateControlList, duplicateControlList];
      const actives = [true, false];

      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray");
    });

    it("GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray", async () => {
      const duplicateControlList = externalWhitelistMock1.target as string;
      expect(await asset.isExternalControlList(duplicateControlList)).to.be.true;

      const controlLists = [duplicateControlList, duplicateControlList];
      const actives = [false, true];

      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "ContradictoryValuesInArray");
    });

    it("GIVEN empty arrays WHEN updating THEN it succeeds and emits event", async () => {
      const initialCount = await asset.getExternalControlListsCount();
      const controlLists: string[] = [];
      const actives: boolean[] = [];
      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlLists, actives);
      expect(await asset.getExternalControlListsCount()).to.equal(initialCount);
    });
  });

  describe("View/Getter Functions", () => {
    it("GIVEN listed and unlisted addresses WHEN isExternalControlList is called THEN it returns the correct status", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      expect(await asset.isExternalControlList(externalBlacklistMock1.target as string)).to.be.true;
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(await asset.isExternalControlList(randomAddress)).to.be.false;
      await asset.connect(signer_A).addExternalControlList(externalWhitelistMock2.target as string);
      expect(await asset.isExternalControlList(externalWhitelistMock2.target as string)).to.be.true;
    });

    it("GIVEN external control lists WHEN getExternalControlListsCount is called THEN it returns the current count", async () => {
      const initialCount = await asset.getExternalControlListsCount();
      expect(initialCount).to.equal(4); // 2 from init + 2 from fixture
      await asset.connect(signer_A).addExternalControlList(externalWhitelistMock2.target as string);
      expect(await asset.getExternalControlListsCount()).to.equal(5);
      await asset.connect(signer_A).removeExternalControlList(externalWhitelistMock1.target as string);
      expect(await asset.getExternalControlListsCount()).to.equal(4);
      await asset.connect(signer_A).removeExternalControlList(externalBlacklistMock1.target as string);
      await asset.connect(signer_A).removeExternalControlList(externalWhitelistMock2.target as string);
      expect(await asset.getExternalControlListsCount()).to.equal(2); // 2 from init remain
    });

    it("GIVEN external control lists WHEN getExternalControlListsMembers is called THEN it returns paginated members", async () => {
      expect(await asset.getExternalControlListsCount()).to.equal(4); // 2 from init + 2 from fixture
      let membersPage = await asset.getExternalControlListsMembers(0, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.target as string,
        initMock2.target as string,
        externalWhitelistMock1.target as string,
        externalBlacklistMock1.target as string,
      ]).to.include(membersPage[0]);

      membersPage = await asset.getExternalControlListsMembers(1, 1);
      expect(membersPage).to.have.lengthOf(1);
      expect([
        initMock1.target as string,
        initMock2.target as string,
        externalWhitelistMock1.target as string,
        externalBlacklistMock1.target as string,
      ]).to.include(membersPage[0]);
      expect(membersPage[0]).to.not.equal((await asset.getExternalControlListsMembers(0, 1))[0]);

      let allMembers = await asset.getExternalControlListsMembers(0, 4);
      expect(allMembers).to.have.lengthOf(4);
      expect(allMembers).to.contain(initMock1.target as string);
      expect(allMembers).to.contain(initMock2.target as string);
      expect(allMembers).to.contain(externalWhitelistMock1.target as string);
      expect(allMembers).to.contain(externalBlacklistMock1.target as string);

      await asset.connect(signer_A).addExternalControlList(externalWhitelistMock2.target as string);
      allMembers = await asset.getExternalControlListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(5);
      expect(allMembers).to.contain(initMock1.target as string);
      expect(allMembers).to.contain(initMock2.target as string);
      expect(allMembers).to.contain(externalWhitelistMock1.target as string);
      expect(allMembers).to.contain(externalBlacklistMock1.target as string);
      expect(allMembers).to.contain(externalWhitelistMock2.target as string);

      membersPage = await asset.getExternalControlListsMembers(1, 3);
      expect(membersPage).to.have.lengthOf(2);

      membersPage = await asset.getExternalControlListsMembers(5, 1);
      expect(membersPage).to.have.lengthOf(0);

      await asset.connect(signer_A).removeExternalControlList(externalWhitelistMock1.target as string);
      await asset.connect(signer_A).removeExternalControlList(externalBlacklistMock1.target as string);
      await asset.connect(signer_A).removeExternalControlList(externalWhitelistMock2.target as string);
      allMembers = await asset.getExternalControlListsMembers(0, 5);
      expect(allMembers).to.have.lengthOf(2); // 2 from init remain
    });
  });

  describe("Pause Tests", () => {
    it("GIVEN a paused token WHEN addExternalControlList THEN it reverts with TokenIsPaused", async () => {
      await asset.connect(signer_A).pause();
      const newControlList = externalWhitelistMock2.target as string;
      await expect(
        asset.connect(signer_A).addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN removeExternalControlList THEN it reverts with TokenIsPaused", async () => {
      await asset.connect(signer_A).pause();
      await expect(
        asset.connect(signer_A).removeExternalControlList(externalWhitelistMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a paused token WHEN updateExternalControlLists THEN it reverts with TokenIsPaused", async () => {
      await asset.connect(signer_A).pause();
      const controlLists = [externalWhitelistMock1.target as string];
      const actives = [false];
      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });
  });

  describe("Initialize Tests", () => {
    it("GIVEN an already initialized contract WHEN initialize_ExternalControlLists is called again THEN it reverts with ContractAlreadyInitialized", async () => {
      const newControlLists = [externalWhitelistMock2.target as string];
      await expect(
        asset.connect(signer_A).initialize_ExternalControlLists(newControlLists),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });
  });

  describe("Access Control Tests", () => {
    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it reverts", async () => {
      const newControlList = externalWhitelistMock2.target as string;
      await expect(
        asset.connect(signer_B).addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN adding an external control list THEN it succeeds", async () => {
      const newControlList = externalWhitelistMock2.target as string;
      expect(await asset.isExternalControlList(newControlList)).to.be.false;
      await expect(
        asset.connect(signer_A).addExternalControlList(newControlList, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "AddedToExternalControlLists")
        .withArgs(signer_A.address, newControlList);
      expect(await asset.isExternalControlList(newControlList)).to.be.true;
    });

    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it reverts", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      await expect(
        asset.connect(signer_B).removeExternalControlList(externalWhitelistMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN removing an external control list THEN it succeeds", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      await expect(
        asset.connect(signer_A).removeExternalControlList(externalWhitelistMock1.target as string, {
          gasLimit: GAS_LIMIT.default,
        }),
      )
        .to.emit(asset, "RemovedFromExternalControlLists")
        .withArgs(signer_A.address, externalWhitelistMock1.target as string);
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.false;
    });

    it("GIVEN an account without _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it reverts", async () => {
      const controlLists = [externalWhitelistMock1.target as string];
      const actives = [false];
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      await expect(
        asset.connect(signer_B).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account with _CONTROL_LIST_MANAGER_ROLE WHEN updating external control lists THEN it succeeds", async () => {
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.true;
      expect(await asset.isExternalControlList(externalBlacklistMock1.target as string)).to.be.true;
      const controlLists = [externalWhitelistMock1.target as string, externalBlacklistMock1.target as string];
      const actives = [false, true]; // Remove whitelist1, keep blacklist1
      await expect(
        asset.connect(signer_A).updateExternalControlLists(controlLists, actives, {
          gasLimit: GAS_LIMIT.high,
        }),
      )
        .to.emit(asset, "ExternalControlListsUpdated")
        .withArgs(signer_A.address, controlLists, actives);
      expect(await asset.isExternalControlList(externalWhitelistMock1.target as string)).to.be.false;
      expect(await asset.isExternalControlList(externalBlacklistMock1.target as string)).to.be.true;
    });
  });

  describe("Testing external authorization", () => {
    it("GIVEN an externally unauthorized account WHEN trying to operate THEN transaction fails with AccountIsBlocked", async () => {
      const issueBody = {
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1,
        data: "0x",
      };
      await expect(asset.connect(signer_A).issueByPartition(issueBody)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
      await initMock1.addToWhitelist(issueBody.tokenHolder);
      await expect(asset.connect(signer_A).issueByPartition(issueBody)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });

    it("GIVEN an externally authorized account WHEN trying to operate THEN transaction succeeds", async () => {
      const issueBody = {
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1,
        data: "0x",
      };
      await initMock1.addToWhitelist(issueBody.tokenHolder);
      await externalWhitelistMock1.addToWhitelist(issueBody.tokenHolder);
      await asset.connect(signer_A).issueByPartition(issueBody);
    });
  });
});
