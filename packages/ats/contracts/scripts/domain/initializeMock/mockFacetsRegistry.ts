// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: registry entries for the mock facet contracts that live in
// `contracts/test/mocks/*.sol`. These mocks are deliberately excluded from the
// auto-generated `atsRegistry.data.ts` (the registry generator skips
// `**/test/**`), so we hand-write the bare minimum FacetDefinition fields
// needed for deployment + registration + configuration of the InitializeMock
// domain.

import { toBeHex } from "ethers";
import type { FacetDefinition } from "@scripts/infrastructure";
import {
  MockDiamondCutHelpers__factory,
  MockFacet1__factory,
  MockFacet2__factory,
  MockFacet3__factory,
  MockFactoryFacet__factory,
} from "@contract-types";
import { getLibLinks } from "../orchestratorLibraries";

// TEST-ONLY: BLR configuration ID for the InitializeMock domain, bytes32(uint256(9)).
// Lives with the mock domain rather than the production `CONFIG_IDS` so test-only
// concerns stay out of the central deploy constants. Consumed by the InitializeMock
// `createConfiguration`, the test-gated Step 12 of `deploySystemWithNewBlr`, and the
// initializer-versioning tests.
export const INITIALIZE_MOCK_CONFIG_ID = toBeHex(9, 32);

// Resolver keys mirror the `bytes32("...")` literals declared in the mock
// contracts. Solidity right-pads short string-to-bytes32 conversions with
// zeros: e.g. `MockFacetN` is 10 ASCII bytes + 22 zero bytes.
const _MOCK_FACET_1 = "0x4d6f636b46616365743100000000000000000000000000000000000000000000";
const _MOCK_FACET_2 = "0x4d6f636b46616365743200000000000000000000000000000000000000000000";
const _MOCK_FACET_3 = "0x4d6f636b46616365743300000000000000000000000000000000000000000000";
const _MOCK_DIAMOND_CUT_HELPERS = "0xa5b023f9f188f3ba68c8758aaaf5ab8080f7660f3e8e5c8c6aed79dfbfd307e7";

// TEST-ONLY: registry of the mock facets, keyed by the contract name used in
// `INITIALIZE_MOCK_FACETS`. Shape matches the production `FACET_REGISTRY` so
// the deploy + configuration code can treat it the same way.
export const MOCK_FACET_REGISTRY = {
  MockDiamondCutHelpers: {
    name: "MockDiamondCutHelpers",
    description: "TEST-ONLY force* state-forcing controls, appended alongside the real DiamondFacet",
    resolverKey: { name: "_MOCK_DIAMOND_CUT_HELPERS", value: _MOCK_DIAMOND_CUT_HELPERS },
    // NominalValueStorageWrapper's initializeNominalValue (called from forceSetNominalValue)
    // triggers pending scheduled cross-ordered tasks via the external ScheduledTasksOps
    // library, so this mock facet's bytecode needs it linked too.
    factory: (signer) => new MockDiamondCutHelpers__factory(getLibLinks("scheduledTasksOps") as any, signer),
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
    description: "TEST-ONLY factory facet that initialises TimeTravel on deployed securities",
    resolverKey: {
      name: "_FACTORY",
      value: "0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7",
    },
    factory: (signer) => new MockFactoryFacet__factory(signer),
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
