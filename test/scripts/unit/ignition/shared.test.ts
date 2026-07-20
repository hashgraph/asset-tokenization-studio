// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `ignition/lib/shared.ts`'s facet-deploy-list helpers. The
 * deploy order fixes the BLR registration versions, so it matters.
 *
 * @module test/scripts/unit/ignition/shared.test
 */

import { expect } from "chai";
import {
  facetDeployList,
  registrationVersions,
  resolverKeyOf,
  PRODUCTION_MODE,
  TIMETRAVEL_MODE,
} from "../../../../ignition/lib/shared";
import { ALL_FACETS, getResolverKey } from "../../../../lib/domain/facetKeys";
import { getAllMockFacets } from "../../../../lib/domain/initializeMock/mockFacetsRegistry";

// Facet-named interfaces present in ALL_FACETS but never deployed or registered.
const NON_DEPLOYABLE_INTERFACES = new Set(["IComplianceFacet", "IDiamondFacet", "IHoldFacet"]);

const isSortedByLocaleCompare = (names: readonly string[]): boolean =>
  names.every((name, i) => i === 0 || names[i - 1].localeCompare(name) <= 0);

describe("ignition/lib/shared", () => {
  describe("facetDeployList", () => {
    const productionNames = facetDeployList(PRODUCTION_MODE).map((f) => f.name);
    const timetravelNames = facetDeployList(TIMETRAVEL_MODE).map((f) => f.name);
    const mockNames = getAllMockFacets().map((f) => f.name);

    describe("production", () => {
      it("excludes TimeTravelFacet and the three non-deployable interfaces", () => {
        expect(productionNames).to.not.include("TimeTravelFacet");
        for (const interfaceName of NON_DEPLOYABLE_INTERFACES) {
          expect(productionNames).to.not.include(interfaceName);
        }
      });

      it("has exactly ALL_FACETS.length minus TimeTravelFacet minus the 3 non-deployable interfaces", () => {
        // 108 total - TimeTravelFacet - {IComplianceFacet, IDiamondFacet, IHoldFacet} = 104.
        expect(ALL_FACETS.length).to.equal(108);
        expect(productionNames.length).to.equal(ALL_FACETS.length - 1 - NON_DEPLOYABLE_INTERFACES.size);
      });

      it("is exactly the ALL_FACETS subset, in ALL_FACETS' own declared order", () => {
        const expected = ALL_FACETS.filter(
          (name) => name !== "TimeTravelFacet" && !NON_DEPLOYABLE_INTERFACES.has(name),
        );
        expect(productionNames).to.deep.equal(expected);
      });

      it("every entry carries the resolver key facetKeys.ts derives for it", () => {
        for (const facet of facetDeployList(PRODUCTION_MODE)) {
          expect(facet.resolverKey?.value).to.equal(getResolverKey(facet.name));
        }
      });
    });

    describe("timetravel", () => {
      it("is production's deployable set plus TimeTravelFacet plus the 5 TEST-ONLY mocks", () => {
        // 104 deployable + TimeTravelFacet + 5 mocks = 110.
        expect(timetravelNames.length).to.equal(productionNames.length + 1 + mockNames.length);
      });

      it("TimeTravelFacet appears only in timetravel, never in production", () => {
        expect(timetravelNames).to.include("TimeTravelFacet");
        expect(productionNames).to.not.include("TimeTravelFacet");
      });

      it("the 5 mocks are appended at the end, in their declared registry order", () => {
        expect(timetravelNames.slice(-mockNames.length)).to.deep.equal(mockNames);
      });

      it("the non-mock prefix (production set + TimeTravelFacet) is sorted by localeCompare", () => {
        // This is what "TimeTravelFacet reinserted at its localeCompare position" means in
        // practice: the whole prefix — not just the reinsertion point — comes out sorted,
        // because the production subset is already declared in that order (see facetKeys.ts).
        const nonMockPrefix = timetravelNames.slice(0, timetravelNames.length - mockNames.length);
        expect(isSortedByLocaleCompare(nonMockPrefix)).to.be.true;
        expect(new Set(nonMockPrefix)).to.deep.equal(new Set([...productionNames, "TimeTravelFacet"]));
      });

      it("every entry carries the resolver key facetKeys.ts (or the mock registry) derives for it", () => {
        for (const facet of facetDeployList(TIMETRAVEL_MODE)) {
          expect(facet.resolverKey?.value).to.equal(getResolverKey(facet.name));
        }
      });
    });
  });

  describe("registrationVersions — deliberate key collisions in timetravel mode", () => {
    it("production: every facet registers at v1 (no collisions)", () => {
      const versions = [...registrationVersions(PRODUCTION_MODE).values()];
      expect(versions.every((v) => v === 1)).to.be.true;
    });

    it("timetravel: MockDiamondCut collides with DiamondFacet's key and lands at v2", () => {
      const versions = registrationVersions(TIMETRAVEL_MODE);
      expect(versions.get("DiamondFacet")).to.equal(1);
      expect(versions.get("MockDiamondCut")).to.equal(2);
    });

    it("timetravel: MockFactoryFacet collides with FactoryFacet's key and lands at v2", () => {
      const versions = registrationVersions(TIMETRAVEL_MODE);
      expect(versions.get("FactoryFacet")).to.equal(1);
      expect(versions.get("MockFactoryFacet")).to.equal(2);
    });
  });

  describe("resolverKeyOf", () => {
    it("delegates to getResolverKey for a production facet", () => {
      expect(resolverKeyOf("AccessControlFacet")).to.equal(getResolverKey("AccessControlFacet"));
    });

    it("delegates to getResolverKey's mock fallback for a TEST-ONLY mock facet", () => {
      expect(resolverKeyOf("MockFacet1")).to.equal(getResolverKey("MockFacet1"));
    });

    it("throws a clear error for an unknown facet", () => {
      expect(() => resolverKeyOf("NotARealFacet")).to.throw(/No resolver key registered/);
    });
  });
});
