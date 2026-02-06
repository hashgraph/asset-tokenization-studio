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
 * @module domain/bondSustainabilityPerformanceTargetRate/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID, atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Bond-specific facets list (41 facets total).
 *
 * This is an explicit positive list of all facets required for bond tokens.
 * Includes all common facets plus BondUSAFacet (NOT EquityUSAFacet).
 *
 * Note: DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet functionality,
 * so we only include DiamondFacet to avoid selector collisions.
 *
 * Updated to match origin/develop feature parity (all facets registered).
 */
const BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_FACETS = [
  // Core Functionality (10 - DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet)
  "AccessControlSustainabilityPerformanceTargetRateFacet",
  "CapSustainabilityPerformanceTargetRateFacet",
  "ControlListSustainabilityPerformanceTargetRateFacet",
  "CorporateActionsSustainabilityPerformanceTargetRateFacet",
  "DiamondFacet", // Combined: includes DiamondCutFacet + DiamondLoupeFacet functionality
  "ERC20SustainabilityPerformanceTargetRateFacet",
  "FreezeSustainabilityPerformanceTargetRateFacet",
  "KycSustainabilityPerformanceTargetRateFacet",
  "PauseSustainabilityPerformanceTargetRateFacet",
  "SnapshotsSustainabilityPerformanceTargetRateFacet",
  "TotalBalanceSustainabilityPerformanceTargetRateFacet",

  // ERC Standards
  "ERC1410IssuerSustainabilityPerformanceTargetRateFacet",
  "ERC1410ManagementSustainabilityPerformanceTargetRateFacet",
  "ERC1410ReadSustainabilityPerformanceTargetRateFacet",
  "ERC1410TokenHolderSustainabilityPerformanceTargetRateFacet",
  "ERC1594SustainabilityPerformanceTargetRateFacet",
  "ERC1643SustainabilityPerformanceTargetRateFacet",
  "ERC1644SustainabilityPerformanceTargetRateFacet",
  "ERC20PermitSustainabilityPerformanceTargetRateFacet",
  "NoncesSustainabilityPerformanceTargetRateFacet",
  "ERC20VotesSustainabilityPerformanceTargetRateFacet",
  "ERC3643BatchSustainabilityPerformanceTargetRateFacet",
  "ERC3643ManagementSustainabilityPerformanceTargetRateFacet",
  "ERC3643OperationsSustainabilityPerformanceTargetRateFacet",
  "ERC3643ReadSustainabilityPerformanceTargetRateFacet",

  // Clearing & Settlement
  "ClearingActionsSustainabilityPerformanceTargetRateFacet",
  "ClearingHoldCreationSustainabilityPerformanceTargetRateFacet",
  "ClearingReadSustainabilityPerformanceTargetRateFacet",
  "ClearingRedeemSustainabilityPerformanceTargetRateFacet",
  "ClearingTransferSustainabilityPerformanceTargetRateFacet",
  "HoldManagementSustainabilityPerformanceTargetRateFacet",
  "HoldReadSustainabilityPerformanceTargetRateFacet",
  "HoldTokenHolderSustainabilityPerformanceTargetRateFacet",

  // External Management
  "ExternalControlListManagementSustainabilityPerformanceTargetRateFacet",
  "ExternalKycListManagementSustainabilityPerformanceTargetRateFacet",
  "ExternalPauseManagementSustainabilityPerformanceTargetRateFacet",

  // Advanced Features
  "AdjustBalancesSustainabilityPerformanceTargetRateFacet",
  "LockSustainabilityPerformanceTargetRateFacet",
  "ProceedRecipientsSustainabilityPerformanceTargetRateFacet",
  "ProtectedPartitionsSustainabilityPerformanceTargetRateFacet",
  "ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacet",
  "ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet",
  "ScheduledCouponListingSustainabilityPerformanceTargetRateFacet",
  "ScheduledSnapshotsSustainabilityPerformanceTargetRateFacet",
  "SsiManagementSustainabilityPerformanceTargetRateFacet",
  "TransferAndLockSustainabilityPerformanceTargetRateFacet",

  //Interest Rate
  "SustainabilityPerformanceTargetRateFacet",
  "KpisSustainabilityPerformanceTargetRateFacet",

  // Jurisdiction-Specific
  "BondUSASustainabilityPerformanceTargetRateFacet",
  "BondUSAReadSustainabilityPerformanceTargetRateFacet",
] as const;

/**
 * Create bond token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with bond-specific data:
 * - Configuration ID: BOND_CONFIG_ID
 * - Facet list: BOND_FACETS (43 facets)
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
 * const result = await createBondConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'BondUSAFacet': '0xdef...',
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
export async function createBondSustainabilityPerformanceTargetRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Get facet names based on time travel mode
  // Include TimeTravelFacet when useTimeTravel=true to provide time manipulation functions
  const baseFacets = useTimeTravel
    ? [...BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_FACETS, "TimeTravelFacet"]
    : BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_FACETS;

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
    configurationId: BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
