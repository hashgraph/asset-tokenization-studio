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

describe("BatchController Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

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
    signer_F = base.user5;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_ISSUER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CONTROLLER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
    ]);

    await asset.addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  describe("single partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("batchForcedTransfer", () => {
      const transferAmount = AMOUNT / 2;

      beforeEach(async () => {
        await asset.mint(signer_F.address, transferAmount);
        await asset.mint(signer_D.address, transferAmount);
      });

      it("GIVEN controller role WHEN batchForcedTransfer THEN transaction succeeds", async () => {
        const fromList = [signer_F.address, signer_D.address];
        const toList = [signer_E.address, signer_E.address];
        const amounts = [transferAmount, transferAmount];

        const initialBalanceF = await asset.balanceOf(signer_F.address);
        const initialBalanceD = await asset.balanceOf(signer_D.address);
        const initialBalanceE = await asset.balanceOf(signer_E.address);

        await expect(asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts)).to.not.be.reverted;

        const finalBalanceF = await asset.balanceOf(signer_F.address);
        const finalBalanceD = await asset.balanceOf(signer_D.address);
        const finalBalanceE = await asset.balanceOf(signer_E.address);

        expect(finalBalanceF).to.equal(initialBalanceF - BigInt(transferAmount));
        expect(finalBalanceD).to.equal(initialBalanceD - BigInt(transferAmount));
        expect(finalBalanceE).to.equal(initialBalanceE + BigInt(transferAmount * 2));
      });

      describe("bug Transfer", () => {
        it("GIVEN controller WHEN batchForcedTransfer THEN Transfer event is emitted for each transfer", async () => {
          const fromList = [signer_F.address, signer_D.address];
          const toList = [signer_E.address, signer_E.address];
          const amounts = [transferAmount, transferAmount];

          await expect(asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts))
            .to.emit(asset, "Transfer")
            .withArgs(signer_F.address, signer_E.address, transferAmount)
            .to.emit(asset, "Transfer")
            .withArgs(signer_D.address, signer_E.address, transferAmount);
        });
      });

      it("GIVEN account without controller role WHEN batchForcedTransfer THEN transaction fails with AccountHasNoRole", async () => {
        const fromList = [signer_F.address];
        const toList = [signer_E.address];
        const amounts = [transferAmount];

        // signer_B does not have ATS_ROLES.ROLE_CONTROLLER
        await expect(
          asset.connect(signer_B).batchForcedTransfer(fromList, toList, amounts),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const toList = [signer_D.address];
        const fromList = [signer_F.address, signer_D.address];
        const amounts = [mintAmount, mintAmount];

        await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });

      it("GIVEN toList and amounts with different lengths WHEN batchForcedTransfer THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const mintAmount = AMOUNT / 2;
        const fromList = [signer_A.address, signer_F.address];
        const toList = [signer_D.address, signer_E.address];
        const amounts = [mintAmount];

        await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });

      it("GIVEN a paused token WHEN batchForcedTransfer THEN transaction fails with IsPaused", async () => {
        await asset.pause();

        const fromList = [signer_F.address];
        const toList = [signer_E.address];
        const amounts = [transferAmount];

        await expect(
          asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
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
      signer_A = base.deployer;
      asset = await ethers.getContractAt("IAsset", base.diamond.target);
    });

    it("GIVEN an single partition token WHEN batchForcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        asset.batchForcedTransfer([signer_A.address], [signer_A.address], [AMOUNT]),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });
  });

  describe("Token is controllable", () => {
    async function deployNotControllableFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isControllable: false,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      signer_A = base.deployer;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      asset = await ethers.getContractAt("IAsset", base.diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_CONTROLLER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.mint(signer_D.address, AMOUNT);
    }

    beforeEach(async () => {
      await loadFixture(deployNotControllableFixture);
    });

    it("GIVEN token is not controllable WHEN batchForcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
      const fromList = [signer_F.address];
      const toList = [signer_E.address];
      const amounts = [AMOUNT];

      await expect(
        asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
      ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN batchForcedTransfer THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).batchForcedTransfer([], [], []),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
  describe.skip("initializeBatchController", () => {
    it("GIVEN an already-initialised facet WHEN initializeBatchController is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const base = await deployEquityTokenFixture();
      const freshAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await freshAsset.connect(base.deployer).initializeBatchController();
      await expect(freshAsset.connect(base.deployer).initializeBatchController()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchController is called THEN it reverts with AccountHasNoRole", async () => {
      const base = await deployEquityTokenFixture();
      const freshAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await expect(freshAsset.connect(base.user3).initializeBatchController()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a fresh deployment WHEN initializeBatchController is called THEN it emits BatchControllerInitialized", async () => {
      const base = await deployEquityTokenFixture();
      const freshAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await expect(freshAsset.connect(base.deployer).initializeBatchController()).to.emit(
        freshAsset,
        "BatchControllerInitialized",
      );
    });
  });
});
