// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, ADDRESS_ZERO, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _SECOND_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;

interface Hold {
  amount: bigint | number;
  expirationTimestamp: bigint | number;
  escrow: string;
  to: string;
  data: string;
}

interface ClearingOperation {
  partition: string;
  expirationTimestamp: number;
  data: string;
}

describe("Balance Tracker By Partition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function deployEquity(multiPartition: boolean) {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: multiPartition,
          clearingActive: false,
        },
      },
    });

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.LOCKER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES.FREEZE_MANAGER_ROLE,
        members: [signer_D.address],
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
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
  });

  describe("balanceOfByPartition", () => {
    describe("Single partition", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, false));
      });

      it("GIVEN a token holder with minted tokens WHEN balanceOfByPartition THEN returns correct balance", async () => {
        const mintAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(mintAmount);
      });

      it("GIVEN an account with no tokens WHEN balanceOfByPartition THEN returns zero", async () => {
        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_C.address)).to.equal(0);
      });

      it("GIVEN a token holder after a transfer WHEN balanceOfByPartition THEN returns updated balance", async () => {
        const mintAmount = 1000;
        const transferAmount = 300;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: EMPTY_HEX_BYTES,
        });

        await asset.connect(signer_A).transfer(signer_B.address, transferAmount);

        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(
          mintAmount - transferAmount,
        );
        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_B.address)).to.equal(transferAmount);
      });
    });

    describe("Multi-partition", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, true));
      });

      it("GIVEN a token holder with tokens in multiple partitions WHEN balanceOfByPartition THEN returns balance for each partition independently", async () => {
        const defaultMintAmount = 600;
        const secondMintAmount = 400;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: defaultMintAmount,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(signer_B).issueByPartition({
          partition: _SECOND_PARTITION,
          tokenHolder: signer_A.address,
          value: secondMintAmount,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(defaultMintAmount);
        expect(await asset.balanceOfByPartition(_SECOND_PARTITION, signer_A.address)).to.equal(secondMintAmount);
      });
    });
  });

  describe("totalSupplyByPartition", () => {
    describe("Single partition", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, false));
      });

      it("GIVEN no tokens minted WHEN totalSupplyByPartition THEN returns zero", async () => {
        expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(0);
      });

      it("GIVEN tokens minted WHEN totalSupplyByPartition THEN returns correct total", async () => {
        const mintAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(mintAmount);
      });

      it("GIVEN tokens minted and then burned WHEN totalSupplyByPartition THEN reflects the redemption", async () => {
        const mintAmount = 1000;
        const burnAmount = 400;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: EMPTY_HEX_BYTES,
        });

        await asset.connect(signer_A).redeemByPartition(_DEFAULT_PARTITION, burnAmount, EMPTY_HEX_BYTES);

        expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(mintAmount - burnAmount);
      });
    });

    describe("Multi-partition", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, true));
      });

      it("GIVEN tokens minted across multiple partitions WHEN totalSupplyByPartition THEN returns per-partition totals independently", async () => {
        const defaultMintAmount = 600;
        const secondMintAmount = 400;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: defaultMintAmount,
          data: EMPTY_HEX_BYTES,
        });
        await asset.connect(signer_B).issueByPartition({
          partition: _SECOND_PARTITION,
          tokenHolder: signer_A.address,
          value: secondMintAmount,
          data: EMPTY_HEX_BYTES,
        });

        expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(defaultMintAmount);
        expect(await asset.totalSupplyByPartition(_SECOND_PARTITION)).to.equal(secondMintAmount);
      });
    });
  });

  describe("getTotalBalanceForByPartition", () => {
    describe("Multi-partition enabled", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, true));
      });

      it("GIVEN multi-partition equity with locked, held, and cleared tokens WHEN getTotalBalanceForByPartition THEN returns correct total balance per partition", async () => {
        const tokenHolder = signer_A.address;

        const defaultMintAmount = 600;
        const defaultLockAmount = 100;
        const defaultHoldAmount = 150;
        const defaultClearAmount = 50;

        const secondMintAmount = 400;
        const secondLockAmount = 80;
        const secondHoldAmount = 70;
        const secondClearAmount = 30;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder,
          value: defaultMintAmount,
          data: EMPTY_HEX_BYTES,
        });

        await asset.connect(signer_B).issueByPartition({
          partition: _SECOND_PARTITION,
          tokenHolder,
          value: secondMintAmount,
          data: EMPTY_HEX_BYTES,
        });

        await asset
          .connect(signer_C)
          .lockByPartition(_DEFAULT_PARTITION, defaultLockAmount, tokenHolder, expirationTimestamp);

        await asset
          .connect(signer_C)
          .lockByPartition(_SECOND_PARTITION, secondLockAmount, tokenHolder, expirationTimestamp);

        const holdDefault: Hold = {
          amount: BigInt(defaultHoldAmount),
          expirationTimestamp: BigInt(expirationTimestamp),
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdDefault);

        const holdSecond: Hold = {
          amount: BigInt(secondHoldAmount),
          expirationTimestamp: BigInt(expirationTimestamp),
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_A).createHoldByPartition(_SECOND_PARTITION, holdSecond);

        await asset.connect(signer_A).activateClearing();

        const clearingOperationDefault: ClearingOperation = {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp,
          data: EMPTY_HEX_BYTES,
        };
        await asset
          .connect(signer_A)
          .clearingTransferByPartition(clearingOperationDefault, defaultClearAmount, signer_B.address);

        const clearingOperationSecond: ClearingOperation = {
          partition: _SECOND_PARTITION,
          expirationTimestamp,
          data: EMPTY_HEX_BYTES,
        };
        await asset
          .connect(signer_A)
          .clearingTransferByPartition(clearingOperationSecond, secondClearAmount, signer_B.address);

        const totalBalanceDefault = await asset.getTotalBalanceForByPartition(_DEFAULT_PARTITION, tokenHolder);
        expect(totalBalanceDefault).to.equal(defaultMintAmount);

        const totalBalanceSecond = await asset.getTotalBalanceForByPartition(_SECOND_PARTITION, tokenHolder);
        expect(totalBalanceSecond).to.equal(secondMintAmount);
      });
    });

    describe("Single partition (no multi-partition)", () => {
      beforeEach(async () => {
        await loadFixture(deployEquity.bind(null, false));
      });

      it("GIVEN single partition equity with locked, held, cleared, and frozen tokens WHEN getTotalBalanceForByPartition THEN returns correct total balance", async () => {
        const tokenHolder = signer_A.address;
        const totalMintAmount = 1000;

        const lockAmount = 100;
        const holdAmount = 150;
        const clearAmount = 50;
        const freezeAmount = 200;

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder,
          value: totalMintAmount,
          data: EMPTY_HEX_BYTES,
        });

        await asset.connect(signer_C).lockByPartition(_DEFAULT_PARTITION, lockAmount, tokenHolder, expirationTimestamp);

        const hold: Hold = {
          amount: BigInt(holdAmount),
          expirationTimestamp: BigInt(expirationTimestamp),
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);

        await asset.connect(signer_A).activateClearing();

        const clearingOperation: ClearingOperation = {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp,
          data: EMPTY_HEX_BYTES,
        };
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, clearAmount, signer_B.address);

        await asset.connect(signer_D).freezePartialTokens(tokenHolder, freezeAmount);

        const totalBalanceByPartition = await asset.getTotalBalanceForByPartition(_DEFAULT_PARTITION, tokenHolder);
        expect(totalBalanceByPartition).to.equal(totalMintAmount);
      });
    });
  });
});
