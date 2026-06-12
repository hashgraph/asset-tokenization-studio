// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import {
  ZERO,
  EMPTY_STRING,
  ATS_ROLES,
  DEFAULT_PARTITION,
  RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION,
} from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const balanceOf_C_Original = 2000;
const EMPTY_VC_ID = EMPTY_STRING;

export function freezeAtSnapshotByPartitionTests(): void {
  describe("FreezeAtSnapshotByPartition Tests", () => {
    let deployer: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    function set_initRbacs(signer_A: string, signer_B: string): any[] {
      return [
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B],
        },
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A],
        },
        {
          role: ATS_ROLES.ROLE_FREEZE_MANAGER,
          members: [signer_B],
        },
      ];
    }

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      deployer = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      asset = ctx.asset;

      await executeRbac(asset, set_initRbacs(deployer.address, signer_B.address));
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    it("GIVEN snapshot exists WHEN querying frozen balances by partition THEN returns correct values", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_ISSUER, deployer.address);

      await asset.connect(deployer).addIssuer(deployer.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);
      await asset.connect(signer_B).grantKyc(deployer.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);

      await asset.connect(deployer).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      const frozenBalance_C_1_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        1,
        signer_C.address,
      );
      expect(frozenBalance_C_1_Partition_1).to.equal(0);

      // Freeze some tokens
      const frozenAmount = 500;
      await asset.connect(signer_B).freezePartialTokens(signer_C.address, frozenAmount);

      // Take snapshot after freezing
      await asset.connect(signer_C).takeSnapshot();

      const frozenBalance_C_2_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        2,
        signer_C.address,
      );
      expect(frozenBalance_C_2_Partition_1).to.equal(frozenAmount);

      // Verify current frozen balance is consistent with the snapshot read
      const currentFrozenBalance = await asset.getFrozenTokens(signer_C.address);
      expect(currentFrozenBalance).to.equal(frozenAmount);
    });

    describe("initializeFreezeAtSnapshotByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshotByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeFreezeAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeFreezeAtSnapshotByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeFreezeAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION, 1);
      });
    });

    describe("initializeFreezeAtSnapshotByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeFreezeAtSnapshotByPartition is called THEN emits FreezeAtSnapshotByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION);
        await expect(asset.initializeFreezeAtSnapshotByPartition()).to.emit(
          asset,
          "FreezeAtSnapshotByPartitionInitialized",
        );
      });
    });
  });
}
