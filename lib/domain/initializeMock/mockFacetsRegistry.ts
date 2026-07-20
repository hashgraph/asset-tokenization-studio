// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: registry entries for the mock facet contracts that live in
// `contracts/test/mocks/*.sol`. These mocks are deliberately excluded from the
// facet-key map in `facetKeys.ts` (it is derived from `@custom:hash resolverKey`
// annotations under `contracts/`, and the mocks carry none), so we hand-write
// the bare minimum FacetDefinition fields needed for deployment + registration
// + configuration of the InitializeMock domain.

import { toBeHex } from "ethers";
import type { FacetDefinition } from "@lib/operations";
import type { FacetName } from "../facetKeys";

// TEST-ONLY: BLR configuration ID for the InitializeMock domain, bytes32(uint256(9)).
// Lives with the mock domain rather than the production `CONFIG_IDS` so test-only
// concerns stay out of the central deploy constants.
export const INITIALIZE_MOCK_CONFIG_ID = toBeHex(9, 32);

// Resolver keys mirror the `bytes32("...")` literals declared in the mock
// contracts. Solidity right-pads short string-to-bytes32 conversions with
// zeros: e.g. `MockFacetN` is 10 ASCII bytes + 22 zero bytes; `MockDiamondCut`
// is 14 ASCII bytes + 18 zero bytes.
const _MOCK_FACET_1 = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
const _MOCK_FACET_2 = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
const _MOCK_FACET_3 = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";
const _DIAMOND = "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4";

// TEST-ONLY: registry of the mock facets, keyed by the contract name used in
// `INITIALIZE_MOCK_FACETS`. Shape matches the production facet-definition
// slim type (`{ name, resolverKey }`) so the deploy + configuration code can
// treat it the same way. Deployment uses the TypeChain factories directly
// (`hre.ethers.getContractFactory` / `MockX__factory`), not a `factory` field
// here.
export const MOCK_FACET_REGISTRY = {
  // TEST-ONLY mock variant of DiamondFacet used by InitializeMock domain.
  MockDiamondCut: {
    name: "MockDiamondCut",
    resolverKey: { name: "_DIAMOND", value: _DIAMOND },
  },
  // TEST-ONLY mock facet used by InitializeMock domain.
  MockFacet1: {
    name: "MockFacet1",
    resolverKey: { name: "_MOCK_FACET_1", value: _MOCK_FACET_1 },
  },
  // TEST-ONLY mock facet used by InitializeMock domain.
  MockFacet2: {
    name: "MockFacet2",
    resolverKey: { name: "_MOCK_FACET_2", value: _MOCK_FACET_2 },
  },
  // TEST-ONLY mock facet used by InitializeMock domain.
  MockFacet3: {
    name: "MockFacet3",
    resolverKey: { name: "_MOCK_FACET_3", value: _MOCK_FACET_3 },
  },
  // TEST-ONLY factory facet that initialises TimeTravel on deployed securities.
  MockFactoryFacet: {
    name: "MockFactoryFacet",
    resolverKey: {
      name: "_FACTORY",
      value: "0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7",
    },
  },
} satisfies Record<string, FacetDefinition>;

// TEST-ONLY: union of the mock facet contract names. Lets the InitializeMock
// configuration type its facet list as `FacetName | MockFacetName` so the mock
// entries (absent from the generated registry) still type-check.
export type MockFacetName = keyof typeof MOCK_FACET_REGISTRY;

// TEST-ONLY: convenience helper mirroring `atsRegistry.getFacetDefinition` for the mocks.
export function getMockFacetDefinition(name: string): FacetDefinition | undefined {
  // `satisfies` keeps the literal keys for `MockFacetName`, so widen here to
  // index by an arbitrary runtime string.
  return (MOCK_FACET_REGISTRY as Record<string, FacetDefinition>)[name];
}

// TEST-ONLY: returns the three mock FacetDefinitions in declaration order, for
// bulk-deploy + register loops in the workflow.
export function getAllMockFacets(): FacetDefinition[] {
  return Object.values(MOCK_FACET_REGISTRY);
}

// TEST-ONLY: facet set for the InitializeMock domain — the real InitializerFacet
// followed by `MockDiamondCut` (a mock variant of `DiamondFacet` that exposes
// the same diamond-cut/loupe surface plus an `initializeDiamondCut()` hook so
// it can participate in the initializer flow) and the three mock facets.
// `getResolverKey` (in `createConfiguration`-style callers) resolves
// `InitializerFacet` from `facetKeys.ts` and falls back to this mock registry
// for the three mocks, which carry no `@custom:hash resolverKey` annotation of
// their own.
export const INITIALIZE_MOCK_FACETS: readonly (FacetName | MockFacetName)[] = [
  "InitializerFacet",
  "MockDiamondCut",
  "MockFacet1",
  "MockFacet2",
  "MockFacet3",
];
