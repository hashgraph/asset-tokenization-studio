// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { IAsset, type ResolverProxy } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
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

describe("OperatorClearingHoldByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

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

    await asset.connect(signer_B).issueByPartition({
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_B.address,
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

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.CONTROLLER_ROLE, members: [signer_C.address] },
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_D.address] },
      { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_E.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_VALIDATOR_ROLE, members: [signer_A.address] },
    ]);

    await setFacets(asset);
  }

  beforeEach(async () => {
    const block = await ethers.provider.getBlock("latest");
    if (!block) throw new Error("Failed to get latest block");
    currentTimestamp = block.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
    [signer_A, signer_B, signer_C, signer_D, signer_E] = await ethers.getSigners();
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
      await loadFixture(deploySecurityFixtureSinglePartition);
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
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
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
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
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
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: _AMOUNT,
          data: _DATA,
        });
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
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
});
