// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { deployBondKpiLinkedRateTokenFixture, getDltTimestamp } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, TIME_PERIODS_S, COUPON_LISTING_RESOLVER_KEY } from "@scripts";

describe("CouponListing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  let startingDate = 0;
  let maturityDate = 0;

  async function deploySecurityFixture() {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + TIME_PERIODS_S.YEAR;

    const base = await deployBondKpiLinkedRateTokenFixture({
      bondDataParams: {
        securityData: {
          internalKycActivated: true,
        },
        bondDetails: {
          startingDate,
          maturityDate,
        },
      },
    });

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await asset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("initializeCouponListing", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCouponListing is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_B).initializeCouponListing())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCouponListing is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCouponListing())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(COUPON_LISTING_RESOLVER_KEY, 1);
    });
  });

  describe("initializeCouponListing event", () => {
    it("GIVEN a fresh deployment WHEN initializeCouponListing is called THEN emits CouponListingInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(COUPON_LISTING_RESOLVER_KEY);
      await expect(asset.initializeCouponListing()).to.emit(asset, "CouponListingInitialized");
    });
  });
});
