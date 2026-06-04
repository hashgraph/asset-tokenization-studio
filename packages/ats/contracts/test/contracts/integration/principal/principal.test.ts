// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO } from "@scripts";
import { deployBondTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// Matches DEFAULT_BOND_PARAMS and DEFAULT_SECURITY_PARAMS in the test fixtures
const DEFAULT_NOMINAL_VALUE = 100n;
const DEFAULT_NOMINAL_DECIMALS = 2n;
const DEFAULT_TOKEN_DECIMALS = 6n;
const DEFAULT_DENOMINATOR = 10n ** DEFAULT_TOKEN_DECIMALS; // 1_000_000

const EMPTY_VC_ID = "";

describe("Principal Tests", () => {
  let asset: IAsset;
  let deployer: HardhatEthersSigner;
  let kycManager: HardhatEthersSigner;
  let holder: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;

  async function deployFixture() {
    const base = await deployBondTokenFixture();
    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    deployer = base.deployer;
    kycManager = base.user1;
    holder = base.user2;
    issuer = base.user3;

    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_KYC, members: [kycManager.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [deployer.address] },
    ]);

    await asset.connect(deployer).addIssuer(deployer.address);
    await asset.connect(kycManager).grantKyc(holder.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("getPrincipalFor", () => {
    it("GIVEN an account with zero balance WHEN getPrincipalFor THEN returns zero numerator with token-precision denominator", async () => {
      const principal = await asset.getPrincipalFor(holder.address);

      expect(principal.numerator).to.equal(0n);
      expect(principal.denominator).to.equal(DEFAULT_DENOMINATOR);
    });

    it("GIVEN an account with issued tokens WHEN getPrincipalFor THEN returns numerator scaled by nominal value over denominator", async () => {
      const amount = 1_000n;

      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_ISSUER, issuer.address);
      await asset.connect(issuer).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: holder.address,
        value: amount,
        data: "0x",
      });

      const principal = await asset.getPrincipalFor(holder.address);

      // numerator = mulDiv(balance, nominalValue, 10^nominalDecimals)
      //           = mulDiv(1_000, 100, 100) = 1_000
      const expectedNumerator = (amount * DEFAULT_NOMINAL_VALUE) / 10n ** DEFAULT_NOMINAL_DECIMALS;
      expect(principal.numerator).to.equal(expectedNumerator);
      expect(principal.denominator).to.equal(DEFAULT_DENOMINATOR);
    });

    it("GIVEN an updated nominal value WHEN getPrincipalFor THEN scales the numerator proportionally", async () => {
      const amount = 500n;
      const newNominalValue = 200n;

      // deployer has ROLE_NOMINAL_VALUE by default from deployBondTokenFixture
      await asset.connect(deployer).setNominalValue(newNominalValue, Number(DEFAULT_NOMINAL_DECIMALS));

      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_ISSUER, issuer.address);
      await asset.connect(issuer).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: holder.address,
        value: amount,
        data: "0x",
      });

      const principal = await asset.getPrincipalFor(holder.address);

      // numerator = mulDiv(500, 200, 100) = 1_000
      const expectedNumerator = (amount * newNominalValue) / 10n ** DEFAULT_NOMINAL_DECIMALS;
      expect(principal.numerator).to.equal(expectedNumerator);
      expect(principal.denominator).to.equal(DEFAULT_DENOMINATOR);
    });
  });
});
