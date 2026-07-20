// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, RESOLVER_KEYS } from "@lib";

const MAX_EXTERNAL_LIST_SIZE = 10;

export function externalListSizeCapTests(getCtx: () => AssetMockCtx): void {
  describe("External List Size Cap", () => {
    let signer_A: HardhatEthersSigner;
    let asset: IAssetMock;

    // Deploys outside the shared ctx.externalMocks pool because the boundary tests
    // need up to 11 instances per type, whereas the shared pool only provides 5.
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
      const ctx = getCtx();
      signer_A = ctx.deployer;
      asset = ctx.asset;

      await asset.setMultiPartition(true);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_PAUSE_MANAGER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST_MANAGER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_KYC_MANAGER, signer_A.address);
    });

    describe("External Pauses", () => {
      it("GIVEN a full external-pause list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
        for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
          await asset.addExternalPause(mocks[i]);
        }
        expect(await asset.getExternalPausesCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
        await expect(asset.addExternalPause(mocks[MAX_EXTERNAL_LIST_SIZE])).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
        expect(await asset.getExternalPausesCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      });

      it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
        await expect(
          asset.updateExternalPauses(mocks, new Array(mocks.length).fill(true)),
        ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      });

      it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalPause", MAX_EXTERNAL_LIST_SIZE + 1);
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalPauseManagement);
        await expect(asset.initializeExternalPauses(mocks)).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
      });
    });

    describe("External Control Lists", () => {
      it("GIVEN a full control list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
        for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
          await asset.addExternalControlList(mocks[i]);
        }
        expect(await asset.getExternalControlListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
        await expect(asset.addExternalControlList(mocks[MAX_EXTERNAL_LIST_SIZE])).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
        expect(await asset.getExternalControlListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      });

      it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
        await expect(
          asset.updateExternalControlLists(mocks, new Array(mocks.length).fill(true)),
        ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      });

      it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedWhitelist", MAX_EXTERNAL_LIST_SIZE + 1);
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalControlListManagement);
        await expect(asset.initializeExternalControlLists(mocks)).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
      });
    });

    describe("External KYC Lists", () => {
      it("GIVEN a full KYC list (MAX entries) WHEN adding one more THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
        for (let i = 0; i < MAX_EXTERNAL_LIST_SIZE; i++) {
          await asset.addExternalKycList(mocks[i]);
        }
        expect(await asset.getExternalKycListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
        await expect(asset.addExternalKycList(mocks[MAX_EXTERNAL_LIST_SIZE])).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
        expect(await asset.getExternalKycListsCount()).to.equal(MAX_EXTERNAL_LIST_SIZE);
      });

      it("GIVEN a bulk update that would exceed MAX THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
        await expect(
          asset.updateExternalKycLists(mocks, new Array(mocks.length).fill(true)),
        ).to.be.revertedWithCustomError(asset, "MaxExternalListSizeReached");
      });

      it("GIVEN initialisation with more than MAX entries THEN it reverts with MaxExternalListSizeReached", async () => {
        const mocks = await deployMockAddresses("MockedExternalKycList", MAX_EXTERNAL_LIST_SIZE + 1);
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalKycListManagement);
        await expect(asset.initializeExternalKycLists(mocks)).to.be.revertedWithCustomError(
          asset,
          "MaxExternalListSizeReached",
        );
      });
    });
  });
}
