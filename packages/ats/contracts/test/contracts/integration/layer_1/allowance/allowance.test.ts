// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const amount = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Allowance Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  describe("Multi partition", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: { isMultiPartition: true },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_C = base.user2;
      signer_D = base.user3;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN a multi-partition token WHEN running allowance-changing methods THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.approve(signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
      await expect(asset.increaseAllowance(signer_C.address, amount)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
      await expect(asset.decreaseAllowance(signer_C.address, amount)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });

  describe("Single partition", () => {
    let assetSignerC: IAsset;
    let assetSignerD: IAsset;

    async function deploySinglePartitionFixture() {
      const base = await deployEquityTokenFixture();
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      assetSignerC = await ethers.getContractAt("IAsset", diamond.target, signer_C);
      assetSignerD = await ethers.getContractAt("IAsset", diamond.target, signer_D);

      await executeRbac(asset, [
        { role: ATS_ROLES._ISSUER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._CONTROL_LIST_ROLE, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_D.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await asset.connect(signer_B).issue(signer_C.address, amount, "0x");
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    describe("allowance", () => {
      it("GIVEN no prior approval WHEN allowance is read THEN it returns 0", async () => {
        expect(await asset.allowance(signer_C.address, signer_D.address)).to.equal(0n);
      });
    });

    describe("approve", () => {
      it("GIVEN a zero spender WHEN approve THEN reverts with SpenderWithZeroAddress", async () => {
        await expect(assetSignerC.approve(ADDRESS_ZERO, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "SpenderWithZeroAddress",
        );
      });

      it("GIVEN a whitelisted spender WHEN approve THEN emits Approval and allowance is updated", async () => {
        await expect(assetSignerC.approve(signer_D.address, amount / 2))
          .to.emit(asset, "Approval")
          .withArgs(signer_C.address, signer_D.address, amount / 2);

        expect(await asset.allowance(signer_C.address, signer_D.address)).to.equal(amount / 2);
      });

      it("GIVEN a paused token WHEN approve THEN reverts with TokenIsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(assetSignerC.approve(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a blacklisted caller WHEN approve THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_C.address);
        await expect(assetSignerC.approve(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });

      it("GIVEN a blacklisted spender WHEN approve THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_D.address);
        await expect(assetSignerC.approve(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });
    });

    describe("increaseAllowance", () => {
      it("GIVEN a zero spender WHEN increaseAllowance THEN reverts with SpenderWithZeroAddress", async () => {
        await expect(assetSignerC.increaseAllowance(ADDRESS_ZERO, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "SpenderWithZeroAddress",
        );
      });

      it("GIVEN a whitelisted spender WHEN increaseAllowance THEN emits Approval and allowance grows", async () => {
        await expect(assetSignerC.increaseAllowance(signer_D.address, amount / 2))
          .to.emit(asset, "Approval")
          .withArgs(signer_C.address, signer_D.address, amount / 2);

        expect(await asset.allowance(signer_C.address, signer_D.address)).to.equal(amount / 2);
      });

      it("GIVEN a paused token WHEN increaseAllowance THEN reverts with TokenIsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(assetSignerC.increaseAllowance(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });
    });

    describe("decreaseAllowance", () => {
      it("GIVEN a zero spender WHEN decreaseAllowance THEN reverts with SpenderWithZeroAddress", async () => {
        await expect(assetSignerC.decreaseAllowance(ADDRESS_ZERO, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "SpenderWithZeroAddress",
        );
      });

      it("GIVEN no prior allowance WHEN decreaseAllowance THEN reverts with InsufficientAllowance", async () => {
        await expect(assetSignerD.decreaseAllowance(signer_B.address, amount / 2))
          .to.be.revertedWithCustomError(asset, "InsufficientAllowance")
          .withArgs(signer_B.address, signer_D.address);
      });

      it("GIVEN a whitelisted spender with allowance WHEN decreaseAllowance THEN emits Approval and allowance shrinks", async () => {
        await assetSignerC.increaseAllowance(signer_D.address, amount);

        await expect(assetSignerC.decreaseAllowance(signer_D.address, amount / 2))
          .to.emit(asset, "Approval")
          .withArgs(signer_C.address, signer_D.address, amount / 2);

        expect(await asset.allowance(signer_C.address, signer_D.address)).to.equal(amount / 2);
      });

      it("GIVEN a paused token WHEN decreaseAllowance THEN reverts with TokenIsPaused", async () => {
        await asset.connect(signer_B).pause();
        await expect(assetSignerC.decreaseAllowance(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });
    });

    describe("Wallet Recovery Tests", () => {
      it("GIVEN non-recovered wallets WHEN approve THEN transaction succeeds", async () => {
        expect(await asset.isAddressRecovered(signer_C.address)).to.be.false;
        expect(await asset.isAddressRecovered(signer_D.address)).to.be.false;

        await expect(assetSignerC.approve(signer_D.address, amount / 2))
          .to.emit(asset, "Approval")
          .withArgs(signer_C.address, signer_D.address, amount / 2);
      });

      it("GIVEN a recovered sender WHEN approve THEN reverts with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
        await asset.recoveryAddress(signer_C.address, signer_A.address, ADDRESS_ZERO);

        expect(await asset.isAddressRecovered(signer_C.address)).to.be.true;

        await expect(assetSignerC.approve(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });

      it("GIVEN a recovered spender WHEN approve THEN reverts with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
        await asset.recoveryAddress(signer_D.address, signer_A.address, ADDRESS_ZERO);

        expect(await asset.isAddressRecovered(signer_D.address)).to.be.true;

        await expect(assetSignerC.approve(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });
    });

    describe("interop", () => {
      it("callers resolving through the diamond via AllowanceFacet still see the same state as via IAsset", async () => {
        const viaAllowance = await ethers.getContractAt("AllowanceFacet", diamond.target, signer_C);
        await viaAllowance.approve(signer_D.address, 42n);
        expect(await viaAllowance.allowance(signer_C.address, signer_D.address)).to.equal(42n);
        expect(await asset.allowance(signer_C.address, signer_D.address)).to.equal(42n);
      });
    });
  });
});
