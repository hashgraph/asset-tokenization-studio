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
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS, BOND_COMMON_FACETS } from "@scripts/domain";
import { BOND_FACETS } from "../../../../scripts/domain/bond/createConfiguration";
import { BOND_FIXED_RATE_FACETS } from "../../../../scripts/domain/bondFixedRate/createConfiguration";
import { BOND_KPI_LINKED_RATE_FACETS } from "../../../../scripts/domain/bondKpiLinkedRate/createConfiguration";
import { EQUITY_FACETS } from "../../../../scripts/domain/equity/createConfiguration";
import { DEPOSIT_TOKEN_FACETS } from "../../../../scripts/domain/depositToken/createConfiguration";
import { LOAN_FACETS } from "../../../../scripts/domain/loan/createConfiguration";
import { LOANS_PORTFOLIO_FACETS } from "../../../../scripts/domain/loanPortfolio/createConfiguration";
import { FACTORY_FACETS } from "../../../../scripts/domain/factory/createConfiguration";
import { INITIALIZE_MOCK_FACETS } from "../../../../scripts/domain/initializeMock/createConfiguration";

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
      BOND_FIXED_RATE_FACETS,
      BOND_KPI_LINKED_RATE_FACETS,
      EQUITY_FACETS,
      DEPOSIT_TOKEN_FACETS,
      LOAN_FACETS,
      LOANS_PORTFOLIO_FACETS,
      FACTORY_FACETS,
      INITIALIZE_MOCK_FACETS,
    };

    for (const [name, list] of Object.entries(configurationLists)) {
      it(`${name} has no duplicates`, () => {
        expect(hasDuplicates(list)).to.be.false;
      });
    }
  });
});
