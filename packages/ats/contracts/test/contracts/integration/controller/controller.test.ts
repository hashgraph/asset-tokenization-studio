// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { grantRoleAndPauseToken } from "@test";
import { deployEquityTokenFixture } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ZERO, DEFAULT_PARTITION, ATS_ROLES, ADDRESS_ZERO, EMPTY_HEX_BYTES } from "@scripts";

const amount = 1;
const data = "0x1234";
const operatorData = "0x5678";
const EMPTY_VC_ID = EMPTY_STRING;

describe("Controller Tests", () => {
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
      await expect(asset.initializeController(false)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await grantRoleAndPauseToken(asset, ATS_ROLES._CONTROLLER_ROLE, signer_A, signer_B, signer_C.address);
      });

      it("GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.connect(signer_C).controllerTransfer(signer_D.address, signer_E.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.connect(signer_C).controllerRedeem(signer_D.address, amount, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused token WHEN attempting to addAgent or removeAgent THEN transactions revert with TokenIsPaused error", async () => {
        await expect(asset.addAgent(signer_A.address)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        await expect(asset.removeAgent(signer_A.address)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without admin role WHEN finalizeControllable THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).finalizeControllable()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).controllerRedeem(signer_D.address, amount, data, operatorData),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an account without admin role WHEN addAgent or removeAgent THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).addAgent(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
        await expect(asset.connect(signer_C).removeAgent(signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without ATS_ROLES._CONTROLLER_ROLE WHEN forcedTransfer is called THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).forcedTransfer(signer_D.address, signer_E.address, amount),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });
    });

    describe("Controllable", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_D.address,
          value: amount * 2,
          data: data,
        });
      });

      it("GIVEN a controllable token WHEN controllerTransfer THEN transaction succeeds", async () => {
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

      it("GIVEN a controllable token WHEN controllerRedeem THEN transaction succeeds", async () => {
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

    describe("ForcedTransfer", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      });

      it("GIVEN an account with balance WHEN forcedTransfer THEN transaction success", async () => {
        await asset.connect(signer_B).mint(signer_E.address, amount * 2);
        await asset.grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_E.address);

        expect(await asset.forcedTransfer(signer_E.address, signer_D.address, amount))
          .to.emit(asset, "Transferred")
          .withArgs(signer_E.address, signer_D.address, amount);

        expect(await asset.totalSupply()).to.be.equal(amount * 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(amount);
        expect(await asset.balanceOf(signer_D.address)).to.be.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(amount);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(amount * 2);
      });

      it("GIVEN a paused token WHEN attempting to forcedTransfer TokenIsPaused error", async () => {
        await asset.connect(signer_B).pause();

        await expect(
          asset.forcedTransfer(signer_A.address, signer_B.address, amount - 1),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("Agent", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      });

      it("GIVEN an initialized token WHEN adding agent THEN addAgent emits AgentAdded with agent address", async () => {
        expect(await asset.addAgent(signer_B.address))
          .to.emit(asset, "AgentAdded")
          .withArgs(signer_B.address);

        const hasRole = await asset.hasRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const isAgent = await asset.isAgent(signer_B.address);
        expect(isAgent).to.equal(true);
        expect(hasRole).to.equal(true);
      });

      it("GIVEN an agent WHEN removing agent THEN removeAgent emits AgentRemoved and revokes role", async () => {
        await asset.addAgent(signer_B.address);

        expect(await asset.removeAgent(signer_B.address))
          .to.emit(asset, "AgentRemoved")
          .withArgs(signer_B.address);

        const hasRole = await asset.hasRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const isAgent = await asset.isAgent(signer_B.address);
        expect(isAgent).to.equal(false);
        expect(hasRole).to.equal(false);
      });

      it("GIVEN a non-agent address WHEN removing agent THEN reverts with AccountNotAssignedToRole", async () => {
        await expect(asset.removeAgent(signer_C.address))
          .to.be.revertedWithCustomError(asset, "AccountNotAssignedToRole")
          .withArgs(ATS_ROLES._AGENT_ROLE, signer_C.address);
      });

      it("GIVEN an already-agent address WHEN adding agent again THEN reverts with AccountAssignedToRole", async () => {
        await asset.addAgent(signer_B.address);

        await expect(asset.addAgent(signer_B.address))
          .to.be.revertedWithCustomError(asset, "AccountAssignedToRole")
          .withArgs(ATS_ROLES._AGENT_ROLE, signer_B.address);
      });

      it("GIVEN a user with the agent role WHEN performing actions using ERC-1400 methods succeeds", async () => {
        await asset.grantRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const issueAmount = 1000;
        await expect(
          asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_E.address,
            value: 4 * issueAmount,
            data: EMPTY_HEX_BYTES,
          }),
        ).to.emit(asset, "IssuedByPartition");

        await expect(asset.connect(signer_B).controllerRedeem(signer_E.address, issueAmount, "0x", "0x")).to.emit(
          asset,
          "ControllerRedemption",
        );
        await expect(
          asset
            .connect(signer_B)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_E.address, issueAmount, "0x", "0x"),
        ).to.emit(asset, "RedeemedByPartition");
        await expect(
          asset.connect(signer_B).controllerTransfer(signer_E.address, signer_D.address, issueAmount, "0x", "0x"),
        ).to.emit(asset, "TransferByPartition");
        await expect(
          asset
            .connect(signer_B)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_E.address,
              signer_D.address,
              issueAmount,
              "0x",
              "0x",
            ),
        ).to.emit(asset, "TransferByPartition");
      });

      it("GIVEN a user with the agent role WHEN performing actions using ERC-3643 methods succeeds", async () => {
        await asset.grantRole(ATS_ROLES._AGENT_ROLE, signer_B.address);
        const issueAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_E.address,
          value: issueAmount,
          data: "0x",
        });
        await expect(asset.connect(signer_B).freezePartialTokens(signer_E.address, issueAmount))
          .to.emit(asset, "TokensFrozen")
          .withArgs(signer_E.address, issueAmount, DEFAULT_PARTITION);
        await expect(asset.connect(signer_B).unfreezePartialTokens(signer_E.address, issueAmount))
          .to.emit(asset, "TokensUnfrozen")
          .withArgs(signer_E.address, issueAmount, DEFAULT_PARTITION);
        await expect(asset.connect(signer_B).forcedTransfer(signer_E.address, signer_D.address, issueAmount))
          .to.emit(asset, "TransferByPartition")
          .withArgs(DEFAULT_PARTITION, ADDRESS_ZERO, signer_E.address, signer_D.address, issueAmount, "0x", "0x");
        await expect(asset.connect(signer_B).mint(signer_E.address, issueAmount))
          .to.emit(asset, "Issued")
          .withArgs(signer_B.address, signer_E.address, issueAmount, "0x");
        await expect(asset.connect(signer_B).burn(signer_E.address, issueAmount))
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, ADDRESS_ZERO, issueAmount);
        await expect(asset.connect(signer_B).setAddressFrozen(signer_E.address, true))
          .to.emit(asset, "AddressFrozen")
          .withArgs(signer_E.address, true, signer_B.address);
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
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      });

      it("GIVEN an account with controller role WHEN controllerTransfer THEN NotAllowedInMultiPartitionMode", async () => {
        const isControllable = await asset.isControllable();
        expect(isControllable).to.equal(true);

        await expect(
          asset.controllerTransfer(signer_D.address, signer_E.address, amount, data, operatorData),
        ).to.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it("GIVEN an account with controller role WHEN controllerRedeem THEN NotAllowedInMultiPartitionMode", async () => {
        const isControllable = await asset.isControllable();
        expect(isControllable).to.equal(true);

        await expect(asset.controllerRedeem(signer_D.address, amount, data, operatorData)).to.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });
  });
});
