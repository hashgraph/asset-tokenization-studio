// SPDX-License-Identifier: Apache-2.0

/**
 * Domain layer exports for Asset Tokenization Studio: ATS-specific data and
 * business logic (what ATS is, as opposed to `lib/operations` — what you can
 * do to deployed contracts).
 */

// The small `roles.ts` (role hashes, hand-maintained) is checked into git,
// safe to re-export eagerly, and surfaces the named `ROLES` constant.
export * from "./roles";

// Domain constants
export * from "./constants";

// Test-environment facet substitution
export * from "./facetEnvironment";

// Explicit facet-name -> resolver-key map (source of truth)
export * from "./facetKeys";

// Shared, type-checked facet sets for deployment configurations
export * from "./facetSets";

// Orchestrator library management
export * from "./orchestratorLibraries";

// Domain registry (ATS-specific contract registry helpers, thin facade over facetKeys)
export * from "./atsRegistry";

// Factory deployment and types
export * from "./factory/deploy";
export * from "./factory/types";

// Token deployment from factory
export * from "./factory/deployEquityToken";
export * from "./factory/deployBondToken";

// Loans-portfolio domain types (HoldingsAssetType) — used by the LoansPortfolio facet suite;
// the asset type itself is not deployed through the factory.
export * from "./loanPortfolio/types";

// TEST-ONLY: InitializeMock domain — mock facet registry used by initializer-versioning tests.
export * from "./initializeMock/mockFacetsRegistry";
