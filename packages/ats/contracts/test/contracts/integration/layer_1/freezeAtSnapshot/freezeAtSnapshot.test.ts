// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, DEFAULT_PARTITION, RESOLVER_KEY_FREEZE_AT_SNAPSHOT } from "@scripts";
import { MAX_UINT256 } from "@test";
import { executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

const AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function freezeAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("FreezeAtSnapshot Tests", () => {
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

    beforeEach(async () => {
      const ctx = getCtx();
      deployer = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      asset = ctx.asset;

      await executeRbac(asset, set_initRbacs(deployer.address, signer_B.address));
    });

    it("GIVEN an account with snapshot role WHEN takeSnapshot and Freeze THEN frozen balance is captured per snapshot", async () => {
      const TINY_AMOUNT = 10;

      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_SNAPSHOT, deployer.address);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_ISSUER, deployer.address);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, deployer.address);
      await asset.connect(deployer).addIssuer(deployer.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);

      await asset.connect(deployer).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: TINY_AMOUNT,
        data: "0x",
      });

      // snapshot
      await asset.connect(deployer).takeSnapshot();

      // Operations
      await asset.connect(deployer).freezePartialTokens(signer_C.address, 1);
      await asset.connect(deployer).freezePartialTokens(signer_C.address, 1);

      // snapshot
      await asset.connect(deployer).takeSnapshot();

      // Operations
      await asset.connect(deployer).unfreezePartialTokens(signer_C.address, 1);

      // snapshot
      await asset.connect(deployer).takeSnapshot();

      // checks
      expect(await asset.frozenBalanceOfAtSnapshot(1, signer_C.address)).to.equal(0);
      expect(await asset.frozenBalanceOfAtSnapshot(2, signer_C.address)).to.equal(2);
      expect(await asset.frozenBalanceOfAtSnapshot(3, signer_C.address)).to.equal(1);
    });

    it("GIVEN frozen tokens WHEN querying historical snapshot THEN balance and frozen amounts are tracked separately", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_SNAPSHOT, deployer.address);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_ISSUER, deployer.address);
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, deployer.address);
      await asset.connect(deployer).addIssuer(deployer.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: AMOUNT,
        data: "0x",
      });

      // snapshot
      await asset.connect(deployer).takeSnapshot();

      // Freeze some tokens
      await asset.connect(deployer).freezePartialTokens(signer_C.address, 100);

      // snapshot
      await asset.connect(deployer).takeSnapshot();

      // Check snapshots track balance and frozen separately
      const balance1 = await asset.balanceOfAtSnapshot(1, signer_C.address);
      const frozen1 = await asset.frozenBalanceOfAtSnapshot(1, signer_C.address);
      const balance2 = await asset.balanceOfAtSnapshot(2, signer_C.address);
      const frozen2 = await asset.frozenBalanceOfAtSnapshot(2, signer_C.address);

      expect(balance1).to.equal(AMOUNT); // Full balance, no frozen
      expect(frozen1).to.equal(0); // No frozen tokens yet
      expect(balance2).to.equal(AMOUNT - 100); // Balance reduced
      expect(frozen2).to.equal(100); // Frozen tokens tracked
      expect(balance2 + frozen2).to.equal(AMOUNT); // Total remains same
    });

    describe("initializeFreezeAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshot is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeFreezeAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeFreezeAtSnapshot is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeFreezeAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_FREEZE_AT_SNAPSHOT, 1);
      });
    });

    describe("initializeFreezeAtSnapshot event", () => {
      it("GIVEN a fresh deployment WHEN initializeFreezeAtSnapshot is called THEN emits FreezeAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_FREEZE_AT_SNAPSHOT);
        await expect(asset.initializeFreezeAtSnapshot()).to.emit(asset, "FreezeAtSnapshotInitialized");
      });
    });
  });
}
