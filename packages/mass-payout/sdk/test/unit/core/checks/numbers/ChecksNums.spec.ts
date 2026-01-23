// SPDX-License-Identifier: Apache-2.0

import CheckNums from "@core/checks/numbers/CheckNums";
import BigDecimal from "@domain/shared/BigDecimal";

describe("CheckNums", () => {
  describe("isWithinRange", () => {
    it("should return true when number is within range", () => {
      expect(CheckNums.isWithinRange(5, 1, 10)).toBe(true);
    });

    it("should return false when number is outside range", () => {
      expect(CheckNums.isWithinRange(15, 1, 10)).toBe(false);
    });

    it("should work with BigDecimal", () => {
      const val = BigDecimal.fromString("5");
      const min = BigDecimal.fromString("1");
      const max = BigDecimal.fromString("10");
      expect(CheckNums.isWithinRange(val, min, max)).toBe(true);
    });
  });

  describe("isLessThan / isGreaterThan", () => {
    it("should correctly compare numbers", () => {
      expect(CheckNums.isLessThan(5, 10)).toBe(true);
      expect(CheckNums.isGreaterThan(15, 10)).toBe(true);
    });

    it("should correctly compare BigDecimals", () => {
      const five = BigDecimal.fromString("5");
      const ten = BigDecimal.fromString("10");
      expect(CheckNums.isLessThan(five, ten)).toBe(true);
      expect(CheckNums.isGreaterThan(ten, five)).toBe(true);
    });
  });

  describe("isLessOrEqualThan / isGreaterOrEqualThan", () => {
    it("should correctly compare numbers with equality", () => {
      expect(CheckNums.isLessOrEqualThan(5, 5)).toBe(true);
      expect(CheckNums.isGreaterOrEqualThan(5, 5)).toBe(true);
    });

    it("should correctly compare BigDecimals with equality", () => {
      const five = BigDecimal.fromString("5");
      expect(CheckNums.isLessOrEqualThan(five, five)).toBe(true);
      expect(CheckNums.isGreaterOrEqualThan(five, five)).toBe(true);
    });
  });

  describe("isBigInt", () => {
    it("should return true for valid bigint strings", () => {
      expect(CheckNums.isBigInt("123")).toBe(true);
    });

    it("should return false for invalid bigint strings", () => {
      expect(CheckNums.isBigInt("not-a-bigint")).toBe(false);
    });
  });

  describe("isBigDecimal", () => {
    it("should return true for BigDecimal instances", () => {
      expect(CheckNums.isBigDecimal(BigDecimal.fromString("123.45"))).toBe(true);
    });

    it("should return true for valid numeric strings", () => {
      expect(CheckNums.isBigDecimal("123.45")).toBe(true);
    });

    it("should return false for invalid strings", () => {
      expect(CheckNums.isBigDecimal("not-a-decimal")).toBe(false);
    });
  });

  describe("hasMoreDecimals", () => {
    it("should return true when string has more decimals than limit", () => {
      expect(CheckNums.hasMoreDecimals("123.4567", 2)).toBe(true);
    });

    it("should return false when within limit", () => {
      expect(CheckNums.hasMoreDecimals("123.45", 3)).toBe(false);
    });

    it("should work with BigDecimal input", () => {
      const bd = BigDecimal.fromString("123.456");
      expect(CheckNums.hasMoreDecimals(bd, 2)).toBe(true);
    });
  });

  describe("isNumber", () => {
    it("should return true for integers", () => {
      expect(CheckNums.isNumber(123)).toBe(true);
    });

    it("should return true for numeric strings", () => {
      expect(CheckNums.isNumber("123")).toBe(true);
    });

    it("should return false for non-numeric strings", () => {
      expect(CheckNums.isNumber("abc")).toBe(false);
    });

    it("should return true for bigint", () => {
      expect(CheckNums.isNumber(123n)).toBe(true);
    });
  });
});
