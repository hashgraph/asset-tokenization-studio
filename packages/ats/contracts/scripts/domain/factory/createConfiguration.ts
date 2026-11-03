// SPDX-License-Identifier: Apache-2.0

/**
 * Factory token configuration module.
 *
 * Creates factory token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with factory-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createBatchConfiguration() operation,
 * providing factory-specific facet list and configuration ID.
 *
 * @module domain/factory/createConfiguration
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
import { CONFIG_IDS } from "../constants";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";

/**
 * Factory-specific facets list (1 facet).
 *
 * Factory is a single-facet ResolverProxy that handles token deployment.
 */
export const FACTORY_FACETS: readonly FacetName[] = ["FactoryFacet"];

/**
 * Create factory token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with factory-specific data:
 * - Configuration ID: CONFIG_IDS.factory
 * - Facet list: FACTORY_FACETS (1 facet)
 *
 * All implementation logic is handled by the generic createBatchConfiguration()
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
 * // Create factory configuration
 * const result = await createFactoryConfiguration(
 *     blr,
 *     {
 *         'FactoryFacet': '0xabc...',
 *     },
 *     false,
 *     false,
 *     15,
 *     0
 * )
 *
 * if (result.success) {
 *   console.log(`Factory config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createFactoryConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Build facet list based on time travel mode
  const facetNames = useTimeTravel ? FACTORY_FACETS.map(() => "MockFactoryFacet") : [...FACTORY_FACETS];

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
    const baseName = name.replace(/TimeTravel$/, "");

    const facetDef = useTimeTravel
      ? (getMockFacetDefinition(name) ?? atsRegistry.getFacetDefinition(baseName))
      : atsRegistry.getFacetDefinition(baseName);
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
    configurationId: CONFIG_IDS.factory,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
