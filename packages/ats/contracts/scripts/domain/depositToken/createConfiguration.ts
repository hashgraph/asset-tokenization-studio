// SPDX-License-Identifier: Apache-2.0

/**
 * Deposit Token configuration module.
 *
 * Registers the deposit token configuration in the BusinessLogicResolver by calling the generic
 * createConfiguration() operation with the deposit-token facet list and configuration id. Every
 * facet listed here is initialised by `Factory._deployDepositToken`, so the set must stay in sync
 * with that function or `setOperationalStatus` will not mark deployed proxies operational.
 *
 * @module domain/depositToken/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { DEPOSIT_TOKEN_CONFIG_ID } from "../constants";
import { buildFacetList } from "../facetEnvironment";
import { COMMON_TOKEN_FACETS } from "../facetSets";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";

/**
 * Deposit Token configuration.
 *
 * A deposit token is a minimal cash-style asset, so it uses only the common
 * token tier (no compliance, KYC, snapshots, locks, coupons, maturity, …) plus
 * `ClearingHoldByPartitionFacet`. Each facet here has a matching initialiser in
 * `Factory._deployDepositToken`.
 */
export const DEPOSIT_TOKEN_FACETS: readonly FacetName[] = [...COMMON_TOKEN_FACETS, "ClearingHoldByPartitionFacet"];

/**
 * Create the deposit token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with deposit-token-specific
 * data:
 * - Configuration ID: DEPOSIT_TOKEN_CONFIG_ID
 * - Facet list: DEPOSIT_TOKEN_FACETS
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise resolving to operation result
 */
export async function createDepositTokenConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = buildFacetList(DEPOSIT_TOKEN_FACETS);

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name) ?? getMockFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${name}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: DEPOSIT_TOKEN_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
