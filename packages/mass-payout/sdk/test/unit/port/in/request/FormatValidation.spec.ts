// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import { EmptyValue } from "@core/error/EmptyValue";
import { InvalidLength } from "@port/in/request/error/InvalidLength";
import { InvalidRange } from "@port/in/request/error/InvalidRange";
import { InvalidType } from "@port/in/request/error/InvalidType";
import { AccountIdNotValid } from "@domain/account/error/AccountIdNotValid";
import { InvalidFormatHedera as InvalidIdFormatHedera } from "@domain/shared/error/InvalidFormatHedera";
import { InvalidEvmAddress } from "@domain/contract/error/InvalidEvmAddress";
import { InvalidFormatHederaIdOrEvmAddress } from "@domain/shared/error/InvalidFormatHederaIdOrEvmAddress";
import { InvalidBytes32 } from "@port/in/request/error/InvalidBytes32";
import { InvalidBase64 } from "@port/in/request/error/InvalidBase64";
import { InvalidValue } from "@port/in/request/error/InvalidValue";

describe("FormatValidation", () => {
  describe("checkString", () => {
    const validator = FormatValidation.checkString({ min: 2, max: 5 });

    it("should return no errors for valid string", () => {
      expect(validator("abcd")).toEqual([]);
    });

    it("should return InvalidType for non-string", () => {
      const errors = validator(123);
      expect(errors[0]).toBeInstanceOf(InvalidType);
    });

    it("should return EmptyValue for empty string", () => {
      const errors = validator("");
      expect(errors[0]).toBeInstanceOf(EmptyValue);
    });

    it("should return InvalidLength for too short string", () => {
      const errors = validator("a");
      expect(errors[0]).toBeInstanceOf(InvalidLength);
    });
  });

  describe("checkNumber", () => {
    it("should return no errors for number within range", () => {
      const validator = FormatValidation.checkNumber({ min: 1, max: 10 });
      expect(validator(5)).toEqual([]);
    });

    it("should return InvalidType for non-number", () => {
      const validator = FormatValidation.checkNumber({ min: 1 });
      const errors = validator("abc");
      expect(errors[0]).toBeInstanceOf(InvalidType);
    });

    it("should return InvalidRange for out of range", () => {
      const validator = FormatValidation.checkNumber({ min: 5, max: 10 });
      const errors = validator(2);
      expect(errors[0]).toBeInstanceOf(InvalidRange);
    });
  });

  describe("checkHederaIdFormat", () => {
    const validator = FormatValidation.checkHederaIdFormat();

    it("should return no errors for valid Hedera ID", () => {
      expect(validator("0.0.123")).toEqual([]);
    });

    it("should return AccountIdNotValid for 0.0.0", () => {
      const errors = validator("0.0.0");
      expect(errors[0]).toBeInstanceOf(AccountIdNotValid);
    });

    it("should return InvalidIdFormatHedera for invalid ID", () => {
      const errors = validator("abc");
      expect(errors[0]).toBeInstanceOf(InvalidIdFormatHedera);
    });
  });

  describe("checkEvmAddressFormat", () => {
    const validator = FormatValidation.checkEvmAddressFormat();

    it("should return no errors for valid EVM address", () => {
      expect(validator("0x1234567890abcdef1234567890abcdef12345678")).toEqual([]);
    });

    it("should return InvalidEvmAddress for invalid format", () => {
      const errors = validator("0x123");
      expect(errors[0]).toBeInstanceOf(InvalidEvmAddress);
    });
  });

  describe("checkHederaIdFormatOrEvmAddress", () => {
    const validator = FormatValidation.checkHederaIdFormatOrEvmAddress();

    it("should accept valid Hedera ID", () => {
      expect(validator("0.0.456")).toEqual([]);
    });

    it("should accept valid EVM address", () => {
      expect(validator("0x1234567890abcdef1234567890abcdef12345678")).toEqual([]);
    });

    it("should reject invalid input", () => {
      const errors = validator("invalid");
      expect(errors[0]).toBeInstanceOf(InvalidFormatHederaIdOrEvmAddress);
    });
  });

  describe("checkBytes32Format", () => {
    const validator = FormatValidation.checkBytes32Format();

    it("should accept valid bytes32", () => {
      const valid = "0x" + "a".repeat(64);
      expect(validator(valid)).toEqual([]);
    });

    it("should reject invalid bytes32", () => {
      const errors = validator("0x1234");
      expect(errors[0]).toBeInstanceOf(InvalidBytes32);
    });
  });

  describe("checkBase64Format", () => {
    const validator = FormatValidation.checkBase64Format();

    it("should accept valid base64", () => {
      expect(validator("aGVsbG8=")).toEqual([]);
    });

    it("should reject invalid base64", () => {
      const errors = validator("???");
      expect(errors[0]).toBeInstanceOf(InvalidBase64);
    });
  });

  describe("checkHederaIdOrEvmAddressArray", () => {
    it("should return error for empty array when not allowed", () => {
      const errors = FormatValidation.checkHederaIdOrEvmAddressArray([], "accounts");
      expect(errors[0]).toBeInstanceOf(InvalidValue);
    });

    it("should reject duplicated values", () => {
      const values = ["0.0.123", "0.0.123"];
      const errors = FormatValidation.checkHederaIdOrEvmAddressArray(values, "accounts", true);
      expect(errors.some((e) => e instanceof InvalidValue)).toBe(true);
    });
  });
});
