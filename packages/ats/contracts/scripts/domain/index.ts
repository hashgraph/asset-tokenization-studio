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

// Domain registry data (auto-generated)
export * from "./atsRegistry.data";

// Domain constants
export * from "./constants";

// Domain registry (ATS-specific contract registry helpers)
export * from "./atsRegistry";

// Factory deployment and types
export * from "./factory/deploy";
export * from "./factory/types";

// Token deployment from factory
export * from "./factory/deployEquityToken";
export * from "./factory/deployBondToken";
export * from "./factory/deployBondFixedRateToken";
export * from "./factory/deployBondKpiLinkedRateToken";
export * from "./factory/deployBondSustainabilityPerformanceTargetRateToken";

// Equity configuration
export * from "./equity/createConfiguration";

// Bond Variable Rate configuration
export * from "./bond/createConfiguration";

// Bond Fixed Rate configuration
export * from "./bondFixedRate/createConfiguration";

// Bond Kpi Linked Rate configuration
export * from "./bondKpiLinkedRate/createConfiguration";

// Bond Sustainability Performance Target Rate configuration
export * from "./bondSustainabilityPerformanceTargetRate/createConfiguration";
