// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset, type ResolverProxy, ITransferByPartition__factory } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("TransferByPartition Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function setupBalances() {
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).issueByPartition({
      partition: DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: _AMOUNT,
      data: EMPTY_HEX_BYTES,
    });
  }

  async function deployFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await setupBalances();
  }

  async function deployFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          clearingActive: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await setupBalances();
  }

  describe("Single partition mode", () => {
    beforeEach(async () => {
      await loadFixture(deployFixtureSinglePartition);
    });

    describe("onlyDefaultPartitionWithSinglePartition", () => {
      it("GIVEN a non-default partition in single-partition mode WHEN transferByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
        const transferByPartition = ITransferByPartition__factory.connect(await diamond.getAddress(), signer_A);

        await expect(
          transferByPartition.transferByPartition(_WRONG_PARTITION, { to: signer_C.address, value: _AMOUNT }, "0x"),
        ).to.be.revertedWithCustomError(transferByPartition, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Happy path", () => {
      it("GIVEN valid parameters WHEN transferByPartition THEN emits TransferByPartition and Transfer", async () => {
        const transferByPartition = ITransferByPartition__factory.connect(await diamond.getAddress(), signer_A);

        await expect(
          transferByPartition.transferByPartition(
            DEFAULT_PARTITION,
            { to: signer_C.address, value: _AMOUNT },
            EMPTY_HEX_BYTES,
          ),
        )
          .to.emit(transferByPartition, "TransferByPartition")
          .withArgs(DEFAULT_PARTITION, ADDRESS_ZERO, signer_A.address, signer_C.address, _AMOUNT, EMPTY_HEX_BYTES, "0x")
          .to.emit(asset, "Transfer")
          .withArgs(signer_A.address, signer_C.address, _AMOUNT);
      });
    });
  });

  describe("Multi partition mode", () => {
    beforeEach(async () => {
      await loadFixture(deployFixtureMultiPartition);
      await asset.connect(signer_A).deactivateClearing();
    });

    describe("Happy path", () => {
      it("GIVEN valid parameters WHEN transferByPartition THEN emits TransferByPartition and Transfer", async () => {
        const transferByPartition = ITransferByPartition__factory.connect(await diamond.getAddress(), signer_A);

        await expect(
          transferByPartition.transferByPartition(
            DEFAULT_PARTITION,
            { to: signer_C.address, value: _AMOUNT },
            EMPTY_HEX_BYTES,
          ),
        )
          .to.emit(transferByPartition, "TransferByPartition")
          .withArgs(DEFAULT_PARTITION, ADDRESS_ZERO, signer_A.address, signer_C.address, _AMOUNT, EMPTY_HEX_BYTES, "0x")
          .to.emit(asset, "Transfer")
          .withArgs(signer_A.address, signer_C.address, _AMOUNT);
      });
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN transferByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset
          .connect(base.deployer)
          .transferByPartition(ethers.ZeroHash, { to: ethers.ZeroAddress, value: 0 }, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe.skip("initializeTransferByPartition", () => {
    beforeEach(async () => {
      const base = await deployEquityTokenFixture();
      signer_A = base.deployer;
      signer_C = base.user2;
      asset = await ethers.getContractAt("IAsset", base.diamond.target, signer_A);
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeTransferByPartition is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeTransferByPartition()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeTransferByPartition();
      });

      it("GIVEN an already-initialised facet WHEN initializeTransferByPartition is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeTransferByPartition()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeTransferByPartition is called THEN it emits TransferByPartitionInitialized", async () => {
      await expect(asset.connect(signer_A).initializeTransferByPartition()).to.emit(
        asset,
        "TransferByPartitionInitialized",
      );
    });
  });
});
