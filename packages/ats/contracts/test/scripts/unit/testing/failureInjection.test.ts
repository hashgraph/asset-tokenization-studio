// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for failure injection utilities.
 *
 * Tests the parsing and evaluation functions for checkpoint testing
 * failure injection via environment variables.
 *
 * @module test/scripts/unit/testing/failureInjection.test
 */

import { expect } from "chai";
import {
  parseFailureConfig,
  resetFailureConfig,
  shouldFailAtStep,
  shouldFailAtFacet,
  createTestFailureMessage,
  isTestFailureError,
  CHECKPOINT_TEST_FAIL_AT_ENV,
  LEGACY_FAIL_AT_FACET_ENV,
  SUPPORTED_STEPS,
} from "@scripts/infrastructure";

describe("Failure Injection Utilities", () => {
  // Helper to set environment variables
  const setEnv = (key: string, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  };

  // Ensure clean state before each test (prevents stale cache from other test files)
  beforeEach(() => {
    resetFailureConfig();
  });

  // Restore environment after each test
  afterEach(() => {
    delete process.env[CHECKPOINT_TEST_FAIL_AT_ENV];
    delete process.env[LEGACY_FAIL_AT_FACET_ENV];
    resetFailureConfig();
  });

  // Restore all env vars after all tests
  after(() => {
    delete process.env[CHECKPOINT_TEST_FAIL_AT_ENV];
    delete process.env[LEGACY_FAIL_AT_FACET_ENV];
    resetFailureConfig();
  });

  // ============================================================================
  // parseFailureConfig Tests
  // ============================================================================

  describe("parseFailureConfig", () => {
    describe("new unified format (CHECKPOINT_TEST_FAIL_AT)", () => {
      it("should parse facet:N format (numeric target)", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:50");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal(50);
      });

      it("should parse facet:0 format (zero index)", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:0");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal(0);
      });

      it("should parse facet:FacetName format (string target)", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:ERC20Facet");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal("ERC20Facet");
      });

      it("should parse step:stepName format", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "step:blr");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("step");
        expect(config!.target).to.equal("blr");
      });

      it("should return null for invalid format (no colon)", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet50");

        const config = parseFailureConfig();

        expect(config).to.be.null;
      });

      it("should return null for unknown type", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "unknown:value");

        const config = parseFailureConfig();

        expect(config).to.be.null;
      });

      it("should return null when env var is not set", () => {
        const config = parseFailureConfig();

        expect(config).to.be.null;
      });

      it("should handle facet name with colons", () => {
        // Edge case: facet name contains a colon
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:SomeFacet:WithColon");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal("SomeFacet:WithColon");
      });
    });

    describe("legacy format (FAIL_AT_FACET)", () => {
      it("should parse numeric value from legacy env var", () => {
        setEnv(LEGACY_FAIL_AT_FACET_ENV, "10");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal(10);
      });

      it("should return null for non-numeric legacy value", () => {
        setEnv(LEGACY_FAIL_AT_FACET_ENV, "not-a-number");

        const config = parseFailureConfig();

        expect(config).to.be.null;
      });

      it("should prioritize new format over legacy", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:100");
        setEnv(LEGACY_FAIL_AT_FACET_ENV, "10");

        const config = parseFailureConfig();

        expect(config).to.not.be.null;
        expect(config!.type).to.equal("facet");
        expect(config!.target).to.equal(100); // New format value, not legacy
      });
    });
  });

  // ============================================================================
  // shouldFailAtStep Tests
  // ============================================================================

  describe("shouldFailAtStep", () => {
    it("should return true for matching step name", () => {
      setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "step:equity");

      const result = shouldFailAtStep("equity");

      expect(result).to.be.true;
    });

    it("should return false for non-matching step name", () => {
      setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "step:equity");

      const result = shouldFailAtStep("bond");

      expect(result).to.be.false;
    });

    it("should return false when config is for facet type", () => {
      setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:50");

      const result = shouldFailAtStep("equity");

      expect(result).to.be.false;
    });

    it("should return false when no env var is set", () => {
      const result = shouldFailAtStep("equity");

      expect(result).to.be.false;
    });

    it("should work for all supported steps", () => {
      for (const step of SUPPORTED_STEPS) {
        resetFailureConfig();
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, `step:${step}`);
        expect(shouldFailAtStep(step), `Should match step: ${step}`).to.be.true;
      }
    });
  });

  // ============================================================================
  // shouldFailAtFacet Tests
  // ============================================================================

  describe("shouldFailAtFacet", () => {
    describe("numeric target (facet count)", () => {
      it("should return true when deployed count matches target", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:5");

        const result = shouldFailAtFacet(5, "SomeFacet");

        expect(result).to.be.true;
      });

      it("should return false when deployed count does not match", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:5");

        const result = shouldFailAtFacet(4, "SomeFacet");

        expect(result).to.be.false;
      });

      it("should return false when deployed count exceeds target", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:5");

        const result = shouldFailAtFacet(6, "SomeFacet");

        expect(result).to.be.false;
      });

      it("should work with zero target", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:0");

        // Deployed 0 facets (about to deploy first one)
        const result = shouldFailAtFacet(0, "FirstFacet");

        expect(result).to.be.true;
      });
    });

    describe("string target (facet name)", () => {
      it("should return true when facet name matches target", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:ERC20Facet");

        const result = shouldFailAtFacet(10, "ERC20Facet");

        expect(result).to.be.true;
      });

      it("should return false when facet name does not match", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:ERC20Facet");

        const result = shouldFailAtFacet(10, "PauseFacet");

        expect(result).to.be.false;
      });

      it("should be case-sensitive", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "facet:ERC20Facet");

        const result = shouldFailAtFacet(10, "erc20facet");

        expect(result).to.be.false;
      });
    });

    describe("other configurations", () => {
      it("should return false when config is for step type", () => {
        setEnv(CHECKPOINT_TEST_FAIL_AT_ENV, "step:equity");

        const result = shouldFailAtFacet(5, "SomeFacet");

        expect(result).to.be.false;
      });

      it("should return false when no env var is set", () => {
        const result = shouldFailAtFacet(5, "SomeFacet");

        expect(result).to.be.false;
      });
    });
  });

  // ============================================================================
  // createTestFailureMessage Tests
  // ============================================================================

  describe("createTestFailureMessage", () => {
    it("should create message for numeric facet target", () => {
      const message = createTestFailureMessage("facet", 50, "SomeFacet");

      expect(message).to.include("[TEST]");
      expect(message).to.include("facet #50");
      expect(message).to.include("SomeFacet");
      expect(message).to.include("checkpoint testing");
    });

    it("should create message for string facet target", () => {
      const message = createTestFailureMessage("facet", "ERC20Facet");

      expect(message).to.include("[TEST]");
      expect(message).to.include("ERC20Facet");
      expect(message).to.include("checkpoint testing");
    });

    it("should create message for step target", () => {
      const message = createTestFailureMessage("step", "equity");

      expect(message).to.include("[TEST]");
      expect(message).to.include("equity step");
      expect(message).to.include("checkpoint testing");
    });

    it("should work without context", () => {
      const message = createTestFailureMessage("facet", 10);

      expect(message).to.include("[TEST]");
      expect(message).to.include("facet #10");
      expect(message).not.to.include("(");
    });
  });

  // ============================================================================
  // isTestFailureError Tests
  // ============================================================================

  describe("isTestFailureError", () => {
    it("should return true for test failure messages", () => {
      const message = createTestFailureMessage("facet", 50, "SomeFacet");

      const result = isTestFailureError(message);

      expect(result).to.be.true;
    });

    it("should return true for any [TEST] prefixed message", () => {
      const result = isTestFailureError("[TEST] Intentional failure");

      expect(result).to.be.true;
    });

    it("should return false for regular error messages", () => {
      const result = isTestFailureError("Deployment failed: out of gas");

      expect(result).to.be.false;
    });

    it("should return false for empty string", () => {
      const result = isTestFailureError("");

      expect(result).to.be.false;
    });

    it("should return false for [TEST] not at start", () => {
      const result = isTestFailureError("Error: [TEST] Intentional failure");

      expect(result).to.be.false;
    });
  });

  // ============================================================================
  // SUPPORTED_STEPS Constant Tests
  // ============================================================================

  describe("SUPPORTED_STEPS", () => {
    it("should contain all workflow steps", () => {
      const expectedSteps = [
        "proxyAdmin",
        "blr",
        "facets",
        "register",
        "equity",
        "bond",
        "bondFixedRate",
        "bondKpiLinkedRate",
        "bondSustainabilityPerformanceTargetRate",
        "factory",
      ];

      expect(SUPPORTED_STEPS).to.deep.equal(expectedSteps);
    });

    it("should be a readonly array", () => {
      // TypeScript enforces this at compile time, but we can check length
      expect(SUPPORTED_STEPS).to.have.length(10);
    });
  });
});
