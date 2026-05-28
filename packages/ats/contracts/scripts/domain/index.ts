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
 *   EQUITY_CONFIG_ID,
 *   BOND_CONFIG_ID,
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
export * from "./factory/deployBondFixedRateToken";
export * from "./factory/deployBondKpiLinkedRateToken";
export * from "./factory/deployLoanToken";
export * from "./factory/deployLoansPortfolioToken";

// Equity configuration
export * from "./equity/createConfiguration";

// Bond Variable Rate configuration
export * from "./bond/createConfiguration";

// Bond Fixed Rate configuration
export * from "./bondFixedRate/createConfiguration";

// Bond Kpi Linked Rate configuration
export * from "./bondKpiLinkedRate/createConfiguration";

// Loan configuration
export * from "./loan/createConfiguration";

// Loans Portfolio configuration
export * from "./loanPortfolio/createConfiguration";
export * from "./loanPortfolio/types";

// TEST-ONLY: InitializeMock domain — stub configuration used by initializer-versioning tests.
export * from "./initializeMock/createConfiguration";
export * from "./initializeMock/mockFacetsRegistry";
