// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for atsRegistry.data.ts factory functions and registry helpers.
 *
 * Tests factory branches for all registered facets and validates registry
 * helper functions for facets, contracts, and storage wrappers.
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
  deployOrchestratorLibraries,
} from "@scripts/domain";
import { TEST_STANDARD_CONTRACTS, TEST_CONTRACT_NAMES, TEST_FACET_NAMES } from "@test";

/**
 * Minimum expected facet count after library-based diamond consolidation.
 * Post-migration registry has ~64 facets (down from ~186 pre-migration).
 */
const MIN_EXPECTED_FACETS = 50;

describe("atsRegistry.data - Factory Functions", () => {
  const facetNames = Object.keys(FACET_REGISTRY);

  // Cache signer to avoid repeated Hardhat network bootstrap (saves ~4+ seconds)
  let signer: Awaited<ReturnType<typeof ethers.getSigners>>[0];

  before(async () => {
    [signer] = await ethers.getSigners();
    await deployOrchestratorLibraries(signer);
  });

  describe("Factory branches (comprehensive)", () => {
    facetNames.forEach((facetName) => {
      const facet = FACET_REGISTRY[facetName as keyof typeof FACET_REGISTRY];

      if (typeof facet.factory === "function") {
        it(`should create factory for ${facetName}`, () => {
          expect(facet).to.not.be.undefined;
          expect(facet.factory).to.be.a("function");

          const factory = facet.factory!(signer);
          expect(factory).to.not.be.undefined;
          expect(factory).to.have.property("deploy");
        });
      }
    });
  });

  describe("Registry structure validation", () => {
    it("should have expected number of facets with factory functions", () => {
      const facetsWithFactory = facetNames.filter((name) => {
        const facet = FACET_REGISTRY[name as keyof typeof FACET_REGISTRY];
        return typeof facet.factory === "function";
      });

      expect(facetsWithFactory.length).to.be.greaterThan(MIN_EXPECTED_FACETS);
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
      const facet = getFacetDefinition(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      expect(facet).to.not.be.undefined;
      expect(facet!.name).to.equal(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      expect(facet!.methods).to.be.an("array");
    });

    it("getFacetDefinition should return undefined for non-existent facet", () => {
      const facet = getFacetDefinition(TEST_FACET_NAMES.NON_EXISTENT);
      expect(facet).to.be.undefined;
    });

    it("getAllFacets should return all facets", () => {
      const facets = getAllFacets();
      expect(facets).to.be.an("array");
      expect(facets.length).to.be.greaterThan(MIN_EXPECTED_FACETS);
    });

    it("hasFacet should return true for existing facet", () => {
      expect(hasFacet(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET)).to.be.true;
    });

    it("hasFacet should return false for non-existent facet", () => {
      expect(hasFacet(TEST_FACET_NAMES.NON_EXISTENT)).to.be.false;
    });

    it("FACET_REGISTRY_COUNT should match actual count", () => {
      const facets = getAllFacets();
      expect(FACET_REGISTRY_COUNT).to.equal(facets.length);
    });
  });

  describe("Contract registry helpers", () => {
    it("getContractDefinition should return a valid contract definition", () => {
      const contract = getContractDefinition(TEST_CONTRACT_NAMES.BLR);
      expect(contract).to.not.be.undefined;
      expect(contract!.name).to.equal(TEST_CONTRACT_NAMES.BLR);
    });

    it("getContractDefinition should return undefined for non-existent contract", () => {
      const contract = getContractDefinition(TEST_CONTRACT_NAMES.NON_EXISTENT);
      expect(contract).to.be.undefined;
    });

    it("getAllContracts should return all contracts", () => {
      const contracts = getAllContracts();
      expect(contracts).to.be.an("array");
      expect(contracts.length).to.be.greaterThan(0);
    });

    it("hasContract should return true for existing contract", () => {
      expect(hasContract(TEST_CONTRACT_NAMES.BLR)).to.be.true;
    });

    it("hasContract should return false for non-existent contract", () => {
      expect(hasContract(TEST_CONTRACT_NAMES.NON_EXISTENT)).to.be.false;
    });
  });

  describe("Storage wrapper registry helpers", () => {
    it("getStorageWrapperDefinition should return undefined (storage wrappers removed in migration)", () => {
      const wrapper = getStorageWrapperDefinition("IAccessControlStorageWrapper");
      expect(wrapper).to.be.undefined;
    });

    it("getStorageWrapperDefinition should return undefined for non-existent wrapper", () => {
      const wrapper = getStorageWrapperDefinition(TEST_FACET_NAMES.NON_EXISTENT);
      expect(wrapper).to.be.undefined;
    });

    it("getAllStorageWrappers should return empty array (storage wrappers removed in migration)", () => {
      const wrappers = getAllStorageWrappers();
      expect(wrappers).to.be.an("array");
      expect(wrappers.length).to.equal(0);
    });

    it("hasStorageWrapper should return false (storage wrappers removed in migration)", () => {
      expect(hasStorageWrapper("IAccessControlStorageWrapper")).to.be.false;
    });

    it("hasStorageWrapper should return false for non-existent wrapper", () => {
      expect(hasStorageWrapper(TEST_FACET_NAMES.NON_EXISTENT)).to.be.false;
    });

    it("STORAGE_WRAPPER_REGISTRY_COUNT should match actual count", () => {
      const wrappers = getAllStorageWrappers();
      expect(STORAGE_WRAPPER_REGISTRY_COUNT).to.equal(wrappers.length);
    });
  });

  describe("atsRegistry provider object", () => {
    it("should have getFacetDefinition method", () => {
      expect(atsRegistry.getFacetDefinition).to.be.a("function");
      const facet = atsRegistry.getFacetDefinition(TEST_STANDARD_CONTRACTS.ACCESS_CONTROL_FACET);
      expect(facet).to.not.be.undefined;
    });

    it("should have getAllFacets method", () => {
      expect(atsRegistry.getAllFacets).to.be.a("function");
      const facets = atsRegistry.getAllFacets();
      expect(facets).to.be.an("array");
      expect(facets.length).to.be.greaterThan(MIN_EXPECTED_FACETS);
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
    it("should be an empty object (storage wrappers removed in migration)", () => {
      expect(STORAGE_WRAPPER_REGISTRY).to.be.an("object");
      expect(Object.keys(STORAGE_WRAPPER_REGISTRY).length).to.equal(0);
    });
  });
});
