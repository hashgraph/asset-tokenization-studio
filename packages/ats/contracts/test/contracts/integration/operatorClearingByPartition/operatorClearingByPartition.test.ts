// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { IAsset, type ResolverProxy, MockDiamondCut } from "@contract-types";
import {
  ADDRESS_ZERO,
  ATS_ROLES,
  EMPTY_HEX_BYTES,
  EMPTY_STRING,
  RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION,
  ZERO,
} from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

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

let clearingOperation: ClearingOperation;
let clearingOperationFrom: ClearingOperationFrom;

describe("OperatorClearingByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function setFacets(asset: IAsset) {
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

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
          clearingActive: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address] },
      { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
    ]);

    await setFacets(asset);
  }

  beforeEach(async () => {
    const block = await ethers.provider.getBlock("latest");
    if (!block) throw new Error("Failed to get latest block");
    currentTimestamp = block.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
    [signer_A, signer_B, signer_C, signer_D, signer_E] = await ethers.getSigners();

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
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("operatorClearingTransferByPartition", () => {
      it("GIVEN an authorized operator WHEN operatorClearingTransferByPartition THEN emits ClearedOperatorTransferByPartition and Transfer", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        await expect(
          asset.connect(signer_B).operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
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
          await asset.recoveryAddress(signer_A.address, signer_E.address, ADDRESS_ZERO);

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
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_E.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_E.address, ADDRESS_ZERO);

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
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN operatorClearingRedeemByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).operatorClearingRedeemByPartition(
          {
            clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
            from: ethers.ZeroAddress,
            operatorData: "0x",
          },
          0,
        ),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN operatorClearingTransferByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).operatorClearingTransferByPartition(
          {
            clearingOperation: { partition: ethers.ZeroHash, expirationTimestamp: 0, data: "0x" },
            from: ethers.ZeroAddress,
            operatorData: "0x",
          },
          0,
          ethers.ZeroAddress,
        ),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
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
        .withArgs(RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION, 1);
    });
  });

  describe("initializeOperatorClearingByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeOperatorClearingByPartition is called THEN emits OperatorClearingByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION);
      await expect(asset.initializeOperatorClearingByPartition()).to.emit(
        asset,
        "OperatorClearingByPartitionInitialized",
      );
    });
  });
  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
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
      await expect(asset.operatorClearingTransferByPartition(minimalOp, 0, ADDRESS_ZERO)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });
});
