// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy, ComplianceMock, IdentityRegistryMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import {
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  DEFAULT_PARTITION,
  ADDRESS_ZERO,
  EMPTY_HEX_BYTES,
  dateToUnixTimestamp,
  EIP1066_CODES,
} from "@scripts";

const name = "TEST";
const symbol = "TAC";
const decimals = 6;
const isin = "US0231351067";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Recovery Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  describe("single partition", () => {
    async function deployFixtureSinglePartition() {
      const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

      complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
      await complianceMock.waitForDeployment();

      identityRegistryMock = await (
        await ethers.getContractFactory("IdentityRegistryMock", signer_A)
      ).deploy(true, false);
      await identityRegistryMock.waitForDeployment();

      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            compliance: complianceMock.target as string,
            identityRegistry: identityRegistryMock.target as string,
            maxSupply: MAX_SUPPLY,
            erc20MetadataInfo: { name, symbol, decimals, isin },
          },
        },
        infrastructure,
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        {
          role: ATS_ROLES.PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ISSUER_ROLE,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES.KYC_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.CLEARING_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.AGENT_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.TREX_OWNER_ROLE,
          members: [signer_A.address],
        },
      ]);

      await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES.FREEZE_MANAGER_ROLE, signer_A.address);
      await asset.grantRole(ATS_ROLES.PAUSER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deployFixtureSinglePartition);
    });

    describe("Paused", () => {
      it("GIVEN a paused token WHEN recoveryAddress THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(
          asset.recoveryAddress(signer_A.address, signer_C.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without AGENT_ROLE role WHEN recoveryAddress THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).recoveryAddress(signer_A.address, signer_B.address, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Recovery", () => {
      it("GIVEN lost wallet with pending locks, holds or clearings THEN recovery fails with CannotRecoverWallet", async () => {
        await asset.grantRole(ATS_ROLES.LOCKER_ROLE, signer_A.address);
        const amount = 1000;
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        // Lock
        await asset.lock(amount, signer_E.address, dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));
        await asset.release(1, signer_E.address);
        // Hold
        const hold = {
          amount: amount,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:06Z"),
          escrow: signer_B.address,
          to: signer_C.address,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).createHoldByPartition(DEFAULT_PARTITION, hold);
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:05Z"));
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          holdId: 1,
        };
        await asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, amount);
        // Clearing
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:09Z"),
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_E).clearingTransferByPartition(clearingOperation, amount, signer_A.address);
        await expect(
          asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "CannotRecoverWallet");
      });

      it("GIVEN lost wallet WHEN calling recoveryAddress THEN normal balance and freeze balance and status is successfully transferred", async () => {
        const amount = 1000;
        await asset.grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: amount,
          data: "0x",
        });
        await asset.freezePartialTokens(signer_E.address, amount / 2);
        await asset.addToControlList(signer_E.address);
        expect(await asset.recoveryAddress(signer_E.address, signer_B.address, ADDRESS_ZERO))
          .to.emit(asset, "RecoverySuccess")
          .withArgs(signer_E.address, signer_B.address, ADDRESS_ZERO);
        const balanceE = await asset.balanceOf(signer_E.address);
        const balanceB = await asset.balanceOf(signer_B.address);
        const frozenBalanceE = await asset.getFrozenTokens(signer_E.address);
        const frozenBalanceB = await asset.getFrozenTokens(signer_B.address);
        const assetStatusE = await asset.isInControlList(signer_E.address);
        const assetStatusB = await asset.isInControlList(signer_B.address);
        const isRecovered = await asset.isAddressRecovered(signer_E.address);
        expect(balanceE).to.equal(0);
        expect(balanceB).to.equal(amount / 2);
        expect(frozenBalanceE).to.equal(0);
        expect(frozenBalanceB).to.equal(amount / 2);
        expect(assetStatusE).to.equal(true);
        expect(assetStatusB).to.equal(true);
        expect(isRecovered).to.equal(true);
      });

      it("GIVEN lost wallet WHEN calling recovery using a previously recovered address THEN recovered status is set to false", async () => {
        await asset.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        await asset.recoveryAddress(signer_B.address, signer_C.address, ADDRESS_ZERO);
        const isRecoveredC = await asset.isAddressRecovered(signer_C.address);
        expect(isRecoveredC).to.equal(false);
      });

      it("GIVEN a recovered address THEN operations should fail", async () => {
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await asset.grantRole(ATS_ROLES.LOCKER_ROLE, signer_A.address);
        await asset.connect(signer_C).authorizeOperator(signer_A.address);
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        await asset.connect(signer_A).authorizeOperator(signer_C.address);
        await asset.connect(signer_A).authorizeOperator(signer_A.address);
        const amount = 1000;
        await asset.recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);
        const basicTransferInfo = {
          to: signer_B.address,
          value: amount,
        };
        await expect(
          asset.connect(signer_C).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).transfer(basicTransferInfo.to, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.connect(signer_C).transferFrom(signer_A.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(ProtectedPartitionRole_1, signer_A.address);
        await asset.protectPartitions();
        await expect(
          asset.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_C.address, signer_B.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        const operatorTransferData = {
          partition: DEFAULT_PARTITION,
          from: signer_A.address,
          to: signer_B.address,
          value: amount,
          data: EMPTY_HEX_BYTES,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_C).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).transferWithData(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).transferFromWithData(signer_A.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).batchTransfer([signer_D.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        operatorTransferData.from = signer_C.address;
        await expect(
          asset.connect(signer_A).operatorTransferByPartition(operatorTransferData),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        operatorTransferData.from = signer_A.address;
        await expect(
          asset.connect(signer_A).transferFromWithData(signer_C.address, signer_B.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_A).transferFrom(signer_C.address, basicTransferInfo.to, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        basicTransferInfo.to = signer_C.address;
        await expect(
          asset.transferByPartition(DEFAULT_PARTITION, basicTransferInfo, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.transfer(signer_C.address, amount)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.transferFrom(signer_A.address, signer_C.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await asset.protectPartitions();
        await expect(
          asset.protectedTransferFromByPartition(DEFAULT_PARTITION, signer_B.address, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        operatorTransferData.to = signer_C.address;
        await expect(asset.operatorTransferByPartition(operatorTransferData)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.transferWithData(signer_C.address, amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.transferFromWithData(signer_A.address, signer_C.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.batchTransfer([signer_C.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).increaseAllowance(signer_A.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).approve(signer_A.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).authorizeOperator(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.connect(signer_C).authorizeOperatorByPartition(DEFAULT_PARTITION, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.increaseAllowance(signer_C.address, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.approve(signer_C.address, amount)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.authorizeOperator(signer_C.address)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.authorizeOperatorByPartition(DEFAULT_PARTITION, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).redeem(amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await asset.protectPartitions();
        await expect(
          asset.protectedRedeemFromByPartition(DEFAULT_PARTITION, signer_C.address, amount, {
            deadline: MAX_UINT256,
            nonce: 1,
            signature: "0x1234",
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorRedeemByPartition(DEFAULT_PARTITION, signer_A.address, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).redeemByPartition(DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).redeemFrom(signer_A.address, amount, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.redeemFrom(signer_C.address, amount, EMPTY_HEX_BYTES)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.operatorRedeemByPartition(
            DEFAULT_PARTITION,
            signer_C.address,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          ),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.issue(signer_C.address, amount, EMPTY_HEX_BYTES)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_C.address,
            value: amount,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.mint(signer_C.address, amount)).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.batchMint([signer_C.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.lock(amount, signer_C.address, MAX_UINT256)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.lockByPartition(DEFAULT_PARTITION, amount, signer_C.address, MAX_UINT256),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        // FIND-127: recovered caller must not be able to issue/mint
        await expect(
          asset.connect(signer_C).issue(signer_D.address, amount, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.connect(signer_C).mint(signer_D.address, amount)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(asset.connect(signer_C).batchMint([signer_D.address], [amount])).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        // FIND-127: release/releaseByPartition must not work on a recovered tokenHolder
        await expect(asset.release(1, signer_C.address)).to.revertedWithCustomError(asset, "WalletRecovered");
        await expect(asset.releaseByPartition(DEFAULT_PARTITION, 1, signer_C.address)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        // FIND-127: controllerCreateHoldByPartition must not work with a recovered _from
        await asset.grantRole(ATS_ROLES.CONTROLLER_ROLE, signer_A.address);
        const controllerHold = {
          amount: amount,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_A.address,
          data: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.controllerCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, controllerHold, EMPTY_HEX_BYTES),
        ).to.revertedWithCustomError(asset, "WalletRecovered");
        await asset.connect(signer_B).activateClearing();
        const clearingOperation = {
          partition: DEFAULT_PARTITION,
          expirationTimestamp: MAX_UINT256,
          data: EMPTY_HEX_BYTES,
        };
        const clearingOperationFrom = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          operatorData: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_C).clearingTransferByPartition(clearingOperation, amount, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingTransferFromByPartition(clearingOperationFrom, amount, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_C.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_A.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        clearingOperationFrom.from = signer_C.address;
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        clearingOperationFrom.from = signer_A.address;
        await expect(
          asset.clearingTransferByPartition(clearingOperation, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, amount, signer_C.address),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        protectedClearingOperation.from = signer_A.address;
        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, amount, signer_C.address, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        protectedClearingOperation.from = signer_C.address;
        await asset.unprotectPartitions();
        const hold = {
          amount: amount,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: EMPTY_HEX_BYTES,
        };
        await expect(
          asset.connect(signer_C).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        hold.to = signer_C.address;
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset.connect(signer_C).clearingRedeemByPartition(clearingOperation, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).clearingRedeemFromByPartition(clearingOperationFrom, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedClearingRedeemByPartition(protectedClearingOperation, amount, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await asset.connect(signer_B).deactivateClearing();
        clearingOperationFrom.from = signer_C.address;
        await expect(asset.clearingRedeemFromByPartition(clearingOperationFrom, amount)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
        clearingOperationFrom.from = signer_A.address;
        await expect(
          asset.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        const protectedHold = {
          hold: hold,
          deadline: MAX_UINT256,
          nonce: 1,
        };
        await expect(
          asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.createHoldFromByPartition(DEFAULT_PARTITION, signer_C.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        hold.to = signer_C.address;
        await expect(
          asset.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await expect(
          asset.connect(signer_C).createHoldFromByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.protectPartitions();
        await expect(
          asset.protectedCreateHoldByPartition(DEFAULT_PARTITION, signer_C.address, protectedHold, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.unprotectPartitions();
        await expect(
          asset
            .connect(signer_C)
            .operatorCreateHoldByPartition(DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        const holdIdentifier = {
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: 1,
        };
        await expect(
          asset.executeHoldByPartition(holdIdentifier, signer_C.address, amount),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        let canTransferByPartition = await asset
          .connect(signer_C)
          .canTransferByPartition(
            signer_A.address,
            signer_C.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canTransferByPartition = await asset
          .connect(signer_C)
          .canTransferByPartition(
            signer_C.address,
            signer_A.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        let canTransfer = await asset.connect(signer_C).canTransfer(signer_A.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        await asset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.controllerTransfer(signer_A.address, signer_C.address, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        canTransferByPartition = await asset
          .connect(signer_B)
          .canTransferByPartition(
            signer_C.address,
            signer_A.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canTransferByPartition = await asset
          .connect(signer_B)
          .canTransferByPartition(
            signer_A.address,
            signer_C.address,
            DEFAULT_PARTITION,
            amount,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
          );
        expect(canTransferByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canTransfer = await asset.canTransfer(signer_C.address, amount, EMPTY_HEX_BYTES);
        expect(canTransfer[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        let canRedeemByPartition = await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_A.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canRedeemByPartition = await asset
          .connect(signer_C)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        canRedeemByPartition = await asset
          .connect(signer_B)
          .canRedeemByPartition(signer_C.address, DEFAULT_PARTITION, amount, EMPTY_HEX_BYTES, EMPTY_HEX_BYTES);
        expect(canRedeemByPartition[1]).to.equal(EIP1066_CODES.REVOKED_OR_BANNED);
        await expect(asset.freezePartialTokens(signer_C.address, amount)).to.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });

      it("GIVEN a recovered wallet WHEN recoveryAddress THEN transaction fails with WalletRecovered", async () => {
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(
          asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });
    });
  });

  describe("multi partition", () => {
    beforeEach(async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        {
          role: ATS_ROLES.PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.CLEARING_ROLE,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROLLER_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
    });

    it("GIVEN a multi partition token WHEN recoveryAddress THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await expect(
        asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN recoveryAddress THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset
          .connect(base.deployer)
          .recoveryAddress(ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe.skip("initializeRecovery", () => {
    beforeEach(async () => {
      const base = await deployEquityTokenFixture();
      signer_A = base.deployer;
      signer_C = base.user2;
      asset = await ethers.getContractAt("IAsset", base.diamond.target, signer_A);
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeRecovery is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeRecovery()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeRecovery();
      });

      it("GIVEN an already-initialised facet WHEN initializeRecovery is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeRecovery()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeRecovery is called THEN it emits RecoveryInitialized", async () => {
      await expect(asset.connect(signer_A).initializeRecovery()).to.emit(asset, "RecoveryInitialized");
    });
  });
});
