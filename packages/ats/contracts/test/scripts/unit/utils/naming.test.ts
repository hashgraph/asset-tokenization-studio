// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for naming utilities.
 *
 * Tests contract name resolution, TimeTravel variant handling,
 * and naming convention utilities.
 *
 * @module test/scripts/unit/utils/naming.test
 */

import { expect } from "chai";
import {
  getTimeTravelVariant,
  hasTimeTravelVariant,
  resolveContractName,
  getBaseContractName,
  isTimeTravelVariant,
} from "@scripts/infrastructure";
import { TEST_STANDARD_CONTRACTS, TEST_TIME_TRAVEL_VARIANTS, TEST_INVALID_INPUTS } from "@test";

describe("Naming Utilities", () => {
  // ============================================================================
  // getTimeTravelVariant Tests
  // ============================================================================

  describe("getTimeTravelVariant", () => {
    it("should append TimeTravel suffix to facet name", () => {
      const result = getTimeTravelVariant(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      expect(result).to.equal(TEST_TIME_TRAVEL_VARIANTS.ACCESS_CONTROL);
    });

    it("should append TimeTravel suffix to any contract name", () => {
      const result = getTimeTravelVariant(TEST_STANDARD_CONTRACTS.PROXY_ADMIN);
      expect(result).to.equal(`${TEST_STANDARD_CONTRACTS.PROXY_ADMIN}${TEST_TIME_TRAVEL_VARIANTS.SUFFIX}`);
    });

    it("should handle empty string", () => {
      const result = getTimeTravelVariant(TEST_INVALID_INPUTS.EMPTY);
      expect(result).to.equal(TEST_TIME_TRAVEL_VARIANTS.SUFFIX);
    });

    it("should handle name already ending with TimeTravel", () => {
      const result = getTimeTravelVariant(`Test${TEST_TIME_TRAVEL_VARIANTS.SUFFIX}`);
      expect(result).to.equal(`Test${TEST_TIME_TRAVEL_VARIANTS.SUFFIX}${TEST_TIME_TRAVEL_VARIANTS.SUFFIX}`);
    });
  });

  // ============================================================================
  // hasTimeTravelVariant Tests
  // ============================================================================

  describe("hasTimeTravelVariant", () => {
    it("should return true for standard facet names", () => {
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET)).to.be.true;
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.PAUSE_FACET)).to.be.true;
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.KYC_FACET)).to.be.true;
    });

    it("should return false for TimeTravelFacet (invariant)", () => {
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET)).to.be.false;
    });

    it("should return false for infrastructure contracts", () => {
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.PROXY_ADMIN)).to.be.false;
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.TRANSPARENT_PROXY)).to.be.false;
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.BLR)).to.be.false;
    });

    it("should return false for contracts not ending with Facet", () => {
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.FACET_REGISTRY)).to.be.false;
      expect(hasTimeTravelVariant(TEST_STANDARD_CONTRACTS.MY_FACET_CONTRACT)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(hasTimeTravelVariant(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should be case sensitive", () => {
      expect(hasTimeTravelVariant("AccessControlFACET")).to.be.false;
      expect(hasTimeTravelVariant("accesscontrolfacet")).to.be.false;
    });
  });

  // ============================================================================
  // resolveContractName Tests
  // ============================================================================

  describe("resolveContractName", () => {
    describe("when useTimeTravel is false", () => {
      it("should return original name for facets", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET, false);
        expect(result).to.equal(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      });

      it("should return original name for infrastructure", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.PROXY_ADMIN, false);
        expect(result).to.equal(TEST_STANDARD_CONTRACTS.PROXY_ADMIN);
      });
    });

    describe("when useTimeTravel is true", () => {
      it("should return TimeTravel variant for facets", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET, true);
        expect(result).to.equal(TEST_TIME_TRAVEL_VARIANTS.ACCESS_CONTROL);
      });

      it("should return original name for infrastructure (no TimeTravel variant)", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.PROXY_ADMIN, true);
        expect(result).to.equal(TEST_STANDARD_CONTRACTS.PROXY_ADMIN);
      });

      it("should return original name for TimeTravelFacet (invariant)", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET, true);
        expect(result).to.equal(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET);
      });
    });

    describe("when useTimeTravel is not provided (default)", () => {
      it("should default to false and return original name", () => {
        const result = resolveContractName(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
        expect(result).to.equal(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      });
    });
  });

  // ============================================================================
  // getBaseContractName Tests
  // ============================================================================

  describe("getBaseContractName", () => {
    it("should strip TimeTravel suffix from variant name", () => {
      const result = getBaseContractName(TEST_TIME_TRAVEL_VARIANTS.ACCESS_CONTROL);
      expect(result).to.equal(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
    });

    it("should return original name if no TimeTravel suffix", () => {
      const result = getBaseContractName(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      expect(result).to.equal(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
    });

    it("should handle infrastructure contracts", () => {
      const result = getBaseContractName(TEST_STANDARD_CONTRACTS.PROXY_ADMIN);
      expect(result).to.equal(TEST_STANDARD_CONTRACTS.PROXY_ADMIN);
    });

    it("should handle empty string", () => {
      const result = getBaseContractName(TEST_INVALID_INPUTS.EMPTY);
      expect(result).to.equal(TEST_INVALID_INPUTS.EMPTY);
    });

    it("should only strip suffix from end", () => {
      const result = getBaseContractName(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET);
      expect(result).to.equal(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET);
    });

    it("should handle TimeTravel appearing in middle of name", () => {
      const result = getBaseContractName("MyTimeTravelHandler");
      expect(result).to.equal("MyTimeTravelHandler");
    });
  });

  // ============================================================================
  // isTimeTravelVariant Tests
  // ============================================================================

  describe("isTimeTravelVariant", () => {
    it("should return true for TimeTravel variant names", () => {
      expect(isTimeTravelVariant(TEST_TIME_TRAVEL_VARIANTS.ACCESS_CONTROL)).to.be.true;
      expect(isTimeTravelVariant(TEST_TIME_TRAVEL_VARIANTS.PAUSE)).to.be.true;
    });

    it("should return false for base contract names", () => {
      expect(isTimeTravelVariant(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET)).to.be.false;
      expect(isTimeTravelVariant(TEST_STANDARD_CONTRACTS.PROXY_ADMIN)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isTimeTravelVariant(TEST_INVALID_INPUTS.EMPTY)).to.be.false;
    });

    it("should return true for just TimeTravel", () => {
      expect(isTimeTravelVariant(TEST_TIME_TRAVEL_VARIANTS.SUFFIX)).to.be.true;
    });

    it("should be case sensitive", () => {
      expect(isTimeTravelVariant("AccessControlFacetTIMETRAVEL")).to.be.false;
      expect(isTimeTravelVariant("AccessControlFacettimetravel")).to.be.false;
    });
  });
});
