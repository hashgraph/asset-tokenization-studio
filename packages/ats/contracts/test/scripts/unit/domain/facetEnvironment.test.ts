// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `buildFacetList` — the single composition shell that replaced the
 * per-config TimeTravel-variant branching.
 *
 * @remarks
 * It is load-bearing: every `createConfiguration` module routes its facet list through
 * it, so a regression would silently ship the wrong facet set. In production the list
 * must pass through untouched; in test mode it must swap `DiamondFacet` for
 * `MockDiamondCut` and append the test-only `EvmAccessorsFacet` — and nothing else.
 * The branch is driven by `isTestMode()`, forced here via the `ATS_TEST_MODE` env var.
 *
 * @module test/scripts/unit/domain/facetEnvironment.test
 */

import { expect } from "chai";
import { buildFacetList, EVM_ACCESSORS_FACET_NAME } from "@scripts/domain";

const ENV_KEY = "ATS_TEST_MODE";

// The production facet whose test-mode counterpart is substituted, and that counterpart.
const REPLACED_PROD_FACET = "DiamondFacet";
const REPLACEMENT_TEST_FACET = "MockDiamondCut";

describe("buildFacetList", () => {
  let originalEnv: string | undefined;

  before(() => {
    originalEnv = process.env[ENV_KEY];
  });

  after(() => {
    if (originalEnv === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalEnv;
    }
  });

  describe("production mode", () => {
    beforeEach(() => {
      process.env[ENV_KEY] = "false";
    });

    it("returns the production facet list unchanged — no substitution, no extras", () => {
      const production = ["FacetA", REPLACED_PROD_FACET, "FacetB"];
      expect(buildFacetList(production)).to.deep.equal(["FacetA", REPLACED_PROD_FACET, "FacetB"]);
    });

    it("returns a fresh array rather than the caller's reference", () => {
      const production = ["FacetA"];
      expect(buildFacetList(production)).to.not.equal(production);
    });
  });

  describe("test mode", () => {
    beforeEach(() => {
      process.env[ENV_KEY] = "true";
    });

    it("substitutes the test counterpart and appends the EVM accessor facet, preserving order", () => {
      const production = ["FacetA", REPLACED_PROD_FACET, "FacetB"];
      expect(buildFacetList(production)).to.deep.equal([
        "FacetA",
        REPLACEMENT_TEST_FACET,
        "FacetB",
        EVM_ACCESSORS_FACET_NAME,
      ]);
    });

    it("appends the EVM accessor facet even when there is nothing to substitute", () => {
      expect(buildFacetList(["FacetA", "FacetB"])).to.deep.equal(["FacetA", "FacetB", EVM_ACCESSORS_FACET_NAME]);
    });

    it("leaves non-substituted facets untouched and never double-appends", () => {
      const result = buildFacetList([REPLACED_PROD_FACET]);
      expect(result).to.deep.equal([REPLACEMENT_TEST_FACET, EVM_ACCESSORS_FACET_NAME]);
      expect(result.filter((name) => name === EVM_ACCESSORS_FACET_NAME)).to.have.length(1);
    });
  });
});
