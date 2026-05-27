// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: registry entries for the mock facet contracts that live in
// `contracts/test/mocks/*.sol`. These mocks are deliberately excluded from the
// auto-generated `atsRegistry.data.ts` (the registry generator skips
// `**/test/**`), so we hand-write the bare minimum FacetDefinition fields
// needed for deployment + registration + configuration of the InitializeMock
// domain.

import type { FacetDefinition } from "@scripts/infrastructure";
import {
  MockDiamondCut__factory,
  MockFacet1__factory,
  MockFacet2__factory,
  MockFacet3__factory,
  MockFactoryFacet__factory,
} from "@contract-types";

// Resolver keys mirror the `bytes32("...")` literals declared in the mock
// contracts. Solidity right-pads short string-to-bytes32 conversions with
// zeros: e.g. `MockFacetN` is 10 ASCII bytes + 22 zero bytes; `MockDiamondCut`
// is 14 ASCII bytes + 18 zero bytes.
const _MOCK_FACET_1_RESOLVER_KEY = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
const _MOCK_FACET_2_RESOLVER_KEY = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
const _MOCK_FACET_3_RESOLVER_KEY = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";
const _DIAMOND_RESOLVER_KEY = "0x1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d78";

// TEST-ONLY: registry of the mock facets, keyed by the contract name used in
// `INITIALIZE_MOCK_FACETS`. Shape matches the production `FACET_REGISTRY` so
// the deploy + configuration code can treat it the same way.
export const MOCK_FACET_REGISTRY: Record<string, FacetDefinition> = {
  MockDiamondCut: {
    name: "MockDiamondCut",
    description: "TEST-ONLY mock variant of DiamondFacet used by InitializeMock domain",
    resolverKey: { name: "_DIAMOND_RESOLVER_KEY", value: _DIAMOND_RESOLVER_KEY },
    factory: (signer) => new MockDiamondCut__factory(signer),
  },
  MockFacet1: {
    name: "MockFacet1",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_1_RESOLVER_KEY", value: _MOCK_FACET_1_RESOLVER_KEY },
    factory: (signer) => new MockFacet1__factory(signer),
  },
  MockFacet2: {
    name: "MockFacet2",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_2_RESOLVER_KEY", value: _MOCK_FACET_2_RESOLVER_KEY },
    factory: (signer) => new MockFacet2__factory(signer),
  },
  MockFacet3: {
    name: "MockFacet3",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_3_RESOLVER_KEY", value: _MOCK_FACET_3_RESOLVER_KEY },
    factory: (signer) => new MockFacet3__factory(signer),
  },
  MockFactoryFacet: {
    name: "MockFactoryFacet",
    description: "TEST-ONLY factory facet that initialises TimeTravel on deployed securities",
    resolverKey: {
      name: "_FACTORY_RESOLVER_KEY",
      value: "0xa5472d34be801f744a73bce4e1851e67767286307e3203726a3261b280a667b3",
    },
    factory: (signer) => new MockFactoryFacet__factory(signer),
  },
};

// TEST-ONLY: convenience helper mirroring `atsRegistry.getFacetDefinition` for the mocks.
export function getMockFacetDefinition(name: string): FacetDefinition | undefined {
  return MOCK_FACET_REGISTRY[name];
}

// TEST-ONLY: returns the three mock FacetDefinitions in declaration order, for
// bulk-deploy + register loops in the workflow.
export function getAllMockFacets(): FacetDefinition[] {
  return Object.values(MOCK_FACET_REGISTRY);
}
