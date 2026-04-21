// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { grantRoleAndPauseToken } from "../../../../../common";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ZERO, DEFAULT_PARTITION, ATS_ROLES } from "@scripts";

const amount = 1;
const data = "0x1234";
const operatorData = "0x5678";
const EMPTY_VC_ID = EMPTY_STRING;

describe("ERC1644 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  describe("single partition", () => {
    async function deploySecurityFixtureSinglePartition() {
      const base = await deployEquityTokenFixture();
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CONTROLLER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
      ]);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
      await expect(asset.initialize_ERC1644(false)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(asset, ATS_ROLES._CONTROLLER_ROLE, signer_A, signer_B, signer_C.address);
      });
      it("GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused", async () => {
        // controller transfer fails
        await expect(
          asset.connect(signer_C).controllerTransfer(signer_D.address, signer_E.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused", async () => {
        // remove document
        await expect(
          asset.connect(signer_C).controllerRedeem(signer_D.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without admin role WHEN finalizeControllable THEN transaction fails with AccountHasNoRole", async () => {
        // controller finalize fails
        await expect(asset.connect(signer_C).finalizeControllable()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole", async () => {
        // controller transfer fails
        await expect(
          asset.connect(signer_C).controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole", async () => {
        // controller redeem fails
        await expect(
          asset.connect(signer_C).controllerRedeem(signer_D.address, amount, data, operatorData),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });
    });

    describe("Controllable", () => {
      beforeEach(async () => {
        // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        // Granting Role to account C
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: amount * 2,
          data: data,
        });
      });

      it("GIVEN a controllable token " + "WHEN controllerTransfer " + "THEN transaction succeeds", async () => {
        expect(
          await asset
            .connect(signer_B)
            .controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        )
          .to.emit(asset, "ControllerTransfer")
          .withArgs(signer_B.address, signer_D.address, signer_E.address, amount, data, data);
        expect(await asset.totalSupply()).to.equal(amount * 2);
        expect(await asset.balanceOf(signer_D.address)).to.equal(amount);
        expect(await asset.balanceOf(signer_E.address)).to.equal(amount);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount * 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(amount);
      });

      it("GIVEN a controllable token " + "WHEN controllerRedeem " + "THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_B).controllerRedeem(signer_D.address, amount, data, operatorData))
          .to.emit(asset, "ControllerRedemption")
          .withArgs(signer_B.address, signer_D.address, amount, data, data);
        expect(await asset.totalSupply()).to.equal(amount);
        expect(await asset.balanceOf(signer_D.address)).to.equal(amount);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount);
      });
    });

    describe("finalizeControllable", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await expect(asset.connect(signer_A).finalizeControllable())
          .to.emit(asset, "FinalizedControllerFeature")
          .withArgs(signer_A.address);
      });

      it("GIVEN an account with admin role WHEN finalizeControllable THEN transaction succeeds", async () => {
        const isControllable = await asset.isControllable();
        expect(isControllable).to.equal(false);
      });

      it("GIVEN finalizeControllable WHEN controllerTransfer THEN TokenIsNotControllable", async () => {
        await expect(
          asset.controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(asset, "TokenIsNotControllable");
      });

      it("GIVEN finalizeControllable WHEN controllerRedeem THEN TokenIsNotControllable", async () => {
        await expect(asset.controllerRedeem(signer_E.address, amount, data, operatorData)).to.revertedWithCustomError(
          asset,
          "TokenIsNotControllable",
        );
      });

      it("GIVEN finalizeControllable WHEN finalizeControllable THEN TokenIsNotControllable", async () => {
        await expect(asset.finalizeControllable()).to.revertedWithCustomError(asset, "TokenIsNotControllable");
      });
    });
  });

  describe("multi partition", () => {
    async function deploySecurityFixtureMultiPartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: { isMultiPartition: true },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
      ]);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("NotAllowedInMultiPartitionMode", () => {
      beforeEach(async () => {
        // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      });

      it("GIVEN an account with controller role WHEN controllerTransfer THEN NotAllowedInMultiPartitionMode", async () => {
        // check is controllable
        const isControllable = await asset.isControllable();
        expect(isControllable).to.equal(true);

        // controller transfer
        await expect(
          asset.controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an account with controller role WHEN controllerRedeem THEN NotAllowedInMultiPartitionMode", async () => {
        // check is controllable
        const isControllable = await asset.isControllable();
        expect(isControllable).to.equal(true);

        // controller transfer
        await expect(asset.controllerRedeem(signer_D.address, amount, data, operatorData)).to.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });
  });
});
