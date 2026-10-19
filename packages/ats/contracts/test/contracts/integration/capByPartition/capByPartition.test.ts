// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { DEFAULT_PARTITION, ZERO, EMPTY_STRING, ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const maxSupply = 3;
const maxSupplyByPartition = 2;
const EMPTY_VC_ID = EMPTY_STRING;

export function capByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("CapByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CAP, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_A).setMaxSupply(maxSupply * 2);
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN setMaxSupplyByPartition THEN transaction fails with IsPaused", async () => {
        await expect(
          asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without cap role WHEN setMaxSupplyByPartition THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("New Max Supply Too low or 0", () => {
      it("GIVEN a token WHEN setMaxSupplyByPartition with 0 THEN transaction fails with NewMaxSupplyCannotBeZero", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await expect(asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, 0)).to.be.revertedWithCustomError(
          asset,
          "NewMaxSupplyCannotBeZero",
        );
      });

      it("GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyForPartitionTooLow", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID_1,
          tokenHolder: signer_A.address,
          value: maxSupply * 2,
          data: "0x",
        });

        await expect(
          asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply),
        ).to.be.revertedWithCustomError(asset, "NewMaxSupplyForPartitionTooLow");
      });
    });

    describe("New Max Supply OK", () => {
      it("GIVEN a token WHEN setMaxSupplyByPartition THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await expect(asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 2))
          .to.emit(asset, "MaxSupplyByPartitionSet")
          .withArgs(signer_C.address, _PARTITION_ID_1, maxSupply * 2, 0);

        const currentMaxSupply = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

        expect(currentMaxSupply).to.equal(maxSupply * 2);
      });

      it("GIVEN a token WHEN setMaxSupplyByPartition exceeds global max supply THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_C.address);

        await expect(asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 100))
          .to.emit(asset, "MaxSupplyByPartitionSet")
          .withArgs(signer_C.address, _PARTITION_ID_1, maxSupply * 100, 0);

        const currentMaxSupply = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

        expect(currentMaxSupply).to.equal(maxSupply * 100);
      });
    });

    describe("initializeCapByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCapByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeCapByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCapByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCapByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.capByPartition, 1);
      });
    });

    describe("initializeCapByPartition event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeCapByPartition is called THEN emits CapByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.capByPartition);
        await expect(asset.initializeCapByPartition()).to.emit(asset, "CapByPartitionInitialized");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setMaxSupplyByPartition THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).setMaxSupplyByPartition(ethers.ZeroHash, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setMaxSupplyByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setMaxSupplyByPartition(DEFAULT_PARTITION, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
