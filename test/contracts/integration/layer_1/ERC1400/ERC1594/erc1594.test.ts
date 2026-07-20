// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@lib";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

export function erc1594Tests(getCtx: () => AssetMockCtx): void {
  describe("ERC1594 Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

    let asset: IAssetMock;

    describe("Single partition mode", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        signer_B = ctx.user1;
        signer_C = ctx.user2;
        signer_D = ctx.user3;
        signer_E = ctx.user4;
        asset = ctx.asset;

        await executeRbac(asset, [
          {
            role: ATS_ROLES.ROLE_PAUSER,
            members: [signer_B.address],
          },
          {
            role: ATS_ROLES.ROLE_ISSUER,
            members: [signer_C.address],
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
            role: ATS_ROLES.ROLE_CLEARING,
            members: [signer_B.address],
          },
        ]);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

        await asset.grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
        await asset.setMaxSupply(MAX_SUPPLY);
        await asset.grantRole(ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, signer_A.address);
        await asset.activateInternalKyc();
      });

      describe("Cap", () => {
        it("GIVEN a max supply WHEN issue more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
          // add to list fails
          await expect(
            asset.connect(signer_A).issue(signer_E.address, MAX_SUPPLY + 1, DATA),
          ).to.be.revertedWithCustomError(asset, "MaxSupplyReached");
        });
      });

      describe("ControlList", () => {
        it("GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked", async () => {
          await asset.forceWhitelist(true);

          // issue fails
          await expect(asset.connect(signer_A).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "AccountIsBlocked",
          );
        });

        it("GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
          // Blacklisting accounts
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
          await asset.connect(signer_A).addToControlList(signer_C.address);

          // redeem with data fails
          await expect(asset.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "AccountIsBlocked",
          );

          // redeem from with data fails
          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

          // Update blacklist
          await asset.connect(signer_A).removeFromControlList(signer_C.address);
          await asset.connect(signer_A).addToControlList(signer_E.address);

          // redeem from with data fails
          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });
      });

      describe("Clearing", () => {
        beforeEach(async () => {
          await asset.connect(signer_B).activateClearing();
        });

        it("GIVEN a token with clearing mode active WHEN redeem THEN transaction fails with ClearingIsActivated", async () => {
          await expect(asset.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );

          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA),
          ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
        });
      });

      describe("Paused", () => {
        beforeEach(async () => {
          await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.issue(signer_C.address, AMOUNT, DATA);
          await asset.issue(signer_E.address, AMOUNT, DATA);
          await asset.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
          await asset.connect(signer_B).pause();
        });

        it("GIVEN a paused Token WHEN issue THEN transaction fails with IsPaused", async () => {
          // issue fails
          await expect(asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused Token WHEN redeem THEN transaction fails with IsPaused", async () => {
          // transfer with data fails
          await expect(asset.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(asset, "IsPaused");

          // transfer from with data fails
          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
          // add to list fails
          await expect(asset.connect(signer_B).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "AccountHasNoRoles",
          );
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
          // add to list fails
          await expect(asset.connect(signer_B).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "AccountHasNoRoles",
          );
        });
      });

      describe("Kyc", () => {
        it(
          "GIVEN non kyc account " + "WHEN redeem or redeemFrom " + "THEN transaction reverts with InvalidKycStatus",
          async () => {
            await asset.connect(signer_B).revokeKyc(signer_E.address);
            await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.revertedWithCustomError(
              asset,
              "InvalidKycStatus",
            );
            await expect(asset.connect(signer_B).redeemFrom(signer_E.address, AMOUNT, DATA)).to.revertedWithCustomError(
              asset,
              "InvalidKycStatus",
            );
          },
        );
      });
    });
  });
}
