// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for facet deployment utilities.
 *
 * Tests pure functions and summary generation that don't require
 * contract deployment interactions.
 *
 * @module test/scripts/unit/operations/facetDeployment.test
 */

import { expect } from "chai";
import { getFacetDeploymentSummary, type DeployFacetsResult, type DeploymentResult } from "@scripts/infrastructure";
import { TEST_ADDRESSES, TEST_TX_HASHES } from "@test";

describe("Facet Deployment Utilities", () => {
  // ============================================================================
  // Test Data Factories
  // ============================================================================

  /**
   * Create a mock deployment result for testing.
   */
  function createMockDeploymentResult(address: string, txHash: string): DeploymentResult {
    return {
      success: true,
      address,
      transactionHash: txHash,
      blockNumber: 12345,
      gasUsed: 1000000,
      contract: { address } as any,
    };
  }

  /**
   * Create a mock facets result with specified deployed, failed, and skipped facets.
   */
  function createFacetsResult(
    deployedNames: string[],
    failedNames: string[] = [],
    skippedNames: string[] = [],
  ): DeployFacetsResult {
    const deployed = new Map<string, DeploymentResult>();
    const failed = new Map<string, string>();
    const skipped = new Map<string, string>();

    deployedNames.forEach((name, i) => {
      const addressKey = `VALID_${i % 7}` as keyof typeof TEST_ADDRESSES;
      const txKey = `SAMPLE_${i % 9}` as keyof typeof TEST_TX_HASHES;
      deployed.set(name, createMockDeploymentResult(TEST_ADDRESSES[addressKey] as string, TEST_TX_HASHES[txKey]));
    });

    failedNames.forEach((name) => {
      failed.set(name, `Deployment failed for ${name}`);
    });

    skippedNames.forEach((name) => {
      skipped.set(name, `Skipped: already deployed`);
    });

    return {
      success: failed.size === 0,
      deployed,
      failed,
      skipped,
    };
  }

  // ============================================================================
  // getFacetDeploymentSummary Tests
  // ============================================================================

  describe("getFacetDeploymentSummary", () => {
    it("should return correct summary for successful deployments", () => {
      const facetNames = ["AccessControlFacet", "PauseFacet", "KycFacet"];
      const result = createFacetsResult(facetNames);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.deep.equal(facetNames);
      expect(summary.failed).to.deep.equal([]);
      expect(summary.skipped).to.deep.equal([]);
      expect(Object.keys(summary.addresses)).to.have.length(3);
    });

    it("should return correct summary with failed deployments", () => {
      const deployed = ["AccessControlFacet", "PauseFacet"];
      const failed = ["KycFacet", "CapTableFacet"];
      const result = createFacetsResult(deployed, failed);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.deep.equal(deployed);
      expect(summary.failed).to.deep.equal(failed);
      expect(summary.skipped).to.deep.equal([]);
      expect(Object.keys(summary.addresses)).to.have.length(2);
    });

    it("should return correct summary with skipped deployments", () => {
      const deployed = ["AccessControlFacet"];
      const failed: string[] = [];
      const skipped = ["PauseFacet", "KycFacet"];
      const result = createFacetsResult(deployed, failed, skipped);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.deep.equal(deployed);
      expect(summary.failed).to.deep.equal([]);
      expect(summary.skipped).to.deep.equal(skipped);
      expect(Object.keys(summary.addresses)).to.have.length(1);
    });

    it("should return correct summary with mixed results", () => {
      const deployed = ["AccessControlFacet", "PauseFacet"];
      const failed = ["KycFacet"];
      const skipped = ["CapTableFacet"];
      const result = createFacetsResult(deployed, failed, skipped);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.deep.equal(deployed);
      expect(summary.failed).to.deep.equal(failed);
      expect(summary.skipped).to.deep.equal(skipped);
    });

    it("should return empty arrays for no deployments", () => {
      const result = createFacetsResult([]);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.deep.equal([]);
      expect(summary.failed).to.deep.equal([]);
      expect(summary.skipped).to.deep.equal([]);
      expect(summary.addresses).to.deep.equal({});
    });

    it("should build addresses map from deployed facets", () => {
      const facetNames = ["FacetA", "FacetB", "FacetC"];
      const result = createFacetsResult(facetNames);

      const summary = getFacetDeploymentSummary(result);

      facetNames.forEach((name) => {
        expect(summary.addresses[name]).to.exist;
        expect(summary.addresses[name]).to.include("0x");
      });
    });

    it("should filter out facets without addresses in addresses map", () => {
      const result = createFacetsResult(["TestFacet"]);

      // Manually add a deployed facet without address (edge case)
      result.deployed.set("NoAddressFacet", {
        success: true,
        // No address field
        transactionHash: TEST_TX_HASHES.SAMPLE_0,
        blockNumber: 12345,
      } as DeploymentResult);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.include("TestFacet");
      expect(summary.deployed).to.include("NoAddressFacet");
      // Addresses map should only include facets with addresses
      expect(summary.addresses["TestFacet"]).to.exist;
      expect(summary.addresses["NoAddressFacet"]).to.be.undefined;
    });

    it("should handle large number of facets", () => {
      const facetNames = Array.from({ length: 50 }, (_, i) => `Facet${i}`);
      const result = createFacetsResult(facetNames);

      const summary = getFacetDeploymentSummary(result);

      expect(summary.deployed).to.have.length(50);
      expect(Object.keys(summary.addresses)).to.have.length(50);
    });

    it("should preserve facet name order from Map iteration", () => {
      const facetNames = ["ZFacet", "AFacet", "MFacet"];
      const result = createFacetsResult(facetNames);

      const summary = getFacetDeploymentSummary(result);

      // Maps preserve insertion order in JavaScript
      expect(summary.deployed).to.deep.equal(facetNames);
    });
  });
});
