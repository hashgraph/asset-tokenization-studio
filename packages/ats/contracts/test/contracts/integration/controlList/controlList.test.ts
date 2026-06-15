// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { IAssetMock } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEY_CONTROL_LIST } from "@scripts";
import {  grantRoleAndPauseToken, executeRbac } from "@test";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { AssetMockCtx } from "@test";

export function controlListTests(getCtx: () => AssetMockCtx): void {
  describe("Control List Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;

      asset = ctx.asset;

      await executeRbac(asset, [{ role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] }]);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with FacetAlreadyRegistered", async () => {
      await expect(asset.initializeControlList(true)).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
    });

    it("GIVEN an account without controlList role WHEN addToControlList THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).addToControlList(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an account without controlList role WHEN removeFromControlList THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).removeFromControlList(signer_C.address)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeControlList is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeControlList(true)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a new deployment WHEN initializeControlList is called THEN it emits ControlListInitialized", async () => {
       await asset.forceFacetNotRegistered(RESOLVER_KEY_CONTROL_LIST);
      await expect(asset.initializeControlList(true)).to.emit(
        asset,
        "ControlListInitialized"
      );
    });

    it("GIVEN a paused Token WHEN addToControlList THEN transaction fails with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CONTROL_LIST, signer_A, signer_B, signer_C.address);

      await expect(asset.connect(signer_C).addToControlList(signer_D.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a paused Token WHEN removeFromControlList THEN transaction fails with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CONTROL_LIST, signer_A, signer_B, signer_C.address);

      await expect(asset.connect(signer_C).removeFromControlList(signer_D.address)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN an account with controlList role WHEN addToControlList and removeFromControlList THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_B.address);

      let check_signer_B = await asset.isInControlList(signer_B.address);
      expect(check_signer_B).to.equal(false);
      let check_signer_C = await asset.isInControlList(signer_C.address);
      expect(check_signer_C).to.equal(false);

      await expect(asset.connect(signer_B).addToControlList(signer_B.address))
        .to.emit(asset, "AddedToControlList")
        .withArgs(signer_B.address, signer_B.address);
      await expect(asset.connect(signer_B).addToControlList(signer_C.address))
        .to.emit(asset, "AddedToControlList")
        .withArgs(signer_B.address, signer_C.address);

      check_signer_B = await asset.isInControlList(signer_B.address);
      expect(check_signer_B).to.equal(true);
      check_signer_C = await asset.isInControlList(signer_C.address);
      expect(check_signer_C).to.equal(true);

      let listCount = await asset.getControlListCount();
      let listMembers = await asset.getControlListMembers(0, listCount);

      expect(listCount).to.equal(2);
      expect(listMembers.length).to.equal(listCount);
      expect(listMembers[0].toUpperCase()).to.equal(signer_B.address.toUpperCase());
      expect(listMembers[1].toUpperCase()).to.equal(signer_C.address.toUpperCase());

      await expect(asset.connect(signer_B).removeFromControlList(signer_B.address))
        .to.emit(asset, "RemovedFromControlList")
        .withArgs(signer_B.address, signer_B.address);

      check_signer_B = await asset.isInControlList(signer_B.address);
      expect(check_signer_B).to.equal(false);

      listCount = await asset.getControlListCount();
      listMembers = await asset.getControlListMembers(0, listCount);

      expect(listCount).to.equal(1);
      expect(listMembers.length).to.equal(listCount);
      expect(listMembers[0].toUpperCase()).to.equal(signer_C.address.toUpperCase());

      const listType = await asset.getControlListType();
      expect(listType).to.equal(false);
    });

    it("GIVEN an account already in control list WHEN addToControlList is called again THEN transaction fails with ListedAccount", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_B.address);

      // Add account to control list
      await asset.connect(signer_B).addToControlList(signer_C.address);

      // Verify account is in the list
      expect(await asset.isInControlList(signer_C.address)).to.equal(true);

      // Try to add the same account again
      await expect(asset.connect(signer_B).addToControlList(signer_C.address))
        .to.be.revertedWithCustomError(asset, "ListedAccount")
        .withArgs(signer_C.address);
    });

    it("GIVEN an account not in control list WHEN removeFromControlList is called THEN transaction fails with UnlistedAccount", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_B.address);

      // Verify account is not in the list
      expect(await asset.isInControlList(signer_C.address)).to.equal(false);

      // Try to remove an account that's not in the list
      await expect(asset.connect(signer_B).removeFromControlList(signer_C.address))
        .to.be.revertedWithCustomError(asset, "UnlistedAccount")
        .withArgs(signer_C.address);
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

        await expect(
          asset.connect(signer_A).addToControlList(ADDRESS_ZERO
        )
        ).to.be.revertedWithCustomError(asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN removeFromControlList THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).removeFromControlList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN addToControlList THEN reverts with AssetNotOperational", async () => {
        await expect(asset.addToControlList(ADDRESS_ZERO)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN removeFromControlList THEN reverts with AssetNotOperational", async () => {
        await expect(asset.removeFromControlList(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
