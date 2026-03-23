// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for naming utilities.
 *
 * Tests the isTimeTravelFacet utility.
 *
 * @module test/scripts/unit/utils/naming.test
 */

import { expect } from "chai";
import { isTimeTravelFacet } from "@scripts/infrastructure";
import { TEST_STANDARD_CONTRACTS } from "@test";

describe("Naming Utilities", () => {
  describe("isTimeTravelFacet", () => {
    it("should return true only for TimeTravelFacet", () => {
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.TIME_TRAVEL_FACET)).to.be.true;
    });

    it("should return false for regular facets", () => {
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET)).to.be.false;
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.PAUSE_FACET)).to.be.false;
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.KYC_FACET)).to.be.false;
    });

    it("should return false for infrastructure contracts", () => {
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.PROXY_ADMIN)).to.be.false;
      expect(isTimeTravelFacet(TEST_STANDARD_CONTRACTS.BLR)).to.be.false;
    });

    it("should be case sensitive", () => {
      expect(isTimeTravelFacet("TimeTravelFacet")).to.be.true;
      expect(isTimeTravelFacet("TIMETRAVELFACET")).to.be.false;
      expect(isTimeTravelFacet("timetravelfacet")).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isTimeTravelFacet("")).to.be.false;
    });

    it("should return false for TimeTravel suffix on other contracts", () => {
      expect(isTimeTravelFacet("AccessControlFacetTimeTravel")).to.be.false;
      expect(isTimeTravelFacet("KycFacetTimeTravel")).to.be.false;
    });
  });
});
