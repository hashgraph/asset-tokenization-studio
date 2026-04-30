// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, EMPTY_HEX_BYTES, ATS_ROLES } from "@scripts";
import { ResolverProxy, IAsset } from "@contract-types";

const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const _OPERATOR_DATA = "0x5678";

describe("ControllerByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  function set_initRbacs() {
    return [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_D.address],
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
        role: ATS_ROLES.CONTROLLER_ROLE,
        members: [signer_C.address],
      },
    ];
  }

  async function setupBalances(asset: IAsset) {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
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
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());
    await setupBalances(asset);
  }

  async function deployFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: { securityData: { isMultiPartition: true } },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());
    await setupBalances(asset);
  }

  describe("Single partition", () => {
    beforeEach(async () => {
      await loadFixture(deployFixtureSinglePartition);
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_D).pause();
      });

      it("GIVEN a paused token WHEN controllerTransferByPartition THEN revert TokenIsPaused", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused token WHEN controllerRedeemByPartition THEN revert TokenIsPaused", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("Wrong partition — onlyDefaultPartitionWithSinglePartition", () => {
      it("GIVEN a wrong partition in single-partition mode WHEN controllerTransferByPartition THEN revert PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerTransferByPartition(
              _WRONG_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN a wrong partition in single-partition mode WHEN controllerRedeemByPartition THEN revert PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerRedeemByPartition(_WRONG_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Controllable — onlyControllable", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).finalizeControllable();
      });

      it("GIVEN a non-controllable token WHEN controllerTransferByPartition THEN revert TokenIsNotControllable", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
      });

      it("GIVEN a non-controllable token WHEN controllerRedeemByPartition THEN revert TokenIsNotControllable", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
      });
    });

    describe("AccessControl — onlyAnyRole", () => {
      it("GIVEN an account without CONTROLLER_ROLE or AGENT_ROLE WHEN controllerTransferByPartition THEN revert AccountHasNoRoles", async () => {
        await expect(
          asset
            .connect(signer_B)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });

      it("GIVEN an account without CONTROLLER_ROLE or AGENT_ROLE WHEN controllerRedeemByPartition THEN revert AccountHasNoRoles", async () => {
        await expect(
          asset
            .connect(signer_B)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
      });
    });

    describe("Success", () => {
      it("GIVEN an account with CONTROLLER_ROLE WHEN controllerTransferByPartition THEN emit TransferByPartition and update balances", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.emit(asset, "TransferByPartition");

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(_AMOUNT);
        expect(await asset.totalSupply()).to.equal(_AMOUNT);
      });

      it("GIVEN an account with AGENT_ROLE WHEN controllerTransferByPartition THEN emit TransferByPartition and update balances", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.AGENT_ROLE, signer_B.address);

        await expect(
          asset
            .connect(signer_B)
            .controllerTransferByPartition(
              DEFAULT_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.emit(asset, "TransferByPartition");

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(_AMOUNT);
      });

      it("GIVEN an account with CONTROLLER_ROLE WHEN controllerRedeemByPartition THEN emit RedeemedByPartition and decrease supply", async () => {
        const supplyBefore = await asset.totalSupply();

        await expect(
          asset
            .connect(signer_C)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.emit(asset, "RedeemedByPartition");

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.totalSupply()).to.equal(supplyBefore - BigInt(_AMOUNT));
      });

      it("GIVEN an account with AGENT_ROLE WHEN controllerRedeemByPartition THEN emit RedeemedByPartition and decrease supply", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.AGENT_ROLE, signer_B.address);
        const supplyBefore = await asset.totalSupply();

        await expect(
          asset
            .connect(signer_B)
            .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.emit(asset, "RedeemedByPartition");

        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.totalSupply()).to.equal(supplyBefore - BigInt(_AMOUNT));
      });
    });
  });

  describe("Multi-partition", () => {
    beforeEach(async () => {
      await loadFixture(deployFixtureMultiPartition);
    });

    describe("Wrong partition — onlyDefaultPartitionWithSinglePartition", () => {
      it("GIVEN a multi-partition token WHEN controllerTransferByPartition with non-existent partition THEN revert InvalidPartition", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerTransferByPartition(
              _WRONG_PARTITION,
              signer_A.address,
              signer_E.address,
              _AMOUNT,
              _DATA,
              _OPERATOR_DATA,
            ),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
      });

      it("GIVEN a multi-partition token WHEN controllerRedeemByPartition with non-existent partition THEN revert InvalidPartition", async () => {
        await expect(
          asset
            .connect(signer_C)
            .controllerRedeemByPartition(_WRONG_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
      });
    });
  });
});
