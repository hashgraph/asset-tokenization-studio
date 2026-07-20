// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the validation helpers (validateAddress, validateBytes32).
 *
 * @module test/scripts/unit/utils/validation.test
 */

import { expect } from "chai";
import { validateAddress, validateBytes32 } from "@lib/operations";
import { TEST_ADDRESSES } from "@test";

describe("Validation Utilities", () => {
  describe("validateAddress", () => {
    it("accepts a valid checksummed address", () => {
      expect(() => validateAddress(TEST_ADDRESSES.VALID_0)).to.not.throw();
    });

    it("accepts a valid lowercase address", () => {
      expect(() => validateAddress(TEST_ADDRESSES.VALID_0.toLowerCase())).to.not.throw();
    });

    it("throws for an empty address, labelling the field", () => {
      expect(() => validateAddress("", "BLR address")).to.throw("BLR address is required");
    });

    it("throws for a malformed address, labelling the field", () => {
      expect(() => validateAddress("0xinvalid", "facet address")).to.throw("Invalid facet address: 0xinvalid");
    });

    it("throws for an address with wrong length", () => {
      expect(() => validateAddress("0x1234")).to.throw("Invalid address");
    });
  });

  describe("validateBytes32", () => {
    const VALID_BYTES32 = "0x" + "ab".repeat(32);

    it("accepts a valid bytes32 value", () => {
      expect(() => validateBytes32(VALID_BYTES32)).to.not.throw();
    });

    it("throws for an empty value, labelling the field", () => {
      expect(() => validateBytes32("", "configuration ID")).to.throw("configuration ID is required");
    });

    it("throws for a value without 0x prefix", () => {
      expect(() => validateBytes32("ab".repeat(33))).to.throw("must be 66 characters");
    });

    it("throws for a value with wrong length", () => {
      expect(() => validateBytes32("0x1234")).to.throw("must be 66 characters");
    });

    it("throws for non-hex characters", () => {
      expect(() => validateBytes32("0x" + "zz".repeat(32))).to.throw("must be 66 characters");
    });
  });
});
