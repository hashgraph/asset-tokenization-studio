// SPDX-License-Identifier: Apache-2.0

/**
 * Equity token configuration module.
 *
 * Creates equity token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with equity-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing equity-specific facet list and configuration ID.
 *
 * @module domain/equity/createConfiguration
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
import { EQUITY_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";
import { buildFacetList } from "../facetEnvironment";
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS } from "../facetSets";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";

/**
 * Equity-specific facets list.
 *
 * The common token tiers plus the equity-specific facets: dividends, voting,
 * and the supporting interest-rate / proceed-recipients / clearing-hold facets.
 */
export const EQUITY_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  "ClearingHoldByPartitionFacet",
  "DividendFacet",
  "DividendSecurityHoldersFacet",
  "InterestRateFacet",
  "NoncesFacet",
  "ProceedRecipientsFacet",
  "VotingFacet",
  "VotingSecurityHoldersFacet",
];

/**
 * Create equity token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with equity-specific data:
 * - Configuration ID: EQUITY_CONFIG_ID
 * - Facet list: EQUITY_FACETS
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * // Get BLR contract instance
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * // Create equity configuration
 * const result = await createEquityConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'ERC20Facet': '0xdef...',
 *         'EquityUSAFacet': '0x123...',
 *         // ... more facets
 *     },
 *     false,
 *     false,
 *     15,
 *     0
 * )
 *
 * if (result.success) {
 *   console.log(`Equity config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createEquityConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = buildFacetList(EQUITY_FACETS);

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
    configurationId: EQUITY_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
