// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { DecimalsLibMock } from "@contract-types";

describe("DecimalsLib Tests", () => {
  let decimalsLib: DecimalsLibMock;

  before(async () => {
    decimalsLib = await (await ethers.getContractFactory("DecimalsLibMock")).deploy();
  });

  describe("calculateDecimalsAdjustment", () => {
    it("GIVEN same decimals WHEN calculateDecimalsAdjustment THEN returns amount unchanged", async () => {
      expect(await decimalsLib.calculateDecimalsAdjustment(1000, 6, 6)).to.equal(1000);
    });

    it("GIVEN zero amount WHEN calculateDecimalsAdjustment THEN returns zero", async () => {
      expect(await decimalsLib.calculateDecimalsAdjustment(0, 6, 18)).to.equal(0);
    });

    describe("multiplication path (_newDecimals > _decimals)", () => {
      it("GIVEN decimals 3 and newDecimals 6 WHEN calculateDecimalsAdjustment THEN multiplies correctly", async () => {
        expect(await decimalsLib.calculateDecimalsAdjustment(1_000, 3, 6)).to.equal(1_000_000);
      });

      it("GIVEN exponent in switch range (diff=18) WHEN calculateDecimalsAdjustment THEN uses lookup path", async () => {
        expect(await decimalsLib.calculateDecimalsAdjustment(1, 0, 18)).to.equal(BigInt("1000000000000000000"));
      });

      it("GIVEN exponent above switch range (diff=19) WHEN calculateDecimalsAdjustment THEN uses fallback path", async () => {
        expect(await decimalsLib.calculateDecimalsAdjustment(1, 0, 19)).to.equal(BigInt("10000000000000000000"));
      });

      it("GIVEN difference of 77 WHEN calculateDecimalsAdjustment THEN succeeds", async () => {
        const expected = BigInt("10") ** BigInt(77);
        expect(await decimalsLib.calculateDecimalsAdjustment(1, 0, 77)).to.equal(expected);
      });

      it("GIVEN newDecimals of 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        await expect(decimalsLib.calculateDecimalsAdjustment(1, 0, 78))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(78);
      });

      it("GIVEN newDecimals above 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        await expect(decimalsLib.calculateDecimalsAdjustment(1, 0, 100))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(100);
      });

      it("GIVEN non-zero decimals and diff of 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge for newDecimals", async () => {
        // decimalsDiff = 83 - 5 = 78, error arg is _newDecimals
        await expect(decimalsLib.calculateDecimalsAdjustment(1, 5, 83))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(83);
      });

      it("GIVEN amount at exact overflow boundary WHEN calculateDecimalsAdjustment THEN succeeds", async () => {
        const maxUint256 = 2n ** 256n - 1n;
        const amount = maxUint256 / 10n; // MAX_UINT256 / multiplier, check passes
        await expect(decimalsLib.calculateDecimalsAdjustment(amount, 0, 1)).to.not.be.reverted;
      });

      it("GIVEN amount one above overflow boundary WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        const maxUint256 = 2n ** 256n - 1n;
        const amount = maxUint256 / 10n + 1n; // one above MAX_UINT256 / multiplier
        await expect(decimalsLib.calculateDecimalsAdjustment(amount, 0, 1))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(1);
      });

      it("GIVEN MAX_UINT256 amount with diff 1 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        const maxUint256 = 2n ** 256n - 1n;
        await expect(decimalsLib.calculateDecimalsAdjustment(maxUint256, 0, 1))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(1);
      });

      it("GIVEN amount that overflows with diff below 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        // 2 * 10^77 > MAX_UINT256 (~1.157e77), so amount=2 with diff=77 overflows
        await expect(decimalsLib.calculateDecimalsAdjustment(2, 0, 77))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(77);
      });
    });

    describe("division path (_decimals > _newDecimals)", () => {
      it("GIVEN decimals 6 and newDecimals 3 WHEN calculateDecimalsAdjustment THEN divides correctly", async () => {
        expect(await decimalsLib.calculateDecimalsAdjustment(1_000_000, 6, 3)).to.equal(1_000);
      });

      it("GIVEN exponent in switch range (diff=18) WHEN calculateDecimalsAdjustment THEN uses lookup path", async () => {
        const amount = BigInt("1000000000000000000");
        expect(await decimalsLib.calculateDecimalsAdjustment(amount, 18, 0)).to.equal(1);
      });

      it("GIVEN exponent above switch range (diff=19) WHEN calculateDecimalsAdjustment THEN uses fallback path", async () => {
        const amount = BigInt("10000000000000000000");
        expect(await decimalsLib.calculateDecimalsAdjustment(amount, 19, 0)).to.equal(1);
      });

      it("GIVEN difference of 77 WHEN calculateDecimalsAdjustment THEN succeeds", async () => {
        const amount = BigInt("10") ** BigInt(77);
        expect(await decimalsLib.calculateDecimalsAdjustment(amount, 77, 0)).to.equal(1);
      });

      it("GIVEN decimals of 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        await expect(decimalsLib.calculateDecimalsAdjustment(1, 78, 0))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(78);
      });

      it("GIVEN decimals above 78 WHEN calculateDecimalsAdjustment THEN reverts with DecimalsTooLarge", async () => {
        await expect(decimalsLib.calculateDecimalsAdjustment(1, 100, 0))
          .to.be.revertedWithCustomError(decimalsLib, "DecimalsTooLarge")
          .withArgs(100);
      });
    });
  });
});
