// SPDX-License-Identifier: Apache-2.0

import CheckStrings from "@core/checks/strings/CheckStrings";
import { HederaId } from "@domain/shared/HederaId";

// Mock HederaId so we don't depend on its real implementation
jest.mock("@domain/shared/HederaId", () => ({
  HederaId: {
    from: jest.fn(),
  },
}));

describe("CheckStrings", () => {
  describe("isNotEmpty", () => {
    it("should return false if value is undefined", () => {
      expect(CheckStrings.isNotEmpty(undefined)).toBe(false);
    });

    it("should return false if value is empty string", () => {
      expect(CheckStrings.isNotEmpty("")).toBe(false);
    });

    it("should return true if value is non-empty", () => {
      expect(CheckStrings.isNotEmpty("hello")).toBe(true);
    });
  });

  describe("isLengthUnder", () => {
    it("should return true when length is under max", () => {
      expect(CheckStrings.isLengthUnder("abc", 5)).toBe(true);
    });

    it("should return true when length is equal to max", () => {
      expect(CheckStrings.isLengthUnder("abc", 3)).toBe(true);
    });

    it("should return false when length exceeds max", () => {
      expect(CheckStrings.isLengthUnder("abcdef", 3)).toBe(false);
    });
  });

  describe("isLength", () => {
    it("should return true if length matches exactly", () => {
      expect(CheckStrings.isLength("12345", 5)).toBe(true);
    });

    it("should return false if length does not match", () => {
      expect(CheckStrings.isLength("12345", 3)).toBe(false);
    });
  });

  describe("isLengthBetween", () => {
    it("should return true if within bounds", () => {
      expect(CheckStrings.isLengthBetween("1234", 2, 5)).toBe(true);
    });

    it("should return true if equal to min bound", () => {
      expect(CheckStrings.isLengthBetween("12", 2, 5)).toBe(true);
    });

    it("should return true if equal to max bound", () => {
      expect(CheckStrings.isLengthBetween("12345", 2, 5)).toBe(true);
    });

    it("should return false if shorter than min", () => {
      expect(CheckStrings.isLengthBetween("1", 2, 5)).toBe(false);
    });

    it("should return false if longer than max", () => {
      expect(CheckStrings.isLengthBetween("123456", 2, 5)).toBe(false);
    });
  });

  describe("isAccountId", () => {
    const mockedFrom = HederaId.from as jest.Mock;

    beforeEach(() => {
      mockedFrom.mockReset();
    });

    it("should return true if HederaId.from does not throw", () => {
      mockedFrom.mockReturnValue({}); // simulate success
      expect(CheckStrings.isAccountId("0.0.123")).toBe(true);
      expect(mockedFrom).toHaveBeenCalledWith("0.0.123");
    });

    it("should return false if HederaId.from throws", () => {
      mockedFrom.mockImplementation(() => {
        throw new Error("invalid id");
      });
      expect(CheckStrings.isAccountId("invalid")).toBe(false);
    });
  });
});
