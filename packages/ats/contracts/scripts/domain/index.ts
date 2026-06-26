// SPDX-License-Identifier: Apache-2.0

/**
 * Domain layer exports for Asset Tokenization Studio.
 *
 * This module provides ATS-specific business logic. These are not generic
 * infrastructure and should not be considered reusable for other projects.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import from domain layer
 * import {
 *   CONFIG_IDS.equity,
 *   CONFIG_IDS.bond,
 *   deployFactory,
 *   createEquityConfiguration,
 *   createBondConfiguration,
 *   FACET_REGISTRY,
 *   ROLES,
 *   getFacetDefinition
 * } from '@scripts/domain'
 * ```
 */

/**
 * @remarks
 * Domain registry data (auto-generated).
 *
 * BBND-1766 — bootstrap-safe access:
 *
 * - The heavy `atsRegistry.generated` (facet / contract / storage-wrapper
 *   registries) is **never** re-exported directly from this barrel. Doing so
 *   would trigger an eager `require` at module load, which would break
 *   bootstrap on a fresh clone (the file is gitignored and only generated
 *   by `prepare` / `hardhat compile`). Consumers reach the data exclusively
 *   through the lazy helpers re-exported from `./atsRegistry`
 *   (`getFacetDefinition`, `getAllFacets`, `FACET_REGISTRY`-proxy, etc.).
 * - The small `atsRoles.generated` (role hashes) is checked into git, safe
 *   to re-export eagerly, and surfaces the named `ROLES` constant.
 */
export * from "./atsRoles.generated";

// Domain constants
export * from "./constants";

// Test-environment facet substitution
export * from "./facetEnvironment";

// Shared, type-checked facet sets for deployment configurations
export * from "./facetSets";

// Orchestrator library management
export * from "./orchestratorLibraries";

// Domain registry (ATS-specific contract registry helpers)
export * from "./atsRegistry";

// Factory deployment and types
export * from "./factory/deploy";
export * from "./factory/types";
export * from "./factory/createConfiguration";

// Token deployment from factory
export * from "./factory/deployEquityToken";
export * from "./factory/deployBondToken";
export * from "./factory/deployDepositToken";

// Equity configuration
export * from "./equity/createConfiguration";

// Bond Variable Rate configuration
export * from "./bond/createConfiguration";

// Deposit Token configuration
export * from "./depositToken/createConfiguration";

// Loans-portfolio domain types (HoldingsAssetType) — retained for the LoansPortfolio facet
// suite even though the asset type is no longer deployed through the factory (BBND-1882).
export * from "./loanPortfolio/types";

// TEST-ONLY: InitializeMock domain — stub configuration used by initializer-versioning tests.
export * from "./initializeMock/createConfiguration";
export * from "./initializeMock/mockFacetsRegistry";
