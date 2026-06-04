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
const _MOCK_FACET_1 = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
const _MOCK_FACET_2 = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
const _MOCK_FACET_3 = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";
const _DIAMOND = "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4";

// TEST-ONLY: registry of the mock facets, keyed by the contract name used in
// `INITIALIZE_MOCK_FACETS`. Shape matches the production `FACET_REGISTRY` so
// the deploy + configuration code can treat it the same way.
export const MOCK_FACET_REGISTRY: Record<string, FacetDefinition> = {
  MockDiamondCut: {
    name: "MockDiamondCut",
    description: "TEST-ONLY mock variant of DiamondFacet used by InitializeMock domain",
    resolverKey: { name: "_DIAMOND", value: _DIAMOND },
    factory: (signer) => new MockDiamondCut__factory(signer),
  },
  MockFacet1: {
    name: "MockFacet1",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_1", value: _MOCK_FACET_1 },
    factory: (signer) => new MockFacet1__factory(signer),
  },
  MockFacet2: {
    name: "MockFacet2",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_2", value: _MOCK_FACET_2 },
    factory: (signer) => new MockFacet2__factory(signer),
  },
  MockFacet3: {
    name: "MockFacet3",
    description: "TEST-ONLY mock facet used by InitializeMock domain",
    resolverKey: { name: "_MOCK_FACET_3", value: _MOCK_FACET_3 },
    factory: (signer) => new MockFacet3__factory(signer),
  },
  MockFactoryFacet: {
    name: "MockFactoryFacet",
    description: "TEST-ONLY factory facet used to deploy securities in test environments",
    resolverKey: {
      name: "_FACTORY",
      value: "0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7",
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
