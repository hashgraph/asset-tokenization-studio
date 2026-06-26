// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `atsRegistry.generated.ts` factory functions.
 *
 * @remarks
 * Exercises the generated facet/contract factory accessors and registry
 * structure by dynamically instantiating every deployable facet factory.
 *
 * @module test/scripts/unit/domain/atsRegistry.generated.test
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
  getFacetRegistryCount,
  getStorageWrapperDefinition,
  getAllStorageWrappers,
  hasStorageWrapper,
  getStorageWrapperRegistryCount,
  atsRegistry,
  isLibraryDependentFacet,
  hasOrchestratorLibraryAddresses,
  setOrchestratorLibraryAddresses,
  resetOrchestratorLibraryAddresses,
} from "@scripts/domain";

describe("atsRegistry.generated - Factory Functions", () => {
  const facetNames = Object.keys(FACET_REGISTRY);

  // Cache signer to avoid repeated Hardhat network bootstrap (saves ~4+ seconds)
  let signer: Awaited<ReturnType<typeof ethers.getSigners>>[0];

  // Tracks whether THIS suite seeded the placeholder library addresses, so the
  // after-hook only clears state it actually introduced.
  let didSeedLibAddresses = false;

  before(async () => {
    [signer] = await ethers.getSigners();
    // Self-sufficient unit-suite bootstrap: when this file runs in isolation
    // (e.g. `npm test -- test/scripts/unit/...`) no upstream integration fixture
    // has primed the orchestrator-library module state, so factory branches
    // that transitively call `getLibLinks()` revert with "addresses not set".
    // Seed zero-address placeholders — no deployment happens here, the factories
    // are only constructed, never invoked. Guarded so integration runs that
    // already set real addresses are left untouched.
    if (!hasOrchestratorLibraryAddresses()) {
      const zero = ethers.ZeroAddress;
      setOrchestratorLibraryAddresses({
        tokenCoreOps: zero,
        holdOps: zero,
        clearingOps: zero,
        clearingLifecycleOps: zero,
        clearingReadOps: zero,
        clearingProtectedOps: zero,
        scheduledTasksOps: zero,
        scheduledTasksDispatchOps: zero,
      });
      didSeedLibAddresses = true;
    }
  });

  // Reset the module singleton if we seeded it, so a later integration deployment
  // in the same process re-links the real orchestrator libraries rather than
  // inheriting these zero placeholders (which would make token init delegatecall a
  // no-code address and revert). Without this, running the scripts suite on its own
  // poisons upgradeConfigurations' proxy-update deployments.
  after(() => {
    if (didSeedLibAddresses) {
      resetOrchestratorLibraryAddresses();
    }
  });

  // Helper to check if a facet can be safely instantiated without library addresses
  // Library-dependent facets require orchestrator library addresses to be set first
  const canTestFactory = (facetName: string): boolean => {
    return !isLibraryDependentFacet(facetName);
  };

  describe("Normal factory branches (comprehensive)", () => {
    facetNames.forEach((facetName) => {
      const facet = FACET_REGISTRY[facetName as keyof typeof FACET_REGISTRY];

      if (typeof facet.factory === "function" && canTestFactory(facetName)) {
        it(`should create normal factory for ${facetName}`, () => {
          expect(facet).to.not.be.undefined;
          expect(facet.factory).to.be.a("function");

          const normalFactory = facet.factory!(signer);
          expect(normalFactory).to.not.be.undefined;
          expect(normalFactory).to.have.property("deploy");
        });
      }
    });
  });

  describe("Factory availability", () => {
    it("should expose a factory function on every deployable facet", () => {
      const facetWithFactory = facetNames.find((name) => {
        const facet = FACET_REGISTRY[name as keyof typeof FACET_REGISTRY];
        return typeof facet.factory === "function";
      });

      expect(facetWithFactory).to.not.be.undefined;

      const facet = FACET_REGISTRY[facetWithFactory as keyof typeof FACET_REGISTRY];
      expect(facet.factory).to.be.a("function");
      const normalFactory = facet.factory!(signer);
      expect(normalFactory).to.have.property("deploy");
    });
  });

  describe("Registry structure validation", () => {
    it("should have expected number of facets with factory functions", () => {
      const facetsWithFactory = facetNames.filter((name) => {
        const facet = FACET_REGISTRY[name as keyof typeof FACET_REGISTRY];
        return typeof facet.factory === "function";
      });

      // 68 total facets, but library facets and abstract facets don't have deployable factories
      expect(facetsWithFactory.length).to.be.greaterThan(40);
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
      expect(facets.length).to.be.greaterThan(60);
    });

    it("hasFacet should return true for existing facet", () => {
      expect(hasFacet("AccessControlFacet")).to.be.true;
    });

    it("hasFacet should return false for non-existent facet", () => {
      expect(hasFacet("NonExistentFacet")).to.be.false;
    });

    it("getFacetRegistryCount() should match actual count", () => {
      const facets = getAllFacets();
      expect(getFacetRegistryCount()).to.equal(facets.length);
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
      const wrapper = getStorageWrapperDefinition("AccessControlStorageWrapper");
      expect(wrapper).to.not.be.undefined;
      expect(wrapper!.name).to.equal("AccessControlStorageWrapper");
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
      expect(hasStorageWrapper("AccessControlStorageWrapper")).to.be.true;
    });

    it("hasStorageWrapper should return false for non-existent wrapper", () => {
      expect(hasStorageWrapper("NonExistentWrapper")).to.be.false;
    });

    it("getStorageWrapperRegistryCount() should match actual count", () => {
      const wrappers = getAllStorageWrappers();
      expect(getStorageWrapperRegistryCount()).to.equal(wrappers.length);
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
      expect(facets.length).to.be.greaterThan(60);
    });
  });

  describe("ROLES constant", () => {
    it("should have defined roles", () => {
      expect(ROLES).to.be.an("object");
      expect(Object.keys(ROLES).length).to.be.greaterThan(0);
    });

    it("should have ROLE_PAUSER defined", () => {
      expect(ROLES.ROLE_PAUSER).to.not.be.undefined;
      expect(ROLES.ROLE_PAUSER).to.match(/^0x[a-fA-F0-9]{64}$/);
    });
  });

  describe("STORAGE_WRAPPER_REGISTRY constant", () => {
    it("should have defined storage wrappers", () => {
      expect(STORAGE_WRAPPER_REGISTRY).to.be.an("object");
      expect(Object.keys(STORAGE_WRAPPER_REGISTRY).length).to.be.greaterThan(0);
    });
  });
});
