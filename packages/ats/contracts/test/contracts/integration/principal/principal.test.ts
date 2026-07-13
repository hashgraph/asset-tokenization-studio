// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, RESOLVER_KEYS, ZERO } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

// Matches DEFAULT_BOND_PARAMS and DEFAULT_SECURITY_PARAMS in the test fixtures
const DEFAULT_NOMINAL_VALUE = 100n;
const DEFAULT_NOMINAL_DECIMALS = 2n;
const DEFAULT_TOKEN_DECIMALS = 6n;
const DEFAULT_DENOMINATOR = 10n ** DEFAULT_TOKEN_DECIMALS; // 1_000_000

const EMPTY_VC_ID = "";

export function principalTests(getCtx: () => AssetMockCtx): void {
  describe("Principal Tests", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;
    let kycManager: HardhatEthersSigner;
    let holder: HardhatEthersSigner;
    let issuer: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      kycManager = ctx.user1;
      holder = ctx.user2;
      issuer = ctx.user3;
      unknownSigner = ctx.unknownSigner;

      // The mega-mock starts in EVM-default state (no initialisers run).
      // Reproduce the bond-fixture's token decimals and nominal value.
      await asset.forceDecimals(Number(DEFAULT_TOKEN_DECIMALS));
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_KYC, members: [kycManager.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [deployer.address] },
        { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [deployer.address] },
      ]);
      await asset.connect(deployer).setNominalValue(DEFAULT_NOMINAL_VALUE, Number(DEFAULT_NOMINAL_DECIMALS));

      await asset.connect(deployer).addIssuer(deployer.address);
      await asset.connect(kycManager).grantKyc(holder.address, EMPTY_VC_ID, ZERO, MAX_UINT256, deployer.address);
    });

    describe("initializePrincipal", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializePrincipal is called THEN reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializePrincipal())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializePrincipal is called again THEN reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.initializePrincipal())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.principal, 1);
      });

      it("GIVEN a fresh deployment WHEN initializePrincipal is called THEN emits PrincipalInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.principal);
        await expect(asset.initializePrincipal()).to.emit(asset, "PrincipalInitialized");
      });
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
}
