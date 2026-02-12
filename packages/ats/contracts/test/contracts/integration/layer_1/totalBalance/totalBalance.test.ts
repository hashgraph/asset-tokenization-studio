// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  type ResolverProxy,
  type IERC1410,
  type LockFacet,
  type FreezeFacet,
  type ClearingActionsFacet,
  ClearingActionsFacet__factory,
  type KycFacet,
  type SsiManagementFacet,
  type TotalBalanceFacet,
  type IHold,
} from "@contract-types";
import { ATS_ROLES, ADDRESS_ZERO, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { Contract } from "ethers";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _SECOND_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

interface ClearingOperation {
  partition: string;
  expirationTimestamp: number;
  data: string;
}

interface Hold {
  amount: bigint | number;
  expirationTimestamp: bigint | number;
  escrow: string;
  to: string;
  data: string;
}

describe("Total Balance Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let erc1410Facet: IERC1410;
  let lockFacet: LockFacet;
  let holdFacet: IHold;
  let clearingFacet: Contract;
  let clearingActionsFacet: ClearingActionsFacet;
  let freezeFacet: FreezeFacet;
  let kycFacet: KycFacet;
  let ssiManagementFacet: SsiManagementFacet;
  let totalBalanceFacet: TotalBalanceFacet;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    // Get clearing facets and combine their interfaces
    const clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);
    const clearingHoldCreationFacet = await ethers.getContractAt("ClearingHoldCreationFacet", diamond.target, signer_A);
    clearingActionsFacet = ClearingActionsFacet__factory.connect(diamond.target as string, signer_A);

    const fragmentMap = new Map<string, any>();
    [
      ...clearingTransferFacet.interface.fragments,
      ...clearingHoldCreationFacet.interface.fragments,
      ...clearingActionsFacet.interface.fragments,
    ].forEach((fragment) => {
      const key = fragment.format();
      if (!fragmentMap.has(key)) {
        fragmentMap.set(key, fragment);
      }
    });

    const uniqueFragments = Array.from(fragmentMap.values());
    clearingFacet = new Contract(diamond.target, uniqueFragments, signer_A);

    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_B);
    lockFacet = await ethers.getContractAt("LockFacet", diamond.target, signer_C);
    holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
    freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target, signer_D);
    kycFacet = await ethers.getContractAt("KycFacet", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagementFacet", diamond.target, signer_A);
    totalBalanceFacet = await ethers.getContractAt("TotalBalanceFacet", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

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

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._LOCKER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._FREEZE_MANAGER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await setFacets({ diamond });
  }

  beforeEach(async () => {
    currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
  });

  describe("Multi-partition enabled", () => {
    beforeEach(async () => {
      await loadFixture(deployEquity.bind(null, true));
    });

    it("GIVEN multi-partition equity with locked, held, and cleared tokens WHEN getTotalBalanceFor and getTotalBalanceForByPartition THEN returns correct total balance", async () => {
      const tokenHolder = signer_A.address;

      // Amounts for DEFAULT partition
      const defaultMintAmount = 600;
      const defaultLockAmount = 100;
      const defaultHoldAmount = 150;
      const defaultClearAmount = 50;

      // Amounts for SECOND partition
      const secondMintAmount = 400;
      const secondLockAmount = 80;
      const secondHoldAmount = 70;
      const secondClearAmount = 30;

      // Mint tokens in DEFAULT partition
      await erc1410Facet.issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: tokenHolder,
        value: defaultMintAmount,
        data: EMPTY_HEX_BYTES,
      });

      // Mint tokens in SECOND partition
      await erc1410Facet.issueByPartition({
        partition: _SECOND_PARTITION,
        tokenHolder: tokenHolder,
        value: secondMintAmount,
        data: EMPTY_HEX_BYTES,
      });

      // Lock tokens in DEFAULT partition
      await lockFacet.lockByPartition(_DEFAULT_PARTITION, defaultLockAmount, tokenHolder, expirationTimestamp);

      // Lock tokens in SECOND partition
      await lockFacet.lockByPartition(_SECOND_PARTITION, secondLockAmount, tokenHolder, expirationTimestamp);

      // Hold tokens in DEFAULT partition
      const holdDefault: Hold = {
        amount: BigInt(defaultHoldAmount),
        expirationTimestamp: BigInt(expirationTimestamp),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: EMPTY_HEX_BYTES,
      };
      await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, holdDefault);

      // Hold tokens in SECOND partition
      const holdSecond: Hold = {
        amount: BigInt(secondHoldAmount),
        expirationTimestamp: BigInt(expirationTimestamp),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: EMPTY_HEX_BYTES,
      };
      await holdFacet.createHoldByPartition(_SECOND_PARTITION, holdSecond);

      // Clear tokens in DEFAULT partition
      await clearingActionsFacet.activateClearing();

      const clearingOperationDefault: ClearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: expirationTimestamp,
        data: EMPTY_HEX_BYTES,
      };
      await clearingFacet.clearingTransferByPartition(clearingOperationDefault, defaultClearAmount, signer_B.address);

      // Clear tokens in SECOND partition
      const clearingOperationSecond: ClearingOperation = {
        partition: _SECOND_PARTITION,
        expirationTimestamp: expirationTimestamp,
        data: EMPTY_HEX_BYTES,
      };
      await clearingFacet.clearingTransferByPartition(clearingOperationSecond, secondClearAmount, signer_B.address);

      // Check getTotalBalanceFor - should return sum of all tokens across all partitions
      const totalBalance = await totalBalanceFacet.getTotalBalanceFor(tokenHolder);
      const expectedTotalBalance = defaultMintAmount + secondMintAmount;
      expect(totalBalance).to.equal(expectedTotalBalance);

      // Check getTotalBalanceForByPartition for DEFAULT partition
      const totalBalanceDefault = await totalBalanceFacet.getTotalBalanceForByPartition(
        _DEFAULT_PARTITION,
        tokenHolder,
      );
      expect(totalBalanceDefault).to.equal(defaultMintAmount);

      // Check getTotalBalanceForByPartition for SECOND partition
      const totalBalanceSecond = await totalBalanceFacet.getTotalBalanceForByPartition(_SECOND_PARTITION, tokenHolder);
      expect(totalBalanceSecond).to.equal(secondMintAmount);
    });
  });

  describe("Single partition (no multi-partition)", () => {
    beforeEach(async () => {
      await loadFixture(deployEquity.bind(null, false));
    });

    it("GIVEN single partition equity with locked, held, cleared, and frozen tokens WHEN getTotalBalanceFor and getTotalBalanceForByPartition THEN returns correct total balance", async () => {
      const tokenHolder = signer_A.address;
      const totalMintAmount = 1000;

      // Amounts for operations
      const lockAmount = 100;
      const holdAmount = 150;
      const clearAmount = 50;
      const freezeAmount = 200;

      // Mint tokens in DEFAULT partition
      await erc1410Facet.issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: tokenHolder,
        value: totalMintAmount,
        data: EMPTY_HEX_BYTES,
      });

      // Lock tokens
      await lockFacet.lockByPartition(_DEFAULT_PARTITION, lockAmount, tokenHolder, expirationTimestamp);

      // Hold tokens
      const hold: Hold = {
        amount: BigInt(holdAmount),
        expirationTimestamp: BigInt(expirationTimestamp),
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: EMPTY_HEX_BYTES,
      };
      await holdFacet.createHoldByPartition(_DEFAULT_PARTITION, hold);

      // Clear tokens
      await clearingActionsFacet.activateClearing();

      const clearingOperation: ClearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: expirationTimestamp,
        data: EMPTY_HEX_BYTES,
      };
      await clearingFacet.clearingTransferByPartition(clearingOperation, clearAmount, signer_B.address);

      // Freeze tokens
      await freezeFacet.freezePartialTokens(tokenHolder, freezeAmount);

      // Check getTotalBalanceFor - should return all tokens including frozen
      const totalBalance = await totalBalanceFacet.getTotalBalanceFor(tokenHolder);
      expect(totalBalance).to.equal(totalMintAmount);

      // Check getTotalBalanceForByPartition for DEFAULT partition
      const totalBalanceByPartition = await totalBalanceFacet.getTotalBalanceForByPartition(
        _DEFAULT_PARTITION,
        tokenHolder,
      );
      expect(totalBalanceByPartition).to.equal(totalMintAmount);
    });
  });
});
