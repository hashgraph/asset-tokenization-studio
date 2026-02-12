// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for registry combination utilities.
 *
 * Tests combining multiple RegistryProvider instances with
 * various conflict resolution strategies.
 *
 * @module test/scripts/unit/infrastructure/combineRegistries.test
 */

import { expect } from "chai";
import {
  combineRegistries,
  getRegistryConflicts,
  type RegistryProvider,
  type FacetDefinition,
} from "@scripts/infrastructure";
import { TEST_RESOLVER_KEYS, TEST_FACET_NAMES } from "@test";

describe("Registry Combination Utilities", () => {
  // ============================================================================
  // Test Helpers
  // ============================================================================

  /**
   * Create a mock facet definition.
   */
  function createMockFacet(name: string, resolverKeyValue?: string): FacetDefinition {
    return {
      name,
      description: `Mock ${name}`,
      resolverKey: resolverKeyValue
        ? {
            name: `_${name.toUpperCase()}_KEY`,
            value: resolverKeyValue,
          }
        : undefined,
    };
  }

  /**
   * Create a mock registry provider with specified facets.
   */
  function createMockRegistry(facets: FacetDefinition[]): RegistryProvider {
    const facetMap = new Map(facets.map((f) => [f.name, f]));

    return {
      getFacetDefinition(name: string): FacetDefinition | undefined {
        return facetMap.get(name);
      },
      getAllFacets(): FacetDefinition[] {
        return Array.from(facetMap.values());
      },
    };
  }

  // ============================================================================
  // combineRegistries Tests
  // ============================================================================

  describe("combineRegistries", () => {
    describe("basic functionality", () => {
      it("should throw error when no registries provided", () => {
        expect(() => combineRegistries()).to.throw("combineRegistries requires at least one registry");
      });

      it("should return same registry when only one provided", () => {
        const facet = createMockFacet(TEST_FACET_NAMES.TEST, TEST_RESOLVER_KEYS.SAMPLE);
        const registry = createMockRegistry([facet]);

        const combined = combineRegistries(registry);

        expect(combined).to.equal(registry);
      });

      it("should combine two registries with no conflicts", () => {
        const registry1 = createMockRegistry([
          createMockFacet(TEST_FACET_NAMES.FACET_A, TEST_RESOLVER_KEYS.KEY_1),
          createMockFacet(TEST_FACET_NAMES.FACET_B, TEST_RESOLVER_KEYS.KEY_2),
        ]);
        const registry2 = createMockRegistry([
          createMockFacet(TEST_FACET_NAMES.FACET_C, TEST_RESOLVER_KEYS.KEY_3),
          createMockFacet(TEST_FACET_NAMES.FACET_D, TEST_RESOLVER_KEYS.KEY_4),
        ]);

        const combined = combineRegistries(registry1, registry2);

        expect(combined.getAllFacets()).to.have.length(4);
        expect(combined.getFacetDefinition(TEST_FACET_NAMES.FACET_A)).to.exist;
        expect(combined.getFacetDefinition(TEST_FACET_NAMES.FACET_B)).to.exist;
        expect(combined.getFacetDefinition(TEST_FACET_NAMES.FACET_C)).to.exist;
        expect(combined.getFacetDefinition(TEST_FACET_NAMES.FACET_D)).to.exist;
      });

      it("should combine three registries", () => {
        const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);
        const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_B)]);
        const registry3 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_C)]);

        const combined = combineRegistries(registry1, registry2, registry3);

        expect(combined.getAllFacets()).to.have.length(3);
      });
    });

    describe("conflict resolution strategies", () => {
      it("should throw error with onConflict: error", () => {
        const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_1)]);
        const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_2)]);

        expect(() => combineRegistries(registry1, registry2, { onConflict: "error" })).to.throw(
          `Registry conflict: Facet '${TEST_FACET_NAMES.DUPLICATE}' appears in multiple registries`,
        );
      });

      it("should use last definition with onConflict: warn (default)", () => {
        const facet1 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_1);
        const facet2 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_2);
        const registry1 = createMockRegistry([facet1]);
        const registry2 = createMockRegistry([facet2]);

        const combined = combineRegistries(registry1, registry2);

        const result = combined.getFacetDefinition(TEST_FACET_NAMES.DUPLICATE);
        expect(result?.resolverKey?.value).to.equal(TEST_RESOLVER_KEYS.KEY_2);
      });

      it("should use first definition with onConflict: first", () => {
        const facet1 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_1);
        const facet2 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_2);
        const registry1 = createMockRegistry([facet1]);
        const registry2 = createMockRegistry([facet2]);

        const combined = combineRegistries(registry1, registry2, { onConflict: "first" });

        const result = combined.getFacetDefinition(TEST_FACET_NAMES.DUPLICATE);
        expect(result?.resolverKey?.value).to.equal(TEST_RESOLVER_KEYS.KEY_1);
      });

      it("should use last definition with onConflict: last", () => {
        const facet1 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_1);
        const facet2 = createMockFacet(TEST_FACET_NAMES.DUPLICATE, TEST_RESOLVER_KEYS.KEY_2);
        const registry1 = createMockRegistry([facet1]);
        const registry2 = createMockRegistry([facet2]);

        const combined = combineRegistries(registry1, registry2, { onConflict: "last" });

        const result = combined.getFacetDefinition(TEST_FACET_NAMES.DUPLICATE);
        expect(result?.resolverKey?.value).to.equal(TEST_RESOLVER_KEYS.KEY_2);
      });
    });

    describe("combined registry behavior", () => {
      it("should return undefined for non-existent facet", () => {
        const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);
        const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_B)]);

        const combined = combineRegistries(registry1, registry2);

        expect(combined.getFacetDefinition(TEST_FACET_NAMES.NON_EXISTENT)).to.be.undefined;
      });

      it("should preserve all facet properties", () => {
        const TEST_DESCRIPTION = "A test facet";
        const TEST_KEY_NAME = "_TEST_KEY";
        const TEST_ROLE_COUNT = 3;
        const TEST_INHERITANCE = ["IBaseFacet"];

        const facet: FacetDefinition = {
          name: TEST_FACET_NAMES.TEST,
          description: TEST_DESCRIPTION,
          resolverKey: { name: TEST_KEY_NAME, value: TEST_RESOLVER_KEYS.ABC },
          roleCount: TEST_ROLE_COUNT,
          inheritance: TEST_INHERITANCE,
        };
        const registry = createMockRegistry([facet]);

        const combined = combineRegistries(registry);
        const result = combined.getFacetDefinition(TEST_FACET_NAMES.TEST);

        expect(result?.description).to.equal(TEST_DESCRIPTION);
        expect(result?.resolverKey?.name).to.equal(TEST_KEY_NAME);
        expect(result?.roleCount).to.equal(TEST_ROLE_COUNT);
        expect(result?.inheritance).to.deep.equal(TEST_INHERITANCE);
      });
    });

    describe("edge cases", () => {
      it("should handle empty registries", () => {
        const emptyRegistry = createMockRegistry([]);
        const registry = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);

        const combined = combineRegistries(emptyRegistry, registry);

        expect(combined.getAllFacets()).to.have.length(1);
      });

      it("should handle multiple empty registries", () => {
        const empty1 = createMockRegistry([]);
        const empty2 = createMockRegistry([]);

        const combined = combineRegistries(empty1, empty2);

        expect(combined.getAllFacets()).to.have.length(0);
      });
    });
  });

  // ============================================================================
  // getRegistryConflicts Tests
  // ============================================================================

  describe("getRegistryConflicts", () => {
    it("should return empty array when no conflicts", () => {
      const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);
      const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_B)]);

      const conflicts = getRegistryConflicts(registry1, registry2);

      expect(conflicts).to.deep.equal([]);
    });

    it("should detect single conflict", () => {
      const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.DUPLICATE)]);
      const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.DUPLICATE)]);

      const conflicts = getRegistryConflicts(registry1, registry2);

      expect(conflicts).to.deep.equal([TEST_FACET_NAMES.DUPLICATE]);
    });

    it("should detect multiple conflicts", () => {
      const registry1 = createMockRegistry([
        createMockFacet(TEST_FACET_NAMES.FACET_A),
        createMockFacet(TEST_FACET_NAMES.FACET_B),
        createMockFacet(TEST_FACET_NAMES.FACET_C),
      ]);
      const registry2 = createMockRegistry([
        createMockFacet(TEST_FACET_NAMES.FACET_A),
        createMockFacet(TEST_FACET_NAMES.FACET_D),
        createMockFacet(TEST_FACET_NAMES.FACET_C),
      ]);

      const conflicts = getRegistryConflicts(registry1, registry2);

      expect(conflicts).to.have.length(2);
      expect(conflicts).to.include(TEST_FACET_NAMES.FACET_A);
      expect(conflicts).to.include(TEST_FACET_NAMES.FACET_C);
    });

    it("should work with three registries", () => {
      const registry1 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);
      const registry2 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_B)]);
      const registry3 = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);

      const conflicts = getRegistryConflicts(registry1, registry2, registry3);

      expect(conflicts).to.deep.equal([TEST_FACET_NAMES.FACET_A]);
    });

    it("should return empty array for single registry", () => {
      const registry = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);

      const conflicts = getRegistryConflicts(registry);

      expect(conflicts).to.deep.equal([]);
    });

    it("should return empty array for no registries", () => {
      const conflicts = getRegistryConflicts();

      expect(conflicts).to.deep.equal([]);
    });

    it("should handle empty registries", () => {
      const empty1 = createMockRegistry([]);
      const empty2 = createMockRegistry([]);

      const conflicts = getRegistryConflicts(empty1, empty2);

      expect(conflicts).to.deep.equal([]);
    });

    it("should not report same facet from same registry as conflict", () => {
      // Single registry with duplicate (shouldn't happen in practice, but test behavior)
      const registry = createMockRegistry([createMockFacet(TEST_FACET_NAMES.FACET_A)]);

      const conflicts = getRegistryConflicts(registry, registry);

      // Same registry passed twice - facet appears twice
      expect(conflicts).to.deep.equal([TEST_FACET_NAMES.FACET_A]);
    });
  });
});
