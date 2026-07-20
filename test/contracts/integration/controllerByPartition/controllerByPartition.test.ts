// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, EMPTY_HEX_BYTES, ATS_ROLES, RESOLVER_KEYS } from "@lib";

const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const _OPERATOR_DATA = "0x5678";

export function controllerByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("ControllerByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    function set_initRbacs() {
      return [
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_D.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_CONTROLLER,
          members: [signer_C.address],
        },
      ];
    }

    async function setupBalances() {
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

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
      await executeRbac(asset, set_initRbacs());
      await setupBalances();
      await asset.forceControllable(true);
    });

    describe("Single partition", () => {
      describe("Paused", () => {
        beforeEach(async () => {
          await asset.connect(signer_D).pause();
        });

        it("GIVEN a paused token WHEN controllerTransferByPartition THEN revert IsPaused", async () => {
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
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN controllerRedeemByPartition THEN revert IsPaused", async () => {
          await expect(
            asset
              .connect(signer_C)
              .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
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
        it("GIVEN an account without ROLE_CONTROLLER or ROLE_AGENT WHEN controllerTransferByPartition THEN revert AccountHasNoRoles", async () => {
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

        it("GIVEN an account without ROLE_CONTROLLER or ROLE_AGENT WHEN controllerRedeemByPartition THEN revert AccountHasNoRoles", async () => {
          await expect(
            asset
              .connect(signer_B)
              .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });
      });

      describe("Success", () => {
        it("GIVEN an account with ROLE_CONTROLLER WHEN controllerTransferByPartition THEN emit TransferByPartition and update balances", async () => {
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

        it("GIVEN an account with ROLE_AGENT WHEN controllerTransferByPartition THEN emit TransferByPartition and update balances", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_AGENT, signer_B.address);

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

        it("GIVEN an account with ROLE_CONTROLLER WHEN controllerRedeemByPartition THEN emit RedeemedByPartition and decrease supply", async () => {
          const supplyBefore = await asset.totalSupply();

          await expect(
            asset
              .connect(signer_C)
              .controllerRedeemByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, _DATA, _OPERATOR_DATA),
          ).to.emit(asset, "RedeemedByPartition");

          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.totalSupply()).to.equal(supplyBefore - BigInt(_AMOUNT));
        });

        it("GIVEN an account with ROLE_AGENT WHEN controllerRedeemByPartition THEN emit RedeemedByPartition and decrease supply", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_AGENT, signer_B.address);
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
        await asset.setMultiPartition(true);
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

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN controllerTransferByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset
            .connect(signer_A)
            .controllerTransferByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN controllerRedeemByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).controllerRedeemByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeControllerByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeControllerByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeControllerByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeControllerByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeControllerByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.controllerByPartition, 1);
      });
    });

    describe("initializeControllerByPartition event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeControllerByPartition is called THEN emits ControllerByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.controllerByPartition);
        await expect(asset.initializeControllerByPartition()).to.emit(asset, "ControllerByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN controllerRedeemByPartition is called THEN AssetNotOperational", async () => {
        await expect(
          asset.controllerRedeemByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0n, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational WHEN controllerTransferByPartition is called THEN AssetNotOperational", async () => {
        await expect(
          asset.controllerTransferByPartition(ethers.ZeroHash, ethers.ZeroAddress, ethers.ZeroAddress, 0n, "0x", "0x"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
