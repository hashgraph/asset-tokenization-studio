// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { executeRbac, getDltTimestamp } from "@test";
import type { AssetMockCtx } from "@test";

const CURRENCY_ZERO = "0x000000";

export function nominalValueAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("NominalValueAtSnapshot Tests", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      const signers = await ethers.getSigners();
      unknownSigner = signers[signers.length - 1];

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [deployer.address] },
        { role: ATS_ROLES.ROLE_SNAPSHOT, members: [deployer.address] },
      ]);
    });

    describe("initializeNominalValueAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValueAtSnapshot THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeNominalValueAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });
      it("GIVEN fresh facet WHEN initializeNominalValueAtSnapshot THEN emits NominalValueAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValueAtSnapshot);
        await expect(asset.initializeNominalValueAtSnapshot()).to.emit(asset, "NominalValueAtSnapshotInitialized");
      });
      it("GIVEN already-initialised WHEN initializeNominalValueAtSnapshot THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeNominalValueAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.nominalValueAtSnapshot, 1);
      });
    });

    describe("nominalValueAtSnapshot", () => {
      it("GIVEN no snapshot taken WHEN nominalValueAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.nominalValueAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      });

      it("GIVEN no snapshot taken WHEN nominalValueAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.nominalValueAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      });

      it("GIVEN a nominal value set and a snapshot taken WHEN nominalValueAtSnapshot THEN returns recorded value", async () => {
        const initDate = (await getDltTimestamp()) - 3600;
        await asset.forceSetNominalValue(200n, 4, CURRENCY_ZERO, initDate, true);
        await asset.connect(deployer).takeSnapshot();

        // publishing a new value after the snapshot should not change the snapshotted value
        await asset.connect(deployer).publishNominalValue(500n, initDate + 60);

        expect(await asset.nominalValueAtSnapshot(1)).to.equal(200n);
      });
    });

    describe("nominalValueDecimalsAtSnapshot", () => {
      it("GIVEN no snapshot taken WHEN nominalValueDecimalsAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.nominalValueDecimalsAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      });

      it("GIVEN no snapshot taken WHEN nominalValueDecimalsAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.nominalValueDecimalsAtSnapshot(1)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdDoesNotExists",
        );
      });

      it("GIVEN a nominal value set and a snapshot taken WHEN nominalValueDecimalsAtSnapshot THEN returns the recorded (immutable) decimals", async () => {
        const initDate = (await getDltTimestamp()) - 3600;
        await asset.forceSetNominalValue(200n, 4, CURRENCY_ZERO, initDate, true);
        await asset.connect(deployer).takeSnapshot();

        // decimals are fixed at initialisation; publishing a new value never changes them.
        await asset.connect(deployer).publishNominalValue(500n, initDate + 60);

        expect(await asset.nominalValueDecimalsAtSnapshot(1)).to.equal(4);
      });
    });
  });
}
