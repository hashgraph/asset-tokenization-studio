// SPDX-License-Identifier: Apache-2.0

/**
 * Bond token configuration module.
 *
 * Creates bond token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with bond-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing bond-specific facet list and configuration ID.
 *
 * @module domain/bondFixedRate/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { BOND_FIXED_RATE_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";
import { buildFacetList } from "../facetEnvironment";
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS, BOND_COMMON_FACETS } from "../facetSets";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Bond Fixed Rate facets list.
 *
 * The shared bond composition plus `FixedRateFacet` for fixed interest-rate
 * calculations.
 */
export const BOND_FIXED_RATE_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  ...BOND_COMMON_FACETS,
  "FixedRateFacet",
];

/**
 * Create bond token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with bond-specific data:
 * - Configuration ID: BOND_FIXED_RATE_CONFIG_ID
 * - Facet list: BOND_FIXED_RATE_FACETS
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
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
 * // Create bond configuration
 * const result = await createBondFixedRateConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         // ... more facets
 *     },
 *     false,
 *     false,
 *     15,
 *     0
 * )
 *
 * if (result.success) {
 *   console.log(`Bond config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createBondFixedRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = buildFacetList(BOND_FIXED_RATE_FACETS, useTimeTravel);

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
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
    configurationId: BOND_FIXED_RATE_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
