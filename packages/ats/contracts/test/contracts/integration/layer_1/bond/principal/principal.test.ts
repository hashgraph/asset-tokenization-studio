// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO, EMPTY_STRING } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture, getBondDetails, getDltTimestamp } from "@test";
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

  let asset: IAsset;
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

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
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

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount));
      expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
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
      const denominator = 10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS));

      expect(principalA.numerator).to.equal(bondDetails.nominalValue * BigInt(amountA));
      expect(principalA.denominator).to.equal(denominator);
      expect(principalC.numerator).to.equal(bondDetails.nominalValue * BigInt(amountC));
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

      expect(principalFor.numerator).to.equal(bondDetails.nominalValue * BigInt(amount) * 2n);
      expect(principalFor.denominator).to.equal(10n ** (bondDetails.nominalValueDecimals + BigInt(DECIMALS)));
    });

    it("GIVEN account with no balance WHEN getPrincipalFor on multi-partition bond THEN numerator is zero", async () => {
      await deployFixture(true);

      const principalFor = await asset.getPrincipalFor(signer_C.address);

      expect(principalFor.numerator).to.equal(0n);
    });
  });
});
