// SPDX-License-Identifier: Apache-2.0

/**
 * Loan token configuration module.
 *
 * Creates loan token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with loan-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing loan-specific facet list and configuration ID.
 *
 * @module domain/loan/createConfiguration
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
import { LOAN_CONFIG_ID } from "../constants";
import { buildFacetList } from "../facetEnvironment";
import { COMMON_TOKEN_FACETS, EXTENDED_TOKEN_FACETS } from "../facetSets";
import { getMockFacetDefinition } from "../initializeMock/mockFacetsRegistry";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";

/**
 * Loan-specific facets list.
 *
 * This is an explicit positive list of all facets required for loan tokens.
 *
 * Note: DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet functionality,
 * so we only include DiamondFacet to avoid selector collisions.
 *
 * Note: Loan does NOT include TimeTravel variants (per spec). TimeTravelFacet
 * is injected automatically by the deploy script in test environments.
 */
export const LOAN_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  "AmortizationFacet",
  "ClearingHoldByPartitionFacet",
  "CouponFacet",
  "CouponListingFacet",
  "CouponSecurityHoldersFacet",
  "LoanFacet",
  "ProceedRecipientsFacet",
];

/**
 * Create loan token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with loan-specific data:
 * - Configuration ID: LOAN_CONFIG_ID
 * - Facet list: LOAN_FACETS
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * Note: Loan configuration does NOT include TimeTravel variants.
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
 * // Create loan configuration
 * const result = await createLoanConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'CouponFacet': '0xdef...',
 *         // ... more facets
 *     },
 *     false,
 *     15,
 *     0
 * )
 *
 * if (result.success) {
 *   console.log(`Loan config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createLoanConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = buildFacetList(LOAN_FACETS, useTimeTravel);

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
    configurationId: LOAN_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
