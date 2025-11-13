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

import { Contract } from "ethers";
import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { EQUITY_CONFIG_ID, atsRegistry } from "@scripts/domain";

/**
 * Equity-specific facets list (41 facets total).
 *
 * This is an explicit positive list of all facets required for equity tokens.
 * Includes all common facets plus EquityUSAFacet.
 *
 * Note: DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet functionality,
 * so we only include DiamondFacet to avoid selector collisions.
 *
 * Based on origin/develop configuration where equity uses ALL common facets.
 */
const EQUITY_FACETS = [
  // Core Functionality (10 - DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet)
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet", // Combined: includes DiamondCutFacet + DiamondLoupeFacet functionality
  "ERC20Facet",
  "FreezeFacet",
  "KycFacet",
  "PauseFacet",
  "SnapshotsFacet",

  // ERC Standards (13)
  "ERC1410IssuerFacet",
  "ERC1410ManagementFacet",
  "ERC1410ReadFacet",
  "ERC1410TokenHolderFacet",
  "ERC1594Facet",
  "ERC1643Facet",
  "ERC1644Facet",
  "ERC20PermitFacet",
  "ERC20VotesFacet",
  "ERC3643BatchFacet",
  "ERC3643ManagementFacet",
  "ERC3643OperationsFacet",
  "ERC3643ReadFacet",

  // Clearing & Settlement (8)
  "ClearingActionsFacet",
  "ClearingHoldCreationFacet",
  "ClearingReadFacet",
  "ClearingRedeemFacet",
  "ClearingTransferFacet",
  "HoldManagementFacet",
  "HoldReadFacet",
  "HoldTokenHolderFacet",

  // External Management (3)
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",

  // Advanced Features (9)
  "AdjustBalancesFacet",
  "LockFacet",
  "ProceedRecipientsFacet",
  "ProtectedPartitionsFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledSnapshotsFacet",
  "SsiManagementFacet",
  "TransferAndLockFacet",

  // Jurisdiction-Specific (1)
  "EquityUSAFacet",
] as const;

/**
 * Create equity token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with equity-specific data:
 * - Configuration ID: EQUITY_CONFIG_ID
 * - Facet list: EQUITY_FACETS (43 facets)
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
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
 *     false
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
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Get facet names based on time travel mode
  // Include TimeTravelFacet when useTimeTravel=true to provide time manipulation functions
  const baseFacets = useTimeTravel ? [...EQUITY_FACETS, "TimeTravelFacet"] : EQUITY_FACETS;

  const facetNames = useTimeTravel
    ? baseFacets.map((name) => (name === "TimeTravelFacet" || name.endsWith("TimeTravel") ? name : `${name}TimeTravel`))
    : baseFacets;

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
    const baseName = name.replace(/TimeTravel$/, "");

    const facetDef = atsRegistry.getFacetDefinition(baseName);
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
    configurationId: EQUITY_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
  });
}
