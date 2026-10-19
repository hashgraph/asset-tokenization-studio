// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import type { AssetMockCtx } from "@test";

import { IAssetMock } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

interface ClearingOperation {
  partition: string;
  expirationTimestamp: number;
  data: string;
}

interface ClearingOperationFrom {
  clearingOperation: ClearingOperation;
  from: string;
  operatorData: string;
}

enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation,
}

let clearingOperation: ClearingOperation;
let clearingOperationFrom: ClearingOperationFrom;

export function operatorClearingByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("OperatorClearingByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let signer_F: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let currentTimestamp = 0;
    let expirationTimestamp = 0;

    async function setFacets(asset: IAssetMock) {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 3 * _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    beforeEach(async () => {
      const block = await ethers.provider.getBlock("latest");
      if (!block) throw new Error("Failed to get latest block");
      currentTimestamp = block.timestamp;
      expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;

      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      signer_F = ctx.user5;
      asset = ctx.asset;

      clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp,
        data: _DATA,
      };

      clearingOperationFrom = {
        clearingOperation,
        from: signer_A.address,
        operatorData: _DATA,
      };
    });

    afterEach(async () => {
      await asset.resetSystemTimestamp();
    });

    describe("Single Partition", async () => {
      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
        ]);

        await asset.activateClearing();
        await setFacets(asset);
      });

      describe("operatorClearingTransferByPartition", () => {
        it("GIVEN an authorized operator WHEN operatorClearingTransferByPartition THEN emits ClearedOperatorTransferByPartition and Transfer", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await expect(
            asset
              .connect(signer_B)
              .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
          )
            .to.emit(asset, "ClearedOperatorTransferByPartition")
            .withArgs(
              signer_B.address,
              clearingOperationFrom.from,
              signer_C.address,
              clearingOperationFrom.clearingOperation.partition,
              1,
              _AMOUNT,
              clearingOperationFrom.clearingOperation.expirationTimestamp,
              clearingOperationFrom.clearingOperation.data,
              clearingOperationFrom.operatorData,
            )
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ADDRESS_ZERO, _AMOUNT);
        });

        it("GIVEN an authorized operator WHEN operatorClearingTransferByPartition THEN clearing operation is recorded", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

          const clearing = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
          expect(clearing.amount).to.equal(_AMOUNT);
        });

        describe("AccessControl", () => {
          it("GIVEN an account without operator authorization WHEN operatorClearingTransferByPartition THEN transaction fails with Unauthorized", async () => {
            await expect(
              asset
                .connect(signer_D)
                .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
            ).to.be.revertedWithCustomError(asset, "Unauthorized");
          });
        });

        describe("Paused", () => {
          it("GIVEN a paused token WHEN operatorClearingTransferByPartition THEN transaction fails with IsPaused", async () => {
            await asset.connect(signer_D).pause();

            await expect(
              asset
                .connect(signer_A)
                .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
            ).to.be.revertedWithCustomError(asset, "IsPaused");
          });
        });

        describe("onlyUnrecoveredAddress modifier", () => {
          it("GIVEN a recovered msgSender WHEN operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
            await asset.connect(signer_A).authorizeOperator(signer_B.address);
            await asset.revokeRole(ATS_ROLES.ROLE_ISSUER, signer_B.address);
            await asset.revokeRole(ATS_ROLES.ROLE_KYC, signer_B.address);
            await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
            await asset.recoveryAddress(signer_B.address, signer_E.address, ADDRESS_ZERO);

            await expect(
              asset
                .connect(signer_B)
                .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });

          it("GIVEN a recovered from address WHEN operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
            await asset.connect(signer_A).authorizeOperator(signer_B.address);
            await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
            await asset.recoveryAddress(signer_F.address, signer_E.address, ADDRESS_ZERO);
            clearingOperationFrom.from = signer_F.address;
            await expect(
              asset
                .connect(signer_B)
                .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });
        });

        it("GIVEN amount is zero WHEN operatorClearingTransferByPartition THEN transaction fails with InvalidClearingAmount", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          await expect(
            asset.connect(signer_B).operatorClearingTransferByPartition(clearingOperationFrom, 0, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "InvalidClearingAmount");
        });
      });

      describe("operatorClearingRedeemByPartition", () => {
        it("GIVEN an authorized operator WHEN operatorClearingRedeemByPartition THEN emits ClearedOperatorRedeemByPartition and Transfer", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await expect(asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT))
            .to.emit(asset, "ClearedOperatorRedeemByPartition")
            .withArgs(
              signer_B.address,
              clearingOperationFrom.from,
              clearingOperationFrom.clearingOperation.partition,
              1,
              _AMOUNT,
              clearingOperationFrom.clearingOperation.expirationTimestamp,
              clearingOperationFrom.clearingOperation.data,
              clearingOperationFrom.operatorData,
            )
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ADDRESS_ZERO, _AMOUNT);
        });

        it("GIVEN an authorized operator WHEN operatorClearingRedeemByPartition THEN clearing operation is recorded", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

          const clearing = await asset.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
          expect(clearing.amount).to.equal(_AMOUNT);
        });

        describe("AccessControl", () => {
          it("GIVEN an account without operator authorization WHEN operatorClearingRedeemByPartition THEN transaction fails with Unauthorized", async () => {
            await expect(
              asset.connect(signer_D).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
            ).to.be.revertedWithCustomError(asset, "Unauthorized");
          });
        });

        describe("Paused", () => {
          it("GIVEN a paused token WHEN operatorClearingRedeemByPartition THEN transaction fails with IsPaused", async () => {
            await asset.connect(signer_D).pause();

            await expect(
              asset.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
            ).to.be.revertedWithCustomError(asset, "IsPaused");
          });
        });

        describe("onlyUnrecoveredAddress modifier", () => {
          it("GIVEN a recovered msgSender WHEN operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
            await asset.connect(signer_A).authorizeOperator(signer_B.address);
            await asset.revokeRole(ATS_ROLES.ROLE_ISSUER, signer_B.address);
            await asset.revokeRole(ATS_ROLES.ROLE_KYC, signer_B.address);
            await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
            await asset.recoveryAddress(signer_B.address, signer_E.address, ADDRESS_ZERO);

            await expect(
              asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });

          it("GIVEN a recovered from address WHEN operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
            await asset.connect(signer_A).authorizeOperator(signer_B.address);
            await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
            await asset.recoveryAddress(signer_F.address, signer_E.address, ADDRESS_ZERO);
            clearingOperationFrom.from = signer_F.address;
            await expect(
              asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });
        });

        it("GIVEN amount is zero WHEN operatorClearingRedeemByPartition THEN transaction fails with InvalidClearingAmount", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          await expect(
            asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, 0),
          ).to.be.revertedWithCustomError(asset, "InvalidClearingAmount");
        });
      });

      describe("FIND-030 - operator clearing phantom allowance guard", () => {
        const zeroAllowance = (holder: string) => asset.allowance(holder, ADDRESS_ZERO);

        it("R1-Cancel: GIVEN operator clearing transfer WHEN cancel THEN allowance(address(0)) == 0 and no Approval event", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);

          const identifier = {
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };

          await expect(asset.connect(signer_A).cancelClearingOperationByPartition(identifier)).to.not.be.reverted;
          expect(await zeroAllowance(signer_A.address)).to.equal(0);
        });

        it("R1-Reclaim: GIVEN operator clearing transfer WHEN reclaim at expiry THEN allowance(address(0)) == 0 and balance restored", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          const balanceBefore = await asset.balanceOf(signer_A.address);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
          await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

          const identifier = {
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };

          await expect(asset.connect(signer_A).reclaimClearingOperationByPartition(identifier)).to.not.be.reverted;
          expect(await zeroAllowance(signer_A.address)).to.equal(0);
          expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore);
        });

        it("R2-Reclaim: GIVEN operator clearing redeem WHEN reclaim at expiry THEN allowance(address(0)) == 0 and balance restored", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          const balanceBefore = await asset.balanceOf(signer_A.address);

          await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);
          await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

          const identifier = {
            clearingOperationType: ClearingOperationType.Redeem,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };

          await expect(asset.connect(signer_A).reclaimClearingOperationByPartition(identifier)).to.not.be.reverted;
          expect(await zeroAllowance(signer_A.address)).to.equal(0);
          expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore);
        });

        it("R5-SequentialCancel: GIVEN authorized and operator clearings WHEN both cancelled THEN authorized allowance exactly restored and operator allowance stays 0", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          const finiteAllowance = 500;
          await asset.connect(signer_A).approve(signer_B.address, finiteAllowance);

          const clearingOperationForFrom = {
            clearingOperation: {
              partition: _DEFAULT_PARTITION,
              expirationTimestamp: clearingOperation.expirationTimestamp,
              data: EMPTY_HEX_BYTES,
            },
            from: signer_A.address,
            operatorData: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationForFrom, _AMOUNT / 2);
          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(finiteAllowance - _AMOUNT / 2);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT / 2, signer_C.address);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);

          const authorizedId = {
            clearingOperationType: ClearingOperationType.Redeem,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };
          const operatorId = {
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };

          await asset.connect(signer_A).cancelClearingOperationByPartition(authorizedId);
          await asset.connect(signer_A).cancelClearingOperationByPartition(operatorId);

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(finiteAllowance);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);
        });

        it("R6-RepeatedCancel: GIVEN operator clearing WHEN cancel THEN new clearing WHEN cancel again THEN allowance stays 0", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
          const firstId = {
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          };
          await asset.connect(signer_A).cancelClearingOperationByPartition(firstId);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
          const secondId = {
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 2,
          };
          await asset.connect(signer_A).cancelClearingOperationByPartition(secondId);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);
        });

        it("R7-ABAF: GIVEN operator clearing WHEN adjustBalances changes the factor THEN cancel THEN allowance(address(0)) stays 0 and no Approval(0x0) event", async () => {
          const adjustFactor = 2;
          const adjustDecimals = 1;
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_C.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: 7 * _AMOUNT,
            data: EMPTY_HEX_BYTES,
          });

          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset
            .connect(signer_B)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
          expect(await zeroAllowance(signer_A.address)).to.equal(0);

          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // Snapshot the balance AFTER the adjustment, right before the unwind.
          const balanceAfterAdjust = await asset.balanceOf(signer_A.address);

          await asset.connect(signer_A).cancelClearingOperationByPartition({
            clearingOperationType: ClearingOperationType.Transfer,
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            clearingId: 1,
          });

          expect(await zeroAllowance(signer_A.address)).to.equal(0);
          // The ABAF-adjusted cleared amount must be credited back to the holder.
          expect(await asset.balanceOf(signer_A.address)).to.equal(
            balanceAfterAdjust + BigInt(_AMOUNT) * BigInt(adjustFactor),
          );
        });
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN operatorClearingRedeemByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.operatorClearingRedeemByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              operatorData: "0x",
            },
            0,
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN operatorClearingTransferByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.operatorClearingTransferByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              operatorData: "0x",
            },
            0,
            ethers.ZeroAddress,
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeOperatorClearingByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperatorClearingByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeOperatorClearingByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperatorClearingByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperatorClearingByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.operatorClearingByPartition, 1);
      });
    });

    describe("initializeOperatorClearingByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperatorClearingByPartition is called THEN emits OperatorClearingByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.operatorClearingByPartition);
        await expect(asset.initializeOperatorClearingByPartition()).to.emit(
          asset,
          "OperatorClearingByPartitionInitialized",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN operatorClearingRedeemByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalOp: ClearingOperationFrom = {
          clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
          from: ADDRESS_ZERO,
          operatorData: "0x",
        };
        await expect(asset.operatorClearingRedeemByPartition(minimalOp, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN operatorClearingTransferByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalOp: ClearingOperationFrom = {
          clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
          from: ADDRESS_ZERO,
          operatorData: "0x",
        };
        await expect(
          asset.operatorClearingTransferByPartition(minimalOp, 0, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
