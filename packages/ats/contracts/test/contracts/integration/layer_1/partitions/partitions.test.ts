// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const _AMOUNT = 1000;

export function partitionsTests(getCtx: () => AssetMockCtx): void {
  describe("Partitions Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    });

    describe("isMultiPartition", () => {
      it("GIVEN a single-partition token WHEN isMultiPartition THEN returns false", async () => {
        expect(await asset.isMultiPartition()).to.equal(false);
      });

      it("GIVEN a multi-partition token WHEN isMultiPartition THEN returns true", async () => {
        await asset.setMultiPartition(true);
        expect(await asset.isMultiPartition()).to.equal(true);
      });
    });

    describe("partitionsOf", () => {
      it("GIVEN a holder with no balance WHEN partitionsOf THEN returns an empty array", async () => {
        expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([]);
      });

      it("GIVEN a holder funded on the default partition WHEN partitionsOf THEN returns that partition", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([_DEFAULT_PARTITION]);
      });

      it("GIVEN a holder funded on multiple partitions WHEN partitionsOf THEN returns every partition in issuance order", async () => {
        await asset.setMultiPartition(true);
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(signer_B).issueByPartition({
          partition: _CUSTOM_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([_DEFAULT_PARTITION, _CUSTOM_PARTITION]);
      });
    });

    describe("initializePartitions", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializePartitions THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializePartitions(false))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializePartitions THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializePartitions(false))
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.partitions, 1);
      });
    });

    describe("initializePartitions event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializePartitions THEN emits PartitionsInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.partitions);
        await expect(asset.initializePartitions(false)).to.emit(asset, "PartitionsInitialized");
      });
    });
  });
}
