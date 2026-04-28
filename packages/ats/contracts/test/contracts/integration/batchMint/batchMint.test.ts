// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("BatchMint Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          maxSupply: MAX_SUPPLY,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_A.address],
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
        role: ATS_ROLES.AGENT_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.addIssuer(signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
  }

  describe("single partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("batchMint", () => {
      it("GIVEN an account with issuer role WHEN batchMint THEN transaction succeeds and balances are updated", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address, signer_E.address];
        const amounts = [mintAmount, mintAmount];

        const initialBalanceD = await asset.balanceOf(signer_D.address);
        const initialBalanceE = await asset.balanceOf(signer_E.address);
        const initialTotalSupply = await asset.totalSupply();

        await expect(asset.batchMint(toList, amounts)).to.not.be.reverted;

        const finalBalanceD = await asset.balanceOf(signer_D.address);
        const finalBalanceE = await asset.balanceOf(signer_E.address);
        const finalTotalSupply = await asset.totalSupply();

        expect(finalBalanceD).to.be.equal(initialBalanceD + BigInt(mintAmount));
        expect(finalBalanceE).to.be.equal(initialBalanceE + BigInt(mintAmount));
        expect(finalTotalSupply).to.be.equal(initialTotalSupply + BigInt(mintAmount * 2));
      });

      it("GIVEN an account without issuer role WHEN batchMint THEN transaction fails with AccountHasNoRole", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address, signer_E.address];
        const amounts = [mintAmount, mintAmount];

        // signer_B does not have ATS_ROLES.ISSUER_ROLE
        await expect(asset.connect(signer_B).batchMint(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const amounts = [mintAmount, mintAmount];

        await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });

      it("GIVEN a paused token WHEN batchMint THEN transaction fails with TokenIsPaused", async () => {
        await asset.pause();

        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const amounts = [mintAmount];

        await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
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

      asset = await ethers.getContractAt("IAsset", diamond.target);
    });

    it("GIVEN an single partition token WHEN batchMint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.batchMint([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });
});
