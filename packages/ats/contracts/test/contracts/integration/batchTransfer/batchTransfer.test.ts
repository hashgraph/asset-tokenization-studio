// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ComplianceMock, IdentityRegistryMock, IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("BatchTransfer Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  async function deployBatchTransferFixture() {
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
      {
        role: ATS_ROLES.CLEARING_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
    await asset.addIssuer(signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.grantRole(ATS_ROLES.PAUSER_ROLE, signer_A.address);
  }

  describe("single partition", () => {
    beforeEach(async () => {
      await loadFixture(deployBatchTransferFixture);
    });

    describe("batchTransfer", () => {
      const transferAmount = AMOUNT / 4;
      const initialMintAmount = AMOUNT;

      beforeEach(async () => {
        // Mint initial tokens to the sender (signer_E)
        await asset.mint(signer_E.address, initialMintAmount);
      });

      it("GIVEN a valid sender WHEN batchTransfer THEN transaction succeeds and balances are updated", async () => {
        const toList = [signer_F.address, signer_D.address];
        const amounts = [transferAmount, transferAmount];

        const initialBalanceSender = await asset.balanceOf(signer_E.address);
        const initialBalanceF = await asset.balanceOf(signer_F.address);
        const initialBalanceD = await asset.balanceOf(signer_D.address);

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.not.be.reverted;

        const finalBalanceSender = await asset.balanceOf(signer_E.address);
        const finalBalanceF = await asset.balanceOf(signer_F.address);
        const finalBalanceD = await asset.balanceOf(signer_D.address);

        expect(finalBalanceSender).to.equal(initialBalanceSender - BigInt(transferAmount * 2));
        expect(finalBalanceF).to.equal(initialBalanceF + BigInt(transferAmount));
        expect(finalBalanceD).to.equal(initialBalanceD + BigInt(transferAmount));
      });

      it("GIVEN insufficient balance WHEN batchTransfer THEN transaction fails", async () => {
        const toList = [signer_F.address, signer_D.address];
        // Total amount > balance
        const amounts = [initialMintAmount, transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InvalidPartition",
        );
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const amounts = [mintAmount, mintAmount];

        await expect(asset.batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });

      it("GIVEN a paused token WHEN batchTransfer THEN transaction fails with TokenIsPaused", async () => {
        await asset.pause();

        const toList = [signer_F.address];
        const amounts = [transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN clearing is activated WHEN batchTransfer THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_B).activateClearing();

        const toList = [signer_F.address];
        const amounts = [transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsActivated",
        );
      });

      it("GIVEN protected partitions without wildcard role WHEN batchTransfer THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await asset.protectPartitions();

        const toList = [signer_F.address];
        const amounts = [transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN non-verified sender WHEN batchTransfer THEN transaction fails with AddressNotVerified", async () => {
        await identityRegistryMock.setFlags(false, false);

        const toList = [signer_F.address];
        const amounts = [transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "AddressNotVerified",
        );
      });

      it("GIVEN compliance returns false WHEN batchTransfer THEN transaction fails with ComplianceNotAllowed", async () => {
        await complianceMock.setFlags(false, false);

        const toList = [signer_F.address];
        const amounts = [transferAmount];

        await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "ComplianceNotAllowed",
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

      asset = await ethers.getContractAt("IAsset", diamond.target);
    });

    it("GIVEN an single partition token WHEN batchTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.batchTransfer([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });
});
