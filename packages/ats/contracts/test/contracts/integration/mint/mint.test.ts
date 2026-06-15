// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO, RESOLVER_KEY_MINT } from "@scripts";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

export function mintTests(getCtx: () => AssetMockCtx): void {
  describe("MintFacet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_E = ctx.user4;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
    });

    describe("initializeERC1594", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeERC1594 is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeERC1594())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeERC1594 is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeERC1594()).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });
    });

    describe("initializeERC1594 event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeERC1594 is called THEN emits ERC1594Initialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_MINT);
        await expect(asset.initializeERC1594()).to.emit(asset, "ERC1594Initialized");
      });
    });

    describe("Multi partition mode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      });

      it("GIVEN multi-partition mode WHEN issue THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.issue(signer_A.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN multi-partition mode WHEN mint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.mint(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Single partition mode", () => {
      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CAP, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CORPORATE_ACTION, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_A).setMaxSupply(MAX_SUPPLY);
      });

      it("GIVEN a fresh token WHEN isIssuable THEN returns true", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_MINT);
        await asset.initializeERC1594();
        expect(await asset.isIssuable()).to.be.true;
      });

      it("GIVEN an issuer WHEN issue THEN emits Issued and updates balances", async () => {
        expect(await asset.issue(signer_E.address, AMOUNT / 2, DATA))
          .to.emit(asset, "Issued")
          .withArgs(signer_A.address, signer_E.address, AMOUNT / 2);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });

      it("GIVEN an issuer WHEN issue with max supply after balance adjustment THEN succeeds", async () => {
        const balanceAdjustmentData = {
          executionDate: 5000n,
          factor: 3,
          decimals: 0,
        };

        await asset.changeSystemTimestamp(100n);

        await asset.setMaxSupply(AMOUNT);
        await asset.issue(signer_E.address, AMOUNT, DATA);
        await asset.setScheduledBalanceAdjustment(balanceAdjustmentData);

        await asset.changeSystemTimestamp(balanceAdjustmentData.executionDate + 1n);

        await expect(asset.issue(signer_E.address, 1, DATA))
          .to.be.revertedWithCustomError(asset, "MaxSupplyReached")
          .withArgs(balanceAdjustmentData.factor * AMOUNT);
      });

      it("GIVEN an issuer WHEN mint THEN emits Issued with empty data and updates balances", async () => {
        expect(await asset.mint(signer_E.address, AMOUNT / 2))
          .to.emit(asset, "Issued")
          .withArgs(signer_A.address, signer_E.address, AMOUNT / 2);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      });

      describe("bug Transfer", () => {
        it("GIVEN an issuer WHEN issue THEN Transfer event is emitted from address(0) to receiver", async () => {
          await expect(asset.issue(signer_E.address, AMOUNT / 2, DATA))
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);
        });

        it("GIVEN an issuer WHEN mint THEN Transfer event is emitted from address(0) to receiver", async () => {
          await expect(asset.mint(signer_E.address, AMOUNT / 2))
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);
        });
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN mint THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).mint(ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN issue THEN reverts with AssetNotOperational", async () => {
        await expect(asset.issue(ADDRESS_ZERO, 0, "0x")).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN mint THEN reverts with AssetNotOperational", async () => {
        await expect(asset.mint(ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
