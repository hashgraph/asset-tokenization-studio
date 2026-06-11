// SPDX-License-Identifier: Apache-2.0

/**
 * Loan Portfolio token configuration module.
 *
 * Creates loan portfolio token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with loan portfolio-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing loan portfolio-specific facet list and configuration ID.
 *
 * @module domain/loanPortfolio/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { LOANS_PORTFOLIO_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";
import { buildFacetList } from "../facetEnvironment";
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS } from "../facetSets";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Loan Portfolio Facets
 *
 * The common token tiers plus the portfolio-specific facets: the portfolio
 * facet itself, coupon listing, and nonces.
 */
export const LOANS_PORTFOLIO_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  "CouponListingFacet",
  "LoansPortfolioFacet",
  "NoncesFacet",
];

export async function createLoansPortfolioConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = buildFacetList(LOANS_PORTFOLIO_FACETS, useTimeTravel);

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    const baseName = name.replace(/TimeTravel$/, "");
    const facetDef = atsRegistry.getFacetDefinition(baseName) ?? getMockFacetDefinition(baseName);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${baseName}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: LOANS_PORTFOLIO_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
