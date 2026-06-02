// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, GAS_LIMIT } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { ResolverProxy, type IAsset } from "@contract-types";

// external lists (pauses, control lists, KYC lists) are iterated in full on the hot path
// of every token operation. An unbounded list could push that loop past the block/tx gas limit and
// permanently brick the token. `MAX_EXTERNAL_LIST_SIZE` (= 10) caps every list, enforced at the
// single chokepoint `ExternalListManagementStorageWrapper.addExternalList`. These tests verify the
// cap is enforced across single adds, bulk updates and initialisation, for all three list types.
const MAX_EXTERNAL_LIST_SIZE = 10;

describe("External List Size Cap", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let asset: IAsset;

  async function deployFixture() {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
    const base = await deployEquityTokenFixture({
      infrastructure,
      equityDataParams: { securityData: { isMultiPartition: true } },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    await base.accessControlFacet.grantRole(ATS_ROLES.ROLE_PAUSE_MANAGER, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES.ROLE_CONTROL_LIST_MANAGER, signer_A.address);
    await base.accessControlFacet.grantRole(ATS_ROLES.ROLE_KYC_MANAGER, signer_A.address);
  }

  async function deployMockAddresses(contractName: string, count: number): Promise<string[]> {
    const factory = await ethers.getContractFactory(contractName, signer_A);
    const addresses: string[] = [];
    for (let i = 0; i < count; i++) {
      const mock = await factory.deploy();
      await mock.waitForDeployment();
      addresses.push(mock.target as string);
    }
    return addresses;
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("External Pauses", () => {
    it("GIVEN a full external-pause list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
      for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
        await asset.addExternalPause(mocks[i], { gasLimit: GAS_LIMIT.default });
      }
      expect(await asset.getExternalPausesCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      await expect(
        asset.addExternalPause(mocks[MAX_EXTERNAL_LIST_SIZE], { gasLimit: GAS_LIMIT.default }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      expect(await asset.getExternalPausesCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
    });

    it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        asset.updateExternalPauses(mocks, new Array(mocks.length).fill(true), { gasLimit: GAS_LIMIT.max }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });

    it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
      const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
      const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        deployEquityTokenFixture({
          infrastructure,
          equityDataParams: { securityData: { isMultiPartition: true, externalPauses: mocks } },
        }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });
  });

  describe("External Control Lists", () => {
    it("GIVEN a full control list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
      for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
        await asset.addExternalControlList(mocks[i], { gasLimit: GAS_LIMIT.default });
      }
      expect(await asset.getExternalControlListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      await expect(
        asset.addExternalControlList(mocks[MAX_EXTERNAL_LIST_SIZE], { gasLimit: GAS_LIMIT.default }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      expect(await asset.getExternalControlListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
    });

    it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        asset.updateExternalControlLists(mocks, new Array(mocks.length).fill(true), { gasLimit: GAS_LIMIT.max }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });

    it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
      const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
      const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        deployEquityTokenFixture({
          infrastructure,
          equityDataParams: { securityData: { isMultiPartition: true, externalControlLists: mocks } },
        }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });
  });

  describe("External KYC Lists", () => {
    it("GIVEN a full KYC list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
      for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
        await asset.addExternalKycList(mocks[i], { gasLimit: GAS_LIMIT.default });
      }
      expect(await asset.getExternalKycListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      await expect(
        asset.addExternalKycList(mocks[MAX_EXTERNAL_LIST_SIZE], { gasLimit: GAS_LIMIT.default }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      expect(await asset.getExternalKycListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
    });

    it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
      const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        asset.updateExternalKycLists(mocks, new Array(mocks.length).fill(true), { gasLimit: GAS_LIMIT.max }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });

    it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
      const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
      const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
      await expect(
        deployEquityTokenFixture({
          infrastructure,
          equityDataParams: { securityData: { isMultiPartition: true, externalKycLists: mocks } },
        }),
      ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
    });
  });
});
