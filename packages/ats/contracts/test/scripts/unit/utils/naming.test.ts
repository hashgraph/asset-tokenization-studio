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

describe("Naming Utilities", () => {
  // ============================================================================
  // getTimeTravelVariant Tests
  // ============================================================================

  describe("getTimeTravelVariant", () => {
    it("should append TimeTravel suffix to facet name", () => {
      const result = getTimeTravelVariant("AccessControlFacet");
      expect(result).to.equal("AccessControlFacetTimeTravel");
    });

    it("should append TimeTravel suffix to any contract name", () => {
      const result = getTimeTravelVariant("ProxyAdmin");
      expect(result).to.equal("ProxyAdminTimeTravel");
    });

    it("should handle empty string", () => {
      const result = getTimeTravelVariant("");
      expect(result).to.equal("TimeTravel");
    });

    it("should handle name already ending with TimeTravel", () => {
      const result = getTimeTravelVariant("TestTimeTravel");
      expect(result).to.equal("TestTimeTravelTimeTravel");
    });
  });

  // ============================================================================
  // hasTimeTravelVariant Tests
  // ============================================================================

  describe("hasTimeTravelVariant", () => {
    it("should return true for standard facet names", () => {
      expect(hasTimeTravelVariant("AccessControlFacet")).to.be.true;
      expect(hasTimeTravelVariant("PauseFacet")).to.be.true;
      expect(hasTimeTravelVariant("KycFacet")).to.be.true;
    });

    it("should return false for TimeTravelFacet (invariant)", () => {
      expect(hasTimeTravelVariant("TimeTravelFacet")).to.be.false;
    });

    it("should return false for infrastructure contracts", () => {
      expect(hasTimeTravelVariant("ProxyAdmin")).to.be.false;
      expect(hasTimeTravelVariant("TransparentUpgradeableProxy")).to.be.false;
      expect(hasTimeTravelVariant("BusinessLogicResolver")).to.be.false;
    });

    it("should return false for contracts not ending with Facet", () => {
      expect(hasTimeTravelVariant("FacetRegistry")).to.be.false;
      expect(hasTimeTravelVariant("MyFacetContract")).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(hasTimeTravelVariant("")).to.be.false;
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
        const result = resolveContractName("AccessControlFacet", false);
        expect(result).to.equal("AccessControlFacet");
      });

      it("should return original name for infrastructure", () => {
        const result = resolveContractName("ProxyAdmin", false);
        expect(result).to.equal("ProxyAdmin");
      });
    });

    describe("when useTimeTravel is true", () => {
      it("should return TimeTravel variant for facets", () => {
        const result = resolveContractName("AccessControlFacet", true);
        expect(result).to.equal("AccessControlFacetTimeTravel");
      });

      it("should return original name for infrastructure (no TimeTravel variant)", () => {
        const result = resolveContractName("ProxyAdmin", true);
        expect(result).to.equal("ProxyAdmin");
      });

      it("should return original name for TimeTravelFacet (invariant)", () => {
        const result = resolveContractName("TimeTravelFacet", true);
        expect(result).to.equal("TimeTravelFacet");
      });
    });

    describe("when useTimeTravel is not provided (default)", () => {
      it("should default to false and return original name", () => {
        const result = resolveContractName("AccessControlFacet");
        expect(result).to.equal("AccessControlFacet");
      });
    });
  });

  // ============================================================================
  // getBaseContractName Tests
  // ============================================================================

  describe("getBaseContractName", () => {
    it("should strip TimeTravel suffix from variant name", () => {
      const result = getBaseContractName("AccessControlFacetTimeTravel");
      expect(result).to.equal("AccessControlFacet");
    });

    it("should return original name if no TimeTravel suffix", () => {
      const result = getBaseContractName("AccessControlFacet");
      expect(result).to.equal("AccessControlFacet");
    });

    it("should handle infrastructure contracts", () => {
      const result = getBaseContractName("ProxyAdmin");
      expect(result).to.equal("ProxyAdmin");
    });

    it("should handle empty string", () => {
      const result = getBaseContractName("");
      expect(result).to.equal("");
    });

    it("should only strip suffix from end", () => {
      const result = getBaseContractName("TimeTravelFacet");
      expect(result).to.equal("TimeTravelFacet");
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
      expect(isTimeTravelVariant("AccessControlFacetTimeTravel")).to.be.true;
      expect(isTimeTravelVariant("PauseFacetTimeTravel")).to.be.true;
    });

    it("should return false for base contract names", () => {
      expect(isTimeTravelVariant("AccessControlFacet")).to.be.false;
      expect(isTimeTravelVariant("ProxyAdmin")).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isTimeTravelVariant("")).to.be.false;
    });

    it("should return true for just TimeTravel", () => {
      expect(isTimeTravelVariant("TimeTravel")).to.be.true;
    });

    it("should be case sensitive", () => {
      expect(isTimeTravelVariant("AccessControlFacetTIMETRAVEL")).to.be.false;
      expect(isTimeTravelVariant("AccessControlFacettimetravel")).to.be.false;
    });
  });
});
