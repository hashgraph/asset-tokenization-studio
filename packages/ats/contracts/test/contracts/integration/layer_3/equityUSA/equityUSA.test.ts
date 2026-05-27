// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { deployEquityTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const EQUITY_RESOLVER_KEY = "0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810";

describe("EquityUSATests", () => {
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployFixture() {
    const base = await deployEquityTokenFixture();
    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initializeEquityUSA event", () => {
    it("GIVEN fresh facet WHEN initializeEquityUSA THEN emits EquityUSAInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(EQUITY_RESOLVER_KEY);
      const equityDetails = {
        votingRight: true,
        informationRight: true,
        liquidationRight: true,
        subscriptionRight: true,
        conversionRight: true,
        redemptionRight: true,
        putRight: true,
        dividendRight: 0,
        currency: "0x000000",
        nominalValue: 1n,
        nominalValueDecimals: 6,
      };
      await expect(asset.initializeEquityUSA(equityDetails)).to.emit(asset, "EquityUSAInitialized");
    });
  });
});
