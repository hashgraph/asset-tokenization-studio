// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import type { AssetMockCtx } from "@test";

import { IAssetMock } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";

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

interface Hold {
  amount: bigint;
  expirationTimestamp: bigint;
  escrow: string;
  to: string;
  data: string;
}

let clearingOperation: ClearingOperation;
let clearingOperationFrom: ClearingOperationFrom;
let hold: Hold;

export function operatorClearingHoldByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("OperatorClearingHoldByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

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

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
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
      asset = ctx.asset;

      hold = {
        amount: BigInt(_AMOUNT),
        expirationTimestamp: BigInt(expirationTimestamp),
        escrow: signer_B.address,
        to: signer_C.address,
        data: _DATA,
      };

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
          { role: ATS_ROLES.ROLE_CONTROLLER, members: [signer_C.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
          { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_E.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
        ]);

        await asset.activateClearing();
        await setFacets(asset);
      });

      it("GIVEN an authorized operator WHEN creating clearing holds THEN holds are created correctly", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        const hold1 = {
          ...hold,
          amount: _AMOUNT / 10,
          to: signer_C.address,
        };

        const hold2 = {
          ...hold,
          amount: _AMOUNT / 10,
          to: signer_D.address,
        };

        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold1);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold2);

        const clearing1 = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        const clearing2 = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 2);

        expect(clearing1.holdTo).to.equal(signer_C.address);
        expect(clearing2.holdTo).to.equal(signer_D.address);
      });

      describe("bug Transfer", () => {
        it("GIVEN an authorized operator WHEN operatorClearingCreateHoldByPartition THEN Transfer event is emitted from holder to address(0)", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          await expect(asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold))
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without operator authorization WHEN operatorClearingCreateHoldByPartition THEN transaction fails with Unauthorized", async () => {
          await expect(
            asset.connect(signer_D).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
          ).to.be.revertedWithCustomError(asset, "Unauthorized");
        });
      });

      describe("onlyUnrecoveredAddress modifier", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          // Give signer_B some tokens and authorize operator
          await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
          await asset.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          // Recover the hold.to address (signer_C - the actual hold.to)
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN operatorClearingCreateHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.operatorClearingCreateHoldByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
              from: ethers.ZeroAddress,
              operatorData: "0x",
            },
            { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeOperatorClearingHoldByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperatorClearingHoldByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeOperatorClearingHoldByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperatorClearingHoldByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperatorClearingHoldByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.operatorClearingHoldByPartition, 1);
      });
    });

    describe("initializeOperatorClearingHoldByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperatorClearingHoldByPartition is called THEN emits OperatorClearingHoldByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.operatorClearingHoldByPartition);
        await expect(asset.initializeOperatorClearingHoldByPartition()).to.emit(
          asset,
          "OperatorClearingHoldByPartitionInitialized",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN operatorClearingCreateHoldByPartition is called THEN AssetNotOperational", async () => {
        await expect(
          asset.operatorClearingCreateHoldByPartition(
            {
              clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0n, data: "0x" },
              from: ethers.ZeroAddress,
              operatorData: "0x",
            },
            { amount: 0n, expirationTimestamp: 0n, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
          ),
        )
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
