// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for validation utilities.
 *
 * Tests all validation functions in infrastructure/utils/validation.ts
 * including boolean validators and throwing validators.
 *
 * @module test/scripts/unit/utils/validation.test
 */

import { expect } from "chai";
import {
  isValidAddress,
  isValidBytes32,
  isValidContractId,
  validateFacetName,
  validateNetwork,
  validateAddress,
  validateBytes32,
  validateContractId,
  validatePositiveNumber,
  validateNonNegativeInteger,
} from "@scripts/infrastructure";
import {
  TEST_ADDRESSES,
  TEST_CONFIG_IDS,
  TEST_CONTRACT_IDS,
  TEST_INVALID_INPUTS,
  TEST_BYTES32,
  TEST_INVALID_CONTRACT_IDS,
  TEST_VALID_VALUES,
  TEST_NUMBERS,
  TEST_NETWORKS,
} from "@test";

describe("Validation Utilities", () => {
  describe("isValidAddress", () => {
    it("should return true for valid checksummed address", () => {
      expect(isValidAddress(TEST_ADDRESSES.VALID_0)).to.be.true;
    });

    it("should return true for valid lowercase address", () => {
      expect(isValidAddress(TEST_ADDRESSES.VALID_0.toLowerCase())).to.be.true;
    });

    it("should return true for valid uppercase address", () => {
      const upperCase = TEST_ADDRESSES.VALID_0.toUpperCase().replace("0X", "0x");
      expect(isValidAddress(upperCase)).to.be.true;
    });

    it("should return true for zero address", () => {
      expect(isValidAddress(TEST_ADDRESSES.ZERO)).to.be.true;
    });

    it("should return false for invalid address", () => {
      expect(isValidAddress(TEST_ADDRESSES.INVALID)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isValidAddress(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should return true for address without 0x prefix (ethers accepts it)", () => {
      // Note: ethers.utils.isAddress accepts 40-char hex strings without 0x prefix
      const addressWithoutPrefix = TEST_ADDRESSES.VALID_0.slice(2);
      expect(isValidAddress(addressWithoutPrefix)).to.be.true;
    });

    it("should return false for address too short", () => {
      expect(isValidAddress(TEST_BYTES32.TOO_SHORT)).to.be.false;
    });

    it("should return false for address too long", () => {
      const tooLongAddress = TEST_ADDRESSES.VALID_0 + "00";
      expect(isValidAddress(tooLongAddress)).to.be.false;
    });

    it("should return false for non-hex characters", () => {
      const nonHexAddress = "0x" + "G".repeat(40);
      expect(isValidAddress(nonHexAddress)).to.be.false;
    });

    it("should return false for null-like inputs", () => {
      expect(isValidAddress(null as unknown as string)).to.be.false;
      expect(isValidAddress(undefined as unknown as string)).to.be.false;
    });
  });

  describe("isValidBytes32", () => {
    it("should return true for valid bytes32", () => {
      expect(isValidBytes32(TEST_CONFIG_IDS.EQUITY)).to.be.true;
    });

    it("should return true for valid bytes32 with all zeros", () => {
      expect(isValidBytes32(TEST_BYTES32.ALL_ZEROS)).to.be.true;
    });

    it("should return true for valid bytes32 with all f's", () => {
      expect(isValidBytes32(TEST_BYTES32.ALL_FS)).to.be.true;
    });

    it("should return false for value too short", () => {
      expect(isValidBytes32(TEST_BYTES32.TOO_SHORT)).to.be.false;
    });

    it("should return false for value too long", () => {
      expect(isValidBytes32(TEST_BYTES32.TOO_LONG)).to.be.false;
    });

    it("should return false for value without 0x prefix", () => {
      expect(isValidBytes32(TEST_BYTES32.NO_PREFIX)).to.be.false;
    });

    it("should return false for non-hex characters", () => {
      expect(isValidBytes32(TEST_BYTES32.NON_HEX)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isValidBytes32(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should return false for non-string inputs", () => {
      expect(isValidBytes32(TEST_NUMBERS.LARGE_POSITIVE_INT as unknown as string)).to.be.false;
      expect(isValidBytes32(null as unknown as string)).to.be.false;
      expect(isValidBytes32(undefined as unknown as string)).to.be.false;
      expect(isValidBytes32({} as unknown as string)).to.be.false;
    });
  });

  describe("isValidContractId", () => {
    it("should return true for valid contract ID", () => {
      expect(isValidContractId(TEST_CONTRACT_IDS.SAMPLE_0)).to.be.true;
    });

    it("should return true for mainnet contract ID", () => {
      expect(isValidContractId(TEST_VALID_VALUES.CONTRACT_ID_MAINNET)).to.be.true;
    });

    it("should return true for large contract number", () => {
      expect(isValidContractId(TEST_VALID_VALUES.CONTRACT_ID_LARGE)).to.be.true;
    });

    it("should return true for non-zero shard and realm", () => {
      expect(isValidContractId(TEST_VALID_VALUES.CONTRACT_ID_FULL)).to.be.true;
    });

    it("should return false for missing parts", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.MISSING_PARTS)).to.be.false;
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.SINGLE_NUMBER)).to.be.false;
    });

    it("should return false for too many parts", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.TOO_MANY_PARTS)).to.be.false;
    });

    it("should return false for non-numeric parts", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.NON_NUMERIC)).to.be.false;
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.ALL_NON_NUMERIC)).to.be.false;
    });

    it("should return false for negative numbers", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.NEGATIVE)).to.be.false;
    });

    it("should return false for decimal numbers (too many parts)", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.TOO_MANY_PARTS)).to.be.false;
    });

    it("should return false for leading zeros in parts", () => {
      expect(isValidContractId(TEST_INVALID_CONTRACT_IDS.LEADING_ZEROS)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isValidContractId(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should return false for non-string inputs", () => {
      expect(isValidContractId(TEST_NUMBERS.LARGE_POSITIVE_INT as unknown as string)).to.be.false;
      expect(isValidContractId(null as unknown as string)).to.be.false;
      expect(isValidContractId(undefined as unknown as string)).to.be.false;
    });
  });

  describe("validateFacetName", () => {
    it("should not throw for valid facet name", () => {
      expect(() => validateFacetName(TEST_VALID_VALUES.FACET_NAME)).to.not.throw();
    });

    it("should not throw for simple name", () => {
      expect(() => validateFacetName(TEST_VALID_VALUES.FACET_NAME_SHORT)).to.not.throw();
    });

    it("should throw for empty string", () => {
      expect(() => validateFacetName(TEST_INVALID_INPUTS.EMPTY)).to.throw("Facet name must be a non-empty string");
    });

    it("should throw for whitespace only (as leading/trailing whitespace)", () => {
      // Whitespace-only strings pass the !name check but fail trim check
      expect(() => validateFacetName(TEST_INVALID_INPUTS.WHITESPACE)).to.throw(
        "Facet name cannot have leading/trailing whitespace",
      );
    });

    it("should throw for leading whitespace", () => {
      expect(() => validateFacetName(TEST_INVALID_INPUTS.LEADING_WHITESPACE)).to.throw(
        "Facet name cannot have leading/trailing whitespace",
      );
    });

    it("should throw for trailing whitespace", () => {
      expect(() => validateFacetName(TEST_INVALID_INPUTS.TRAILING_WHITESPACE)).to.throw(
        "Facet name cannot have leading/trailing whitespace",
      );
    });

    it("should throw for non-string inputs", () => {
      expect(() => validateFacetName(null as unknown as string)).to.throw("Facet name must be a non-empty string");
      expect(() => validateFacetName(undefined as unknown as string)).to.throw("Facet name must be a non-empty string");
    });
  });

  describe("validateNetwork", () => {
    it("should not throw for valid network name", () => {
      expect(() => validateNetwork(TEST_NETWORKS.HARDHAT)).to.not.throw();
      expect(() => validateNetwork(TEST_NETWORKS.LOCAL)).to.not.throw();
    });

    it("should not throw for hyphenated network name", () => {
      expect(() => validateNetwork(TEST_NETWORKS.TESTNET)).to.not.throw();
      expect(() => validateNetwork(TEST_NETWORKS.MAINNET)).to.not.throw();
    });

    it("should throw for empty string", () => {
      expect(() => validateNetwork(TEST_INVALID_INPUTS.EMPTY)).to.throw("Network must be a non-empty string");
    });

    it("should throw for whitespace only (as leading/trailing whitespace)", () => {
      // Whitespace-only strings pass the !network check but fail trim check
      expect(() => validateNetwork(TEST_INVALID_INPUTS.WHITESPACE)).to.throw(
        "Network cannot have leading/trailing whitespace",
      );
    });

    it("should throw for leading whitespace", () => {
      expect(() => validateNetwork(TEST_INVALID_INPUTS.LEADING_WHITESPACE)).to.throw(
        "Network cannot have leading/trailing whitespace",
      );
    });

    it("should throw for trailing whitespace", () => {
      expect(() => validateNetwork(TEST_INVALID_INPUTS.TRAILING_WHITESPACE)).to.throw(
        "Network cannot have leading/trailing whitespace",
      );
    });

    it("should throw for non-string inputs", () => {
      expect(() => validateNetwork(null as unknown as string)).to.throw("Network must be a non-empty string");
      expect(() => validateNetwork(undefined as unknown as string)).to.throw("Network must be a non-empty string");
    });
  });

  describe("validateAddress", () => {
    const customFieldName = "proxyAddress";

    it("should not throw for valid address", () => {
      expect(() => validateAddress(TEST_ADDRESSES.VALID_0)).to.not.throw();
    });

    it("should not throw for zero address", () => {
      expect(() => validateAddress(TEST_ADDRESSES.ZERO)).to.not.throw();
    });

    it("should throw for empty address with default field name", () => {
      expect(() => validateAddress(TEST_INVALID_INPUTS.EMPTY)).to.throw("address is required");
    });

    it("should throw for empty address with custom field name", () => {
      expect(() => validateAddress(TEST_INVALID_INPUTS.EMPTY, customFieldName)).to.throw(
        `${customFieldName} is required`,
      );
    });

    it("should throw for invalid address with default field name", () => {
      expect(() => validateAddress(TEST_ADDRESSES.INVALID)).to.throw(`Invalid address: ${TEST_ADDRESSES.INVALID}`);
    });

    it("should throw for invalid address with custom field name", () => {
      expect(() => validateAddress(TEST_ADDRESSES.INVALID, customFieldName)).to.throw(
        `Invalid ${customFieldName}: ${TEST_ADDRESSES.INVALID}`,
      );
    });

    it("should throw for null address", () => {
      expect(() => validateAddress(null as unknown as string)).to.throw("address is required");
    });
  });

  describe("validateBytes32", () => {
    const customFieldName = "configId";

    it("should not throw for valid bytes32", () => {
      expect(() => validateBytes32(TEST_CONFIG_IDS.EQUITY)).to.not.throw();
    });

    it("should throw for empty value with default field name", () => {
      expect(() => validateBytes32(TEST_INVALID_INPUTS.EMPTY)).to.throw("bytes32 value is required");
    });

    it("should throw for empty value with custom field name", () => {
      expect(() => validateBytes32(TEST_INVALID_INPUTS.EMPTY, customFieldName)).to.throw(
        `${customFieldName} is required`,
      );
    });

    it("should throw for invalid bytes32 with default field name", () => {
      expect(() => validateBytes32(TEST_BYTES32.TOO_SHORT)).to.throw(
        "Invalid bytes32 value: must be 66 characters (0x + 64 hex chars)",
      );
    });

    it("should throw for invalid bytes32 with custom field name", () => {
      expect(() => validateBytes32(TEST_BYTES32.TOO_SHORT, customFieldName)).to.throw(
        `Invalid ${customFieldName}: must be 66 characters (0x + 64 hex chars)`,
      );
    });

    it("should throw for null value", () => {
      expect(() => validateBytes32(null as unknown as string)).to.throw("bytes32 value is required");
    });
  });

  describe("validateContractId", () => {
    const customFieldName = "factoryId";

    it("should not throw for valid contract ID", () => {
      expect(() => validateContractId(TEST_CONTRACT_IDS.SAMPLE_0)).to.not.throw();
    });

    it("should throw for empty value with default field name", () => {
      expect(() => validateContractId(TEST_INVALID_INPUTS.EMPTY)).to.throw("contract ID is required");
    });

    it("should throw for empty value with custom field name", () => {
      expect(() => validateContractId(TEST_INVALID_INPUTS.EMPTY, customFieldName)).to.throw(
        `${customFieldName} is required`,
      );
    });

    it("should throw for invalid contract ID with default field name", () => {
      expect(() => validateContractId(TEST_INVALID_INPUTS.INVALID_FORMAT)).to.throw(
        "Invalid contract ID: must be in format 'shard.realm.num' (e.g., '0.0.12345')",
      );
    });

    it("should throw for invalid contract ID with custom field name", () => {
      expect(() => validateContractId(TEST_INVALID_INPUTS.INVALID_FORMAT, customFieldName)).to.throw(
        `Invalid ${customFieldName}: must be in format 'shard.realm.num' (e.g., '0.0.12345')`,
      );
    });

    it("should throw for null value", () => {
      expect(() => validateContractId(null as unknown as string)).to.throw("contract ID is required");
    });
  });

  describe("validatePositiveNumber", () => {
    const customFieldName = "amount";

    it("should not throw for positive integer", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.POSITIVE_INT)).to.not.throw();
      expect(() => validatePositiveNumber(TEST_NUMBERS.LARGE_POSITIVE_INT)).to.not.throw();
    });

    it("should not throw for positive decimal", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.POSITIVE_DECIMAL)).to.not.throw();
      expect(() => validatePositiveNumber(TEST_NUMBERS.POSITIVE_DECIMAL_LARGE)).to.not.throw();
    });

    it("should throw for zero", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.ZERO)).to.throw("value must be positive");
    });

    it("should throw for zero with custom field name", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.ZERO, customFieldName)).to.throw(
        `${customFieldName} must be positive`,
      );
    });

    it("should throw for negative number", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.NEGATIVE_INT)).to.throw("value must be positive");
      expect(() => validatePositiveNumber(TEST_NUMBERS.NEGATIVE_DECIMAL)).to.throw("value must be positive");
    });

    it("should throw for NaN", () => {
      expect(() => validatePositiveNumber(NaN)).to.throw("value must be a number");
    });

    it("should throw for non-number types", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.POSITIVE_INT.toString() as unknown as number)).to.throw(
        "value must be a number",
      );
      expect(() => validatePositiveNumber(null as unknown as number)).to.throw("value must be a number");
      expect(() => validatePositiveNumber(undefined as unknown as number)).to.throw("value must be a number");
    });

    it("should not throw for very large positive number", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.MAX_SAFE_INT)).to.not.throw();
    });

    it("should not throw for very small positive number", () => {
      expect(() => validatePositiveNumber(TEST_NUMBERS.MIN_VALUE)).to.not.throw();
    });
  });

  describe("validateNonNegativeInteger", () => {
    const customFieldName = "count";
    const versionFieldName = "version";

    it("should not throw for zero", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.ZERO)).to.not.throw();
    });

    it("should not throw for positive integer", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.POSITIVE_INT)).to.not.throw();
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.LARGE_POSITIVE_INT)).to.not.throw();
    });

    it("should throw for negative integer", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.NEGATIVE_INT)).to.throw("value cannot be negative");
    });

    it("should throw for negative number with custom field name", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.NEGATIVE_INT, customFieldName)).to.throw(
        `${customFieldName} cannot be negative`,
      );
    });

    it("should throw for decimal number", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.POSITIVE_DECIMAL_LARGE)).to.throw(
        "value must be an integer",
      );
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.POSITIVE_DECIMAL)).to.throw("value must be an integer");
    });

    it("should throw for decimal with custom field name", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.POSITIVE_DECIMAL_LARGE, versionFieldName)).to.throw(
        `${versionFieldName} must be an integer`,
      );
    });

    it("should throw for NaN", () => {
      expect(() => validateNonNegativeInteger(NaN)).to.throw("value must be a number");
    });

    it("should throw for non-number types", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.POSITIVE_INT.toString() as unknown as number)).to.throw(
        "value must be a number",
      );
      expect(() => validateNonNegativeInteger(null as unknown as number)).to.throw("value must be a number");
      expect(() => validateNonNegativeInteger(undefined as unknown as number)).to.throw("value must be a number");
    });

    it("should not throw for large integer", () => {
      expect(() => validateNonNegativeInteger(TEST_NUMBERS.MAX_SAFE_INT)).to.not.throw();
    });
  });
});
