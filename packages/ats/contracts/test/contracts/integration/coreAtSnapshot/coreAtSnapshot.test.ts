// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_CORE_AT_SNAPSHOT } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, executeRbac, grantKycToHolders, DEFAULT_PARTITION } from "@test";

export function coreAtSnapshotTests(): void {
  describe("CoreAtSnapshot Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;

    let asset: IAssetMock;

    async function deployEquity() {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_A = ctx.deployer;
      signer_B = ctx.user1;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_SNAPSHOT,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).addIssuer(signer_B.address);
      await grantKycToHolders(asset, signer_B, [signer_A]);
    }

    beforeEach(async () => {
      await loadFixture(deployEquity);
    });

    describe("decimalsAtSnapshot", () => {
      it("GIVEN no snapshot taken WHEN decimalsAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.decimalsAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      });

      it("GIVEN no snapshot taken WHEN decimalsAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.decimalsAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      });

      it("GIVEN a snapshot taken WHEN decimalsAtSnapshot THEN returns the token decimals at that snapshot", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 1000,
          data: "0x",
        });

        const snapshotId = await asset.connect(signer_A).takeSnapshot.staticCall();
        await asset.connect(signer_A).takeSnapshot();

        expect(await asset.decimalsAtSnapshot(snapshotId)).to.equal(await asset.decimals());
      });
    });
    describe("initializeCoreAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCoreAtSnapshot is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).initializeCoreAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCoreAtSnapshot is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCoreAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_CORE_AT_SNAPSHOT, 1);
      });
    });

    describe("initializeCoreAtSnapshot event", () => {
      it("GIVEN a fresh deployment WHEN initializeCoreAtSnapshot is called THEN emits CoreAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_CORE_AT_SNAPSHOT);
        await expect(asset.initializeCoreAtSnapshot()).to.emit(asset, "CoreAtSnapshotInitialized");
      });
    });
  });
}
