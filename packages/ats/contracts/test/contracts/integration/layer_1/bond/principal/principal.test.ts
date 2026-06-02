// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO, EMPTY_STRING, RESOLVER_KEY_PRINCIPAL } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture, getDltTimestamp } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { TIME_PERIODS_S } from "@scripts";

const DECIMALS = 6;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("PrincipalFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let unknownSigner: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let startingDate = 0;
  let maturityDate = 0;

  async function deployFixture(isMultiPartition = false) {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + 50 * TIME_PERIODS_S.DAY;

    const base = await deployBondTokenFixture({
      bondDataParams: {
        securityData: { isMultiPartition },
        bondDetails: { startingDate, maturityDate },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    const signers = await ethers.getSigners();
    unknownSigner = signers[signers.length - 1];

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Single Partition", () => {
    it("GIVEN an account with no balance WHEN getPrincipalFor THEN numerator is zero", async () => {
      const principalFor = await asset.getPrincipalFor(signer_C.address);

      expect(principalFor.numerator).to.equal(0n);
    });

    it("GIVEN token holder with balance WHEN getPrincipalFor THEN returns correct numerator and denominator", async () => {
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await asset.getPrincipalFor(signer_A.address);
      const bondDetails = await asset.getBondDetails();
      const nominalScale = 10n ** bondDetails.nominalValueDecimals;

      expect(principalFor.numerator).to.equal((bondDetails.nominalValue * BigInt(amount)) / nominalScale);
      expect(principalFor.denominator).to.equal(10n ** BigInt(DECIMALS));
    });

    it("GIVEN two token holders WHEN getPrincipalFor THEN each returns independent principal", async () => {
      const amountA = 500;
      const amountC = 300;

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amountA,
        data: "0x",
      });
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: amountC,
        data: "0x",
      });

      const principalA = await asset.getPrincipalFor(signer_A.address);
      const principalC = await asset.getPrincipalFor(signer_C.address);
      const bondDetails = await asset.getBondDetails();
      const nominalScale = 10n ** bondDetails.nominalValueDecimals;
      const denominator = 10n ** BigInt(DECIMALS);

      expect(principalA.numerator).to.equal((bondDetails.nominalValue * BigInt(amountA)) / nominalScale);
      expect(principalA.denominator).to.equal(denominator);
      expect(principalC.numerator).to.equal((bondDetails.nominalValue * BigInt(amountC)) / nominalScale);
      expect(principalC.denominator).to.equal(denominator);
    });
  });

  describe("Multi Partition", () => {
    it("GIVEN token holder with balance across multiple partitions WHEN getPrincipalFor THEN numerator accumulates all partitions", async () => {
      await deployFixture(true);

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await asset.getPrincipalFor(signer_A.address);
      const bondDetails = await asset.getBondDetails();
      const nominalScale = 10n ** bondDetails.nominalValueDecimals;

      expect(principalFor.numerator).to.equal((bondDetails.nominalValue * BigInt(amount) * 2n) / nominalScale);
      expect(principalFor.denominator).to.equal(10n ** BigInt(DECIMALS));
    });

    it("GIVEN account with no balance WHEN getPrincipalFor on multi-partition bond THEN numerator is zero", async () => {
      await deployFixture(true);

      const principalFor = await asset.getPrincipalFor(signer_C.address);

      expect(principalFor.numerator).to.equal(0n);
    });
  });

  describe("initializePrincipal", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializePrincipal THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializePrincipal())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializePrincipal THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializePrincipal())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_PRINCIPAL, 1);
    });
  });

  describe("initializePrincipal event", () => {
    it("GIVEN fresh facet WHEN initializePrincipal THEN emits PrincipalInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_PRINCIPAL);
      await expect(asset.initializePrincipal()).to.emit(asset, "PrincipalInitialized");
    });
  });

  describe("overflow safety and precision invariants", () => {
    it("GIVEN any holder WHEN getPrincipalFor THEN the returned fraction equals the canonical balance·nominal / 10^(nd+d) ratio", async () => {
      // Ratio equivalence proof. The new (numerator, denominator) decomposition
      // changes shape relative to the pre-FIND-052 form, but the represented ratio must
      // remain identical. Verified by BigInt cross-multiplication (a/b == c/d iff a·d == b·c).
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const principalFor = await asset.getPrincipalFor(signer_A.address);
      const bondDetails = await asset.getBondDetails();
      const canonicalNumerator = bondDetails.nominalValue * BigInt(amount);
      const canonicalDenominator = 10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS));

      expect(principalFor.numerator * canonicalDenominator).to.equal(canonicalNumerator * principalFor.denominator);
    });

    it("GIVEN a high-precision nominal that would have overflowed balance·nominal pre-fix WHEN getPrincipalFor THEN does not revert", async () => {
      // Regression for the audit's overflow scenario. With a nominal scale of 10^60
      // and a sizeable raw holding, the pre-fix `balance * nominalValue` product exceeds
      // uint256's ceiling (~1.16·10^77). The new path uses 512-bit mulDiv so the operation
      // completes and returns a well-formed fraction.
      const HIGH_NOMINAL_DECIMALS = 60;
      const NOMINAL = 10n ** BigInt(HIGH_NOMINAL_DECIMALS); // nominal_real = 1
      const HOLDING = 10n ** 20n; // 10^20 raw tokens — well within uint256

      // Self-document the overflow: prove the pre-fix product would not have fit in uint256.
      const preFixProduct = NOMINAL * HOLDING;
      expect(preFixProduct).to.be.greaterThan(2n ** 256n - 1n);

      await asset.connect(signer_A).setNominalValue(NOMINAL, HIGH_NOMINAL_DECIMALS);
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: HOLDING,
        data: "0x",
      });

      // Must not revert. The post-fix numerator is mulDiv(10^20, 10^60, 10^60) = 10^20,
      // denominator is 10^DECIMALS, so the represented principal is 10^20 / 10^6 = 10^14.
      const principalFor = await asset.getPrincipalFor(signer_A.address);
      expect(principalFor.numerator).to.equal(HOLDING);
      expect(principalFor.denominator).to.equal(10n ** BigInt(DECIMALS));
    });

    it("GIVEN token decimals adjusted to 78 WHEN getPrincipalFor THEN reverts with ExponentOverflow", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_A.address);
      // DECIMALS (6) + 72 = 78 == MAX_DECIMALS; 10^78 overflows uint256
      await asset.connect(signer_A).adjustBalances(1, 72);
      await expect(asset.getPrincipalFor(signer_A.address)).to.be.revertedWithCustomError(asset, "ExponentOverflow");
    });
  });
});
