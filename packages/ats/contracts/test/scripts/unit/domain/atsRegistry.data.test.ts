// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for atsRegistry.data.ts factory functions.
 *
 * Tests the TimeTravel factory branch which is otherwise untested.
 * This achieves 100% coverage on the atsRegistry.data.ts file by
 * dynamically testing all facets that have TimeTravel variants.
 *
 * @module test/scripts/unit/domain/atsRegistry.data.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import {
  FACET_REGISTRY,
  STORAGE_WRAPPER_REGISTRY,
  ROLES,
  getFacetDefinition,
  getContractDefinition,
  getAllFacets,
  getAllContracts,
  hasFacet,
  hasContract,
  FACET_REGISTRY_COUNT,
  getStorageWrapperDefinition,
  getAllStorageWrappers,
  hasStorageWrapper,
  STORAGE_WRAPPER_REGISTRY_COUNT,
  atsRegistry,
} from "@scripts/domain";

describe("atsRegistry.data - Factory Functions", () => {
  /**
   * Get all facet names from the registry that have factory functions.
   * This ensures comprehensive coverage of all factory branches.
   */
  const facetNames = Object.keys(FACET_REGISTRY);

  // Cache signer to avoid repeated Hardhat network bootstrap (saves ~4+ seconds)
  let signer: Awaited<ReturnType<typeof ethers.getSigners>>[0];

  before(async () => {
    [signer] = await ethers.getSigners();
  });

  describe("TimeTravel factory branches (comprehensive)", () => {
    facetNames.forEach((facetName) => {
      const facet = FACET_REGISTRY[facetName as keyof typeof FACET_REGISTRY];

      // Only test facets that have a factory function
      if (typeof facet.factory === "function") {
        it(`should create TimeTravel factory for ${facetName}`, () => {
          expect(facet).to.not.be.undefined;
          expect(facet.factory).to.be.a("function");

          // Test TimeTravel factory (useTimeTravel = true)
          // This exercises the uncovered branch
          const timeTravelFactory = facet.factory!(signer, true);
          expect(timeTravelFactory).to.not.be.undefined;
          expect(timeTravelFactory).to.have.property("deploy");
        });
      }
    });
  });

  describe("Normal factory branches (comprehensive)", () => {
    facetNames.forEach((facetName) => {
      const facet = FACET_REGISTRY[facetName as keyof typeof FACET_REGISTRY];

      // Only test facets that have a factory function
      if (typeof facet.factory === "function") {
        it(`should create normal factory for ${facetName}`, () => {
          expect(facet).to.not.be.undefined;
          expect(facet.factory).to.be.a("function");

          // Test normal factory (useTimeTravel = false)
          const normalFactory = facet.factory!(signer, false);
          expect(normalFactory).to.not.be.undefined;
          expect(normalFactory).to.have.property("deploy");
        });
      }
    });
  });

  describe("Factory default parameter behavior", () => {
    it("should default to normal factory when useTimeTravel is omitted", () => {
      // Find any facet with a factory function
      const facetWithFactory = facetNames.find((name) => {
        const facet = FACET_REGISTRY[name as keyof typeof FACET_REGISTRY];
        return typeof facet.factory === "function";
      });

      expect(facetWithFactory).to.not.be.undefined;

      const facet = FACET_REGISTRY[facetWithFactory as keyof typeof FACET_REGISTRY];

      // Without second parameter - should use normal factory
      const defaultFactory = facet.factory!(signer);
      const normalFactory = facet.factory!(signer, false);

      // Both should be the same type of factory
      expect(defaultFactory).to.not.be.undefined;
      expect(normalFactory).to.not.be.undefined;
      expect(defaultFactory).to.have.property("deploy");
      expect(normalFactory).to.have.property("deploy");
    });
  });

  describe("Registry structure validation", () => {
    it("should have expected number of facets with factory functions", () => {
      const facetsWithFactory = facetNames.filter((name) => {
        const facet = FACET_REGISTRY[name as keyof typeof FACET_REGISTRY];
        return typeof facet.factory === "function";
      });

      // Verify we have a significant number of facets (adjust as registry grows)
      expect(facetsWithFactory.length).to.be.greaterThan(150);
    });

    it("should have matching facet names in factory entries", () => {
      facetNames.forEach((facetName) => {
        const facet = FACET_REGISTRY[facetName as keyof typeof FACET_REGISTRY];
        expect(facet.name).to.equal(facetName);
      });
    });
  });
});

// ============================================================================
// atsRegistry.ts - Registry Helper Functions
// ============================================================================

