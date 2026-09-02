// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockedExternalKycList } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@scripts";

/**
 * Registration-time validation of external KYC lists.
 *
 * Every address that is not a working `IExternalKycList` is accepted today and makes every
 * later transfer revert inside `isExternallyGranted`, for every holder, with an error that
 * names neither the list nor the cause. These cases pin the four shapes that are accepted
 * (an externally owned account, a silent fallback, a wrong interface, and, on Hedera, a
 * token facade or a system contract, both of which present as one of the first two), and
 * the controls pin what registration must keep accepting and what removal must keep doing.
 */
export function externalKycListRegistrationTests(getCtx: () => AssetMockCtx): void {
  describe("ExternalKycList Registration Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

    let asset: IAssetMock;
    let conformingList: MockedExternalKycList;
    let eoa: string;
    let silentFallback: string;
    let wrongInterface: string;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_E = ctx.user4;
      asset = ctx.asset;
      conformingList = ctx.externalMocks.kyc[0];
      eoa = signer_E.address;

      const silent = await (await ethers.getContractFactory("MockedSilentFallback", signer_A)).deploy();
      await silent.waitForDeployment();
      silentFallback = silent.target as string;

      const wrong = await (await ethers.getContractFactory("MockedWrongInterface", signer_A)).deploy();
      await wrong.waitForDeployment();
      wrongInterface = wrong.target as string;

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_KYC_MANAGER, signer_A.address);
    });

    describe("addExternalKycList", () => {
      it("GIVEN a conforming external KYC list WHEN addExternalKycList THEN it is accepted", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(conformingList.target as string)).to.not.be.reverted;
        expect(await asset.isExternalKycList(conformingList.target as string)).to.be.true;
      });

      it("GIVEN an externally owned account WHEN addExternalKycList THEN it reverts with NotAnExternalKycList", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(eoa))
          .to.be.revertedWithCustomError(asset, "NotAnExternalKycList")
          .withArgs(eoa);
      });

      it("GIVEN a contract with a silent fallback WHEN addExternalKycList THEN it reverts with NotAnExternalKycList", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(silentFallback))
          .to.be.revertedWithCustomError(asset, "NotAnExternalKycList")
          .withArgs(silentFallback);
      });

      it("GIVEN a contract with the wrong interface WHEN addExternalKycList THEN it reverts with NotAnExternalKycList", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(wrongInterface))
          .to.be.revertedWithCustomError(asset, "NotAnExternalKycList")
          .withArgs(wrongInterface);
      });

      it("GIVEN the zero address WHEN addExternalKycList THEN it still reverts with ZeroAddressNotAllowed", async () => {
        await expect(asset.connect(signer_A).addExternalKycList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });
    });

    describe("updateExternalKycLists", () => {
      it("GIVEN a conforming list activated WHEN updateExternalKycLists THEN it is accepted", async () => {
        await expect(asset.connect(signer_A).updateExternalKycLists([conformingList.target as string], [true])).to.not
          .be.reverted;
        expect(await asset.isExternalKycList(conformingList.target as string)).to.be.true;
      });

      it("GIVEN a non-conforming list activated WHEN updateExternalKycLists THEN it reverts with NotAnExternalKycList", async () => {
        await expect(asset.connect(signer_A).updateExternalKycLists([silentFallback], [true]))
          .to.be.revertedWithCustomError(asset, "NotAnExternalKycList")
          .withArgs(silentFallback);
      });

      it("GIVEN the zero address activated WHEN updateExternalKycLists THEN it still reverts with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.connect(signer_A).updateExternalKycLists([ADDRESS_ZERO], [true]),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a registered list that has stopped answering WHEN it is deactivated THEN the deactivation succeeds", async () => {
        const breakable = await (await ethers.getContractFactory("MockedBreakableKycList", signer_A)).deploy();
        await breakable.waitForDeployment();
        const list = breakable.target as string;

        await asset.connect(signer_A).addExternalKycList(list);
        await breakable.breakList();

        await expect(asset.connect(signer_A).updateExternalKycLists([list], [false])).to.not.be.reverted;
        expect(await asset.isExternalKycList(list)).to.be.false;
      });
    });

    describe("initializeExternalKycLists", () => {
      it("GIVEN a conforming list WHEN initializeExternalKycLists THEN it emits ExternalKycListInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalKycListManagement);
        await expect(asset.initializeExternalKycLists([conformingList.target as string])).to.emit(
          asset,
          "ExternalKycListInitialized",
        );
      });

      it("GIVEN a non-conforming list WHEN initializeExternalKycLists THEN it reverts with NotAnExternalKycList", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.externalKycListManagement);
        await expect(asset.initializeExternalKycLists([silentFallback]))
          .to.be.revertedWithCustomError(asset, "NotAnExternalKycList")
          .withArgs(silentFallback);
      });
    });

    describe("removeExternalKycList", () => {
      it("GIVEN a registered list that has stopped answering WHEN removeExternalKycList THEN the removal succeeds", async () => {
        const breakable = await (await ethers.getContractFactory("MockedBreakableKycList", signer_A)).deploy();
        await breakable.waitForDeployment();
        const list = breakable.target as string;

        await asset.connect(signer_A).addExternalKycList(list);
        await breakable.breakList();

        await expect(asset.connect(signer_A).removeExternalKycList(list)).to.not.be.reverted;
        expect(await asset.isExternalKycList(list)).to.be.false;
      });
    });
  });
}
