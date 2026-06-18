// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ZERO, EMPTY_STRING, ATS_ROLES, ADDRESS_ZERO, RESOLVER_KEY_CLEARING_AT_SNAPSHOT } from "@scripts";
import { MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const amount = 1000;
const balanceOf_C_Original = 2 * amount;
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;

export function clearingAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("ClearingAtSnapshot Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    function set_initRbacs(): any[] {
      return [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_B.address] },
      ];
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      unknownSigner = ctx.unknownSigner;

      asset = ctx.asset;
      await asset.setMultiPartition(true);
      await executeRbac(asset, set_initRbacs());
      await asset.connect(signer_B).activateClearing();
    });

    it("GIVEN snapshot exists WHEN querying cleared balances THEN returns correct values", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      const clearedBalance_C_1 = await asset.clearedBalanceOfAtSnapshot(1, signer_C.address);
      const clearedBalance_C_1_Partition_1 = await asset.clearedBalanceOfAtSnapshotByPartition(
        _PARTITION_ID_1,
        1,
        signer_C.address,
      );
      const clearedBalance_C_1_Partition_2 = await asset.clearedBalanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
        1,
        signer_C.address,
      );

      expect(clearedBalance_C_1).to.equal(0);
      expect(clearedBalance_C_1_Partition_1).to.equal(0);
      expect(clearedBalance_C_1_Partition_2).to.equal(0);

      const clearedAmount_Partition_1 = 800;
      await asset.connect(signer_C).clearingTransferByPartition(
        {
          partition: _PARTITION_ID_1,
          expirationTimestamp: MAX_UINT256,
          data: "0x",
        },
        clearedAmount_Partition_1,
        signer_A.address,
      );

      const clearedAmount_Partition_2 = 500;
      await asset.connect(signer_C).clearingTransferByPartition(
        {
          partition: _PARTITION_ID_2,
          expirationTimestamp: MAX_UINT256,
          data: "0x",
        },
        clearedAmount_Partition_2,
        signer_A.address,
      );

      await asset.connect(signer_C).takeSnapshot();

      const clearedBalance_C_2 = await asset.clearedBalanceOfAtSnapshot(2, signer_C.address);
      const clearedBalance_C_2_Partition_1 = await asset.clearedBalanceOfAtSnapshotByPartition(
        _PARTITION_ID_1,
        2,
        signer_C.address,
      );
      const clearedBalance_C_2_Partition_2 = await asset.clearedBalanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
        2,
        signer_C.address,
      );

      expect(clearedBalance_C_2).to.equal(clearedAmount_Partition_1 + clearedAmount_Partition_2);
      expect(clearedBalance_C_2_Partition_1).to.equal(clearedAmount_Partition_1);
      expect(clearedBalance_C_2_Partition_2).to.equal(clearedAmount_Partition_2);

      const currentBalance_C = await asset.balanceOf(signer_C.address);
      expect(currentBalance_C).to.equal(
        balanceOf_C_Original + amount - clearedAmount_Partition_1 - clearedAmount_Partition_2,
      );

      const currentBalance_C_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
      expect(currentBalance_C_Partition_1).to.equal(balanceOf_C_Original - clearedAmount_Partition_1);

      const currentBalance_C_Partition_2 = await asset.balanceOfByPartition(_PARTITION_ID_2, signer_C.address);
      expect(currentBalance_C_Partition_2).to.equal(amount - clearedAmount_Partition_2);
    });

    it("GIVEN active snapshot WHEN clearing transfer creation THEN address(0) has no phantom snapshot balance", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      await asset.connect(signer_C).clearingTransferByPartition(
        {
          partition: _PARTITION_ID_1,
          expirationTimestamp: MAX_UINT256,
          data: "0x",
        },
        amount,
        signer_A.address,
      );

      expect(await asset.balanceOfAtSnapshot(1, ADDRESS_ZERO)).to.equal(0);
    });

    describe("initializeClearingAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeClearingAtSnapshot THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeClearingAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeClearingAtSnapshot THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeClearingAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_CLEARING_AT_SNAPSHOT, 1);
      });
    });

    describe("initializeClearingAtSnapshot event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeClearingAtSnapshot THEN emits ClearingAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_CLEARING_AT_SNAPSHOT);
        await expect(asset.initializeClearingAtSnapshot()).to.emit(asset, "ClearingAtSnapshotInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN clearingTransferByPartition THEN AssetNotOperational", async () => {
        await expect(
          asset.clearingTransferByPartition(
            { partition: _PARTITION_ID_1, expirationTimestamp: MAX_UINT256, data: "0x" },
            amount,
            signer_A.address,
          ),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