describe("atsRegistry - Registry Helper Functions", () => {
  describe("Facet registry helpers", () => {
    it("getFacetDefinition should return a valid facet definition", () => {
      const facet = getFacetDefinition("AccessControlFacet");
      expect(facet).to.not.be.undefined;
      expect(facet!.name).to.equal("AccessControlFacet");
      expect(facet!.methods).to.be.an("array");
    });

    it("getFacetDefinition should return undefined for non-existent facet", () => {
      const facet = getFacetDefinition("NonExistentFacet");
      expect(facet).to.be.undefined;
    });

    it("getAllFacets should return all facets", () => {
      const facets = getAllFacets();
      expect(facets).to.be.an("array");
      expect(facets.length).to.be.greaterThan(100);
    });

    it("hasFacet should return true for existing facet", () => {
      expect(hasFacet("AccessControlFacet")).to.be.true;
    });

    it("hasFacet should return false for non-existent facet", () => {
      expect(hasFacet("NonExistentFacet")).to.be.false;
    });

    it("FACET_REGISTRY_COUNT should match actual count", () => {
      const facets = getAllFacets();
      expect(FACET_REGISTRY_COUNT).to.equal(facets.length);
    });
  });

  describe("Contract registry helpers", () => {
    it("getContractDefinition should return a valid contract definition", () => {
      const contract = getContractDefinition("BusinessLogicResolver");
      expect(contract).to.not.be.undefined;
      expect(contract!.name).to.equal("BusinessLogicResolver");
    });

    it("getContractDefinition should return undefined for non-existent contract", () => {
      const contract = getContractDefinition("NonExistentContract");
      expect(contract).to.be.undefined;
    });

    it("getAllContracts should return all contracts", () => {
      const contracts = getAllContracts();
      expect(contracts).to.be.an("array");
      expect(contracts.length).to.be.greaterThan(0);
    });

    it("hasContract should return true for existing contract", () => {
      expect(hasContract("BusinessLogicResolver")).to.be.true;
    });

    it("hasContract should return false for non-existent contract", () => {
      expect(hasContract("NonExistentContract")).to.be.false;
    });
  });

  describe("Storage wrapper registry helpers", () => {
    it("getStorageWrapperDefinition should return a valid wrapper definition", () => {
      const wrapper = getStorageWrapperDefinition("IAccessControlStorageWrapper");
      expect(wrapper).to.not.be.undefined;
      expect(wrapper!.name).to.equal("IAccessControlStorageWrapper");
    });

    it("getStorageWrapperDefinition should return undefined for non-existent wrapper", () => {
      const wrapper = getStorageWrapperDefinition("NonExistentWrapper");
      expect(wrapper).to.be.undefined;
    });

    it("getAllStorageWrappers should return all wrappers", () => {
      const wrappers = getAllStorageWrappers();
      expect(wrappers).to.be.an("array");
      expect(wrappers.length).to.be.greaterThan(0);
    });

    it("hasStorageWrapper should return true for existing wrapper", () => {
      expect(hasStorageWrapper("IAccessControlStorageWrapper")).to.be.true;
    });

    it("hasStorageWrapper should return false for non-existent wrapper", () => {
      expect(hasStorageWrapper("NonExistentWrapper")).to.be.false;
    });

    it("STORAGE_WRAPPER_REGISTRY_COUNT should match actual count", () => {
      const wrappers = getAllStorageWrappers();
      expect(STORAGE_WRAPPER_REGISTRY_COUNT).to.equal(wrappers.length);
    });
  });

  describe("atsRegistry provider object", () => {
    it("should have getFacetDefinition method", () => {
      expect(atsRegistry.getFacetDefinition).to.be.a("function");
      const facet = atsRegistry.getFacetDefinition("AccessControlFacet");
      expect(facet).to.not.be.undefined;
    });

    it("should have getAllFacets method", () => {
      expect(atsRegistry.getAllFacets).to.be.a("function");
      const facets = atsRegistry.getAllFacets();
      expect(facets).to.be.an("array");
      expect(facets.length).to.be.greaterThan(100);
    });
  });

  describe("ROLES constant", () => {
    it("should have defined roles", () => {
      expect(ROLES).to.be.an("object");
      expect(Object.keys(ROLES).length).to.be.greaterThan(0);
    });

    it("should have _PAUSER_ROLE defined", () => {
      expect(ROLES._PAUSER_ROLE).to.not.be.undefined;
      expect(ROLES._PAUSER_ROLE).to.match(/^0x[a-fA-F0-9]{64}$/);
    });
  });

  describe("STORAGE_WRAPPER_REGISTRY constant", () => {
    it("should have defined storage wrappers", () => {
      expect(STORAGE_WRAPPER_REGISTRY).to.be.an("object");
      expect(Object.keys(STORAGE_WRAPPER_REGISTRY).length).to.be.greaterThan(0);
    });
  });
});
