// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("ERC1594 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  describe("Single partition mode", () => {
    async function deploySecurityFixtureSinglePartition() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
            maxSupply: MAX_SUPPLY,
          },
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
          role: ATS_ROLES.PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ISSUER_ROLE,
          members: [signer_C.address],
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
          role: ATS_ROLES.CLEARING_ROLE,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
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
        // First deploy a new token using white list
        const newTokenFixture = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              internalKycActivated: true,
              isWhiteList: true,
            },
          },
        });

        // accounts are blacklisted by default (white list)
        const newAccessControl = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await newAccessControl.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await newAccessControl.grantRole(ATS_ROLES.KYC_ROLE, signer_B.address);
        await newAccessControl.grantRole(ATS_ROLES.SSI_MANAGER_ROLE, signer_A.address);

        const newSsiManagement = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await newSsiManagement.addIssuer(signer_E.address);

        const newKycFacet = asset.attach(newTokenFixture.diamond.target).connect(signer_B) as IAsset;
        await newKycFacet.grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

        // issue fails
        const newErc1594 = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await expect(newErc1594.issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });

      it("GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
        // Blacklisting accounts
        await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROL_LIST_ROLE, signer_A.address);
        await asset.connect(signer_A).addToControlList(signer_C.address);

        // redeem with data fails
        await expect(asset.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // redeem from with data fails
        await expect(asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // Update blacklist
        await asset.connect(signer_A).removeFromControlList(signer_C.address);
        await asset.connect(signer_A).addToControlList(signer_E.address);

        // redeem from with data fails
        await expect(asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
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

        await expect(asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsActivated",
        );
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

      it("GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused", async () => {
        // issue fails
        await expect(asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused", async () => {
        // transfer with data fails
        await expect(asset.connect(signer_C).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );

        // transfer from with data fails
        await expect(asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
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
