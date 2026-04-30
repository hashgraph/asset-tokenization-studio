// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ComplianceMock, IdentityRegistryMock, IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO, ADDRESS_ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("BatchFreeze Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  async function deployBatchFreezeFixture() {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

    complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
    await complianceMock.waitForDeployment();

    identityRegistryMock = await (
      await ethers.getContractFactory("IdentityRegistryMock", signer_A)
    ).deploy(true, false);
    await identityRegistryMock.waitForDeployment();

    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          compliance: complianceMock.target as string,
          identityRegistry: identityRegistryMock.target as string,
          maxSupply: MAX_SUPPLY,
        },
      },
      infrastructure,
    });

    const diamond: ResolverProxy = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_D = base.user3;
    signer_E = base.user4;
    signer_F = base.user5;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
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

    await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
    await asset.addIssuer(signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.grantRole(ATS_ROLES.FREEZE_MANAGER_ROLE, signer_A.address);
    await asset.grantRole(ATS_ROLES.PAUSER_ROLE, signer_A.address);
  }

  describe("single partition", () => {
    beforeEach(async () => {
      await loadFixture(deployBatchFreezeFixture);
    });

    describe("batchSetAddressFrozen", () => {
      const mintAmount = AMOUNT;
      const transferAmount = AMOUNT / 2;

      beforeEach(async () => {
        // Mint tokens to accounts that will be frozen/unfrozen
        await asset.mint(signer_D.address, mintAmount);
        await asset.mint(signer_E.address, mintAmount);
      });

      it("GIVEN a FREEZE_MANAGER WHEN batchSetAddressFrozen with true THEN transfers from those addresses fail", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const freezeFlags = [true, true];

        // Freeze accounts
        await expect(asset.batchSetAddressFrozen(userAddresses, freezeFlags)).to.not.be.reverted;

        // Attempting transfers from frozen accounts should fail
        await expect(asset.connect(signer_D).transfer(signer_A.address, transferAmount)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        await expect(asset.connect(signer_E).transfer(signer_A.address, transferAmount)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });

      it("GIVEN paused token WHEN batchSetAddressFrozen THEN fails with TokenIsPaused", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        // grant KYC to signer_A.address
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await asset.connect(signer_B).pause();

        // First, freeze the addresses
        await expect(asset.batchSetAddressFrozen(userAddresses, [true, true])).to.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN invalid address WHEN batchSetAddressFrozen THEN fails with ZeroAddressNotAllowed", async () => {
        const userAddresses = [signer_D.address, signer_E.address, ADDRESS_ZERO];
        // grant KYC to signer_A.address
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        // First, freeze the addresses
        await expect(asset.batchSetAddressFrozen(userAddresses, [true, true, true])).to.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN frozen addresses WHEN batchSetAddressFrozen with false THEN transfers from those addresses succeed", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        // grant KYC to signer_A.address
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        // First, freeze the addresses
        await asset.batchSetAddressFrozen(userAddresses, [true, true]);

        // Now, unfreeze them in a batch
        await expect(asset.batchSetAddressFrozen(userAddresses, [false, false])).to.not.be.reverted;

        await expect(asset.connect(signer_D).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

        await expect(asset.connect(signer_E).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

        // Check final balances to be sure
        expect(await asset.balanceOf(signer_D.address)).to.equal(mintAmount - transferAmount);
        expect(await asset.balanceOf(signer_E.address)).to.equal(mintAmount - transferAmount);
      });

      it("GIVEN an account without ATS_ROLES.FREEZE_MANAGER_ROLE WHEN batchSetAddressFrozen THEN transaction fails", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const freezeFlags = [true, true];

        await expect(
          asset.connect(signer_F).batchSetAddressFrozen(userAddresses, freezeFlags),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an invalid input boolean array THEN transaction fails with InputBoolArrayLengthMismatch", async () => {
        const toList = [signer_D.address];
        const status = [true, true];

        await expect(asset.batchSetAddressFrozen(toList, status)).to.be.revertedWithCustomError(
          asset,
          "InputBoolArrayLengthMismatch",
        );
      });
    });

    describe("batchFreezePartialTokens", () => {
      const freezeAmount = AMOUNT / 2;
      beforeEach(async () => {
        await asset.mint(signer_D.address, freezeAmount);
        await asset.mint(signer_E.address, freezeAmount);
      });

      it("GIVEN ATS_ROLES.FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN tokens are frozen successfully", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [freezeAmount, freezeAmount];

        const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
        const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

        await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

        const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
        const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

        expect(finalFrozenD).to.equal(initialFrozenD + BigInt(freezeAmount));
        expect(finalFrozenE).to.equal(initialFrozenE + BigInt(freezeAmount));
      });

      describe("bug Transfer", () => {
        it("GIVEN freeze manager WHEN batchFreezePartialTokens THEN Transfer event is emitted for each account", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [freezeAmount, freezeAmount];

          await expect(asset.batchFreezePartialTokens(userAddresses, amounts))
            .to.emit(asset, "Transfer")
            .withArgs(signer_D.address, ethers.ZeroAddress, freezeAmount)
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, freezeAmount);
        });
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const amounts = [mintAmount, mintAmount];

        await expect(asset.batchFreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });
    });

    describe("batchUnfreezePartialTokens", () => {
      const totalAmount = AMOUNT;
      const unfreezeAmount = AMOUNT / 2;

      beforeEach(async () => {
        await asset.mint(signer_D.address, totalAmount);
        await asset.mint(signer_E.address, totalAmount);

        await asset.freezePartialTokens(signer_D.address, totalAmount);
        await asset.freezePartialTokens(signer_E.address, totalAmount);
      });

      it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN tokens are unfrozen successfully", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [unfreezeAmount, unfreezeAmount];

        const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
        const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

        await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

        const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
        const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

        expect(finalFrozenD).to.equal(initialFrozenD - BigInt(unfreezeAmount));
        expect(finalFrozenE).to.equal(initialFrozenE - BigInt(unfreezeAmount));
      });

      describe("bug Transfer", () => {
        it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN Transfer event is emitted for each account", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [unfreezeAmount, unfreezeAmount];

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts))
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_D.address, unfreezeAmount)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_E.address, unfreezeAmount);
        });
      });

      it("GIVEN insufficient frozen tokens WHEN batchUnfreezePartialTokens THEN transaction fails", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        // Try to unfreeze more than was frozen for signer_D.address
        const amounts = [totalAmount + 1, unfreezeAmount];

        await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "InsufficientFrozenBalance",
        );
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const amounts = [mintAmount, mintAmount];

        await expect(asset.batchUnfreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.pause();
      });

      it("GIVEN a paused token WHEN batchFreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused token WHEN batchUnfreezePartialTokens THEN transactions revert with TokenIsPaused error", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [100, 100];

        await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
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
      const diamond: ResolverProxy = base.diamond;
      signer_A = base.deployer;
      signer_D = base.user3;

      asset = await ethers.getContractAt("IAsset", diamond.target);
    });

    describe("Freeze", () => {
      it("GIVEN an account with ATS_ROLES.FREEZE_MANAGER_ROLE WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchFreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN an account with ATS_ROLES.FREEZE_MANAGER_ROLE WHEN batchUnfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchUnfreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });
  });
});
