// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the shared facet sets and the per-domain configuration lists
 * composed from them.
 *
 * @remarks
 * The `FacetName` type — generated from the registry keys — already guarantees
 * at compile time that every entry is a real, registered facet, so there is no
 * value in re-asserting that at runtime. What the type cannot express is that a
 * `FacetName[]` has no repeats: a facet listed twice (e.g. added to a delta when
 * it already sits in a tier, or shared between two tiers) type-checks but makes
 * the chain revert with `DuplicatedFacetInConfiguration` at deploy time. These
 * tests guard exactly that — duplicates within each list and overlap between the
 * additive tiers.
 *
 * @module test/scripts/unit/domain/facetSets.test
 */

import { expect } from "chai";
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS, BOND_COMMON_FACETS, ALL_ASSET_FACETS } from "@lib/domain";
import { BOND_FACETS, EQUITY_FACETS, DEPOSIT_TOKEN_FACETS, FACTORY_FACETS } from "../../../../lib/domain/facetSets";
import { INITIALIZE_MOCK_FACETS } from "../../../../lib/domain/initializeMock/mockFacetsRegistry";

const hasDuplicates = (list: readonly string[]): boolean => new Set(list).size !== list.length;
const intersect = (a: readonly string[], b: readonly string[]): string[] => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

describe("facetSets", () => {
  describe("tiers", () => {
    const tiers = {
      COMMON_TOKEN_FACETS,
      EXTENDED_TOKEN_FACETS,
      BOND_COMMON_FACETS,
    };

    for (const [name, tier] of Object.entries(tiers)) {
      it(`${name} has no duplicates`, () => {
        expect(hasDuplicates(tier)).to.be.false;
      });
    }

    it("tiers are mutually disjoint", () => {
      expect(intersect(COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS)).to.be.empty;
      expect(intersect(COMMON_TOKEN_FACETS, BOND_COMMON_FACETS)).to.be.empty;
      expect(intersect(EXTENDED_TOKEN_FACETS, BOND_COMMON_FACETS)).to.be.empty;
    });
  });

  describe("composed configuration lists", () => {
    const configurationLists: Record<string, readonly string[]> = {
      BOND_FACETS,
      EQUITY_FACETS,
      DEPOSIT_TOKEN_FACETS,
      FACTORY_FACETS,
      INITIALIZE_MOCK_FACETS,
    };

    for (const [name, list] of Object.entries(configurationLists)) {
      it(`${name} has no duplicates`, () => {
        expect(hasDuplicates(list)).to.be.false;
      });
    }
  });

  describe("ALL_ASSET_FACETS", () => {
    // The asset-class deploy lists registered in production. Factory and InitializeMock are
    // deliberately excluded — they are not IAsset facets.
    //
    // Loan, LoansPortfolio, BondFixedRate and BondKpiLinkedRate have no production deploy
    // config, but their facets are exercised by the shared AssetMock mega-asset, so
    // ALL_ASSET_FACETS (the mega-asset union) is a *superset* of the deployable per-class
    // lists below.
    const assetClassLists = [EQUITY_FACETS, BOND_FACETS, DEPOSIT_TOKEN_FACETS];

    it("has no duplicates", () => {
      expect(hasDuplicates(ALL_ASSET_FACETS)).to.be.false;
    });

    it("contains every facet from each deployable asset-class facet list", () => {
      // Drift guard: a facet added to a per-class deploy list but missing from the mega-asset
      // union fails here, before any deployment.
      const all = new Set<string>(ALL_ASSET_FACETS);
      const missing = [...new Set(assetClassLists.flat())].filter((facet) => !all.has(facet));
      expect(missing, `facets in a per-class list but missing from ALL_ASSET_FACETS: ${missing.join(", ")}`).to.be
        .empty;
    });
  });
});
