// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { RESOLVER_KEYS } from "@scripts";
import { ADDRESS_ZERO, ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";

const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function transferByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("TransferByPartition Facet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    async function setupBalances() {
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
    });

    describe("Single partition mode", () => {
      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).addIssuer(signer_A.address);
        await setupBalances();
      });

      it("GIVEN a non-default partition in single-partition mode WHEN transferByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset.connect(signer_A).transferByPartition(_WRONG_PARTITION, { to: signer_C.address, value: _AMOUNT }, "0x"),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
      it("GIVEN a zero-value transfer WHEN transferByPartition THEN reverts with ZeroValue", async () => {
        await expect(
          asset.connect(signer_A).transferByPartition(DEFAULT_PARTITION, { to: signer_C.address, value: 0 }, "0x"),
        ).to.be.revertedWithCustomError(asset, "ZeroValue");
      });

      describe("Happy path", () => {
        it("GIVEN valid parameters WHEN transferByPartition in single-partition mode THEN emits TransferByPartition and Transfer", async () => {
          await expect(
            asset
              .connect(signer_A)
              .transferByPartition(DEFAULT_PARTITION, { to: signer_C.address, value: _AMOUNT }, EMPTY_HEX_BYTES),
          )
            .to.emit(asset, "TransferByPartition")
            .withArgs(
              DEFAULT_PARTITION,
              ADDRESS_ZERO,
              signer_A.address,
              signer_C.address,
              _AMOUNT,
              EMPTY_HEX_BYTES,
              "0x",
            )
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, signer_C.address, _AMOUNT);
        });
      });
    });

    describe("Multi partition mode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).addIssuer(signer_A.address);
        await setupBalances();
      });

      describe("Happy path", () => {
        it("GIVEN valid parameters WHEN transferByPartition in multi-partition mode THEN emits TransferByPartition and Transfer", async () => {
          await expect(
            asset
              .connect(signer_A)
              .transferByPartition(DEFAULT_PARTITION, { to: signer_C.address, value: _AMOUNT }, EMPTY_HEX_BYTES),
          )
            .to.emit(asset, "TransferByPartition")
            .withArgs(
              DEFAULT_PARTITION,
              ADDRESS_ZERO,
              signer_A.address,
              signer_C.address,
              _AMOUNT,
              EMPTY_HEX_BYTES,
              "0x",
            )
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, signer_C.address, _AMOUNT);
        });
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN transferByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).transferByPartition(ethers.ZeroHash, { to: ethers.ZeroAddress, value: 0 }, "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeTransferByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeTransferByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeTransferByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeTransferByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeTransferByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.transferByPartition, 1);
      });
    });

    describe("initializeTransferByPartition event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeTransferByPartition is called THEN emits TransferByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.transferByPartition);
        await expect(asset.initializeTransferByPartition()).to.emit(asset, "TransferByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN transferByPartition is called THEN AssetNotOperational", async () => {
        await expect(asset.transferByPartition(ethers.ZeroHash, { to: ethers.ZeroAddress, value: 0n }, "0x"))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
