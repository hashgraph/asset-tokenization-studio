// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, RESOLVER_KEY_OPERATOR_BY_PARTITION } from "@scripts";
import { executeRbac, grantKycToHolders } from "@test";
import type { AssetMockCtx } from "@test";

const WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const AMOUNT = 1000;

export function operatorByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("OperatorByPartitionFacet Tests", () => {
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
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_A, [signer_A, signer_B, signer_C, signer_D]);

      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    });

    // ─── authorizeOperatorByPartition ────────────────────────────────────────────

    describe("authorizeOperatorByPartition", () => {
      it("GIVEN a paused token WHEN authorizeOperatorByPartition THEN reverts with IsPaused", async () => {
        await asset.pause();
        await expect(
          asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an incompatible partition WHEN authorizeOperatorByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(asset.connect(signer_A).authorizeOperatorByPartition(WRONG_PARTITION, signer_B.address))
          .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(WRONG_PARTITION);
      });

      it("GIVEN a blocked operator WHEN authorizeOperatorByPartition THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_B.address);
        await expect(
          asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      it("GIVEN valid inputs WHEN authorizeOperatorByPartition THEN emits AuthorizedOperatorByPartition and isOperatorForPartition returns true", async () => {
        await expect(asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address))
          .to.emit(asset, "AuthorizedOperatorByPartition")
          .withArgs(DEFAULT_PARTITION, signer_B.address, signer_A.address);

        expect(await asset.isOperatorForPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address)).to.equal(
          true,
        );
      });
    });

    // ─── revokeOperatorByPartition ────────────────────────────────────────────────

    describe("revokeOperatorByPartition", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
      });

      it("GIVEN a paused token WHEN revokeOperatorByPartition THEN reverts with IsPaused", async () => {
        await asset.pause();
        await expect(
          asset.connect(signer_A).revokeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an incompatible partition WHEN revokeOperatorByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(asset.connect(signer_A).revokeOperatorByPartition(WRONG_PARTITION, signer_B.address))
          .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(WRONG_PARTITION);
      });

      it("GIVEN a blocked operator WHEN revokeOperatorByPartition THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_B.address);
        await expect(
          asset.connect(signer_A).revokeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      it("GIVEN a previously authorised operator WHEN revokeOperatorByPartition THEN emits RevokedOperatorByPartition and isOperatorForPartition returns false", async () => {
        await expect(asset.connect(signer_A).revokeOperatorByPartition(DEFAULT_PARTITION, signer_B.address))
          .to.emit(asset, "RevokedOperatorByPartition")
          .withArgs(DEFAULT_PARTITION, signer_B.address, signer_A.address);

        expect(await asset.isOperatorForPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address)).to.equal(
          false,
        );
      });
    });

    // ─── isOperatorForPartition ───────────────────────────────────────────────────

    describe("isOperatorForPartition", () => {
      it("GIVEN no approval WHEN isOperatorForPartition THEN returns false", async () => {
        expect(await asset.isOperatorForPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address)).to.equal(
          false,
        );
      });

      it("GIVEN per-partition approval WHEN isOperatorForPartition THEN returns true", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        expect(await asset.isOperatorForPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address)).to.equal(
          true,
        );
      });

      it("GIVEN revoked per-partition approval WHEN isOperatorForPartition THEN returns false", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        await asset.connect(signer_A).revokeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        expect(await asset.isOperatorForPartition(DEFAULT_PARTITION, signer_B.address, signer_A.address)).to.equal(
          false,
        );
      });
    });

    // ─── operatorTransferByPartition ─────────────────────────────────────────────

    describe("operatorTransferByPartition", () => {
      it("GIVEN to address is zero WHEN operatorTransferByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        await expect(
          asset.connect(signer_B).operatorTransferByPartition({
            partition: DEFAULT_PARTITION,
            from: signer_A.address,
            to: ethers.ZeroAddress,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
            operatorData: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN an incompatible partition WHEN operatorTransferByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset.connect(signer_B).operatorTransferByPartition({
            partition: WRONG_PARTITION,
            from: signer_A.address,
            to: signer_C.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
            operatorData: EMPTY_HEX_BYTES,
          }),
        )
          .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(WRONG_PARTITION);
      });

      it("GIVEN a non-operator caller WHEN operatorTransferByPartition THEN reverts with Unauthorized", async () => {
        await asset.connect(signer_A).approve(signer_B.address, AMOUNT);
        await expect(
          asset.connect(signer_B).operatorTransferByPartition({
            partition: DEFAULT_PARTITION,
            from: signer_A.address,
            to: signer_C.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
            operatorData: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "Unauthorized");
      });

      it("GIVEN valid inputs WHEN operatorTransferByPartition THEN emits TransferByPartition and balances update correctly", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);

        const initialBalanceA = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
        const initialBalanceC = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address);

        await expect(
          asset.connect(signer_B).operatorTransferByPartition({
            partition: DEFAULT_PARTITION,
            from: signer_A.address,
            to: signer_C.address,
            value: AMOUNT,
            data: EMPTY_HEX_BYTES,
            operatorData: EMPTY_HEX_BYTES,
          }),
        )
          .to.emit(asset, "TransferByPartition")
          .withArgs(
            DEFAULT_PARTITION,
            signer_B.address,
            signer_A.address,
            signer_C.address,
            AMOUNT,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(
          initialBalanceA - BigInt(AMOUNT),
        );
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(
          initialBalanceC + BigInt(AMOUNT),
        );
      });
    });

    // ─── operatorRedeemByPartition ────────────────────────────────────────────────

    describe("operatorRedeemByPartition", () => {
      it("GIVEN an incompatible partition WHEN operatorRedeemByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        await expect(
          asset
            .connect(signer_B)
            .operatorRedeemByPartition(WRONG_PARTITION, signer_A.address, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        )
          .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(WRONG_PARTITION);
      });

      it("GIVEN a non-operator caller WHEN operatorRedeemByPartition THEN reverts with InsufficientAllowance", async () => {
        await expect(
          asset
            .connect(signer_B)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
      });

      it("GIVEN insufficient balance WHEN operatorRedeemByPartition THEN reverts", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);
        await expect(
          asset
            .connect(signer_B)
            .operatorRedeemByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              AMOUNT + 1,
              EMPTY_HEX_BYTES,
              EMPTY_HEX_BYTES,
            ),
        ).to.be.reverted;
      });

      it("GIVEN valid inputs WHEN operatorRedeemByPartition THEN emits RedeemedByPartition and totalSupply decreases", async () => {
        await asset.connect(signer_A).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address);

        const initialSupply = await asset.totalSupplyByPartition(DEFAULT_PARTITION);
        const initialBalance = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);

        await expect(
          asset
            .connect(signer_B)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        )
          .to.emit(asset, "RedeemedByPartition")
          .withArgs(DEFAULT_PARTITION, signer_B.address, signer_A.address, AMOUNT, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(
          initialBalance - BigInt(AMOUNT),
        );
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(initialSupply - BigInt(AMOUNT));
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN authorizeOperatorByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).authorizeOperatorByPartition(ethers.ZeroHash, ethers.ZeroAddress),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN revokeOperatorByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).revokeOperatorByPartition(ethers.ZeroHash, ethers.ZeroAddress),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN operatorTransferByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).operatorTransferByPartition({
            partition: ethers.ZeroHash,
            from: ethers.ZeroAddress,
            to: ethers.ZeroAddress,
            value: 0,
            data: "0x",
            operatorData: "0x",
          }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN operatorRedeemByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).operatorRedeemByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeOperatorByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperatorByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeOperatorByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperatorByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperatorByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_OPERATOR_BY_PARTITION, 1);
      });
    });

    describe("initializeOperatorByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperatorByPartition is called THEN emits OperatorByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_OPERATOR_BY_PARTITION);
        await expect(asset.initializeOperatorByPartition()).to.emit(asset, "OperatorByPartitionInitialized");
      });
    });
    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN authorizeOperatorByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.authorizeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN revokeOperatorByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.revokeOperatorByPartition(DEFAULT_PARTITION, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN operatorTransferByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.operatorTransferByPartition({
            partition: DEFAULT_PARTITION,
            from: signer_A.address,
            to: signer_B.address,
            value: 0,
            data: EMPTY_HEX_BYTES,
            operatorData: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN operatorRedeemByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, 0, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN revokeOperator THEN reverts with AssetNotOperational", async () => {
        await expect(asset.revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
